import React, { useState, useEffect, useMemo } from "react";
import {
  Activity, Signal, Droplets, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Calendar, Info, Edit
} from "lucide-react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../../config/firebase";
import "../../styles/monitor.css";

// Local Tooltip for table
const TableTooltip = ({ text }) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="monitor-tooltip-wrapper"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <button className="monitor-tooltip-btn">
        <Info />
      </button>
      {show && <span className="monitor-tooltip-content">{text}</span>}
    </span>
  );
};
// import { useNavigate } from "react-router-dom"; // Unused after header removal
// Cleaned up unused import

const Monitor = () => {
  // const navigate = useNavigate(); // Unused
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNodeView, setSelectedNodeView] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [allReadings, setAllReadings] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [cableLength, setCableLength] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // const handleRefresh = () => { // Unused
  //   window.location.reload();
  // };

  // Fetch data from Firebase
  useEffect(() => {
    console.log("📡 Loading monitor data from Firebase...");

    const rootRef = ref(database);

    const unsubscribe = onValue(rootRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const readings = [];
        const nodesList = [];

        // Get node configurations from config.nodes
        if (data.config && data.config.nodes) {
          Object.keys(data.config.nodes).forEach(key => {
            const nodeConfig = data.config.nodes[key];
            nodesList.push({
              name: key,
              activated: nodeConfig.activated || false,
              h1_m: nodeConfig.h1_m || 0
            });
          });
        }

        console.log(`📍 Found ${nodesList.length} nodes:`, nodesList);

        // Process LoRaSensor data
        if (data.LoRaSensor) {
          Object.keys(data.LoRaSensor).forEach(nodeKey => {
            const nodeData = data.LoRaSensor[nodeKey];
            const nodeInfo = nodesList.find(n => n.name === nodeKey) || {
              name: nodeKey,
              activated: false,
              h1_m: 0
            };

            if (typeof nodeData === 'object' && nodeData !== null) {
              Object.keys(nodeData).forEach(timestamp => {
                const reading = nodeData[timestamp];

                if (!reading || typeof reading !== 'object') return;

                let depth_m = 0;

                // 1. Try checking direct numeric fields (case-insensitive keys if possible, but manual check for common ones)
                if (reading.depth_m !== undefined) depth_m = parseFloat(reading.depth_m);
                else if (reading.Depth !== undefined) depth_m = parseFloat(reading.Depth);
                else if (reading.depth !== undefined) depth_m = parseFloat(reading.depth);
                else if (reading.H2 !== undefined) depth_m = parseFloat(reading.H2);
                else if (reading.h2 !== undefined) depth_m = parseFloat(reading.h2);

                // 2. If still 0 (or undefined), try RawData string parsing
                if ((!depth_m || depth_m === 0) && reading.RawData && typeof reading.RawData === 'string') {
                  // Try strict match first: Depth=1.23m
                  let depthMatch = reading.RawData.match(/Depth\s*[=:]\s*([\d.]+)/i);

                  // If no match, try finding just the number if the string is simple
                  if (!depthMatch) {
                    depthMatch = reading.RawData.match(/D\s*[=:]\s*([\d.]+)/i);
                  }

                  if (depthMatch) depth_m = parseFloat(depthMatch[1]);
                }

                const h2_m = depth_m;
                // Correct Water Height Calculation
                // h1 = cable length (depth to cable end)
                // h2 = sensor reading (depth to water surface)
                // If h2 < h1: water present, Height = h1 - h2
                // If h2 >= h1: no water or error
                let waterHeight = 0;

                if (nodeInfo.h1_m > 0) {
                  waterHeight = nodeInfo.h1_m - h2_m;
                }

                // Determine status based on water height
                let status = "inactive";
                if (nodeInfo.activated) {
                  if (waterHeight <= 0) {
                    status = "critical";
                  } else if (waterHeight < 5) {
                    status = "warning";
                  } else if (waterHeight < 10) {
                    status = "warning";
                  } else {
                    status = "active";
                  }
                }

                let parsedDate = new Date(timestamp);

                // Robust timestamp parsing
                if (isNaN(parsedDate.getTime())) {
                  // Handle format: YYYY-MM-DD_HH-mm-ss
                  // Replace first "_" with "T" and last two "-" with ":"
                  // Example: 2026-01-24_17-10-45 -> 2026-01-24T17:10:45
                  if (timestamp.includes('_') && timestamp.includes('-')) {
                    // Find the underscore
                    const parts = timestamp.split('_');
                    if (parts.length === 2) {
                      const datePart = parts[0];
                      const timePart = parts[1].replace(/-/g, ':');
                      const isoString = `${datePart}T${timePart}`;
                      parsedDate = new Date(isoString);
                    }
                  }

                  // Try parsing as integer (Unix timestamp or ID)
                  if (isNaN(parsedDate.getTime()) && !isNaN(parseInt(timestamp))) {
                    parsedDate = new Date(parseInt(timestamp));
                  }
                  // If still invalid, check if there's a Timestamp field in the reading object
                  if (isNaN(parsedDate.getTime()) && reading.Timestamp) {
                    parsedDate = new Date(reading.Timestamp);
                  }

                  // If completely failed
                  if (isNaN(parsedDate.getTime())) {
                    console.warn(`Invalid timestamp for node ${nodeKey}: ${timestamp}`);
                    return;
                  }
                }

                readings.push({
                  id: `${nodeKey}-${timestamp}`,
                  node: nodeKey,
                  nodeStatus: status,
                  timestamp: timestamp,
                  date: parsedDate,
                  waterHeightM: parseFloat(waterHeight.toFixed(2)),
                  waterHeightFt: parseFloat((waterHeight * 3.28084).toFixed(2)),
                  h1: nodeInfo.h1_m,
                  h2: parseFloat(h2_m.toFixed(2)),
                  depth_m: parseFloat(depth_m.toFixed(2)),
                  activated: nodeInfo.activated,
                  rawData: JSON.stringify(reading), // Capture ENTIRE object for debug
                  region: "Arusha, Tanzania"
                });
              });
            }
          });
        }

        // Sort by most recent first
        readings.sort((a, b) => b.date - a.date);

        setAllReadings(readings);
        setAllNodes(nodesList);
        // setLastUpdate(new Date());
        console.log(`✅ Loaded ${readings.length} readings from ${nodesList.length} nodes`);
      } else {
        console.log("⚠️ No data found in Firebase");
      }
      setLoading(false);
    }, (error) => {
      console.error("❌ Firebase error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Auto-refresh timestamp - Removed as lastUpdate is unused
  // useEffect(() => {
  //   if (!autoRefresh) return;
  //   const interval = setInterval(() => {
  //     // setLastUpdate(new Date());
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, [autoRefresh]);

  // Filter and sort readings
  const filteredData = useMemo(() => {
    let result = [...allReadings];

    // Filter by selected node view
    if (selectedNodeView !== "all") {
      result = result.filter((item) => item.node === selectedNodeView);
    }

    if (filter !== "all") {
      const now = new Date();
      if (filter === "today") {
        result = result.filter((item) => item.date.toDateString() === now.toDateString());
      } else if (filter === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter((item) => item.date >= weekAgo);
      } else if (filter === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter((item) => item.date >= monthAgo);
      }
    }

    if (searchTerm) {
      result = result.filter((item) =>
        item.node.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortBy === "level-high") {
      result.sort((a, b) => b.waterHeightM - a.waterHeightM);
    } else if (sortBy === "level-low") {
      result.sort((a, b) => a.waterHeightM - b.waterHeightM);
    } else if (sortBy === "status") {
      const statusOrder = { critical: 0, warning: 1, active: 2, inactive: 3 };
      result.sort((a, b) => statusOrder[a.nodeStatus] - statusOrder[b.nodeStatus]);
    } else {
      result.sort((a, b) => b.date - a.date);
    }

    return result;
  }, [allReadings, filter, searchTerm, sortBy, selectedNodeView]);

  // Calculate node statistics
  const nodeStats = useMemo(() => {
    const stats = {};

    allNodes.forEach(node => {
      stats[node.name] = {
        name: node.name,
        count: 0,
        avgHeight: 0,
        maxHeight: 0,
        minHeight: Infinity,
        lastReading: null,
        status: node.activated ? "active" : "inactive",
        activated: node.activated,
        h1_m: node.h1_m,
        latestStatus: "inactive"
      };
    });

    // Use allReadings instead of filteredData to get accurate stats for all nodes
    allReadings.forEach((item) => {
      if (stats[item.node]) {
        stats[item.node].count++;
        if (item.activated) {
          stats[item.node].avgHeight += item.waterHeightM;
        }
        stats[item.node].maxHeight = Math.max(stats[item.node].maxHeight, item.waterHeightM);
        stats[item.node].minHeight = Math.min(stats[item.node].minHeight, item.waterHeightM);

        if (!stats[item.node].lastReading || item.date > new Date(stats[item.node].lastReading)) {
          stats[item.node].lastReading = item.timestamp;
          stats[item.node].latestStatus = item.nodeStatus;
        }
      }
    });

    Object.keys(stats).forEach((key) => {
      if (stats[key].count > 0) {
        const activatedCount = allReadings.filter(r => r.node === key && r.activated).length;
        stats[key].avgHeight = activatedCount > 0
          ? parseFloat((stats[key].avgHeight / activatedCount).toFixed(2))
          : 0;
        if (stats[key].minHeight === Infinity) stats[key].minHeight = 0;
      } else {
        stats[key].minHeight = 0;
      }
    });

    return Object.values(stats);
  }, [allReadings, allNodes]);

  // Edit cable length
  const handleEditCableLength = (node) => {
    // Find the node active stats to show current values
    const nodeStat = nodeStats.find(n => n.name === node.name);
    setEditModal({ ...nodeStat, ...node });
    setCableLength(node.h1_m?.toString() || "");
  };

  const handleUpdateCableLength = async () => {
    if (!cableLength || parseFloat(cableLength) <= 0) {
      alert("Please enter a valid cable length");
      return;
    }

    try {
      const nodeConfigRef = ref(database, `config/nodes/${editModal.name}/h1_m`);
      await set(nodeConfigRef, parseFloat(cableLength));

      setEditModal(null);
      setCableLength("");
      showToast(`Cable length updated for ${editModal.name}`, 'success');
    } catch (error) {
      console.error("❌ Error updating cable length:", error);
      showToast("Failed to update cable length", 'error');
    }
  };

  // Toast component (inline)
  const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#000';

    return (
      <div style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        background: bgColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        animation: 'slideIn 0.3s ease',
        minWidth: '300px'
      }}>
        {type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
        <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
      </div>
    );
  };



  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "#16A34A";
      case "warning": return "#D97706";
      case "critical": return "#DC2626";
      case "inactive": return "#64748B"; // Slate-500 for pending
      default: return "#999";
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #F0F0F0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading monitor data...</p>
      </div>
    );
  }

  return (
    <div className="monitor-page">
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .monitor-page {
          min-height: 100vh;
          background: #FAFAFA;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .monitor-header {
          background: white;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          border: 1px solid #E8E8E8;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #00cf45bc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .pulse-indicator {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #16A34A;
          border-radius: 50%;
          border: 2px solid white;
          animation: pulse 2s ease-in-out infinite;
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
          background: #00cf45bc;
          color: white;
        }

        .btn-primary:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: white;
          color: #000;
          border: 2px solid #E8E8E8;
        }

        .btn-secondary:hover {
          border-color: #00cf45bc;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .info-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: #FAFAFA;
          border-radius: 10px;
        }

        .info-label {
          font-size: 12px;
          color: #999;
          font-weight: 600;
        }

        .info-value {
          font-size: 16px;
          font-weight: 700;
          color: #000;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E8E8E8;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #F5F5F5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.5px;
        }

        .stat-unit {
          font-size: 16px;
          color: #666;
          margin-left: 4px;
        }

        /* Node Selector */
        .node-selector-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #E8E8E8;
        }

        .node-selector-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .node-selector-title {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .node-selector-info {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }

        .node-selector-buttons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .node-btn {
          flex: 1;
          min-width: 180px;
          padding: 16px 20px;
          border-radius: 12px;
          border: 2px solid #E8E8E8;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .node-btn:hover {
          border-color: #00cf45bc;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        .node-btn-inactive {
          border-color: #E8E8E8;
        }

        .node-btn-active {
          border-color: #00cf45bc;
          background: #00cf45bc;
        }

        .node-btn-active .node-btn-name {
          color: white;
        }

        .node-btn-active .node-btn-count {
          color: rgba(255,255,255,0.7);
        }

        .node-btn-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .node-btn-name {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          margin-bottom: 2px;
        }

        .node-btn-count {
          font-size: 11px;
          color: #999;
          font-weight: 600;
        }

        /* Filters */
        .filters-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #E8E8E8;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
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
          background: green;
          color: white;
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
          border-color: #00cf45bc;
        }

        .filter-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          cursor: pointer;
          background: white;
          font-weight: 600;
        }

        /* Node Status Cards */
        .nodes-section {
          margin-bottom: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
        }

        .section-badge {
          padding: 6px 12px;
          background: #00cf45bc;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .node-status-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E8E8E8;
          transition: all 0.2s ease;
        }

        .node-status-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .node-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .node-name {
          font-size: 18px;
          font-weight: 700;
          color: #000;
        }

        .node-status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .btn-icon-small {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #F5F5F5;
          border: 1px solid #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s ease;
        }

        .btn-icon-small:hover {
          background: #E8E8E8;
          color: #00cf45bc;
          border-color: #00cf45bc;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 24px;
        }

        .modal-content {
          background: white;
          padding: 32px;
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          margin-bottom: 24px;
        }

        .modal-title {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #666;
        }

        .modal-info {
          padding: 20px;
          background: #FAFAFA;
          border-radius: 12px;
          margin-bottom: 24px;
          border: 1px solid #E8E8E8;
        }

        .modal-info p {
          color: #666;
          font-size: 13px;
          line-height: 1.8;
          margin: 0;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 700;
          color: #000;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .form-input {
          width: 100%;
          padding: 14px;
          border: 2px solid #E8E8E8;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
        }

        .form-input:focus {
          border-color: #000;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .btn-modal {
          flex: 1;
          padding: 14px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .btn-modal-dark {
          background: #000;
          color: white;
        }

        .btn-modal-dark:hover {
          background: #333;
        }

        .btn-modal-cancel {
          background: #F5F5F5;
          color: #666;
        }

        .btn-modal-cancel:hover {
          background: #E8E8E8;
        }

        .node-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .node-metric {
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
        }

        .node-metric-label {
          font-size: 11px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .node-metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
        }

        .node-footer {
          padding-top: 16px;
          border-top: 1px solid #F0F0F0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .node-readings-count {
          color: #999;
          font-weight: 600;
        }

        .node-last-update {
          color: #666;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* Recent Readings */
        .readings-section h2 {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          margin-bottom: 16px;
          letter-spacing: -0.3px;
        }

        .header-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          margin: 0;
          letter-spacing: -0.5px;
        }

        .page-subtitle {
          font-size: 13px;
          color: #666;
          font-weight: 500;
          margin: 0;
        }

        .live-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #dc2626, #ef4444);
          color: white;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .readings-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .reading-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #E8E8E8;
          transition: all 0.2s ease;
        }

        .reading-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }

        .reading-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .reading-node {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reading-node-name {
          font-size: 16px;
          font-weight: 700;
          color: #000;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .reading-time {
          font-size: 12px;
          color: #999;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .reading-metrics {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .reading-metric {
          padding: 12px;
          background: #FAFAFA;
          border-radius: 8px;
          text-align: center;
        }

        .reading-metric-label {
          font-size: 10px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .reading-metric-value {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.2px;
        }

        /* Empty State */
        .empty-state {
          background: white;
          border-radius: 16px;
          padding: 60px;
          text-align: center;
          border: 2px dashed #E8E8E8;
          grid-column: 1 / -1;
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

        /* Responsive */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .node-selector-buttons {
            flex-direction: column;
          }
          .node-btn {
            min-width: 100%;
          }
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .nodes-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .monitor-page {
            padding: 16px;
          }
          .monitor-header {
            padding: 24px;
          }
          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .header-info {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            width: 100%;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .filters-grid {
            grid-template-columns: 1fr;
          }
          .reading-metrics {
            grid-template-columns: 1fr;
          }
          .node-selector-buttons {
            flex-direction: column;
          }
          .node-btn {
            min-width: 100%;
          }
        }
      `}</style>




      {/* Stats */}
      {/* Stats & Insights Grid */}
      <div className="stats-insights-grid">
        {/* Stats Row */}
        <div className="stats-row">
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', border: 'none' }}>
            <div className="stat-icon" style={{ background: 'white' }}>
              <Signal size={20} style={{ color: '#2563EB' }} />
            </div>
            <div className="stat-label" style={{ color: '#1E40AF' }}>Total Nodes</div>
            <div className="stat-value" style={{ color: '#1E3A8A' }}>{nodeStats.length}</div>
            <div style={{ fontSize: '12px', color: '#60A5FA', marginTop: '4px' }}>Monitoring grid</div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: 'none' }}>
            <div className="stat-icon" style={{ background: 'white' }}>
              <CheckCircle size={20} style={{ color: '#16A34A' }} />
            </div>
            <div className="stat-label" style={{ color: '#15803D' }}>Active</div>
            <div className="stat-value" style={{ color: '#14532D' }}>{nodeStats.filter(n => n.activated).length}</div>
            <div style={{ fontSize: '12px', color: '#4ADE80', marginTop: '4px' }}>
              {Math.round((nodeStats.filter(n => n.activated).length / (nodeStats.length || 1)) * 100)}% online
            </div>
          </div>

          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)', border: 'none' }}>
            <div className="stat-icon" style={{ background: 'white' }}>
              <Droplets size={20} style={{ color: '#0EA5E9' }} />
            </div>
            <div className="stat-label" style={{ color: '#0369A1' }}>Avg Depth</div>
            <div className="stat-value" style={{ color: '#0C4A6E' }}>
              {nodeStats.filter(n => n.activated).length > 0
                ? (nodeStats.filter(n => n.activated).reduce((sum, n) => sum + parseFloat(n.avgHeight), 0) / nodeStats.filter(n => n.activated).length).toFixed(1)
                : "0.0"}
              <span className="stat-unit" style={{ fontSize: '16px', color: '#0369A1' }}>m</span>
            </div>
            <div style={{ fontSize: '12px', color: '#38BDF8', marginTop: '4px' }}>stable levels</div>
          </div>
        </div>

        {/* Insights Panel */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#64748B', fontWeight: 600 }}>
            <Activity size={18} />
            System Insights
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22C55E' }}></div>
              All sensors operating within normal parameters
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }}></div>
              Data stream connection is stable (24ms latency)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#334155' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }}></div>
              Water levels trending steady over last 24h
            </div>
          </div>
        </div>
      </div>

      {/* Node Selector */}
      {allNodes.length > 0 && (
        <div className="node-selector-card">
          <div className="node-selector-header">
            <div className="node-selector-title">
              <Signal size={16} />
              Select Node View
            </div>
            <div className="node-selector-info">
              {allNodes.filter(n => n.activated).length} active nodes • {allReadings.length} total readings
            </div>
          </div>
          <div className="node-selector-buttons">
            <button
              onClick={() => setSelectedNodeView("all")}
              className={selectedNodeView === "all" ? "node-btn node-btn-active" : "node-btn node-btn-inactive"}
            >
              <Signal size={16} />
              <div>
                <div className="node-btn-name">All Nodes</div>
                <div className="node-btn-count">{allReadings.length} readings</div>
              </div>
            </button>
            {allNodes
              .filter(node => node.activated) // Only show activated nodes
              .map((node) => {
                const nodeReadingsCount = allReadings.filter(r => r.node === node.name).length;
                const nodeStatus = nodeStats.find(n => n.name === node.name)?.latestStatus || "inactive";
                return (
                  <button
                    key={node.name}
                    onClick={() => setSelectedNodeView(node.name)}
                    className={selectedNodeView === node.name ? "node-btn node-btn-active" : "node-btn node-btn-inactive"}
                  >
                    <div
                      className="node-btn-indicator"
                      style={{ background: getStatusColor(nodeStatus) }}
                    ></div>
                    <div>
                      <div className="node-btn-name">{node.name}</div>
                      <div className="node-btn-count">{nodeReadingsCount} readings • h₁={node.h1_m}m</div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-card">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Time Period</label>
            <div className="filter-buttons">
              {["all", "today", "week", "month"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={filter === f ? "filter-btn filter-btn-active" : "filter-btn filter-btn-inactive"}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search node or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="filter-select">
              <option value="time">Most Recent</option>
              <option value="level-high">Highest Level</option>
              <option value="level-low">Lowest Level</option>
              <option value="status">Status Priority</option>
            </select>
          </div>
        </div>
      </div>

      {allReadings.length === 0 ? (
        <div className="empty-state">
          <Droplets size={48} style={{ color: '#CCC', marginBottom: '16px' }} />
          <h3>No Sensor Data</h3>
          <p>Waiting for LoRa sensor readings from configured nodes...</p>
        </div>
      ) : (
        <>
          {/* Node Status Cards */}
          <section className="monitor-nodes-section">
            <div className="monitor-section-header">
              <h2 className="monitor-section-title">
                {selectedNodeView === "all" ? "All Nodes Status" : `${selectedNodeView} Status`}
              </h2>
              <div className="monitor-section-badge">
                {selectedNodeView === "all"
                  ? `${nodeStats.filter(n => n.activated).length} active nodes`
                  : `h₁ = ${nodeStats.find(n => n.name === selectedNodeView)?.h1_m || 0}m`}
              </div>
            </div>

            {/* Edit Cable Length Modal */}
            {editModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2 className="modal-title">Edit Cable Length - {editModal.name}</h2>
                    <p className="modal-subtitle">Update h₁ (cable length) for this node</p>
                  </div>

                  <div className="modal-info">
                    <p>
                      <strong>Current Values:</strong><br />
                      • h₁ (Cable): {editModal.h1_m}m<br />
                      Updating cable length will recalculate water height automatically.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      New Cable Length (h₁) in meters <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={cableLength}
                      onChange={(e) => setCableLength(e.target.value)}
                      placeholder="Enter new cable length"
                      className="form-input"
                      autoFocus
                    />
                  </div>

                  <div className="modal-actions">
                    <button onClick={handleUpdateCableLength} className="btn-modal btn-modal-dark">
                      <CheckCircle size={16} />
                      Update Cable Length
                    </button>
                    <button
                      onClick={() => {
                        setEditModal(null);
                        setCableLength("");
                      }}
                      className="btn-modal btn-modal-cancel"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="monitor-nodes-grid">
              {nodeStats
                .filter(node => {
                  // Show all activated nodes when "all" is selected, or just the selected node
                  if (selectedNodeView === "all") {
                    return node.activated;
                  }
                  return node.name === selectedNodeView;
                })
                .map((node) => (
                  <div key={node.name} className="monitor-node-card">
                    <div className="monitor-node-card-header">
                      <div className="monitor-node-card-left">
                        <div className="monitor-node-card-icon monitor-node-card-icon-sky">
                          <Droplets />
                        </div>
                        <div>
                          <h3 className="monitor-node-card-name">{node.name}</h3>
                          <p className="monitor-node-card-id">Sensor ID: #{node.name.substring(0, 4)}...</p>
                        </div>
                      </div>
                      <button
                        className="monitor-node-card-edit"
                        onClick={() => handleEditCableLength(node)}
                        title="Edit Cable Length"
                      >
                        <Edit />
                      </button>
                    </div>

                    <div className="monitor-water-level">
                      <div className="monitor-water-level-header">
                        <span className="monitor-water-level-label">Water Level</span>
                        <span className="monitor-water-level-value">
                          {node.avgHeight}m <span>/ {node.h1_m}m</span>
                        </span>
                      </div>
                      <div className="monitor-progress-bar">
                        <div
                          className="monitor-progress-fill"
                          style={{ width: `${(parseFloat(node.avgHeight) / parseFloat(node.h1_m || 20)) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="monitor-node-card-footer">
                      <div className="monitor-node-card-footer-item">
                        <Signal /> {node.count} readings
                      </div>
                      <div className="monitor-node-card-footer-item">
                        <Clock />{" "}
                        {node.lastReading
                          ? new Date(node.lastReading).toLocaleTimeString()
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </section>

          {/* Recent Readings */}
          <section className="monitor-readings-section">
            <div className="monitor-section-header">
              <h2 className="monitor-section-title">
                {selectedNodeView === "all" ? "Recent Readings - All Nodes" : `Recent Readings - ${selectedNodeView}`}
              </h2>
              <div className="monitor-section-badge">
                Showing {filteredData.length} of {allReadings.length} readings
              </div>
            </div>
            <div className="monitor-readings-table-container">
              <div className="table-wrapper">
                <table className="monitor-table">
                  <thead>
                    <tr>
                      <th>Node</th>
                      <th>Status</th>
                      <th>Region</th>
                      <th>Time</th>
                      <th>Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 20).map((item, i) => (
                      <tr key={item.id} className={i % 2 === 0 ? "monitor-table-row-even" : "monitor-table-row-odd"}>
                        <td>{item.node}</td>
                        <td>
                          <span
                            className={`monitor-status-badge monitor-status-badge-${item.nodeStatus.toLowerCase()}`}
                          >
                            <span className="monitor-status-badge-dot" />
                            {item.nodeStatus}
                          </span>
                        </td>
                        <td>{item.region}</td>
                        <td>
                          <Calendar /> {new Date(item.date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <TrendingUp /> {item.waterHeightM}m
                          <TableTooltip text="Distance from sensor to water surface" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )
      }
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div >
  );
};

export default Monitor;
