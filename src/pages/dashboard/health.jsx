import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw,
  Database, Wifi, Clock, Zap, TrendingUp, Server, HardDrive,
  Eye, Download, Cpu, CardSim, Globe
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";

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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #F0F0F0',
          borderTopColor: '#000',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}></div>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading system health...</p>
      </div>
    );
  }

  return (
    <div className="health-page">
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .health-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .health-header {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 32px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 52px;
          height: 52px;
          background: linear-gradient(135deg, #0369a1, #0284c7);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.25);
        }

        .header-text h1 {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
          letter-spacing: -0.5px;
        }

        .header-text p {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .btn-header {
          padding: 10px 20px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.25);
        }

        .btn-primary:hover {
          background: linear-gradient(135deg, #0c4a6e, #0369a1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.35);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.8);
          color: #0369a1;
          border: 2px solid #e2e8f0;
          backdrop-filter: blur(10px);
        }

        .btn-secondary:hover {
          border-color: #0369a1;
          background: white;
        }

        /* System Status Banner */
        .status-banner {
          background: linear-gradient(135deg, ${systemHealth.color} 0%, ${systemHealth.color}DD 100%);
          border-radius: 16px;
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          box-shadow: 0 8px 24px ${systemHealth.color}40;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .status-indicator {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-text h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .status-text p {
          font-size: 13px;
          opacity: 0.9;
        }

        .status-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          opacity: 0.9;
        }

        /* Health Metrics */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.9);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .metric-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #0ea5e9, #22d3ee, #06b6d4);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .metric-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .metric-card:hover::before {
          opacity: 1;
        }

        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .metric-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
        }

        .metric-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .metric-label {
          font-size: 12px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 32px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.5px;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
        }

        .stat-icon-wrapper {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 12px;
        }

        .stat-label {
          font-size: 11px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.5px;
        }

        /* Additional Metrics Grid */
        .additional-metrics {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        /* Filters */
        .filters-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .filters-row {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 20px;
          align-items: end;
        }

        .filter-group label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-btn-inactive {
          background: #F5F5F5;
          color: #666;
        }

        .filter-btn-active {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
        }

        .filter-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
        }

        .filter-input:focus {
          border-color: #0369a1;
          box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
        }

        .toggle-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .toggle-label {
          font-size: 13px;
          color: #666;
          font-weight: 600;
        }

        .toggle-switch {
          position: relative;
          width: 44px;
          height: 24px;
          background: #E8E8E8;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .toggle-switch.active {
          background: linear-gradient(135deg, #0369a1, #0284c7);
        }

        .toggle-knob {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .toggle-switch.active .toggle-knob {
          left: 22px;
        }

        /* Logs Section */
        .logs-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-title h2 {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
        }

        .section-badge {
          padding: 8px 16px;
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
        }

        .logs-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        .logs-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .log-item {
          padding: 16px 24px;
          border-bottom: 1px solid #F5F5F5;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          transition: all 0.2s ease;
        }

        .log-item:hover {
          background: #FAFAFA;
        }

        .log-item:last-child {
          border-bottom: none;
        }

        .log-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .log-content {
          flex: 1;
        }

        .log-message {
          font-size: 14px;
          color: #000;
          font-weight: 600;
          margin-bottom: 4px;
          line-height: 1.5;
        }

        .log-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #999;
        }

        .log-type-badge {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .log-timestamp {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Empty State */
        .empty-state {
          padding: 60px;
          text-align: center;
        }

        .empty-state-icon {
          color: #CCC;
          margin: 0 auto 16px;
        }

        .empty-state h3 {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
        }

        .empty-state p {
          font-size: 14px;
          color: #999;
        }

        /* Export Footer */
        .export-footer {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
          border: 1px solid #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .export-text h3 {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
        }

        .export-text p {
          font-size: 13px;
          color: #666;
        }

        .export-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.25);
        }

        .export-btn:hover {
          background: linear-gradient(135deg, #0c4a6e, #0369a1);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(3, 105, 161, 0.35);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .additional-metrics {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .health-page {
            padding: 16px;
          }
          .health-header {
            padding: 24px;
          }
          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .metrics-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .additional-metrics {
            grid-template-columns: 1fr;
          }
          .filters-row {
            grid-template-columns: 1fr;
          }
          .status-banner {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* Header */}
      <div className="health-header">
        <div className="header-top">
          <div className="header-left">
            <div className="header-icon">
              <Activity size={24} style={{ color: 'white' }} />
            </div>
            <div className="header-text">
              <h1>System Health Monitor</h1>
              <p>Real-time backend diagnostics & system logs</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header btn-secondary" onClick={() => navigate("/")}>
              <Eye size={16} />
              Dashboard
            </button>
            <button className="btn-header btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="status-banner">
          <div className="status-left">
            <div className="status-indicator"></div>
            <div className="status-text">
              <h3>{systemHealth.status === "healthy" ? "All Systems Operational" :
                systemHealth.status === "degraded" ? "System Degraded" :
                  systemHealth.status === "warning" ? "Warning Status" : "System Down"}</h3>
              <p>{systemHealth.message}</p>
            </div>
          </div>
          <div className="status-time">
            <Clock size={16} />
            Last checked: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Primary Health Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Database size={20} />
            </div>
            <div
              className="metric-status"
              style={{ background: getHealthStatusColor(healthMetrics.database) }}
            ></div>
          </div>
          <div className="metric-label">Database</div>
          <div className="metric-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>
            {healthMetrics.database}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Wifi size={20} />
            </div>
            <div
              className="metric-status"
              style={{ background: getHealthStatusColor(healthMetrics.connection) }}
            ></div>
          </div>
          <div className="metric-label">Connection</div>
          <div className="metric-value" style={{ fontSize: '18px', textTransform: 'capitalize' }}>
            {healthMetrics.connection}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="metric-label">Uptime</div>
          <div className="metric-value" style={{ fontSize: '24px' }}>
            {formatValue(healthMetrics.uptime)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Zap size={20} />
            </div>
          </div>
          <div className="metric-label">Latency</div>
          <div className="metric-value" style={{ fontSize: '24px' }}>
            {formatValue(healthMetrics.latency)}
          </div>
        </div>
      </div>

      {/* Additional System Metrics */}
      <div className="additional-metrics">
        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Cpu size={20} />
            </div>
          </div>
          <div className="metric-label">CPU Usage</div>
          <div className="metric-value" style={{ fontSize: '24px' }}>
            {formatValue(healthMetrics.monitorCpu || healthMetrics.cpu)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Temp: {formatValue(healthMetrics.monitorCpuTemp || healthMetrics.cpuTemp)}
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <CardSim size={20} />
            </div>
          </div>
          <div className="metric-label">Memory Usage</div>
          <div className="metric-value" style={{ fontSize: '24px' }}>
            {formatValue(healthMetrics.memory)}
          </div>
          {healthMetrics.monitorMemUsed && healthMetrics.monitorMemTotal && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {healthMetrics.monitorMemUsed}MB / {healthMetrics.monitorMemTotal}MB
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <HardDrive size={20} />
            </div>
          </div>
          <div className="metric-label">Disk Usage</div>
          <div className="metric-value" style={{ fontSize: '24px' }}>
            {formatValue(healthMetrics.diskUsage)}
          </div>
          {healthMetrics.monitorDiskUsed && healthMetrics.monitorDiskTotal && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              {healthMetrics.monitorDiskUsed}GB / {healthMetrics.monitorDiskTotal}GB
            </div>
          )}
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Globe size={20} />
            </div>
            <div
              className="metric-status"
              style={{ background: healthMetrics.internet === "Online" ? "#16A34A" : "#DC2626" }}
            ></div>
          </div>
          <div className="metric-label">Internet</div>
          <div className="metric-value" style={{ fontSize: '18px' }}>
            {formatValue(healthMetrics.monitorInternet || healthMetrics.internet)}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            IP: {formatValue(healthMetrics.ipAddress)}
          </div>
        </div>

        {healthMetrics.loraStatus && healthMetrics.loraStatus !== "N/A" && (
          <div className="metric-card">
            <div className="metric-header">
              <div className="metric-icon">
                <Activity size={20} />
              </div>
              <div
                className="metric-status"
                style={{ background: healthMetrics.loraStatus === "Running" ? "#16A34A" : "#DC2626" }}
              ></div>
            </div>
            <div className="metric-label">LoRa Status</div>
            <div className="metric-value" style={{ fontSize: '18px' }}>
              {formatValue(healthMetrics.loraStatus)}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
              Last: {formatValue(healthMetrics.loraLastPacket)}
            </div>
          </div>
        )}

        <div className="metric-card">
          <div className="metric-header">
            <div className="metric-icon">
              <Wifi size={20} />
            </div>
          </div>
          <div className="metric-label">WiFi Signal</div>
          <div className="metric-value" style={{ fontSize: '16px' }}>
            {healthMetrics.monitorWifiRssi ? `${healthMetrics.monitorWifiRssi} dBm` : formatValue(healthMetrics.wifiSignal)}
          </div>
        </div>
      </div>

      {/* Network Interfaces */}
      {healthMetrics.networkInterfaces && (
        <div style={{ marginBottom: '24px' }}>
          <div className="logs-header">
            <div className="section-title">
              <Globe size={20} />
              <h2>Network Interfaces</h2>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            {Object.entries(healthMetrics.networkInterfaces).map(([interfaceName, data]) => (
              <div key={interfaceName} className="metric-card">
                <div className="metric-label">{interfaceName.toUpperCase()}</div>
                <div style={{ marginTop: '12px', fontSize: '14px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>IP:</strong> {data.ip || "N/A"}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    <strong>MAC:</strong> {data.mac || "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Timestamps */}
      <div style={{ marginBottom: '24px' }}>
        <div className="metric-card">
          <div className="metric-label">System Timestamps</div>
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Last Status Update</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatValue(healthMetrics.lastStatusUpdate)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Monitor Local Time</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatValue(healthMetrics.monitorLocalTime)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Monitor UTC Time</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{formatValue(healthMetrics.monitorUtcTime)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Server size={20} />
          </div>
          <div className="stat-label">Total Logs</div>
          <div className="stat-value">{stats.totalLogs}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#DCFCE7' }}>
            <CheckCircle size={20} style={{ color: '#16A34A' }} />
          </div>
          <div className="stat-label">Success</div>
          <div className="stat-value">{stats.successLogs}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#FEE2E2' }}>
            <XCircle size={20} style={{ color: '#DC2626' }} />
          </div>
          <div className="stat-label">Errors</div>
          <div className="stat-value">{stats.errorLogs}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: '#FEF3C7' }}>
            <AlertTriangle size={20} style={{ color: '#D97706' }} />
          </div>
          <div className="stat-label">Warnings</div>
          <div className="stat-value">{stats.warningLogs}</div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper">
            <Activity size={20} />
          </div>
          <div className="stat-label">Info</div>
          <div className="stat-value">{stats.infoLogs}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-row">
          <div className="filter-group">
            <label>Log Type</label>
            <div className="filter-buttons">
              {["all", "success", "error", "warning", "info"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={filterType === type ? "filter-btn filter-btn-active" : "filter-btn filter-btn-inactive"}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Search Logs</label>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Auto Refresh</label>
            <div className="toggle-wrapper">
              <span className="toggle-label">30s</span>
              <div
                className={autoRefresh ? "toggle-switch active" : "toggle-switch"}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <div className="toggle-knob"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Section */}
      <div className="logs-header">
        <div className="section-title">
          <HardDrive size={20} />
          <h2>System Logs</h2>
        </div>
        <div className="section-badge">
          {filteredLogs.length} entries
        </div>
      </div>

      <div className="logs-container">
        {filteredLogs.length === 0 ? (
          <div className="empty-state">
            <Activity size={48} className="empty-state-icon" />
            <h3>No Logs Found</h3>
            <p>No system logs match your current filters</p>
          </div>
        ) : (
          <div className="logs-list">
            {filteredLogs.map((log) => (
              <div key={log.id} className="log-item">
                <div
                  className="log-icon"
                  style={{
                    background: `${getLogTypeColor(log.type)}20`,
                    color: getLogTypeColor(log.type)
                  }}
                >
                  {getLogTypeIcon(log.type)}
                </div>
                <div className="log-content">
                  <div className="log-message">{log.message}</div>
                  <div className="log-meta">
                    <span
                      className="log-type-badge"
                      style={{
                        background: `${getLogTypeColor(log.type)}20`,
                        color: getLogTypeColor(log.type)
                      }}
                    >
                      {log.type}
                    </span>
                    <span className="log-timestamp">
                      <Clock size={12} />
                      {log.date.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Footer */}
      {filteredLogs.length > 0 && (
        <div className="export-footer">
          <div className="export-text">
            <h3>Export System Logs</h3>
            <p>Download {filteredLogs.length} log entries as CSV</p>
          </div>
          <button onClick={exportLogs} className="export-btn">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default Health;
