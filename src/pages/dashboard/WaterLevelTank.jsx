import React from "react";
import { Activity, Droplets, Gauge, Ruler } from "lucide-react";
import "../../styles/waterTankSimulation.css";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const asNumber = (value, fallback = 0) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatMeter = (value) => `${asNumber(value).toFixed(2)}m`;
const normalizeStatus = (status) => String(status || "inactive").toLowerCase();

const WaterLevelTank = ({
  nodeName,
  waterHeightM,
  tankDepthM,
  sensorHangingM,
  sensorDepthM,
  status,
  readingCount,
  lastReadingLabel,
  compact = false,
}) => {
  const depth = asNumber(tankDepthM);
  const height = asNumber(waterHeightM);
  const sensorHanging = asNumber(sensorHangingM);
  const sensorDepth = asNumber(sensorDepthM);
  const fillPercent = depth > 0 ? clamp((height / depth) * 100, 0, 100) : 0;
  const waterSurfaceTop = 100 - fillPercent;
  const probeTop = depth > 0 ? clamp((sensorHanging / depth) * 100, 0, 100) : null;
  const safeStatus = normalizeStatus(status);
  const displayStatus = safeStatus === "low" ? "warning" : safeStatus;
  const statusClassName = displayStatus.replace(/\s+/g, "-");
  const fillStateClassName = fillPercent >= 99.5
    ? " water-tank-visual-full"
    : fillPercent <= 0.5
      ? " water-tank-visual-empty"
      : "";
  const markersOverlap = probeTop !== null && Math.abs(probeTop - waterSurfaceTop) < 7;
  const ticks = [100, 75, 50, 25, 0];

  return (
    <div className={`water-tank-card ${compact ? "water-tank-card-compact" : ""}`}>
      <div className="water-tank-header">
        <div>
          <div className="water-tank-eyebrow">Live tank level</div>
          <h4>{nodeName || "Selected node"}</h4>
        </div>
        <span className={`water-tank-status water-tank-status-${statusClassName}`}>
          <span />
          {safeStatus}
        </span>
      </div>

      <div className="water-tank-body">
        <div className="water-tank-instrument">
          <div className="water-tank-scale" aria-hidden="true">
            {ticks.map((tick) => (
              <div className="water-tank-scale-tick" style={{ top: `${100 - tick}%` }} key={tick}>
                <span>{depth > 0 ? formatMeter((depth * tick) / 100) : `${tick}%`}</span>
              </div>
            ))}
          </div>

          <div
            className={`water-tank-visual${fillStateClassName}`}
            aria-label={`Water level ${fillPercent.toFixed(0)} percent`}
            style={{
              "--fill-percent": `${fillPercent}%`,
              "--surface-top": `${waterSurfaceTop}%`,
            }}
          >
            <div className="water-tank-top-rim" />
            <div className="water-tank-empty-region" />
            <div className="water-tank-fill">
              <div className="water-tank-liquid-surface" />
            </div>
            <div className="water-tank-bottom-rim" />
            {probeTop !== null && (
              <div
                className={`water-tank-sensor-cable ${markersOverlap ? "water-tank-sensor-cable-overlap" : ""}`}
                style={{ "--probe-top": `${probeTop}%` }}
              >
                <span className="water-tank-cable-mount" />
                <span className="water-tank-cable-line" />
                <span className="water-tank-probe" />
                <span className="water-tank-probe-label">Sensor h1 {formatMeter(sensorHanging)}</span>
              </div>
            )}
            <div className="water-tank-surface-marker">
              <span>
                <small>Level</small>
                <strong>{formatMeter(height)}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="water-tank-readout">
          <div className="water-tank-main-value">
            <Droplets size={18} />
            <span>{formatMeter(height)}</span>
          </div>
          <div className="water-tank-main-caption">
            Current water height
            <strong>{fillPercent.toFixed(0)}% full</strong>
          </div>
          <div className="water-tank-level-bar" aria-hidden="true">
            <span style={{ width: `${fillPercent}%` }} />
          </div>
          <div className="water-tank-metrics">
            <div>
              <Ruler size={14} />
              <span>Tank length</span>
              <strong>{formatMeter(depth)}</strong>
            </div>
            <div>
              <Ruler size={14} />
              <span>Sensor hanging</span>
              <strong>{formatMeter(sensorHanging)}</strong>
            </div>
            <div>
              <Gauge size={14} />
              <span>h2 reading</span>
              <strong>{formatMeter(sensorDepth)}</strong>
            </div>
            <div>
              <Activity size={14} />
              <span>Readings</span>
              <strong>{readingCount ?? "0"}</strong>
            </div>
          </div>
          {lastReadingLabel && (
            <div className="water-tank-updated">Last reading: {lastReadingLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaterLevelTank;
