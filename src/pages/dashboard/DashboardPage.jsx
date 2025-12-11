import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Droplets, Activity, AlertTriangle, MapPin, 
  Zap, ChevronRight, Eye, Edit, CheckCircle, 
  XCircle, TrendingUp, TrendingDown, RefreshCw,
  BarChart3, Gauge, Battery, Settings
} from "lucide-react";
import { ref, onValue, set } from "firebase/database";
import { database } from "../../config/firebase";
import notificationService from "../../services/NotificationService";

// Toast notification component (inline since react-hot-toast not installed)
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
      {type === 'success' && <CheckCircle size={20} />}
      {type === 'error' && <XCircle size={20} />}
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  );
};

const DashboardPage = () => {
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [stats, setStats] = useState({
    totalNodes: 0,
    activeNodes: 0,
    alerts: 0,
    notActivated: 0,
    totalWaterHeight: 0,
    avgWaterHeight: 0
  });
  const [loading, setLoading] = useState(true);
  const [activationModal, setActivationModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [cableLength, setCableLength] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = "WISE Future"; // You can get this from currentUser if available

    if (hour >= 0 && hour < 6) {
      return {
        text: `Still awake, ${name}? 🌙`,
        subtext: "Late night monitoring session"
      };
    } else if (hour >= 6 && hour < 12) {
      return {
        text: `Good morning, ${name}! ☀️`,
        subtext: "Ready to start the day"
      };
    } else if (hour >= 12 && hour < 17) {
      return {
        text: `Good afternoon, ${name}! 👋`,
        subtext: "Hope you're having a productive day"
      };
    } else if (hour >= 17 && hour < 21) {
      return {
        text: `Good evening, ${name}! 🌆`,
        subtext: "Winding down for the day"
      };
    } else {
      return {
        text: `Good night, ${name}! 🌃`,
        subtext: "Late evening check-in"
      };
    }
  };

  const greeting = getGreeting();

  // Fetch all data from Firebase
  useEffect(() => {
    console.log("🚀 Starting Firebase connection...");
    
    // Initialize notification service
    notificationService.init();
    
    const rootRef = ref(database);
    
    const unsubscribe = onValue(rootRef, (snapshot) => {
      console.log("📡 Firebase snapshot received");
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log("📊 Database structure:", Object.keys(data));
        
        // Get selected node from config
        if (data.config && data.config.selectedNode) {
          setSelectedNode(data.config.selectedNode);
        }
        
        // Process LoRaSensor data to extract nodes
        if (data.LoRaSensor && data.config && data.config.nodes) {
          const nodeKeys = Object.keys(data.LoRaSensor);
          const nodesArray = [];
          
          nodeKeys.forEach(nodeKey => {
            const nodeData = data.LoRaSensor[nodeKey];
            const nodeConfig = data.config.nodes[nodeKey];
            
            // Get the latest reading
            const timestamps = Object.keys(nodeData).sort().reverse();
            const latestTimestamp = timestamps[0];
            const latestReading = nodeData[latestTimestamp];
            
            // Update notification service with latest timestamp
            notificationService.updateNodeTimestamp(nodeKey, latestTimestamp);
            
            // Parse RawData string
            let voltage_mV = 0;
            let current_mA = 0;
            let depth_m = 0;
            
            if (latestReading.RawData && typeof latestReading.RawData === 'string') {
              const voltageMatch = latestReading.RawData.match(/Voltage=(\d+)mV/);
              const currentMatch = latestReading.RawData.match(/Current=([\d.]+)mA/);
              const depthMatch = latestReading.RawData.match(/Depth=([\d.]+)m/);
              
              if (voltageMatch) voltage_mV = parseFloat(voltageMatch[1]);
              if (currentMatch) current_mA = parseFloat(currentMatch[1]);
              if (depthMatch) depth_m = parseFloat(depthMatch[1]);
            }
            
            // Check if node is activated from config.nodes
            const isActivated = nodeConfig ? nodeConfig.activated : false;
            const h1_m = nodeConfig ? nodeConfig.h1_m : 0;
            
            // Calculate water height: Correct Formula
            // h1_m = Cable length (from surface to cable end)
            // h2_m = Sensor depth reading (from surface to sensor)
            // Water Height = h2_m - h1_m (water above cable end)
            // If h2 > h1, sensor is deeper than cable = ERROR/NO WATER
            
            const h2_m = depth_m; // Sensor reading (depth from surface)
            let waterHeight = 0;
            let status = "Not Activated";
            
            if (isActivated && h1_m > 0) {
              // Correct calculation: Water Height = Sensor Depth - Cable Length
              // If sensor reads less depth than cable length = water present
              if (h2_m < h1_m) {
                waterHeight = h1_m - h2_m; // Water height above cable end
                
                // Determine status based on water height
                if (waterHeight > 10) {
                  status = "Active";
                } else if (waterHeight >= 5) {
                  status = "Warning";
                } else if (waterHeight > 0) {
                  status = "Low";
                } else {
                  status = "Critical";
                }
              } else {
                // Sensor reads deeper than cable = No water or sensor error
                waterHeight = 0;
                status = "Critical";
              }
            }
            
            console.log(`${nodeKey}: h1=${h1_m}m, h2=${h2_m}m, waterHeight=${waterHeight}m, status=${status}`);
            
            nodesArray.push({
              id: nodeKey,
              name: nodeKey,
              activated: isActivated,
              h1_m: h1_m,
              h2_m: h2_m,
              waterHeight: parseFloat(waterHeight.toFixed(2)),
              status: status,
              location: "Tanzania",
              region: "Arusha",
              current_mA: current_mA,
              voltage_mV: voltage_mV,
              depth_m: depth_m,
              lastUpdate: latestTimestamp,
              readingsCount: timestamps.length
            });
          });
          
          setNodes(nodesArray);
          calculateStats(nodesArray);
          setLastUpdate(new Date());
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("❌ Firebase error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      // Don't destroy notification service - let it continue monitoring
      // notificationService.destroy();
    };
  }, []);

  // Calculate statistics
  const calculateStats = (nodesArray) => {
    const total = nodesArray.length;
    const active = nodesArray.filter(n => n.status === "Active").length;
    const notActivated = nodesArray.filter(n => !n.activated).length;
    const alerts = nodesArray.filter(n => 
      n.status === "Warning" || n.status === "Critical" || n.status === "Low"
    ).length;
    
    const activatedNodes = nodesArray.filter(n => n.activated);
    const totalWaterHeight = activatedNodes.reduce((sum, n) => sum + n.waterHeight, 0);
    const avgWaterHeight = activatedNodes.length > 0 ? totalWaterHeight / activatedNodes.length : 0;
    
    setStats({
      totalNodes: total,
      activeNodes: active,
      alerts: alerts,
      notActivated: notActivated,
      totalWaterHeight: parseFloat(totalWaterHeight.toFixed(2)),
      avgWaterHeight: parseFloat(avgWaterHeight.toFixed(2))
    });
  };

  // Activate node
  const handleActivateNode = async () => {
    if (!cableLength || parseFloat(cableLength) <= 0) {
      showToast("Please enter a valid cable length (h₁)", 'error');
      return;
    }

    try {
      const nodeConfigRef = ref(database, `config/nodes/${activationModal.id}`);
      await set(nodeConfigRef, {
        activated: true,
        h1_m: parseFloat(cableLength)
      });
      
      setActivationModal(null);
      setCableLength("");
      showToast(`${activationModal.name} activated successfully!`, 'success');
    } catch (error) {
      console.error("❌ Error activating node:", error);
      showToast("Failed to activate node. Please try again.", 'error');
    }
  };

  // Edit cable length with modal instead of prompt
  const handleEditCableLength = (node) => {
    setEditModal(node);
    setCableLength(node.h1_m.toString());
  };

  const handleUpdateCableLength = async () => {
    if (!cableLength || parseFloat(cableLength) <= 0) {
      showToast("Please enter a valid cable length", 'error');
      return;
    }

    try {
      const nodeConfigRef = ref(database, `config/nodes/${editModal.id}/h1_m`);
      await set(nodeConfigRef, parseFloat(cableLength));
      
      setEditModal(null);
      setCableLength("");
      showToast(`Cable length updated for ${editModal.name}`, 'success');
    } catch (error) {
      console.error("❌ Error updating cable length:", error);
      showToast("Failed to update cable length", 'error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active": return "#16A34A";
      case "Low":
      case "Warning": return "#D97706";
      case "Critical": return "#DC2626";
      case "Not Activated": return "#999";
      default: return "#999";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active": return <CheckCircle size={14} />;
      case "Low":
      case "Warning": return <AlertTriangle size={14} />;
      case "Critical": return <XCircle size={14} />;
      default: return <Activity size={14} />;
    }
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
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
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

        .dashboard-page {
          min-height: 100vh;
          background: #FAFAFA;
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .dashboard-header {
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
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-icon {
          width: 48px;
          height: 48px;
          background: #000;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
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
          background: #000;
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
          border-color: #000;
        }

        /* Hero Card */
        .hero-card {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 16px;
          padding: 40px;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(50%, -50%);
        }

        .hero-content {
          position: relative;
          z-index: 1;
        }

        .hero-label {
          font-size: 13px;
          font-weight: 600;
          opacity: 0.8;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .hero-value {
          font-size: 56px;
          font-weight: 700;
          margin-bottom: 8px;
          letter-spacing: -1.5px;
        }

        .hero-unit {
          font-size: 24px;
          opacity: 0.9;
          margin-left: 8px;
        }

        .hero-subtitle {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 16px;
        }

        .hero-stats {
          display: flex;
          gap: 24px;
          margin-top: 20px;
        }

        .hero-stat {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .hero-stat-label {
          font-size: 12px;
          opacity: 0.8;
        }

        .hero-stat-value {
          font-size: 18px;
          font-weight: 700;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: #F5F5F5;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
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

        .stat-subtitle {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
          font-weight: 500;
        }

        /* Section Header */
        .section-header {
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
          padding: 6px 12px;
          background: #000;
          color: white;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }

        /* Nodes Grid */
        .nodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 20px;
          margin-bottom: 24px;
        }

        .node-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E8E8E8;
          transition: all 0.2s ease;
        }

        .node-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
          border-color: #000;
        }

        .node-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .node-info h3 {
          font-size: 18px;
          font-weight: 700;
          color: #000;
          margin-bottom: 4px;
          letter-spacing: -0.2px;
        }

        .node-location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #999;
          font-weight: 500;
        }

        .status-badge {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        /* Water Display */
        .water-display {
          background: linear-gradient(135deg, #F5F5F5 0%, #FAFAFA 100%);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          border: 2px solid #E8E8E8;
          text-align: center;
        }

        .water-label {
          font-size: 11px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .water-value {
          font-size: 48px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
          letter-spacing: -1.5px;
        }

        .water-formula {
          font-size: 13px;
          color: #666;
          font-weight: 600;
          padding: 8px 16px;
          background: white;
          border-radius: 8px;
          display: inline-block;
        }

        /* Metrics Grid */
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 20px;
        }

        .metric-item {
          background: #FAFAFA;
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          border: 1px solid #F0F0F0;
        }

        .metric-label {
          font-size: 10px;
          color: #999;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 8px;
        }

        .metric-value {
          font-size: 20px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.3px;
        }

        /* Action Buttons */
        .action-buttons {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .btn {
          padding: 12px;
          border-radius: 10px;
          font-weight: 600;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-dark {
          background: #000;
          color: white;
        }

        .btn-dark:hover {
          background: #333;
          transform: translateY(-1px);
        }

        .btn-outline {
          background: white;
          color: #000;
          border: 2px solid #E8E8E8;
        }

        .btn-outline:hover {
          border-color: #000;
        }

        .last-update {
          font-size: 11px;
          color: #999;
          text-align: center;
          font-weight: 500;
        }

        /* Not Activated State */
        .not-activated {
          padding: 40px 24px;
          text-align: center;
          background: #FAFAFA;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 2px dashed #E8E8E8;
        }

        .not-activated-icon {
          color: #CCC;
          margin: 0 auto 16px;
        }

        .not-activated-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .not-activated-count {
          font-size: 12px;
          color: #999;
          margin-bottom: 20px;
        }

        /* Modal */
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

        /* Quick Actions Card */
        .quick-actions-card {
          background: white;
          border-radius: 16px;
          padding: 24px;
          border: 1px solid #E8E8E8;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .quick-action-btn {
          padding: 20px;
          background: #FAFAFA;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .quick-action-btn:hover {
          border-color: #000;
          background: white;
          transform: translateY(-2px);
        }

        .quick-action-icon {
          width: 48px;
          height: 48px;
          background: #000;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .quick-action-text h4 {
          font-size: 14px;
          font-weight: 700;
          color: #000;
          margin-bottom: 2px;
        }

        .quick-action-text p {
          font-size: 12px;
          color: #666;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-stats {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 16px;
          }
          .dashboard-header {
            padding: 24px;
          }
          .hero-card {
            padding: 28px;
          }
          .hero-value {
            font-size: 42px;
          }
          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .nodes-grid {
            grid-template-columns: 1fr;
          }
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Activation Modal */}
      {activationModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">Activate {activationModal.name}</h2>
              <p className="modal-subtitle">Configure cable length to start monitoring</p>
            </div>
            
            <div className="modal-info">
              <p>
                <strong>Water Height Formula: H = h₁ - h₂</strong><br/><br/>
                • <strong>h₁</strong> = Cable length (depth from surface to cable end)<br/>
                • <strong>h₂</strong> = Sensor reading (depth to water surface)<br/>
                • <strong>H</strong> = Water height above cable end<br/><br/>
                ⚠️ If h₂ ≥ h₁, it means no water or sensor error<br/>
                📏 Sensor must read LESS than cable length for water to be present
              </p>
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Cable Length (h₁) in meters <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={cableLength}
                onChange={(e) => setCableLength(e.target.value)}
                placeholder="Enter cable length, e.g., 50.5"
                className="form-input"
                autoFocus
              />
            </div>
            
            <div className="modal-actions">
              <button onClick={handleActivateNode} className="btn-modal btn-modal-dark">
                <CheckCircle size={16} />
                Activate Node
              </button>
              <button
                onClick={() => {
                  setActivationModal(null);
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
                <strong>Current Values:</strong><br/>
                • h₁ (Cable): {editModal.h1_m}m<br/>
                • h₂ (Sensor): {editModal.h2_m.toFixed(2)}m<br/>
                • Water Height: {editModal.waterHeight}m<br/><br/>
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

      {/* Header */}
      <div className="dashboard-header">
        <div className="header-top">
          <div className="header-left">
            <div className="header-icon">
              <Droplets size={24} style={{ color: 'white' }} />
            </div>
            <div className="header-text">
              <h1>{greeting.text}</h1>
              <p>{greeting.subtext} • {stats.totalNodes} nodes monitoring • Last update: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header btn-secondary" onClick={() => navigate("/analytics")}>
              <BarChart3 size={16} />
              Analytics
            </button>
            <button className="btn-header btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="hero-card">
          <div className="hero-content">
            <div className="hero-label">Total Water Height</div>
            <div>
              <span className="hero-value">{stats.totalWaterHeight}</span>
              <span className="hero-unit">meters</span>
            </div>
            <div className="hero-subtitle">
              Average: {stats.avgWaterHeight}m across {stats.activeNodes} active nodes
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <Droplets size={20} />
                <div>
                  <div className="hero-stat-label">Active Wells</div>
                  <div className="hero-stat-value">{stats.activeNodes}</div>
                </div>
              </div>
              <div className="hero-stat">
                <AlertTriangle size={20} />
                <div>
                  <div className="hero-stat-label">Alerts</div>
                  <div className="hero-stat-value">{stats.alerts}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Droplets size={20} />
            </div>
          </div>
          <p className="stat-label">Total Nodes</p>
          <p className="stat-value">{stats.totalNodes}</p>
          <p className="stat-subtitle">LoRa Sensors</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#DCFCE7' }}>
              <CheckCircle size={20} style={{ color: '#16A34A' }} />
            </div>
          </div>
          <p className="stat-label">Active Nodes</p>
          <p className="stat-value">{stats.activeNodes}</p>
          <p className="stat-subtitle">Operational</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon" style={{ background: '#FEF3C7' }}>
              <AlertTriangle size={20} style={{ color: '#D97706' }} />
            </div>
          </div>
          <p className="stat-label">Alerts</p>
          <p className="stat-value">{stats.alerts}</p>
          <p className="stat-subtitle">Requires attention</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <XCircle size={20} />
            </div>
          </div>
          <p className="stat-label">Not Activated</p>
          <p className="stat-value">{stats.notActivated}</p>
          <p className="stat-subtitle">Pending setup</p>
        </div>
      </div>

      {/* Nodes Section */}
      <div className="section-header">
        <div className="section-title">
          <MapPin size={20} />
          <h2>Sensor Nodes</h2>
        </div>
        <div className="section-badge">
          {nodes.length} total
        </div>
      </div>
      
      <div className="nodes-grid">
        {nodes.map((node) => (
          <div key={node.id} className="node-card">
            <div className="node-header">
              <div className="node-info">
                <h3>{node.name}</h3>
                <div className="node-location">
                  <MapPin size={12} /> {node.location}, {node.region}
                </div>
              </div>
              <span 
                className="status-badge" 
                style={{ 
                  background: `${getStatusColor(node.status)}20`,
                  color: getStatusColor(node.status)
                }}
              >
                {getStatusIcon(node.status)}
                {node.status}
              </span>
            </div>

            {!node.activated ? (
              <div className="not-activated">
                <XCircle size={40} className="not-activated-icon" />
                <p className="not-activated-text">Node not yet activated</p>
                <p className="not-activated-count">{node.readingsCount} sensor readings available</p>
                <button
                  onClick={() => setActivationModal(node)}
                  className="btn btn-dark"
                  style={{ width: '100%' }}
                >
                  <CheckCircle size={16} />
                  Activate Node
                </button>
              </div>
            ) : (
              <>
                <div className="water-display">
                  <p className="water-label">Water Height (H)</p>
                  <p className="water-value">{node.waterHeight}<span style={{ fontSize: '28px', marginLeft: '8px' }}>m</span></p>
                  <div className="water-formula">
                    h₁: {node.h1_m}m - h₂: {node.h2_m.toFixed(2)}m = {node.waterHeight}m
                  </div>
                </div>

                <div className="metrics-grid">
                  <div className="metric-item">
                    <p className="metric-label">Current</p>
                    <p className="metric-value">{node.current_mA.toFixed(1)}mA</p>
                  </div>
                  <div className="metric-item">
                    <p className="metric-label">Voltage</p>
                    <p className="metric-value">{node.voltage_mV}mV</p>
                  </div>
                  <div className="metric-item">
                    <p className="metric-label">Depth</p>
                    <p className="metric-value">{node.depth_m.toFixed(2)}m</p>
                  </div>
                </div>

                <div className="action-buttons">
                  <button onClick={() => navigate('/monitor')} className="btn btn-dark">
                    <Eye size={14} />
                    Monitor
                  </button>
                  <button 
                    onClick={() => handleEditCableLength(node)}
                    className="btn btn-outline"
                  >
                    <Edit size={14} />
                    Edit h₁
                  </button>
                </div>

                <p className="last-update">
                  Last: {new Date(node.lastUpdate).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-header">
        <div className="section-title">
          <Zap size={20} />
          <h2>Quick Actions</h2>
        </div>
      </div>

      <div className="quick-actions-card">
        <div className="quick-actions-grid">
          <button className="quick-action-btn" onClick={() => navigate("/monitor")}>
            <div className="quick-action-icon">
              <Activity size={24} style={{ color: 'white' }} />
            </div>
            <div className="quick-action-text">
              <h4>Real-Time Monitor</h4>
              <p>View live sensor data</p>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => navigate("/analytics")}>
            <div className="quick-action-icon">
              <BarChart3 size={24} style={{ color: 'white' }} />
            </div>
            <div className="quick-action-text">
              <h4>Analytics</h4>
              <p>View trends & reports</p>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => navigate("/health")}>
            <div className="quick-action-icon">
              <Gauge size={24} style={{ color: 'white' }} />
            </div>
            <div className="quick-action-text">
              <h4>System Health</h4>
              <p>Backend diagnostics</p>
            </div>
          </button>

          <button className="quick-action-btn" onClick={() => navigate("/settings")}>
            <div className="quick-action-icon">
              <Settings size={24} style={{ color: 'white' }} />
            </div>
            <div className="quick-action-text">
              <h4>Settings</h4>
              <p>Configure system</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;