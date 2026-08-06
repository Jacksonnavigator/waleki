import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Droplets,
  Gauge,
  Ruler,
  Signal,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import LegacyMonitor from "./monitor.jsx";
import WaterLevelTank from "./WaterLevelTank";
import "../../styles/node-detail.css";

const parseTimestamp = (timestamp, reading) => {
  let parsed = new Date(timestamp);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  if (timestamp.includes("_") && timestamp.includes("-")) {
    const parts = timestamp.split("_");
    if (parts.length === 2) {
      parsed = new Date(`${parts[0]}T${parts[1].replace(/-/g, ":")}`);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
  }

  if (!Number.isNaN(Number.parseInt(timestamp, 10))) {
    parsed = new Date(Number.parseInt(timestamp, 10));
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (reading?.Timestamp) {
    parsed = new Date(reading.Timestamp);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

const extractDepth = (reading) => {
  if (reading.depth_m !== undefined) return Number.parseFloat(reading.depth_m);
  if (reading.Depth !== undefined) return Number.parseFloat(reading.Depth);
  if (reading.depth !== undefined) return Number.parseFloat(reading.depth);
  if (reading.H2 !== undefined) return Number.parseFloat(reading.H2);
  if (reading.h2 !== undefined) return Number.parseFloat(reading.h2);

  if (reading.RawData && typeof reading.RawData === "string") {
    let match = reading.RawData.match(/Depth\s*[=:]\s*([\d.]+)/i);
    if (!match) match = reading.RawData.match(/D\s*[=:]\s*([\d.]+)/i);
    if (match) return Number.parseFloat(match[1]);
  }

  return 0;
};

const getStatus = (activated, waterHeight) => {
  if (!activated) return "inactive";
  if (waterHeight <= 0) return "critical";
  if (waterHeight < 10) return "warning";
  return "active";
};

const statusIcon = {
  active: <CheckCircle size={16} />,
  warning: <TrendingUp size={16} />,
  critical: <XCircle size={16} />,
  inactive: <Signal size={16} />,
};

const DEFAULT_TANK_LENGTH_M = 2;

const getTankLengthStorageKey = (nodeId) => `waleki:tank-length-m:${nodeId}`;

const readStoredTankLength = (nodeId) => {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem(getTankLengthStorageKey(nodeId));
  const parsed = Number.parseFloat(stored);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const NodeDetailFromQuery = ({ nodeId, onBack }) => {
  const [nodeConfig, setNodeConfig] = useState(null);
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tankLengthOverride, setTankLengthOverride] = useState(() => readStoredTankLength(nodeId));

  useEffect(() => {
    setTankLengthOverride(readStoredTankLength(nodeId));
  }, [nodeId]);

  useEffect(() => {
    const rootRef = ref(database);
    const unsubscribe = onValue(rootRef, (snapshot) => {
      if (!snapshot.exists()) {
        setLoading(false);
        return;
      }

      const data = snapshot.val();
      const config = data.config?.nodes?.[nodeId] || { activated: false, h1_m: 0 };
      const nodeData = data.LoRaSensor?.[nodeId] || {};
      const nextReadings = [];

      Object.keys(nodeData).forEach((timestamp) => {
        const reading = nodeData[timestamp];
        if (!reading || typeof reading !== "object") return;

        const date = parseTimestamp(timestamp, reading);
        if (!date) return;

        const depth = extractDepth(reading);
        const waterHeight = config.h1_m > 0 ? config.h1_m - depth : 0;
        const status = getStatus(config.activated, waterHeight);

        nextReadings.push({
          id: `${nodeId}-${timestamp}`,
          timestamp,
          date,
          h1: Number.parseFloat(config.h1_m || 0),
          h2: Number.parseFloat(depth.toFixed(2)),
          waterHeightM: Number.parseFloat(waterHeight.toFixed(2)),
          waterHeightFt: Number.parseFloat((waterHeight * 3.28084).toFixed(2)),
          status,
        });
      });

      nextReadings.sort((a, b) => b.date - a.date);
      setNodeConfig({ name: nodeId, activated: config.activated || false, h1_m: config.h1_m || 0 });
      setReadings(nextReadings);
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [nodeId]);

  const latestReading = readings[0];
  const sensorHangingLength = Number.parseFloat(nodeConfig?.h1_m || 0);
  const fallbackTankLength = Math.max(
    DEFAULT_TANK_LENGTH_M,
    sensorHangingLength,
    latestReading?.waterHeightM || 0
  );
  const tankLengthM = tankLengthOverride || fallbackTankLength;

  const summary = useMemo(() => {
    const heights = readings.map((reading) => reading.waterHeightM);
    const total = heights.reduce((sum, value) => sum + value, 0);
    return {
      avg: heights.length ? total / heights.length : 0,
      max: heights.length ? Math.max(...heights) : 0,
      min: heights.length ? Math.min(...heights) : 0,
    };
  }, [readings]);

  const handleTankLengthChange = (event) => {
    const nextLength = Number.parseFloat(event.target.value);
    if (!Number.isFinite(nextLength) || nextLength <= 0) return;

    const normalizedLength = Number.parseFloat(nextLength.toFixed(2));
    setTankLengthOverride(normalizedLength);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(getTankLengthStorageKey(nodeId), String(normalizedLength));
    }
  };

  if (loading) {
    return (
      <div className="node-detail-loading">
        <div />
        <p>Loading node details...</p>
      </div>
    );
  }

  return (
    <div className="node-detail-page">
      <button className="node-detail-back" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to monitor
      </button>

      <section className="node-detail-header">
        <div>
          <span className="node-detail-eyebrow">Node detail</span>
          <h1>{nodeId}</h1>
          <p>Detailed readings, sensor hanging length, h2 reading, and live tank level for this node.</p>
        </div>
        <span className={`node-detail-status node-detail-status-${latestReading?.status || "inactive"}`}>
          {statusIcon[latestReading?.status || "inactive"]}
          {latestReading?.status || "inactive"}
        </span>
      </section>

      <section className="node-detail-grid">
        <WaterLevelTank
          nodeName={nodeId}
          waterHeightM={latestReading?.waterHeightM || 0}
          tankDepthM={tankLengthM}
          sensorHangingM={sensorHangingLength}
          sensorDepthM={latestReading?.h2 || 0}
          status={latestReading?.status || "inactive"}
          readingCount={readings.length}
          lastReadingLabel={latestReading ? latestReading.date.toLocaleString() : "No readings yet"}
        />

        <div className="node-detail-metrics">
          <div>
            <Droplets size={18} />
            <span>Current water height</span>
            <strong>{(latestReading?.waterHeightM || 0).toFixed(2)}m</strong>
          </div>
          <div>
            <Ruler size={18} />
            <span>Tank length</span>
            <label className="node-detail-meter-input">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={tankLengthM}
                onChange={handleTankLengthChange}
              />
              <strong>m</strong>
            </label>
          </div>
          <div>
            <Ruler size={18} />
            <span>Sensor hanging length h1</span>
            <strong>{sensorHangingLength.toFixed(2)}m</strong>
          </div>
          <div>
            <Gauge size={18} />
            <span>Sensor reading h2</span>
            <strong>{(latestReading?.h2 || 0).toFixed(2)}m</strong>
          </div>
          <div>
            <Activity size={18} />
            <span>Average height</span>
            <strong>{summary.avg.toFixed(2)}m</strong>
          </div>
          <div>
            <TrendingUp size={18} />
            <span>Maximum height</span>
            <strong>{summary.max.toFixed(2)}m</strong>
          </div>
          <div>
            <Clock size={18} />
            <span>Total readings</span>
            <strong>{readings.length}</strong>
          </div>
        </div>
      </section>

      <section className="node-detail-table-card">
        <div className="node-detail-section-title">
          <Calendar size={18} />
          Recent readings
        </div>
        <div className="node-detail-table-wrap">
          <table className="node-detail-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Water height</th>
                <th>Water height ft</th>
                <th>Sensor h1</th>
                <th>h2</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 30).map((reading) => (
                <tr key={reading.id}>
                  <td>{reading.date.toLocaleString()}</td>
                  <td>{reading.waterHeightM}m</td>
                  <td>{reading.waterHeightFt}ft</td>
                  <td>{reading.h1}m</td>
                  <td>{reading.h2}m</td>
                  <td>
                    <span className={`node-detail-status-pill node-detail-status-pill-${reading.status}`}>
                      {reading.status}
                    </span>
                  </td>
                </tr>
              ))}
              {readings.length === 0 && (
                <tr>
                  <td colSpan="6">No readings found for this node.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

const MonitorWithNodeDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedNode = searchParams.get("node");

  if (selectedNode) {
    return (
      <NodeDetailFromQuery
        nodeId={selectedNode}
        onBack={() => setSearchParams({})}
      />
    );
  }

  const handleMonitorClick = (event) => {
    if (event.target.closest("button, a, input, select, textarea")) return;

    const card = event.target.closest(".monitor-node-card");
    if (!card) return;

    const nodeName = card.querySelector(".monitor-node-card-name")?.textContent?.trim();
    if (nodeName) {
      setSearchParams({ node: nodeName });
    }
  };

  return (
    <div onClick={handleMonitorClick}>
      <LegacyMonitor />
    </div>
  );
};

export default MonitorWithNodeDetails;
