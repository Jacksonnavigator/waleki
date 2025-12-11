// NotificationService.js - Push + Beem Africa SMS Alerts

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.monitoring = new Map();
    this.checkInterval = null;

    this.CHECK_INTERVAL_MS = 60000; // 1 minute
    this.TIMEOUT_MS = 300000;       // 5 minutes
    this.notifiedNodes = new Set();
  }

  // ===========================================================
  // 1️⃣ BEEM AFRICA SMS CONFIG
  // ===========================================================
  BEEM_API_KEY = "";        // <-- Replace
  BEEM_SECRET_KEY = "";  // <-- Replace
  SENDER_ID = "";                // <-- Replace (must be approved)
  PHONE_NUMBER = "";        // <-- Replace (no +)

  // ===========================================================
  // 2️⃣ SEND SMS USING BEEM AFRICA API
  // ===========================================================
  async sendSMS(message) {
    try {
      const body = {
        source_addr: this.SENDER_ID,
        schedule_time: "",
        encoding: 0,
        message: message,
        recipients: [
          {
            recipient_id: 1,
            dest_addr: this.PHONE_NUMBER
          }
        ]
      };

      const response = await fetch("https://api.beem.africa/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic " +
            btoa(`${this.BEEM_API_KEY}:${this.BEEM_SECRET_KEY}`)
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();
      console.log("📨 Beem SMS Response:", result);

    } catch (error) {
      console.error("❌ Error sending Beem SMS:", error);
    }
  }

  // ===========================================================
  // 3️⃣ Initialize Push Notifications
  // ===========================================================
  async init() {
    if (!("Notification" in window)) return false;

    this.permission = Notification.permission;

    if (this.permission === "granted") {
      this.startMonitoring();
    }

    return this.permission === "granted";
  }

  async requestPermission() {
    const permission = await Notification.requestPermission();
    this.permission = permission;

    if (permission === "granted") {
      this.startMonitoring();
    }

    return permission === "granted";
  }

  // ===========================================================
  // 4️⃣ Monitoring
  // ===========================================================
  startMonitoring() {
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkInterval = setInterval(() => {
      this.checkDataFlow();
    }, this.CHECK_INTERVAL_MS);
  }

  stopMonitoring() {
    clearInterval(this.checkInterval);
    this.checkInterval = null;
  }

  updateNodeTimestamp(nodeId, timestamp) {
    const now = Date.now();
    const timestampMs = new Date(timestamp).getTime();
    const previous = this.monitoring.get(nodeId);

    this.monitoring.set(nodeId, {
      lastUpdate: timestampMs,
      lastCheck: now
    });

    // 🔵 NODE BACK ONLINE
    if (previous && this.notifiedNodes.has(`${nodeId}-offline`)) {
      this.notifiedNodes.delete(`${nodeId}-offline`);

      const msg = `✅ SYSTEM ONLINE\n${nodeId} has resumed sending data.`;
      this.sendSMS(msg);

      this.showNotification(
        `✅ ${nodeId} Back Online`,
        `Sensor has resumed data transmission.`,
        { tag: `${nodeId}-online` }
      );
    }
  }

  // ===========================================================
  // 5️⃣ Check if system is DOWN
  // ===========================================================
  checkDataFlow() {
    const now = Date.now();

    this.monitoring.forEach((data, nodeId) => {
      const timeSinceUpdate = now - data.lastUpdate;

      if (timeSinceUpdate > this.TIMEOUT_MS) {
        const key = `${nodeId}-offline`;

        if (!this.notifiedNodes.has(key)) {
          this.notifiedNodes.add(key);

          const minutes = Math.floor(timeSinceUpdate / 60000);

          const smsText = `⚠️ SYSTEM DOWN\n${nodeId} has been offline for ${minutes} minutes.`;

          // 📩 Send SMS using Beem
          this.sendSMS(smsText);

          // 🔔 Show push notification
          this.showNotification(
            `⚠️ ${nodeId} OFFLINE`,
            `No data for ${minutes} minutes.`,
            { tag: key }
          );
        }
      }
    });
  }

  // ===========================================================
  // 6️⃣ Push Notification
  // ===========================================================
  showNotification(title, body, options = {}) {
    if (this.permission !== "granted") return;

    const notification = new Notification(title, {
      body,
      icon: "/waleki-logo.png",
      badge: "/waleki-badge.png",
      ...options
    });

    setTimeout(() => notification.close(), 8000);

    return notification;
  }

  // ===========================================================
  // 7️⃣ Utilities
  // ===========================================================
  getMonitoringStatus() {
    const now = Date.now();
    const status = {};

    this.monitoring.forEach((data, id) => {
      status[id] = {
        lastUpdate: new Date(data.lastUpdate).toISOString(),
        minutesOffline: Math.floor((now - data.lastUpdate) / 60000),
        isOnline: now - data.lastUpdate < this.TIMEOUT_MS
      };
    });

    return status;
  }

  clearNotifications() {
    this.notifiedNodes.clear();
  }

  destroy() {
    this.stopMonitoring();
    this.monitoring.clear();
    this.notifiedNodes.clear();
  }
}

const notificationService = new NotificationService();
export default notificationService;
