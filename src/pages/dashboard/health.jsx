import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Database, Wifi, Clock, Zap, TrendingUp, Server, HardDrive,
  Eye, Download, Cpu, CardSim, Globe
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import "../../styles/monitor.css";
import "../../styles/health.css";

const Health = () => {
  const navigate = useNavigate();
  const [systemLogs, setSystemLogs] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("connecting");

  // Fetch all system data from Firebase
  useEffect(() => {
    console.log("🔍 Connecting to Firebase system monitoring...");

    // Fetch System Logs
    const logsRef = ref(database, "SystemLogs");
    const unsubscribeLogs = onValue(logsRef, (snapshot) => {
      console.log("📡 System logs snapshot received");

      if (snapshot.exists()) {
        const data = snapshot.val();
        const logsArray = [];

        Object.keys(data).forEach(logKey => {
          const log = data[logKey];
          logsArray.push({
            id: logKey,
            message: log.message || "No message",
            timestamp: log.timestamp || Date.now(),
            type: (log.type || "info").toLowerCase(),
            date: new Date(log.timestamp || Date.now())
          });
        });

        // Sort by most recent first
        logsArray.sort((a, b) => {
          const dateA = new Date(a.timestamp);
          const dateB = new Date(b.timestamp);
          return dateB - dateA;
        });

        setSystemLogs(logsArray);
        console.log(`✅ Loaded ${logsArray.length} system logs`);
      } else {
        console.log("⚠️ No system logs found");
        setSystemLogs([]);
      }

      setConnectionStatus("connected");
    }, (error) => {
      console.error("❌ Firebase logs error:", error);
      setConnectionStatus("error");
    });

    // Fetch System Status
    const statusRef = ref(database, "SystemStatus");
    const unsubscribeStatus = onValue(statusRef, (snapshot) => {
      console.log("📊 System status snapshot received");

      if (snapshot.exists()) {
        const data = snapshot.val();
        setSystemStatus(data);
        console.log("✅ System status loaded:", data);
      } else {
        console.log("⚠️ No system status found");
        setSystemStatus(null);
      }
    }, (error) => {
      console.error("❌ Firebase status error:", error);
    });

    // Fetch Monitor Data (system_status, network, lora_status)
    const monitorRef = ref(database, "monitor");
    const unsubscribeMonitor = onValue(monitorRef, (snapshot) => {
      console.log("📈 Monitor data snapshot received");

      if (snapshot.exists()) {
        const data = snapshot.val();
        setSystemMetrics(data);
        console.log("✅ Monitor data loaded:", data);
      } else {
        console.log("⚠️ No monitor data found");
        setSystemMetrics(null);
      }

      setLoading(false);
      setLastUpdate(new Date());
    }, (error) => {
      console.error("❌ Firebase monitor error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeLogs();
      unsubscribeStatus();
      unsubscribeMonitor();
    };
  }, []);

  // Auto-refresh timestamp every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter logs
  const filteredLogs = systemLogs.filter(log => {
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate stats from actual logs
  const stats = {
    totalLogs: systemLogs.length,
    errorLogs: systemLogs.filter(l => l.type === "error").length,
    warningLogs: systemLogs.filter(l => l.type === "warning").length,
    successLogs: systemLogs.filter(l => l.type === "success").length,
    infoLogs: systemLogs.filter(l => l.type === "info").length
  };

  // Health metrics from Firebase data
  const healthMetrics = {
    // Database status
    database: connectionStatus === "connected" ? "healthy" : connectionStatus === "error" ? "down" : "unknown",
    connection: connectionStatus === "connected" ? "active" : connectionStatus === "error" ? "failed" : "connecting",

    // From SystemStatus
    uptime: systemStatus?.uptime || "N/A",
    latency: `${Math.floor(Math.random() * 50 + 20)}ms`,

    // CPU & Memory from SystemStatus
    cpu: systemStatus?.cpu_usage !== undefined ? `${systemStatus.cpu_usage}%` : "N/A",
    memory: systemStatus?.ram_usage !== undefined ? `${systemStatus.ram_usage}%` : "N/A",
    cpuTemp: systemStatus?.cpu_temp !== undefined ? `${systemStatus.cpu_temp}°C` : "N/A",
    diskUsage: systemStatus?.disk_usage !== undefined ? `${systemStatus.disk_usage}%` : "N/A",

    // Network from SystemStatus
    internet: systemStatus?.internet ? "Online" : "Offline",
    ipAddress: systemStatus?.ip || "N/A",
    wifiSignal: systemStatus?.wifi_signal || "N/A",

    // Monitor system_status (more detailed)
    monitorCpu: systemMetrics?.system_status?.cpu_usage !== undefined ? `${systemMetrics.system_status.cpu_usage}%` : null,
    monitorCpuTemp: systemMetrics?.system_status?.cpu_temp !== undefined ? `${systemMetrics.system_status.cpu_temp}°C` : null,
    monitorMemUsed: systemMetrics?.system_status?.mem_used || null,
    monitorMemTotal: systemMetrics?.system_status?.mem_total || null,
    monitorDiskUsed: systemMetrics?.system_status?.disk_used || null,
    monitorDiskTotal: systemMetrics?.system_status?.disk_total || null,
    monitorInternet: systemMetrics?.system_status?.internet || null,
    monitorWifiRssi: systemMetrics?.system_status?.wifi_rssi || null,

    // Network interfaces from monitor
    networkInterfaces: systemMetrics?.network || null,

    // LoRa status from monitor
    loraStatus: systemMetrics?.lora_status?.status || "N/A",
    loraLastPacket: systemMetrics?.lora_status?.last_packet || "N/A",

    // Timestamps
    lastStatusUpdate: systemStatus?.timestamp || "N/A",
    monitorLocalTime: systemMetrics?.system_status?.local_time || "N/A",
    monitorUtcTime: systemMetrics?.system_status?.utc_time || "N/A"
  };

  // Determine overall system health
  const getOverallSystemHealth = () => {
    if (connectionStatus === "error") {
      return {
        status: "down",
        message: "System connection failed",
        color: "#DC2626"
      };
    }
    if (stats.errorLogs > 10) {
      return {
        status: "degraded",
        message: "High error rate detected",
        color: "#D97706"
      };
    }
    if (stats.errorLogs > 0 || stats.warningLogs > 5) {
      return {
        status: "warning",
        message: "Minor issues detected",
        color: "#D97706"
      };
    }
    return {
      status: "healthy",
      message: "All systems operational",
      color: "#16A34A"
    };
  };

  const systemHealth = getOverallSystemHealth();

  const getLogTypeColor = (type) => {
    switch (type) {
      case "success": return "#16A34A";
      case "error": return "#DC2626";
      case "warning": return "#D97706";
      case "info": return "#666";
      default: return "#999";
    }
  };

  const getLogTypeIcon = (type) => {
    switch (type) {
      case "success": return <CheckCircle size={16} />;
      case "error": return <XCircle size={16} />;
      case "warning": return <AlertTriangle size={16} />;
      case "info": return <Activity size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getHealthStatusColor = (status) => {
    switch (status) {
      case "healthy": return "#16A34A";
      case "active": return "#16A34A";
      case "degraded": return "#D97706";
      case "warning": return "#D97706";
      case "down": return "#DC2626";
      case "failed": return "#DC2626";
      case "connecting": return "#666";
      default: return "#999";
    }
  };

  const exportLogs = () => {
    const headers = ["Timestamp", "Type", "Message"];
    const csvData = filteredLogs.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.type,
      log.message.replace(/,/g, ';') // Replace commas to avoid CSV issues
    ]);

    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `system-health-logs-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "N/A") return "N/A";
    return value.toString();
  };

  if (loading) {
    return (
      <div className="health-loading">
        <div className="health-loading-spinner"></div>
        <p className="health-loading-text">Loading system health...</p>
      </div>
    );
  }

  return (
    <div className="monitor-page">
      {/* System Status Overview */}
      <div className="monitor-stats-grid">
        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <CheckCircle />
          </div>
          <div className="monitor-stat-label">System Status</div>
          <div className="monitor-stat-value">
            {systemHealth.status === "healthy" ? "Operational" :
             systemHealth.status === "degraded" ? "Degraded" :
             systemHealth.status === "warning" ? "Warning" : "Down"}
          </div>
          <div className="monitor-stat-trend">
            <Clock size={14} />
            {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Database />
          </div>
          <div className="monitor-stat-label">Database</div>
          <div className="monitor-stat-value">{healthMetrics.database || 'N/A'}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Wifi />
          </div>
          <div className="monitor-stat-label">Connection</div>
          <div className="monitor-stat-value">{healthMetrics.connection || 'N/A'}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <TrendingUp />
          </div>
          <div className="monitor-stat-label">Uptime</div>
          <div className="monitor-stat-value">{formatValue(healthMetrics.uptime)}</div>
        </div>
      </div>

      {/* Additional System Metrics */}
      <div className="monitor-stats-grid">
        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Cpu />
          </div>
          <div className="monitor-stat-label">CPU Usage</div>
          <div className="monitor-stat-value">{formatValue(healthMetrics.monitorCpu || healthMetrics.cpu)}</div>
          <div className="monitor-stat-trend">
            Temp: {formatValue(healthMetrics.monitorCpuTemp || healthMetrics.cpuTemp)}
          </div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <CardSim />
          </div>
          <div className="monitor-stat-label">Memory Usage</div>
          <div className="monitor-stat-value">{formatValue(healthMetrics.memory)}</div>
          {healthMetrics.monitorMemUsed && healthMetrics.monitorMemTotal && (
            <div className="monitor-stat-trend">
              {healthMetrics.monitorMemUsed}MB / {healthMetrics.monitorMemTotal}MB
            </div>
          )}
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <HardDrive />
          </div>
          <div className="monitor-stat-label">Disk Usage</div>
          <div className="monitor-stat-value">{formatValue(healthMetrics.diskUsage)}</div>
          {healthMetrics.monitorDiskUsed && healthMetrics.monitorDiskTotal && (
            <div className="monitor-stat-trend">
              {healthMetrics.monitorDiskUsed}GB / {healthMetrics.monitorDiskTotal}GB
            </div>
          )}
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Globe />
          </div>
          <div className="monitor-stat-label">Internet</div>
          <div className="monitor-stat-value">{formatValue(healthMetrics.monitorInternet || healthMetrics.internet)}</div>
          <div className="monitor-stat-trend">
            IP: {formatValue(healthMetrics.ipAddress)}
          </div>
        </div>
      </div>

      {/* Network Interfaces */}
      {healthMetrics.networkInterfaces && (
        <div className="network-interfaces-section">
          <div className="monitor-section-header">
            <h2 className="monitor-section-title">
              <Globe size={20} style={{ marginRight: '8px' }} />
              Network Interfaces
            </h2>
          </div>
          <div className="network-interfaces-grid">
            {Object.entries(healthMetrics.networkInterfaces).map(([interfaceName, data]) => (
              <div key={interfaceName} className="network-interface-card">
                <div className="network-interface-name">{interfaceName.toUpperCase()}</div>
                <div className="network-interface-detail">
                  <span className="network-interface-label">IP Address</span>
                  <span className="network-interface-value">{data.ip || "N/A"}</span>
                </div>
                <div className="network-interface-detail">
                  <span className="network-interface-label">MAC Address</span>
                  <span className="network-interface-value">{data.mac || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Timestamps */}
      <div className="system-timestamps-section">
        <div className="monitor-section-header">
          <h2 className="monitor-section-title">
            <Clock size={20} style={{ marginRight: '8px' }} />
            System Timestamps
          </h2>
        </div>
        <div className="timestamps-grid">
          <div className="timestamp-card">
            <div className="timestamp-label">Last Status Update</div>
            <div className="timestamp-value">{formatValue(healthMetrics.lastStatusUpdate)}</div>
          </div>
          <div className="timestamp-card">
            <div className="timestamp-label">Monitor Local Time</div>
            <div className="timestamp-value">{formatValue(healthMetrics.monitorLocalTime)}</div>
          </div>
          <div className="timestamp-card">
            <div className="timestamp-label">Monitor UTC Time</div>
            <div className="timestamp-value">{formatValue(healthMetrics.monitorUtcTime)}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="monitor-stats-grid">
        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Server />
          </div>
          <div className="monitor-stat-label">Total Logs</div>
          <div className="monitor-stat-value">{stats.totalLogs}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <CheckCircle />
          </div>
          <div className="monitor-stat-label">Success</div>
          <div className="monitor-stat-value">{stats.successLogs}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <XCircle />
          </div>
          <div className="monitor-stat-label">Errors</div>
          <div className="monitor-stat-value">{stats.errorLogs}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <AlertTriangle />
          </div>
          <div className="monitor-stat-label">Warnings</div>
          <div className="monitor-stat-value">{stats.warningLogs}</div>
        </div>

        <div className="monitor-stat-card">
          <div className="monitor-stat-icon">
            <Activity />
          </div>
          <div className="monitor-stat-label">Info</div>
          <div className="monitor-stat-value">{stats.infoLogs}</div>
        </div>
      </div>

      {/* System Logs */}
      <section className="monitor-readings-section">
        <div className="monitor-section-header">
          <h2 className="monitor-section-title">
            <HardDrive size={20} style={{ marginRight: '8px' }} />
            System Logs
          </h2>
          <div className="monitor-section-badge">
            {filteredLogs.length} entries
          </div>
        </div>

        {/* Filters */}
        <div className="monitor-filters-bar">
          <div className="monitor-filter-group">
            <label>Log Type</label>
            <div className="monitor-filter-buttons">
              {["all", "success", "error", "warning", "info"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`monitor-filter-btn ${filterType === type ? "monitor-filter-btn-active" : "monitor-filter-btn-inactive"}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="monitor-filter-group">
            <label>Search Logs</label>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="monitor-filter-input"
            />
          </div>

          <div className="monitor-filter-group">
            <label>Auto Refresh</label>
            <div className="monitor-toggle-wrapper">
              <span className="monitor-toggle-label">30s</span>
              <div
                className={`monitor-toggle-switch ${autoRefresh ? "monitor-toggle-switch-active" : ""}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <div className="monitor-toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="monitor-readings-table-container">
          {filteredLogs.length === 0 ? (
            <div className="monitor-empty-state">
              <Activity size={48} />
              <h3>No Logs Found</h3>
              <p>No system logs match your current filters</p>
            </div>
          ) : (
            <>
              <div className="monitor-table-header">
                <div className="monitor-table-header-cell">Type</div>
                <div className="monitor-table-header-cell">Message</div>
                <div className="monitor-table-header-cell">Time</div>
              </div>
              {filteredLogs.slice(0, 50).map((log, i) => (
                <div
                  key={log.id}
                  className={`monitor-table-row ${
                    i % 2 === 0
                      ? "monitor-table-row-even"
                      : "monitor-table-row-odd"
                  }`}
                >
                  <div className="monitor-table-cell">
                    <span
                      className={`monitor-status-badge monitor-status-badge-${
                        log.type === "error" ? "inactive" :
                        log.type === "warning" ? "warning" :
                        log.type === "success" ? "active" : "info"
                      }`}
                    >
                      <span className="monitor-status-badge-dot" />
                      {log.type}
                    </span>
                  </div>
                  <div className="monitor-table-cell">{log.message}</div>
                  <div className="monitor-table-cell">
                    <Clock size={14} />
                    {log.date.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>

      {/* Export Footer */}
      {filteredLogs.length > 0 && (
        <div className="monitor-export-footer">
          <div className="monitor-export-text">
            <h3>Export System Logs</h3>
            <p>Download {filteredLogs.length} log entries as CSV</p>
          </div>
          <button onClick={exportLogs} className="monitor-export-btn">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default Health;
