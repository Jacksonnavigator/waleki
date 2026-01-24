import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart3, TrendingUp, Calendar, Filter,
  Activity, Droplets, RefreshCw,
  FileJson, FileText, ArrowUp, ArrowDown,
  Database, Waves, Eye
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ComposedChart
} from "recharts";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import { useNavigate } from "react-router-dom";
// import HelpTooltip from "../../components/Tooltip";
// Future advanced features - uncomment when integrating:
// import NodeMap from "../../components/NodeMap";
// import TrendPrediction from "../../components/TrendPrediction";
// import EnhancedChart from "../../components/EnhancedChart";
// import NodeComparison from "../../components/NodeComparison";
// import PDFExport from "../../components/PDFExport";

const Analytics = () => {
  const navigate = useNavigate();
  const [allReadings, setAllReadings] = useState([]);
  const [allNodes, setAllNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [selectedNode, setSelectedNode] = useState("all");
  const [chartType, setChartType] = useState("area");
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch data from Firebase
  useEffect(() => {
    console.log("📊 Loading analytics data from Firebase...");

    const rootRef = ref(database);

    const unsubscribe = onValue(rootRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const readings = [];
        const nodesList = [];

        // Get node configurations
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

                // 1. Try checking direct numeric fields
                if (reading.depth_m !== undefined) depth_m = parseFloat(reading.depth_m);
                else if (reading.Depth !== undefined) depth_m = parseFloat(reading.Depth);
                else if (reading.depth !== undefined) depth_m = parseFloat(reading.depth);
                else if (reading.H2 !== undefined) depth_m = parseFloat(reading.H2);
                else if (reading.h2 !== undefined) depth_m = parseFloat(reading.h2);

                // 2. If still 0 (or undefined), try RawData string parsing
                if ((!depth_m || depth_m === 0) && reading.RawData && typeof reading.RawData === 'string') {
                  let depthMatch = reading.RawData.match(/Depth\s*[=:]\s*([\d.]+)/i);
                  if (!depthMatch) {
                    depthMatch = reading.RawData.match(/D\s*[=:]\s*([\d.]+)/i);
                  }
                  if (depthMatch) depth_m = parseFloat(depthMatch[1]);
                }

                const h2_m = depth_m;
                // Correct Water Height Calculation
                // If h2 < h1: water present, Height = h1 - h2
                // If h2 >= h1: no water
                let waterHeight = 0;
                if (nodeInfo.activated && nodeInfo.h1_m > 0) {
                  if (h2_m < nodeInfo.h1_m) {
                    waterHeight = Math.max(0, nodeInfo.h1_m - h2_m);
                  }
                }

                let parsedDate = new Date(timestamp);

                // Robust timestamp parsing
                if (isNaN(parsedDate.getTime())) {
                  // Handle format: YYYY-MM-DD_HH-mm-ss
                  if (timestamp.includes('_') && timestamp.includes('-')) {
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
                  timestamp: timestamp,
                  date: parsedDate,
                  waterHeight: parseFloat(waterHeight.toFixed(2)),
                  h1: nodeInfo.h1_m,
                  h2: parseFloat(h2_m.toFixed(2)),
                  depth_m: parseFloat(depth_m.toFixed(2)),
                  activated: nodeInfo.activated
                });
              });
            }
          });
        }

        // Sort by most recent first
        readings.sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0));

        setAllReadings(readings);
        setAllNodes(nodesList);
        setLastUpdate(new Date());
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

  // Filter data by time range and node
  const filteredData = useMemo(() => {
    let result = [...allReadings];

    const now = new Date();
    if (timeRange === "today") {
      result = result.filter(r => r.date.toDateString() === now.toDateString());
    } else if (timeRange === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(r => r.date >= weekAgo);
    } else if (timeRange === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      result = result.filter(r => r.date >= monthAgo);
    } else if (timeRange === "year") {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      result = result.filter(r => r.date >= yearAgo);
    }

    if (selectedNode !== "all") {
      result = result.filter(r => r.node === selectedNode);
    }

    return result;
  }, [allReadings, timeRange, selectedNode]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        totalReadings: 0,
        avgWaterHeight: 0,
        maxWaterHeight: 0,
        minWaterHeight: 0,
        avgDepth: 0,
        trend: 0,
        activeNodes: 0
      };
    }

    const activatedData = filteredData.filter(r => r.activated);

    const avgWaterHeight = activatedData.length > 0
      ? activatedData.reduce((sum, r) => sum + r.waterHeight, 0) / activatedData.length
      : 0;
    const avgDepth = filteredData.reduce((sum, r) => sum + r.depth_m, 0) / filteredData.length;
    const maxWaterHeight = activatedData.length > 0
      ? Math.max(...activatedData.map(r => r.waterHeight), 0)
      : 0;
    const minWaterHeight = activatedData.length > 0
      ? Math.min(...activatedData.map(r => r.waterHeight), 0)
      : 0;

    // Calculate trend (compare first half vs second half)
    const midPoint = Math.floor(activatedData.length / 2);
    if (midPoint > 0) {
      const firstHalf = activatedData.slice(midPoint);
      const secondHalf = activatedData.slice(0, midPoint);
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.waterHeight, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.waterHeight, 0) / secondHalf.length;
      const trend = firstAvg !== 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0;

      const uniqueNodes = new Set(filteredData.map(r => r.node));

      return {
        totalReadings: filteredData.length,
        avgWaterHeight: avgWaterHeight.toFixed(2),
        maxWaterHeight: maxWaterHeight.toFixed(2),
        minWaterHeight: minWaterHeight.toFixed(2),
        avgDepth: avgDepth.toFixed(2),
        trend: trend.toFixed(1),
        activeNodes: uniqueNodes.size
      };
    }

    const uniqueNodes = new Set(filteredData.map(r => r.node));

    return {
      totalReadings: filteredData.length,
      avgWaterHeight: avgWaterHeight.toFixed(2),
      maxWaterHeight: maxWaterHeight.toFixed(2),
      minWaterHeight: minWaterHeight.toFixed(2),
      avgDepth: avgDepth.toFixed(2),
      trend: "0.0",
      activeNodes: uniqueNodes.size
    };
  }, [filteredData]);

  // Prepare time series data
  const timeSeriesData = useMemo(() => {
    if (filteredData.length === 0) return [];

    const grouped = {};

    filteredData.forEach(reading => {
      let key;
      const date = reading.date;

      if (timeRange === "today") {
        // Group by hour: "HH:MM"
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        key = `${hours}:${minutes}`;
      } else if (timeRange === "week") {
        // Group by day/hour: "Mon D, HH:00"
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const hour = date.getHours().toString().padStart(2, '0');
        key = `${month} ${day}, ${hour}:00`;
      } else if (timeRange === "month") {
        // Group by day: "Mon D"
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        key = `${month} ${day}`;
      } else if (timeRange === "year") {
        // Group by month: "Mon YYYY"
        const month = date.toLocaleString('en-US', { month: 'short' });
        const year = date.getFullYear();
        key = `${month} ${year}`;
      } else {
        // Group by date: "Mon D, YYYY"
        const month = date.toLocaleString('en-US', { month: 'short' });
        const day = date.getDate();
        const year = date.getFullYear();
        key = `${month} ${day}, ${year}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          time: key,
          totalHeight: 0,
          totalDepth: 0,
          count: 0,
          activatedCount: 0
        };
      }

      if (reading.activated) {
        grouped[key].totalHeight += reading.waterHeight;
        grouped[key].activatedCount++;
      }
      grouped[key].totalDepth += reading.depth_m;
      grouped[key].count++;
    });

    const result = Object.values(grouped)
      .map(item => ({
        time: item.time,
        waterHeight: item.activatedCount > 0
          ? parseFloat((item.totalHeight / item.activatedCount).toFixed(2))
          : 0,
        depth: parseFloat((item.totalDepth / item.count).toFixed(2))
      }))
      .reverse();

    // Limit data points based on time range
    const maxPoints = timeRange === "today" ? 24 :
      timeRange === "week" ? 30 :
        timeRange === "month" ? 30 :
          timeRange === "year" ? 12 : 50;

    return result.slice(-maxPoints);
  }, [filteredData, timeRange]);

  // Node comparison data
  const nodeComparisonData = useMemo(() => {
    const nodeStats = {};

    allNodes.forEach(node => {
      nodeStats[node.name] = {
        name: node.name,
        readings: 0,
        avgHeight: 0,
        avgDepth: 0,
        activatedReadings: 0
      };
    });

    filteredData.forEach(reading => {
      if (nodeStats[reading.node]) {
        nodeStats[reading.node].readings++;
        if (reading.activated) {
          nodeStats[reading.node].avgHeight += reading.waterHeight;
          nodeStats[reading.node].activatedReadings++;
        }
        nodeStats[reading.node].avgDepth += reading.depth_m;
      }
    });

    return Object.values(nodeStats)
      .filter(node => node.readings > 0)
      .map(node => ({
        name: node.name,
        readings: node.readings,
        avgHeight: node.activatedReadings > 0
          ? parseFloat((node.avgHeight / node.activatedReadings).toFixed(2))
          : 0,
        avgDepth: parseFloat((node.avgDepth / node.readings).toFixed(2))
      }));
  }, [filteredData, allNodes]);

  // Distribution data for pie chart
  const distributionData = useMemo(() => {
    const distribution = {};

    filteredData.forEach(reading => {
      if (!distribution[reading.node]) {
        distribution[reading.node] = 0;
      }
      distribution[reading.node]++;
    });

    return Object.keys(distribution).map(node => ({
      name: node,
      value: distribution[node]
    }));
  }, [filteredData]);

  // Hourly distribution (for today view)
  const hourlyDistribution = useMemo(() => {
    if (timeRange !== "today") return [];

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      readings: 0
    }));

    filteredData.forEach(reading => {
      const hour = reading.date.getHours();
      hours[hour].readings++;
    });

    return hours;
  }, [filteredData, timeRange]);

  // Radar chart data for multi-metric comparison - Unused
  // const radarData = useMemo(() => {
  //   if (nodeComparisonData.length === 0) return [];
  // 
  //   return nodeComparisonData.map(node => ({
  //     node: node.name,
  //     waterHeight: parseFloat(node.avgHeight) * 10, // Scale up for visibility
  //     depth: parseFloat(node.avgDepth) * 10 // Scale up for visibility
  //   }));
  // }, [nodeComparisonData]);

  // Export functions
  const exportToCSV = () => {
    const headers = ["Node", "Timestamp", "Water Height (m)", "h1 (m)", "h2 (m)", "Depth (m)", "Activated"];
    const csvData = filteredData.map(r => [
      r.node,
      r.date instanceof Date && !isNaN(r.date.getTime()) ? r.date.toLocaleString() : 'Invalid Date',
      r.waterHeight,
      r.waterHeight,
      r.h1,
      r.h2,
      r.depth_m,
      r.activated ? "Yes" : "No"
    ]);

    const csv = [headers, ...csvData].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${selectedNode}-${timeRange}-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToJSON = () => {
    const jsonData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        timeRange: timeRange,
        selectedNode: selectedNode,
        totalReadings: filteredData.length,
        statistics: statistics
      },
      readings: filteredData.map(r => ({
        node: r.node,
        timestamp: r.timestamp,
        waterHeight: r.waterHeight,
        h1: r.h1,
        h2: r.h2,
        depth_m: r.depth_m,
        activated: r.activated
      })),
      nodeComparison: nodeComparisonData
    };

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${selectedNode}-${timeRange}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ['#0369a1', '#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'white',
          border: '1px solid #E8E8E8',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#000' }}>
            {label}
          </p>
          {payload.map((entry, index) => (
            <p key={index} style={{ fontSize: '12px', color: entry.color, marginBottom: '4px' }}>
              <strong>{entry.name}:</strong> {entry.value}
              {entry.name.includes('Height') || entry.name.includes('Depth') ? 'm' :
                entry.name.includes('Current') ? 'mA' :
                  entry.name.includes('Voltage') ? 'mV' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid #F0F0F0', borderTopColor: '#00cf45bc', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
        <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Loading analytics (v2)...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .analytics-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Header */
        .analytics-header {
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

        /* Filters Bar */
        .filters-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        .filter-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }

        .filter-label {
          font-size: 12px;
          font-weight: 700;
          color: #000;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
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

        .filter-select {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #E8E8E8;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
          background: white;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
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

        .stat-card::before {
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

        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
        }

        .stat-card:hover::before {
          opacity: 1;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.1);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .stat-trend.up {
          background: #DCFCE7;
          color: #16A34A;
        }

        .stat-trend.down {
          background: #FEE2E2;
          color: #DC2626;
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

        /* Charts Grid */
        .charts-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        .chart-card.full {
          grid-column: 1 / -1;
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .chart-title {
          font-size: 16px;
          font-weight: 700;
          color: #000;
          letter-spacing: -0.2px;
        }

        .chart-type-selector {
          display: flex;
          gap: 8px;
        }

        .chart-type-btn {
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #F5F5F5;
          color: #666;
        }

        .chart-type-btn.active {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
        }

        /* Table */
        .table-container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          overflow: hidden;
          margin-bottom: 24px;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }

        .table-header {
          padding: 20px 24px;
          border-bottom: 1px solid #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .table-title {
          font-size: 16px;
          font-weight: 700;
          color: #000;
        }

        .table-badge {
          padding: 4px 12px;
          background: #F5F5F5;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
          color: #666;
        }

        .table-wrapper {
          overflow-x: auto;
          max-height: 500px;
          overflow-y: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 16px 24px;
          font-size: 11px;
          font-weight: 700;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: #FAFAFA;
          border-bottom: 1px solid #E8E8E8;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        td {
          padding: 16px 24px;
          font-size: 14px;
          color: #000;
          border-bottom: 1px solid #F5F5F5;
        }

        tr:hover td {
          background: #FAFAFA;
        }

        .node-name {
          font-weight: 700;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-active {
          background: #DCFCE7;
          color: #16A34A;
        }

        .status-inactive {
          background: #FEE2E2;
          color: #DC2626;
        }

        /* Export Footer */
        .export-footer {
          background: white;
          border-radius: 16px;
          padding: 24px;
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

        .export-buttons {
          display: flex;
          gap: 12px;
        }

        .export-btn {
          padding: 12px 20px;
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

        .export-btn.secondary {
          background: rgba(255, 255, 255, 0.8);
          color: #0369a1;
          border: 2px solid #e2e8f0;
          box-shadow: none;
        }

        .export-btn.secondary:hover {
          border-color: #0369a1;
          background: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.1);
        }

        /* Empty State */
        .empty-state {
          grid-column: 1 / -1;
          padding: 60px;
          text-align: center;
          background: white;
          border-radius: 16px;
          border: 2px dashed #E8E8E8;
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
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .analytics-page {
            padding: 16px;
          }
          .analytics-header {
            padding: 24px;
          }
          .header-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .filters-bar {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Header */}
      <div className="analytics-header">
        <div className="header-top">
          <div className="header-left">
            <div className="header-icon">
              <BarChart3 size={24} style={{ color: 'white' }} />
            </div>
            <div className="header-text">
              <h1>Advanced Analytics</h1>
              <p>Comprehensive insights & trends • Last updated: {lastUpdate.toLocaleTimeString()}</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-header btn-secondary" onClick={() => navigate("/")}>
              <Eye size={16} />
              Dashboard
            </button>
            <button className="btn-header btn-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-card">
          <div className="filter-label">
            <Calendar size={14} />
            Time Range
          </div>
          <div className="filter-buttons">
            {["today", "week", "month", "year", "all"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={timeRange === range ? "filter-btn filter-btn-active" : "filter-btn filter-btn-inactive"}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-card">
          <div className="filter-label">
            <Filter size={14} />
            Node Selection
          </div>
          <select
            value={selectedNode}
            onChange={(e) => setSelectedNode(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Nodes</option>
            {allNodes.map(node => (
              <option key={node.name} value={node.name}>{node.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-card">
          <div className="filter-label">
            <Activity size={14} />
            Chart Type
          </div>
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="filter-select"
          >
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
            <option value="bar">Bar Chart</option>
            <option value="composed">Multi-Metric</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Waves size={20} />
            </div>
            <div className={`stat-trend ${parseFloat(statistics.trend) >= 0 ? 'up' : 'down'}`}>
              {parseFloat(statistics.trend) >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              {Math.abs(parseFloat(statistics.trend))}%
            </div>
          </div>
          <div className="stat-label">Avg Water Height</div>
          <div className="stat-value">
            {statistics.avgWaterHeight}
            <span className="stat-unit">m</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="stat-label">Max Water Height</div>
          <div className="stat-value">
            {statistics.maxWaterHeight}
            <span className="stat-unit">m</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Droplets size={20} />
            </div>
          </div>
          <div className="stat-label">Avg Depth (h₂)</div>
          <div className="stat-value">
            {statistics.avgDepth}
            <span className="stat-unit">m</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon">
              <Database size={20} />
            </div>
          </div>
          <div className="stat-label">Total Readings</div>
          <div className="stat-value" style={{ fontSize: '28px' }}>
            {statistics.totalReadings}
          </div>
        </div>
      </div>

      {filteredData.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={48} style={{ color: '#CCC', margin: '0 auto 16px' }} />
          <h3>No Data Available</h3>
          <p>No readings found for the selected time range and node. Try adjusting your filters.</p>
        </div>
      ) : (
        <>
          {/* Main Charts */}
          <div className="charts-grid">
            {/* Primary Time Series Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Water Level Trends</div>
                <div className="chart-type-selector">
                  <button
                    className={chartType === 'area' ? 'chart-type-btn active' : 'chart-type-btn'}
                    onClick={() => setChartType('area')}
                  >
                    Area
                  </button>
                  <button
                    className={chartType === 'line' ? 'chart-type-btn active' : 'chart-type-btn'}
                    onClick={() => setChartType('line')}
                  >
                    Line
                  </button>
                  <button
                    className={chartType === 'bar' ? 'chart-type-btn active' : 'chart-type-btn'}
                    onClick={() => setChartType('bar')}
                  >
                    Bar
                  </button>
                  <button
                    className={chartType === 'composed' ? 'chart-type-btn active' : 'chart-type-btn'}
                    onClick={() => setChartType('composed')}
                  >
                    Multi
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                {chartType === 'area' ? (
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorHeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0369a1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="waterHeight"
                      stroke="#0369a1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorHeight)"
                      name="Water Height"
                    />
                  </AreaChart>
                ) : chartType === 'line' ? (
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="waterHeight"
                      stroke="#0369a1"
                      strokeWidth={2}
                      dot={{ fill: '#0369a1', r: 3 }}
                      name="Water Height"
                    />
                  </LineChart>
                ) : chartType === 'bar' ? (
                  <BarChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="waterHeight"
                      fill="#0369a1"
                      name="Water Height"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                ) : (
                  <ComposedChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                    <XAxis
                      dataKey="time"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fontSize: 11, fill: '#666' }}
                      stroke="#E8E8E8"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="waterHeight"
                      fill="#0369a120"
                      stroke="#0369a1"
                      name="Water Height (m)"
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="depth"
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      name="Depth (m)"
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Distribution Pie Chart */}
            <div className="chart-card">
              <div className="chart-header">
                <div className="chart-title">Data Distribution by Node</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Node Comparison Bar Chart */}
          <div className="chart-card full">
            <div className="chart-header">
              <div className="chart-title">Node Comparison - Average Metrics</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={nodeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#666' }}
                  stroke="#E8E8E8"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#666' }}
                  stroke="#E8E8E8"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="avgHeight" fill="#0369a1" name="Avg Height (m)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgDepth" fill="#0ea5e9" name="Avg Depth (m)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Hourly Distribution (Today only) */}
          {timeRange === "today" && hourlyDistribution.length > 0 && (
            <div className="chart-card full">
              <div className="chart-header">
                <div className="chart-title">Hourly Reading Distribution (Today)</div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E8E8" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#666' }}
                    stroke="#E8E8E8"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#666' }}
                    stroke="#E8E8E8"
                  />
                  <Tooltip />
                  <Bar
                    dataKey="readings"
                    fill="#0369a1"
                    name="Readings"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Detailed Readings Table */}
          <div className="table-container">
            <div className="table-header">
              <div className="table-title">Detailed Readings</div>
              <div className="table-badge">{filteredData.length} records</div>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Timestamp</th>
                    <th>Water Height (m)</th>
                    <th>h₁ (m)</th>
                    <th>h₂ / Depth (m)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((reading) => (
                    <tr key={reading.id}>
                      <td className="node-name">{reading.node}</td>
                      <td>{reading.date instanceof Date && !isNaN(reading.date.getTime()) ? reading.date.toLocaleString() : 'Invalid Date'}</td>
                      <td>{reading.waterHeight}</td>
                      <td>{reading.h1}</td>
                      <td>{reading.depth_m}</td>
                      <td>
                        <span className={reading.activated ? 'status-badge status-active' : 'status-badge status-inactive'}>
                          {reading.activated ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Footer */}
          <div className="export-footer">
            <div className="export-text">
              <h3>Export Analytics Data</h3>
              <p>Download {filteredData.length} readings as CSV or JSON format</p>
            </div>
            <div className="export-buttons">
              <button onClick={exportToCSV} className="export-btn">
                <FileText size={16} />
                Export CSV
              </button>
              <button onClick={exportToJSON} className="export-btn secondary">
                <FileJson size={16} />
                Export JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
