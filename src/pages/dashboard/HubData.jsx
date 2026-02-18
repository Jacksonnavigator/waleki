import React, { useState, useEffect, useMemo } from "react";
import {
    Database, Signal, Droplets, Activity, Clock, ChevronDown,
    ChevronUp, Search, Download, FileJson, FileText, RefreshCw,
    CheckCircle, AlertTriangle, XCircle, Info, Eye, EyeOff,
    TrendingUp, Layers, Filter
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "../../config/firebase";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer
} from "recharts";

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseTimestamp(timestamp, reading) {
    let d = new Date(timestamp);
    if (!isNaN(d.getTime())) return d;

    if (timestamp.includes("_") && timestamp.includes("-")) {
        const parts = timestamp.split("_");
        if (parts.length === 2) {
            d = new Date(`${parts[0]}T${parts[1].replace(/-/g, ":")}`);
            if (!isNaN(d.getTime())) return d;
        }
    }
    if (!isNaN(parseInt(timestamp))) {
        d = new Date(parseInt(timestamp));
        if (!isNaN(d.getTime())) return d;
    }
    if (reading?.Timestamp) {
        d = new Date(reading.Timestamp);
        if (!isNaN(d.getTime())) return d;
    }
    return null;
}

function extractDepth(reading) {
    if (reading.depth_m !== undefined) return parseFloat(reading.depth_m);
    if (reading.Depth !== undefined) return parseFloat(reading.Depth);
    if (reading.depth !== undefined) return parseFloat(reading.depth);
    if (reading.H2 !== undefined) return parseFloat(reading.H2);
    if (reading.h2 !== undefined) return parseFloat(reading.h2);

    if (reading.RawData && typeof reading.RawData === "string") {
        let m = reading.RawData.match(/Depth\s*[=:]\s*([\d.]+)/i);
        if (!m) m = reading.RawData.match(/D\s*[=:]\s*([\d.]+)/i);
        if (m) return parseFloat(m[1]);
    }
    return 0;
}

function statusColor(status) {
    switch (status) {
        case "active": return "#16A34A";
        case "warning": return "#D97706";
        case "critical": return "#DC2626";
        default: return "#64748B";
    }
}

function statusBg(status) {
    switch (status) {
        case "active": return "#DCFCE7";
        case "warning": return "#FEF3C7";
        case "critical": return "#FEE2E2";
        default: return "#F1F5F9";
    }
}

function StatusIcon({ status, size = 14 }) {
    if (status === "active") return <CheckCircle size={size} color="#16A34A" />;
    if (status === "warning") return <AlertTriangle size={size} color="#D97706" />;
    if (status === "critical") return <XCircle size={size} color="#DC2626" />;
    return <Signal size={size} color="#64748B" />;
}

// ─── Main Component ──────────────────────────────────────────────────────────

