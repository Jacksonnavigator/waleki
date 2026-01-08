import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle, Search, ChevronDown, ChevronRight, Copy,
  CheckCircle, AlertTriangle, Zap, Settings, BarChart3,
  Bell, Database, ThumbsUp, ThumbsDown, Mail, Phone, Users
} from 'lucide-react';

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#000';
  const Icon = type === 'success' ? CheckCircle : AlertTriangle;

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
      minWidth: '320px'
    }}>
      <Icon size={20} />
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{message}</span>
    </div>
  );
};

const HelpPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [toast, setToast] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // FAQ Data
  const faqData = {
    'getting-started': [
      {
        id: 'gs1',
        question: 'How do I add a new sensor node?',
        answer: 'To add a new sensor node:\n\n1. Navigate to Settings → Nodes tab\n2. Fill in Node ID (e.g., "Node4")\n3. Enter cable length (h₁) in meters\n4. Add location and region\n5. Check "Activate immediately"\n6. Click "Add Node"\n\nThe node will appear in your Dashboard once added.',
        tags: ['node', 'sensor', 'add']
      },
      {
        id: 'gs2',
        question: 'What is cable length (h₁)?',
        answer: 'Cable length (h₁) is the depth from surface to cable end.\n\nIt\'s critical for calculating water height:\n• Water Height = h₁ - h₂\n• h₁ = Cable length (fixed)\n• h₂ = Sensor reading (varies)\n\nMeasure accurately during installation!',
        tags: ['cable', 'h1', 'measurement']
      },
      {
        id: 'gs3',
        question: 'How do I activate or deactivate a node?',
        answer: 'To toggle node activation:\n\n1. Go to Settings → Nodes tab\n2. Find your node in the list\n3. Click the eye icon (👁️) next to the node\n4. Node toggles between Active ✅ and Inactive ⚪\n\nOnly active nodes appear in monitoring dashboards.',
        tags: ['activate', 'deactivate', 'toggle']
      },
      {
        id: 'gs4',
        question: 'What do I need to install a sensor?',
        answer: 'Required equipment:\n\n1. LoRa Sensor Module\n2. Ultrasonic sensor cable\n3. Power supply (solar/battery)\n4. Mounting hardware\n5. Waterproof enclosure\n\nOptional:\n• Lightning protection\n• Extra batteries\n• Signal booster\n\nContact support for installation guide!',
        tags: ['installation', 'equipment', 'hardware']
      },
      {
        id: 'gs5',
        question: 'How far apart can sensor nodes be?',
        answer: 'LoRa Range:\n\n• Urban areas: 2-5 km\n• Rural areas: 5-15 km\n• Line of sight: Up to 15 km\n\nFactors affecting range:\n• Buildings and obstacles\n• Terrain elevation\n• Weather conditions\n• Antenna placement\n\nUse signal strength indicator to optimize placement.',
        tags: ['range', 'distance', 'lora']
      },
      {
        id: 'gs6',
        question: 'What is the difference between Admin, Operator, and Viewer roles?',
        answer: 'User Roles:\n\n**Admin:**\n• Full system access\n• Manage users\n• Configure all settings\n• Delete nodes\n\n**Operator:**\n• Monitor sensors\n• View analytics\n• Configure nodes\n• Cannot delete or manage users\n\n**Viewer:**\n• Read-only access\n• View dashboards\n• View reports\n• Cannot modify anything',
        tags: ['roles', 'permissions', 'users']
      }
    ],
    'monitoring': [
      {
        id: 'mon1',
        question: 'How often does data update?',
        answer: 'Sensor data updates in real-time via Firebase.\n\n• Data flows continuously\n• Dashboard auto-refreshes every 30s\n• Change rate in Settings → System\n• Manual refresh: Click navbar button',
        tags: ['update', 'refresh', 'real-time']
      },
      {
        id: 'mon2',
        question: 'What do node statuses mean?',
        answer: 'Node status colors:\n\n🟢 Active: Water > 10m\n🟡 Warning: Water 5-10m\n🟠 Low: Water 0-5m\n🔴 Critical: No water\n⚪ Inactive: Not activated',
        tags: ['status', 'color', 'indicator']
      },
      {
        id: 'mon3',
        question: 'How do I view historical data?',
        answer: 'Access historical data:\n\n1. Go to Analytics page\n2. Select node from dropdown\n3. Choose time range (24h/7d/30d/custom)\n4. View charts or tables\n5. Export as CSV/JSON\n\nData retained for 30 days (default).',
        tags: ['history', 'analytics', 'data']
      },
      {
        id: 'mon4',
        question: 'Can I monitor multiple wells at once?',
        answer: 'Yes! Multiple monitoring options:\n\n• Dashboard: All nodes in grid\n• Monitor: Switch between nodes\n• Analytics: Compare up to 3 nodes\n• Health: System-wide overview\n\nAll update in real-time!',
        tags: ['multiple', 'wells', 'comparison']
      },
      {
        id: 'mon5',
        question: 'What is the minimum water level I can measure?',
        answer: 'Measurement capabilities:\n\n• Minimum: 0.5 meters\n• Maximum: Depends on cable length\n• Accuracy: ±2cm\n• Resolution: 1cm\n\nFor shallow wells under 0.5m, use shorter cables or different sensor type.',
        tags: ['measurement', 'minimum', 'accuracy']
      },
      {
        id: 'mon6',
        question: 'How accurate are the water level readings?',
        answer: 'Sensor Accuracy:\n\n• Standard accuracy: ±2cm\n• Temperature drift: ±0.5%\n• Response time: <1 second\n• Calibration: Every 6 months\n\nFactors affecting accuracy:\n• Sensor alignment\n• Temperature changes\n• Water turbulence\n• Cable tension\n\nRegular calibration maintains accuracy.',
        tags: ['accuracy', 'precision', 'calibration']
      },
      {
        id: 'mon7',
        question: 'Can I set custom water level thresholds?',
        answer: 'Customize alert thresholds:\n\n1. Settings → System tab\n2. Find "Alert Thresholds"\n3. Set custom levels:\n   • Critical: < 2m (red)\n   • Low: 2-5m (orange)\n   • Warning: 5-10m (yellow)\n   • Normal: > 10m (green)\n4. Save changes\n\nAlerts trigger when thresholds crossed.',
        tags: ['threshold', 'custom', 'alerts']
      }
    ],
    'notifications': [
      {
        id: 'not1',
        question: 'How do I enable notifications?',
        answer: 'To enable push notifications:\n\n1. Click bell icon (🔔) in navbar\n2. Click "Enable Notifications"\n3. Allow browser permissions\n4. Receive confirmation\n\nGet alerts when sensors go offline!',
        tags: ['notifications', 'alerts', 'enable']
      },
      {
        id: 'not2',
        question: 'What types of notifications will I receive?',
        answer: 'Alert Types:\n\n**Critical:**\n• Sensor offline (5+ min)\n• Water level critical (< 2m)\n• System errors\n\n**Warning:**\n• Low water level (2-5m)\n• Battery low (<20%)\n• Connection unstable\n\n**Info:**\n• Sensor back online\n• Daily reports\n• Maintenance reminders',
        tags: ['types', 'alerts', 'categories']
      },
      {
        id: 'not3',
        question: 'Can I customize notification settings?',
        answer: 'Customize notifications:\n\n1. Settings → System\n2. Configure:\n   • Check interval (10-300s)\n   • Timeout threshold (60-1800s)\n   • Alert types (critical/warning/info)\n   • Quiet hours (optional)\n   • Notification channels (email/SMS/push)\n\n3. Profile → Preferences\n   • Toggle notification types\n   • Set preferred channels',
        tags: ['customize', 'settings', 'preferences']
      },
      {
        id: 'not4',
        question: 'Why am I not receiving notifications?',
        answer: 'Troubleshooting steps:\n\n1. Check browser permissions\n2. Verify alerts enabled (Settings → System)\n3. Check notification panel (🔔)\n4. Test notification (click "Test" button)\n5. Clear browser cache\n6. Try different browser\n\nStill issues? Check:\n• Do Not Disturb mode (OS)\n• Browser notification settings\n• Firewall blocking notifications',
        tags: ['troubleshooting', 'not working', 'fix']
      },
      {
        id: 'not5',
        question: 'Can I receive SMS or email alerts?',
        answer: 'Multi-channel alerts:\n\n**SMS Alerts:**\n• Available for premium accounts\n• Configure in Settings → Notifications\n• Enter phone number\n• Verify via code\n• Set SMS preferences\n\n**Email Alerts:**\n• Free for all accounts\n• Automatic email verification\n• Daily/weekly digest options\n• Instant critical alerts\n\nContact support to enable premium features.',
        tags: ['sms', 'email', 'channels']
      }
    ],
    'settings': [
      {
        id: 'set1',
        question: 'How do I backup configuration?',
        answer: 'To backup:\n\n1. Settings → Backup tab\n2. Click "Export"\n3. JSON file downloads\n4. Store safely\n\nIncludes all nodes and settings.',
        tags: ['backup', 'export']
      },
      {
        id: 'set2',
        question: 'Can I import settings from another system?',
        answer: 'Import configuration:\n\n1. Settings → Backup tab\n2. Click "Import"\n3. Select JSON file\n4. Review changes\n5. Confirm import\n\n⚠️ Warning: Overwrites current settings!\nBackup first!',
        tags: ['import', 'restore', 'transfer']
      },
      {
        id: 'set3',
        question: 'How do I change my password?',
        answer: 'Change password:\n\n1. Profile → Security tab\n2. Enter current password\n3. Enter new password (min 6 chars)\n4. Confirm new password\n5. Click "Change Password"\n\nYou\'ll be logged out. Sign in with new password.',
        tags: ['password', 'security']
      },
      {
        id: 'set4',
        question: 'Can I change the dashboard refresh rate?',
        answer: 'Adjust refresh rate:\n\n1. Settings → System tab\n2. Find "Auto Refresh Interval"\n3. Set 10-300 seconds\n4. Toggle "Auto Refresh" on/off\n5. Save settings\n\nLower = more frequent but higher data usage.',
        tags: ['refresh', 'rate', 'dashboard']
      },
      {
        id: 'set5',
        question: 'How do I change the theme or language?',
        answer: 'Customize appearance:\n\n**Theme:**\n1. Settings → Preferences\n2. Select theme:\n   • Light (default)\n   • Dark\n   • Auto (system)\n\n**Language:**\n1. Settings → Preferences\n2. Select language:\n   • English\n   • Swahili (Kiswahili)\n   • More coming soon!\n\nChanges apply immediately.',
        tags: ['theme', 'language', 'appearance']
      },
      {
        id: 'set6',
        question: 'What data retention options are available?',
        answer: 'Data retention settings:\n\n1. Settings → System\n2. Set retention period:\n   • 7 days (minimal)\n   • 30 days (default)\n   • 90 days (recommended)\n   • 365 days (maximum)\n\n**Note:**\n• Longer retention = more storage\n• Analytics limited by retention\n• Export data before it expires\n• Premium: Unlimited retention',
        tags: ['retention', 'storage', 'data']
      }
    ],
    'troubleshooting': [
      {
        id: 'trb1',
        question: 'Node shows offline?',
        answer: 'Check:\n\n1. Sensor powered on?\n2. Cables connected?\n3. Within 5m of cable end?\n4. Check Health → System Logs\n\nStill offline? Contact support.',
        tags: ['offline', 'fix']
      },
      {
        id: 'trb2',
        question: 'Water shows 0m?',
        answer: 'If h₂ ≥ h₁, water = 0m.\n\nSolution:\n1. Settings → Nodes\n2. Check h₁ value\n3. Update if incorrect\n4. Save changes\n\nFormula: H = h₁ - h₂',
        tags: ['zero', 'water', 'height']
      },
      {
        id: 'trb3',
        question: 'Dashboard not updating?',
        answer: 'Fix dashboard issues:\n\n1. Check auto-refresh (Settings → System)\n2. Hard refresh: Ctrl+Shift+R\n3. Clear browser cache\n4. Check internet connection\n5. Verify Firebase status (Health page)\n6. Try different browser\n\nIf Health shows "Connected", data is flowing.',
        tags: ['dashboard', 'update', 'refresh']
      },
      {
        id: 'trb4',
        question: 'Sensor readings are erratic?',
        answer: 'Stabilize readings:\n\n**Common causes:**\n• Loose cable connections\n• Water turbulence\n• Sensor misalignment\n• Electrical interference\n• Temperature changes\n\n**Solutions:**\n1. Secure all connections\n2. Wait for water to settle\n3. Check sensor position\n4. Move away from electrical lines\n5. Recalibrate sensor\n\nContact support if persists.',
        tags: ['erratic', 'unstable', 'fluctuating']
      },
      {
        id: 'trb5',
        question: 'How do I reset a sensor node?',
        answer: 'Reset procedure:\n\n**Soft Reset:**\n1. Settings → Nodes\n2. Click edit on node\n3. Click "Reset Configuration"\n4. Confirm reset\n\n**Hard Reset:**\n1. Power off sensor\n2. Wait 30 seconds\n3. Power on sensor\n4. Reconfigure in dashboard\n\n**Factory Reset:**\n• Contact support\n• Requires physical access\n• Clears all settings',
        tags: ['reset', 'restart', 'reboot']
      },
      {
        id: 'trb6',
        question: 'Battery draining too quickly?',
        answer: 'Extend battery life:\n\n**Check settings:**\n• Reduce check interval\n• Lower transmission power\n• Disable unnecessary features\n\n**Hardware:**\n• Clean solar panel\n• Check battery health\n• Verify charging circuit\n• Upgrade to larger battery\n\n**Expected life:**\n• Solar + battery: Indefinite\n• Battery only: 6-12 months\n• Depends on usage\n\nMonitor in Health → Node Status.',
        tags: ['battery', 'power', 'drain']
      }
    ],
    'technical': [
      {
        id: 'tech1',
        question: 'Water height formula?',
        answer: 'H = h₁ - h₂\n\nWhere:\n• H = Water height\n• h₁ = Cable length (fixed)\n• h₂ = Sensor reading (varies)\n\nExample: 50m - 45m = 5m water',
        tags: ['formula', 'calculation']
      },
      {
        id: 'tech2',
        question: 'How does LoRa communication work?',
        answer: 'LoRa Technology:\n\n**Sensor → Gateway:**\n• Long Range (2-15km)\n• Low Power (<50mA)\n• 868/915 MHz frequency\n• Encrypted transmission\n\n**Gateway → Cloud:**\n• Internet connection\n• Uploads to Firebase\n• Real-time sync\n\n**Cloud → Dashboard:**\n• WebSocket connection\n• Instant updates\n• Data caching\n\n**Benefits:**\n• No cellular data needed\n• Works in remote areas\n• Very low power consumption',
        tags: ['lora', 'communication', 'wireless']
      },
      {
        id: 'tech3',
        question: 'What data is stored in Firebase?',
        answer: 'Database structure:\n\n**Real-time Data:**\n• Sensor readings (h₂)\n• Timestamps\n• Connection status\n• Battery levels\n\n**Configuration:**\n• Node settings (h₁, location)\n• System preferences\n• User profiles\n• Alert thresholds\n\n**Historical:**\n• Activity logs\n• System events\n• Error reports\n\n**Security:**\n• Encrypted at rest\n• Encrypted in transit\n• Role-based access',
        tags: ['firebase', 'database', 'storage']
      },
      {
        id: 'tech4',
        question: 'Can I integrate with other systems?',
        answer: 'Integration options:\n\n**REST API:**\n• GET /api/nodes - List nodes\n• GET /api/data/{nodeId} - Get readings\n• POST /api/alerts - Create alert\n• Authentication required\n\n**Webhooks:**\n• Real-time data push\n• Configure in Settings\n• JSON payload\n• Retry on failure\n\n**Exports:**\n• CSV/JSON download\n• Scheduled exports\n• Email delivery\n• FTP/SFTP upload\n\nAPI docs: docs.waleki.com/api',
        tags: ['api', 'integration', 'webhook']
      },
      {
        id: 'tech5',
        question: 'What is the system architecture?',
        answer: 'Waleki Architecture:\n\n**1. Sensor Layer:**\n• Ultrasonic sensors\n• LoRa transmitters\n• Solar/battery power\n\n**2. Network Layer:**\n• LoRa gateways\n• Internet connection\n• Edge processing\n\n**3. Cloud Layer:**\n• Firebase Realtime DB\n• Authentication\n• File storage\n\n**4. Application Layer:**\n• React web app\n• Real-time updates\n• Analytics engine\n\n**5. User Layer:**\n• Web browsers\n• Mobile devices\n• Admin panels',
        tags: ['architecture', 'system', 'design']
      },
      {
        id: 'tech6',
        question: 'How is data secured?',
        answer: 'Security measures:\n\n**Data Encryption:**\n• TLS 1.3 in transit\n• AES-256 at rest\n• End-to-end encryption\n\n**Authentication:**\n• Firebase Auth\n• Email verification\n• 2FA support\n• Session management\n\n**Authorization:**\n• Role-based access\n• Granular permissions\n• Audit logging\n\n**Network:**\n• Firewall protection\n• DDoS mitigation\n• Rate limiting\n• IP filtering\n\n**Compliance:**\n• GDPR ready\n• Data privacy\n• Regular audits',
        tags: ['security', 'encryption', 'privacy']
      }
    ]
  };

  const searchFAQs = () => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const results = [];
    Object.entries(faqData).forEach(([category, faqs]) => {
      faqs.forEach(faq => {
        if (faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query) ||
          faq.tags.some(tag => tag.includes(query))) {
          results.push({ ...faq, category });
        }
      });
    });
    return results;
  };

  const displayedFAQs = searchQuery.trim() ? searchFAQs() : faqData[activeTab] || [];

  const handleFeedback = (faqId, helpful) => {
    setFeedbackGiven({ ...feedbackGiven, [faqId]: helpful });
    showToast(helpful ? 'Thanks for feedback!' : 'We\'ll improve this', 'success');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="help-page">
      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(400px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .help-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }
        .help-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0c4a6e 100%);
          border-radius: 24px;
          padding: 48px 40px;
          margin-bottom: 24px;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.3);
        }
        .help-header::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 60%);
          border-radius: 50%;
        }
        .header-content {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 32px;
        }
        .header-icon-large {
          width: 80px;
          height: 80px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }
        .header-info { flex: 1; }
        .header-title {
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -1px;
        }
        .header-subtitle {
          font-size: 16px;
          opacity: 0.95;
          line-height: 1.6;
        }
        .search-section {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .search-wrapper { position: relative; }
        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }
        .search-input {
          width: 100%;
          padding: 16px 20px 16px 52px;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          font-size: 15px;
          outline: none;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: #0369a1;
          box-shadow: 0 0 0 3px rgba(3, 105, 161, 0.1);
        }
        .help-content {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }
        .sidebar { display: flex; flex-direction: column; gap: 16px; }
        .sidebar-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
        }
        .nav-item {
          width: 100%;
          padding: 14px 16px;
          background: transparent;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-bottom: 6px;
        }
        .nav-item:hover { background: #F5F5F5; color: #000; }
        .nav-item.active {
          background: linear-gradient(135deg, #0369a1, #0284c7);
          color: white;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.2);
        }
        .quick-link-item {
          padding: 12px;
          background: #FAFAFA;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid #F0F0F0;
          margin-bottom: 8px;
        }
        .quick-link-item:hover {
          background: white;
          border-color: #000;
        }
        .quick-link-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0369a1, #0284c7);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .quick-link-text {
          font-size: 13px;
          font-weight: 600;
          color: #000;
        }
        .main-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 32px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04);
        }
        .content-header {
          margin-bottom: 32px;
          padding-bottom: 20px;
          border-bottom: 1px solid #F0F0F0;
        }
        .content-title {
          font-size: 24px;
          font-weight: 700;
          color: #000;
          margin-bottom: 8px;
        }
        .content-subtitle {
          font-size: 15px;
          color: #666;
        }
        .faq-list { display: flex; flex-direction: column; gap: 16px; }
        .faq-item {
          background: #FAFAFA;
          border-radius: 12px;
          border: 1px solid #F0F0F0;
          overflow: hidden;
        }
        .faq-question-btn {
          width: 100%;
          padding: 20px;
          background: transparent;
          border: none;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .faq-question-text {
          font-size: 15px;
          font-weight: 700;
          color: #000;
        }
        .faq-answer {
          padding: 0 20px 20px;
          font-size: 14px;
          color: #666;
          line-height: 1.8;
          white-space: pre-line;
        }
        .faq-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #F0F0F0;
        }
        .feedback-text {
          font-size: 13px;
          color: #999;
          font-weight: 600;
        }
        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: white;
          border: 1px solid #E8E8E8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #666;
        }
        .action-btn:hover {
          border-color: #000;
          color: #000;
        }
        .action-btn.active-positive {
          background: #DCFCE7;
          border-color: #16A34A;
          color: #16A34A;
        }
        @media (max-width: 1024px) {
          .help-content { grid-template-columns: 1fr; }
          .header-content { flex-direction: column; }
        }
      `}</style>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="help-header">
        <div className="header-content">
          <div className="header-icon-large"><HelpCircle size={40} /></div>
          <div className="header-info">
            <h1 className="header-title">Help & Support</h1>
            <p className="header-subtitle">Find answers and get expert support</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="help-content">
        <div className="sidebar">
          <div className="sidebar-card">
            {Object.keys(faqData).map(tab => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              >
                {tab === 'getting-started' && <Zap size={18} />}
                {tab === 'monitoring' && <BarChart3 size={18} />}
                {tab === 'notifications' && <Bell size={18} />}
                {tab === 'settings' && <Settings size={18} />}
                {tab === 'troubleshooting' && <AlertTriangle size={18} />}
                {tab === 'technical' && <Database size={18} />}
                <span>{tab.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-card">
            <div className="quick-link-item" onClick={() => navigate('/settings')}>
              <div className="quick-link-icon"><Settings size={16} /></div>
              <span className="quick-link-text">Settings</span>
            </div>
            <div className="quick-link-item" onClick={() => navigate('/profile')}>
              <div className="quick-link-icon"><Users size={16} /></div>
              <span className="quick-link-text">Profile</span>
            </div>
            <div className="quick-link-item" onClick={() => window.open('mailto:support@waleki.com')}>
              <div className="quick-link-icon"><Mail size={16} /></div>
              <span className="quick-link-text">Email</span>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="content-header">
            <h2 className="content-title">
              {searchQuery.trim() ? `Search: "${searchQuery}"` : activeTab.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
            </h2>
            <p className="content-subtitle">
              {displayedFAQs.length} article{displayedFAQs.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="faq-list">
            {displayedFAQs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button className="faq-question-btn" onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}>
                  <div className="faq-question-text">{faq.question}</div>
                  {expandedFAQ === faq.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                {expandedFAQ === faq.id && (
                  <div className="faq-answer">
                    {faq.answer}
                    <div className="faq-actions">
                      <span className="feedback-text">Helpful?</span>
                      <button
                        className={`action-btn ${feedbackGiven[faq.id] === true ? 'active-positive' : ''}`}
                        onClick={() => handleFeedback(faq.id, true)}
                      >
                        <ThumbsUp size={14} />
                      </button>
                      <button
                        className={`action-btn ${feedbackGiven[faq.id] === false ? 'active-negative' : ''}`}
                        onClick={() => handleFeedback(faq.id, false)}
                      >
                        <ThumbsDown size={14} />
                      </button>
                      <button className="action-btn" onClick={() => copyToClipboard(faq.answer)} style={{ marginLeft: 'auto' }}>
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;