const HubData = () => {
    const [allReadings, setAllReadings] = useState([]);
    const [allNodes, setAllNodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedNode, setSelectedNode] = useState("all");
    const [search, setSearch] = useState("");
    const [sortCol, setSortCol] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [expandedRows, setExpandedRows] = useState({});
    const [showRaw, setShowRaw] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 50;

    // ── Firebase fetch ──────────────────────────────────────────────────────
    useEffect(() => {
        const rootRef = ref(database);
        const unsub = onValue(rootRef, (snap) => {
            if (!snap.exists()) { setLoading(false); return; }
            const data = snap.val();
            const nodesList = [];
            const readings = [];

            if (data.config?.nodes) {
                Object.keys(data.config.nodes).forEach(key => {
                    const nc = data.config.nodes[key];
                    nodesList.push({ name: key, activated: nc.activated || false, h1_m: nc.h1_m || 0 });
                });
            }

            if (data.LoRaSensor) {
                Object.keys(data.LoRaSensor).forEach(nodeKey => {
                    const nodeData = data.LoRaSensor[nodeKey];
                    const nodeInfo = nodesList.find(n => n.name === nodeKey) || { name: nodeKey, activated: false, h1_m: 0 };

                    if (typeof nodeData !== "object" || nodeData === null) return;

                    Object.keys(nodeData).forEach(ts => {
                        const reading = nodeData[ts];
                        if (!reading || typeof reading !== "object") return;

                        const parsedDate = parseTimestamp(ts, reading);
                        if (!parsedDate) return;

                        const depth_m = extractDepth(reading);
                        const h2_m = depth_m;
                        const h1_m = nodeInfo.h1_m;
                        const waterHeight = h1_m > 0 ? h1_m - h2_m : 0;

                        let status = "inactive";
                        if (nodeInfo.activated) {
                            if (waterHeight <= 0) status = "critical";
                            else if (waterHeight < 10) status = "warning";
                            else status = "active";
                        }

                        // Collect ALL raw fields from the reading object
                        const rawFields = {};
                        Object.keys(reading).forEach(k => { rawFields[k] = reading[k]; });

                        readings.push({
                            id: `${nodeKey}-${ts}`,
                            node: nodeKey,
                            timestamp: ts,
                            date: parsedDate,
                            waterHeightM: parseFloat(waterHeight.toFixed(3)),
                            waterHeightFt: parseFloat((waterHeight * 3.28084).toFixed(3)),
                            h1: h1_m,
                            h2: parseFloat(h2_m.toFixed(3)),
                            depth_m: parseFloat(depth_m.toFixed(3)),
                            status,
                            activated: nodeInfo.activated,
                            rawFields,
                            rawData: reading.RawData || "",
                        });
                    });
                });
            }

            readings.sort((a, b) => b.date - a.date);
            setAllReadings(readings);
            setAllNodes(nodesList);
            setLoading(false);
        }, () => setLoading(false));

        return () => unsub();
    }, []);

    // ── Node stats ──────────────────────────────────────────────────────────
    const nodeStats = useMemo(() => {
        const map = {};
        allNodes.forEach(n => {
            map[n.name] = { ...n, count: 0, lastDate: null, latestStatus: "inactive", avgHeight: 0, activatedCount: 0 };
        });
        allReadings.forEach(r => {
            if (!map[r.node]) return;
            const s = map[r.node];
            s.count++;
            if (r.activated) { s.avgHeight += r.waterHeightM; s.activatedCount++; }
            if (!s.lastDate || r.date > s.lastDate) { s.lastDate = r.date; s.latestStatus = r.status; }
        });
        Object.values(map).forEach(s => {
            s.avgHeight = s.activatedCount > 0 ? parseFloat((s.avgHeight / s.activatedCount).toFixed(2)) : 0;
        });
        return Object.values(map);
    }, [allReadings, allNodes]);

    // ── Filtered + sorted data ──────────────────────────────────────────────
    const filtered = useMemo(() => {
        let r = selectedNode === "all" ? [...allReadings] : allReadings.filter(x => x.node === selectedNode);
        if (search.trim()) {
            const q = search.toLowerCase();
            r = r.filter(x =>
                x.node.toLowerCase().includes(q) ||
                x.status.toLowerCase().includes(q) ||
                x.rawData.toLowerCase().includes(q) ||
                x.date.toLocaleString().toLowerCase().includes(q)
            );
        }
        r.sort((a, b) => {
            let av = a[sortCol], bv = b[sortCol];
            if (sortCol === "date") { av = a.date.getTime(); bv = b.date.getTime(); }
            if (typeof av === "string") av = av.toLowerCase();
            if (typeof bv === "string") bv = bv.toLowerCase();
            if (av < bv) return sortDir === "asc" ? -1 : 1;
            if (av > bv) return sortDir === "asc" ? 1 : -1;
            return 0;
        });
        return r;
    }, [allReadings, selectedNode, search, sortCol, sortDir]);

    // ── Chart data (last 100 points, chronological) ─────────────────────────
    const chartData = useMemo(() => {
        return [...filtered]
            .sort((a, b) => a.date - b.date)
            .slice(-100)
            .map(r => ({
                time: r.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
                waterHeight: r.waterHeightM,
                depth: r.depth_m,
            }));
    }, [filtered]);

    // ── Summary stats for selected node ────────────────────────────────────
    const summary = useMemo(() => {
        const activated = filtered.filter(r => r.activated);
        const heights = activated.map(r => r.waterHeightM);
        const sum = heights.reduce((a, b) => a + b, 0);
        // Use reduce instead of Math.max/min spread to avoid call stack overflow on large datasets
        const maxH = heights.reduce((m, v) => v > m ? v : m, -Infinity);
        const minH = heights.reduce((m, v) => v < m ? v : m, Infinity);
        return {
            total: filtered.length,
            avg: heights.length ? (sum / heights.length).toFixed(2) : "—",
            max: heights.length ? maxH.toFixed(2) : "—",
            min: heights.length ? minH.toFixed(2) : "—",
            h1: selectedNode !== "all" ? (allNodes.find(n => n.name === selectedNode)?.h1_m ?? "—") : "—",
        };
    }, [filtered, selectedNode, allNodes]);

    // ── Pagination ──────────────────────────────────────────────────────────
    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortCol(col); setSortDir("desc"); }
        setPage(1);
    };

    const toggleRow = (id) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));

    // ── Export ──────────────────────────────────────────────────────────────
    const exportCSV = () => {
        const headers = ["Node", "Timestamp", "Water Height (m)", "Water Height (ft)", "h1 (m)", "h2 (m)", "Depth (m)", "Status", "Activated", "Raw Data"];
        const rows = filtered.map(r => [
            r.node, r.date.toLocaleString(), r.waterHeightM, r.waterHeightFt,
            r.h1, r.h2, r.depth_m, r.status, r.activated ? "Yes" : "No",
            `"${r.rawData.replace(/"/g, '""')}"`
        ]);
        const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `hub-data-${selectedNode}-${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        const payload = {
            node: selectedNode, exportedAt: new Date().toISOString(), summary, readings: filtered.map(r => ({
                node: r.node, timestamp: r.date.toISOString(), waterHeightM: r.waterHeightM,
                waterHeightFt: r.waterHeightFt, h1: r.h1, h2: r.h2, depth_m: r.depth_m,
                status: r.status, activated: r.activated, rawFields: r.rawFields
            }))
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `hub-data-${selectedNode}-${Date.now()}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    // ── Loading ─────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 16 }}>
                <div style={{ width: 40, height: 40, border: "3px solid #F0F0F0", borderTopColor: "#0369a1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 14, color: "#666", fontWeight: 500 }}>Loading hub data…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        .hub-card { background:white; border-radius:16px; border:1px solid #E8E8E8; transition:all 0.2s ease; }
        .hub-card:hover { box-shadow:0 8px 24px rgba(0,0,0,0.06); }
        .node-chip { padding:10px 18px; border-radius:10px; border:2px solid #E8E8E8; background:white; cursor:pointer; font-size:13px; font-weight:600; color:#444; transition:all 0.2s ease; display:flex; align-items:center; gap:8px; }
        .node-chip:hover { border-color:#0369a1; color:#0369a1; transform:translateY(-1px); }
        .node-chip.active { background:linear-gradient(135deg,#0369a1,#0284c7); border-color:#0369a1; color:white; box-shadow:0 4px 12px rgba(3,105,161,0.25); }
        .node-card { padding:20px; border-radius:14px; border:2px solid #E8E8E8; background:white; cursor:pointer; transition:all 0.2s ease; animation:fadeIn 0.3s ease; }
        .node-card:hover { transform:translateY(-2px); box-shadow:0 8px 20px rgba(0,0,0,0.08); }
        .node-card.selected { border-color:#0369a1; background:linear-gradient(135deg,#EFF6FF,#DBEAFE); }
        .stat-pill { background:#F8FAFC; border:1px solid #E8E8E8; border-radius:12px; padding:16px 20px; text-align:center; }
        .th-btn { background:none; border:none; cursor:pointer; font-size:12px; font-weight:700; color:#666; text-transform:uppercase; letter-spacing:0.5px; display:flex; align-items:center; gap:4px; padding:0; white-space:nowrap; }
        .th-btn:hover { color:#0369a1; }
        .th-btn.active { color:#0369a1; }
        .tr-data:hover { background:#F8FAFC; }
        .raw-field { font-size:11px; color:#555; background:#F8FAFC; border-radius:6px; padding:4px 8px; display:inline-block; margin:2px; }
        .btn-export { padding:9px 16px; border-radius:9px; border:none; cursor:pointer; font-size:13px; font-weight:600; display:flex; align-items:center; gap:7px; transition:all 0.2s ease; }
        .btn-export:hover { transform:translateY(-1px); }
        .page-btn { width:34px; height:34px; border-radius:8px; border:1px solid #E8E8E8; background:white; cursor:pointer; font-size:13px; font-weight:600; color:#444; transition:all 0.2s ease; }
        .page-btn:hover { border-color:#0369a1; color:#0369a1; }
        .page-btn.active { background:#0369a1; border-color:#0369a1; color:white; }
        .search-input { padding:10px 14px 10px 38px; border:1px solid #E8E8E8; border-radius:10px; font-size:14px; outline:none; width:260px; transition:border-color 0.2s; }
        .search-input:focus { border-color:#0369a1; }
      `}</style>

            {/* ── Header ── */}
            <div className="hub-card" style={{ padding: 28, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ width: 52, height: 52, background: "linear-gradient(135deg,#0369a1,#0284c7)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(3,105,161,0.25)" }}>
                            <Database size={24} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#000", margin: 0, letterSpacing: -0.5 }}>Hub Data</h1>
                            <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0", fontWeight: 500 }}>
                                Select a node to explore all backend data — {allReadings.length.toLocaleString()} total readings across {allNodes.length} nodes
                            </p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="btn-export" style={{ background: "#DCFCE7", color: "#16A34A" }} onClick={exportCSV}>
                            <FileText size={15} /> Export CSV
                        </button>
                        <button className="btn-export" style={{ background: "#DBEAFE", color: "#0369a1" }} onClick={exportJSON}>
                            <FileJson size={15} /> Export JSON
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Node Selector ── */}
            <div className="hub-card" style={{ padding: 24, marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                    <Layers size={16} color="#0369a1" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#000", textTransform: "uppercase", letterSpacing: 0.5 }}>Select Node</span>
                    <span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>{allNodes.length} nodes available</span>
                </div>

                {/* "All" chip */}
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                    <button
                        className={`node-chip ${selectedNode === "all" ? "active" : ""}`}
                        onClick={() => { setSelectedNode("all"); setPage(1); }}
                    >
                        <Activity size={14} /> All Nodes
                        <span style={{ fontSize: 11, opacity: 0.75 }}>({allReadings.length})</span>
                    </button>
                    {nodeStats.map(n => (
                        <button
                            key={n.name}
                            className={`node-chip ${selectedNode === n.name ? "active" : ""}`}
                            onClick={() => { setSelectedNode(n.name); setPage(1); }}
                        >
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: statusColor(n.latestStatus), flexShrink: 0 }} />
                            {n.name}
                            <span style={{ fontSize: 11, opacity: 0.75 }}>({n.count})</span>
                        </button>
                    ))}
                </div>

                {/* Node detail cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
                    {nodeStats.map(n => (
                        <div
                            key={n.name}
                            className={`node-card ${selectedNode === n.name ? "selected" : ""}`}
                            onClick={() => { setSelectedNode(n.name); setPage(1); }}
                        >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: "#000" }}>{n.name}</span>
                                <span style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: statusBg(n.latestStatus), fontSize: 11, fontWeight: 700, color: statusColor(n.latestStatus), textTransform: "uppercase" }}>
                                    <StatusIcon status={n.latestStatus} size={11} />
                                    {n.latestStatus}
                                </span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                                <div>
                                    <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Readings</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#000" }}>{n.count}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Avg Height</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: "#0369a1" }}>{n.avgHeight}<span style={{ fontSize: 12, color: "#666" }}>m</span></div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Cable (h1)</div>
                                    <div style={{ fontSize: 14, fontWeight: 600, color: "#444" }}>{n.h1_m}m</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>Last Seen</div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "#666" }}>
                                        {n.lastDate ? n.lastDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Summary Stats ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14, marginBottom: 20 }}>
                {[
                    { label: "Total Readings", value: summary.total.toLocaleString(), icon: <Database size={18} color="#0369a1" /> },
                    { label: "Avg Water Height", value: `${summary.avg}m`, icon: <Droplets size={18} color="#0284c7" /> },
                    { label: "Max Height", value: `${summary.max}m`, icon: <TrendingUp size={18} color="#16A34A" /> },
                    { label: "Min Height", value: `${summary.min}m`, icon: <TrendingUp size={18} color="#D97706" style={{ transform: "scaleY(-1)" }} /> },
                    { label: "Cable Length (h1)", value: selectedNode !== "all" ? `${summary.h1}m` : "—", icon: <Signal size={18} color="#7C3AED" /> },
                ].map(s => (
                    <div key={s.label} className="stat-pill">
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>{s.icon}</div>
                        <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#000", letterSpacing: -0.3 }}>{s.value}</div>
                    </div>
                ))}
            </div>

            {/* ── Mini Chart ── */}
            {chartData.length > 1 && (
                <div className="hub-card" style={{ padding: 24, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                        <Activity size={16} color="#0369a1" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#000", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            Water Height Over Time
                        </span>
                        <span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>Last {chartData.length} readings</span>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                            <defs>
                                <linearGradient id="hubGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0369a1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#0369a1" stopOpacity={0.02} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#999" }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10, fill: "#999" }} />
                            <Tooltip
                                contentStyle={{ background: "white", border: "1px solid #E8E8E8", borderRadius: 8, fontSize: 12 }}
                                formatter={(v, n) => [`${v}m`, n === "waterHeight" ? "Water Height" : "Depth"]}
                            />
                            <Area type="monotone" dataKey="waterHeight" stroke="#0369a1" strokeWidth={2} fill="url(#hubGrad)" name="waterHeight" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* ── Data Table ── */}
            <div className="hub-card" style={{ padding: 24 }}>
                {/* Table toolbar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Filter size={16} color="#0369a1" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#000", textTransform: "uppercase", letterSpacing: 0.5 }}>
                            All Readings
                        </span>
                        <span style={{ padding: "3px 10px", background: "#DBEAFE", color: "#0369a1", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                            {filtered.length.toLocaleString()}
                        </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {/* Search */}
                        <div style={{ position: "relative" }}>
                            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#999" }} />
                            <input
                                className="search-input"
                                placeholder="Search readings…"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        {/* Toggle raw fields */}
                        <button
                            onClick={() => setShowRaw(v => !v)}
                            style={{ padding: "9px 14px", borderRadius: 9, border: "1px solid #E8E8E8", background: showRaw ? "#DBEAFE" : "white", color: showRaw ? "#0369a1" : "#666", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s" }}
                        >
                            {showRaw ? <EyeOff size={14} /> : <Eye size={14} />}
                            {showRaw ? "Hide Raw" : "Show Raw"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #F0F0F0" }}>
                                {[
                                    { col: "node", label: "Node" },
                                    { col: "date", label: "Timestamp" },
                                    { col: "waterHeightM", label: "Height (m)" },
                                    { col: "waterHeightFt", label: "Height (ft)" },
                                    { col: "h1", label: "h1 (m)" },
                                    { col: "h2", label: "h2 (m)" },
                                    { col: "depth_m", label: "Depth (m)" },
                                    { col: "status", label: "Status" },
                                ].map(({ col, label }) => (
                                    <th key={col} style={{ padding: "10px 12px", textAlign: "left", whiteSpace: "nowrap" }}>
                                        <button className={`th-btn ${sortCol === col ? "active" : ""}`} onClick={() => handleSort(col)}>
                                            {label}
                                            {sortCol === col ? (sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null}
                                        </button>
                                    </th>
                                ))}
                                <th style={{ padding: "10px 12px", textAlign: "left" }}>
                                    <span style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 }}>Details</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: 48, textAlign: "center", color: "#999", fontSize: 14 }}>
                                        No readings found. Try adjusting your search or selecting a different node.
                                    </td>
                                </tr>
                            ) : pageData.map(r => (
                                <React.Fragment key={r.id}>
                                    <tr className="tr-data" style={{ borderBottom: "1px solid #F5F5F5", cursor: "pointer" }} onClick={() => toggleRow(r.id)}>
                                        {/* Node */}
                                        <td style={{ padding: "10px 12px", fontWeight: 700, color: "#000" }}>{r.node}</td>
                                        {/* Timestamp */}
                                        <td style={{ padding: "10px 12px", color: "#555", whiteSpace: "nowrap" }}>
                                            <div style={{ fontSize: 12, fontWeight: 600 }}>{r.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                                            <div style={{ fontSize: 11, color: "#999" }}>{r.date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
                                        </td>
                                        {/* Water Height m */}
                                        <td style={{ padding: "10px 12px" }}>
                                            <span style={{ fontWeight: 700, color: r.waterHeightM > 0 ? "#0369a1" : "#DC2626" }}>{r.waterHeightM}</span>
                                            <span style={{ fontSize: 11, color: "#999" }}> m</span>
                                        </td>
                                        {/* Water Height ft */}
                                        <td style={{ padding: "10px 12px", color: "#555" }}>{r.waterHeightFt} <span style={{ fontSize: 11, color: "#999" }}>ft</span></td>
                                        {/* h1 */}
                                        <td style={{ padding: "10px 12px", color: "#555" }}>{r.h1}</td>
                                        {/* h2 */}
                                        <td style={{ padding: "10px 12px", color: "#555" }}>{r.h2}</td>
                                        {/* depth */}
                                        <td style={{ padding: "10px 12px", color: "#555" }}>{r.depth_m}</td>
                                        {/* Status */}
                                        <td style={{ padding: "10px 12px" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: statusBg(r.status), color: statusColor(r.status), fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>
                                                <StatusIcon status={r.status} size={11} />
                                                {r.status}
                                            </span>
                                        </td>
                                        {/* Expand toggle */}
                                        <td style={{ padding: "10px 12px" }}>
                                            <button style={{ background: "none", border: "none", cursor: "pointer", color: "#0369a1", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}>
                                                {expandedRows[r.id] ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> View</>}
                                            </button>
                                        </td>
                                    </tr>

                                    {/* Expanded row */}
                                    {expandedRows[r.id] && (
                                        <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E8E8E8" }}>
                                            <td colSpan={9} style={{ padding: "16px 20px" }}>
                                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                                                    {/* Raw Data string */}
                                                    {r.rawData && (
                                                        <div>
                                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Raw Data String</div>
                                                            <code style={{ fontSize: 12, background: "#EFF6FF", padding: "8px 12px", borderRadius: 8, display: "block", wordBreak: "break-all", color: "#0369a1", border: "1px solid #DBEAFE" }}>
                                                                {r.rawData}
                                                            </code>
                                                        </div>
                                                    )}
                                                    {/* All raw fields */}
                                                    {showRaw && (
                                                        <div>
                                                            <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>All Firebase Fields</div>
                                                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                                {Object.entries(r.rawFields).map(([k, v]) => (
                                                                    <span key={k} className="raw-field">
                                                                        <strong>{k}:</strong> {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Computed values summary */}
                                                    <div>
                                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Computed Values</div>
                                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                                                            {[
                                                                { label: "Water Height", value: `${r.waterHeightM} m / ${r.waterHeightFt} ft` },
                                                                { label: "Cable (h1)", value: `${r.h1} m` },
                                                                { label: "Sensor (h2)", value: `${r.h2} m` },
                                                                { label: "Depth", value: `${r.depth_m} m` },
                                                                { label: "Activated", value: r.activated ? "Yes" : "No" },
                                                                { label: "Node ID", value: r.node },
                                                            ].map(item => (
                                                                <div key={item.label} style={{ background: "white", borderRadius: 8, padding: "8px 12px", border: "1px solid #E8E8E8" }}>
                                                                    <div style={{ fontSize: 10, color: "#999", fontWeight: 700, textTransform: "uppercase", marginBottom: 2 }}>{item.label}</div>
                                                                    <div style={{ fontSize: 13, fontWeight: 600, color: "#000" }}>{item.value}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 20, flexWrap: "wrap", gap: 12 }}>
                        <span style={{ fontSize: 13, color: "#666", fontWeight: 500 }}>
                            Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} readings
                        </span>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ opacity: page === 1 ? 0.4 : 1 }}>‹</button>
                            {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                                let p;
                                if (totalPages <= 7) p = i + 1;
                                else if (page <= 4) p = i + 1;
                                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                                else p = page - 3 + i;
                                return (
                                    <button key={p} className={`page-btn ${page === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
                                );
                            })}
                            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ opacity: page === totalPages ? 0.4 : 1 }}>›</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HubData;
