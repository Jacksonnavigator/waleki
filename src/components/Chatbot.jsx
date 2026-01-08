import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Chatbot = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Get time-based greeting
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser?.displayName?.split(' ')[0] || 'there';
    
    if (hour >= 5 && hour < 12) {
      return `Good morning, ${name}! ☀️ Ready to monitor your water wells today?`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${name}! 👋 How can I help with your water monitoring?`;
    } else if (hour >= 17 && hour < 21) {
      return `Good evening, ${name}! 🌆 What can I assist you with?`;
    } else {
      return `Hey ${name}! 🌙 Working late? I'm here to help!`;
    }
  };

  // Initialize with time-based greeting
  useEffect(() => {
    setMessages([
      {
        type: 'bot',
        message: getTimeBasedGreeting(),
        timestamp: new Date()
      }
    ]);
  }, [currentUser]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Get user's first name
  const getUserName = () => {
    return currentUser?.displayName?.split(' ')[0] || 'friend';
  };

  // Enhanced AI Response Logic with more human-like interactions
  const getBotResponse = (input) => {
    const lower = input.toLowerCase();
    const name = getUserName();

    // Greetings with time awareness
    if (lower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|sup|yo|hola)/)) {
      const hour = new Date().getHours();
      const greetings = [
        `Hey ${name}! 😊 What brings you here today?`,
        `Hello! I'm all ears. What would you like to know?`,
        `Hi there! Ready to tackle some water monitoring questions?`,
        hour < 12 ? `Good morning! ☕ How can I brighten your day?` : `Hey! 👋 What's on your mind?`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // How are you / Personal
    if (lower.match(/(how are you|how're you|hows it going|whats up|wassup)/)) {
      return `I'm doing great, thanks for asking! 😊 As an AI assistant, I'm always ready to help. How about you? Everything running smoothly with your water monitoring system?`;
    }

    // Thank you responses
    if (lower.match(/(thank|thanks|thx|appreciate|grateful)/)) {
      const responses = [
        `You're very welcome, ${name}! 😊 Happy to help anytime!`,
        `My pleasure! That's what I'm here for. Need anything else?`,
        `Glad I could help! Feel free to ask me anything else.`,
        `You're welcome! Don't hesitate to reach out if you need more help! 👍`
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }

    // Goodbye / See you
    if (lower.match(/(bye|goodbye|see you|later|gtg|gotta go)/)) {
      const hour = new Date().getHours();
      const farewells = [
        `Goodbye, ${name}! Have a wonderful ${hour < 17 ? 'day' : 'evening'}! 👋`,
        `See you later! Don't hesitate to come back if you need help! 😊`,
        `Take care! Your water wells are in good hands! 💧`,
        `Catch you later! Stay hydrated! 💦😄`
      ];
      return farewells[Math.floor(Math.random() * farewells.length)];
    }

    // Good / Great / Awesome responses
    if (lower.match(/^(good|great|awesome|excellent|perfect|nice|cool|wonderful)/)) {
      return `That's awesome to hear! 🎉 Is there anything else I can help you with?`;
    }

    // Yes / No responses
    if (lower === 'yes' || lower === 'yeah' || lower === 'yep' || lower === 'sure') {
      return `Great! What would you like to know about? I can help with:\n• Adding nodes\n• Troubleshooting issues\n• Understanding calculations\n• System settings\n\nJust ask away! 😊`;
    }

    if (lower === 'no' || lower === 'nope' || lower === 'nah') {
      return `No worries! I'm here whenever you need me. Feel free to ask if anything comes up! 👍`;
    }

    // Who are you / About bot
    if (lower.match(/(who are you|what are you|your name|about you)/)) {
      return `I'm Waleki Assistant! 🤖 Your friendly AI helper for all things water monitoring.\n\nI can help you with:\n• Setting up sensor nodes\n• Understanding water calculations\n• Troubleshooting problems\n• Navigating the system\n• And much more!\n\nThink of me as your 24/7 water monitoring expert! 💧`;
    }

    // Add node - detailed
    if (lower.match(/(add|create|setup|install|new).*(node|sensor|device)/)) {
      return `Great! Let me walk you through adding a new sensor node! 🎯\n\n**Step-by-step:**\n1️⃣ Go to **Settings** → **Nodes tab**\n2️⃣ Scroll to the form at bottom\n3️⃣ Enter **Node ID** (like "Node4" or "Well-East")\n4️⃣ Enter **Cable Length (h₁)** in meters\n   📏 *This is SUPER important - measure carefully!*\n5️⃣ Add **Location** (e.g., "Mwanza Region")\n6️⃣ Check **"Activate immediately"** if ready\n7️⃣ Click **"Add Node"** button\n\n✅ Done! Your node will show up in the Dashboard!\n\nNeed help measuring cable length? Just ask! 😊`;
    }

    // Cable length / h1 - detailed
    if (lower.match(/(cable|h1|h₁|measure|length|depth)/)) {
      return `Ah, cable length - the foundation of accurate readings! 📏\n\n**What is h₁?**\nIt's the total distance from ground surface to the END of your sensor cable.\n\n**Why is it critical?**\nWater Height = h₁ - h₂\n• h₁ = Your cable length (FIXED, you measure once)\n• h₂ = Sensor reading (CHANGES, real-time from sensor)\n• H = Actual water height (CALCULATED)\n\n**Example:**\n• Cable goes down 50 meters (h₁ = 50m)\n• Sensor reads 45m from surface (h₂ = 45m)\n• Water height = 50 - 45 = **5 meters of water** 💧\n\n**Pro tip:** If your water shows 0m but there IS water, your h₁ is probably too small! Remeasure and update it in Settings.\n\nMake sense? Let me know if you need clarification! 🤓`;
    }

    // Notifications / Alerts - detailed
    if (lower.match(/(notification|alert|push|bell|email|sms)/)) {
      return `Let's get you set up with notifications! 🔔\n\n**Quick Setup:**\n1️⃣ Click the **bell icon (🔔)** in the navbar\n2️⃣ Click **"Enable Notifications"**\n3️⃣ Allow permissions when browser asks\n4️⃣ You'll get a test notification!\n\n**You'll receive alerts for:**\n🚨 **Critical:** Sensor offline, no water\n⚠️ **Warning:** Low water, battery low\nℹ️ **Info:** Sensor back online, daily reports\n\n**Want to customize?**\nGo to Settings → System to adjust:\n• How often to check\n• When to alert\n• Which alert types\n\n**Pro tip:** You can also get SMS & email alerts! Check Settings → Preferences to enable them.\n\nLet me know if you hit any snags! 😊`;
    }

    // Offline sensor - detailed
    if (lower.match(/(offline|not working|down|disconnected|no signal|connection)/)) {
      return `Sensor offline? Don't worry, let's troubleshoot! 🔧\n\n**Quick Checks:**\n\n1️⃣ **Power Supply**\n   ✓ Is the sensor powered on?\n   ✓ Check battery level\n   ✓ Solar panel clean and working?\n\n2️⃣ **Physical Connections**\n   ✓ All cables firmly connected?\n   ✓ No visible damage to wires?\n   ✓ Waterproof seals intact?\n\n3️⃣ **Sensor Position**\n   ✓ Is sensor within 5m of cable end?\n   ✓ Any obstructions?\n   ✓ Proper alignment?\n\n4️⃣ **Check System Logs**\n   📊 Go to **Health** → **System Logs**\n   Look for error messages\n\n5️⃣ **Network Range**\n   📡 Too far from gateway? (Max 2-15km)\n   Buildings blocking signal?\n\n**Still offline?**\nTry a soft reset: Power off → Wait 30s → Power on\n\nIf nothing works, our support team is ready! Contact: support@waleki.com\n\nHope this helps! 🤞`;
    }

    // Water shows 0m - detailed
    if (lower.match(/(water.*0|zero.*water|shows.*0|0.*meter|no.*water|empty)/)) {
      return `Water showing 0m but you know there's water? I can fix that! 💧\n\n**The Problem:**\nThis happens when h₂ ≥ h₁ (sensor reading ≥ cable length)\n\n**Translation:**\nThe sensor thinks it's reading deeper than your cable reaches, which is impossible! So it displays 0m.\n\n**The Solution:**\n\n1️⃣ **Check Your h₁ (Cable Length):**\n   • Go to **Settings** → **Nodes tab**\n   • Find your node in the list\n   • Check the h₁ value - is it correct?\n\n2️⃣ **Update if Wrong:**\n   • Click the **edit icon (✏️)**\n   • Enter the CORRECT cable length\n   • Save changes\n\n3️⃣ **Verify:**\n   • Go to Dashboard\n   • Check if water height now shows correctly\n\n**Example Fix:**\n❌ Before: h₁ = 40m, h₂ = 45m → Shows 0m (ERROR!)\n✅ After: h₁ = 50m, h₂ = 45m → Shows 5m (CORRECT!)\n\n**Pro Tip:** Always measure your cable length from ground surface to the ABSOLUTE END of the cable. Don't estimate - use a tape measure! 📏\n\nDid that solve it? Let me know! 😊`;
    }

    // Backup / Export - detailed
    if (lower.match(/(backup|export|save|download|config)/)) {
      return `Smart thinking - backups are crucial! 💾\n\n**To Backup Your Configuration:**\n\n1️⃣ Go to **Settings** → **Backup tab**\n2️⃣ Click the big **"Export"** button\n3️⃣ A JSON file downloads automatically\n   📁 Filename: waleki-config-[timestamp].json\n4️⃣ **Store it safely!**\n   • Google Drive\n   • Dropbox\n   • External hard drive\n   • USB stick\n\n**What's Included:**\n✓ All sensor node configurations\n✓ System settings\n✓ User preferences  \n✓ Alert thresholds\n✓ Notification settings\n\n**To Restore Later:**\n• Same tab, click **"Import"**\n• Select your backup file\n• Confirm (it will overwrite current settings)\n\n**Pro Tip:** Make backups:\n• Before major changes\n• Once a month\n• Before system updates\n\nYour future self will thank you! 🙏`;
    }

    // Dashboard / Pages / Navigation
    if (lower.match(/(dashboard|page|where|navigate|go to|find)/)) {
      return `Let me give you a tour of Waleki! 🗺️\n\n**Main Pages:**\n\n🏠 **Dashboard** - Your home base\n   • See all active nodes at once\n   • Real-time water levels\n   • Status indicators\n   • Quick stats\n\n📊 **Monitor** - Deep dive single nodes\n   • Select specific node\n   • Live sensor data\n   • Detailed readings\n   • Historical mini-chart\n\n📈 **Analytics** - Data analysis paradise\n   • Compare multiple nodes\n   • Charts & graphs\n   • Export data (CSV/JSON)\n   • Custom date ranges\n\n🏥 **Health** - System diagnostics\n   • All nodes overview\n   • System logs\n   • Error tracking\n   • Performance metrics\n\n⚙️ **Settings** - Configuration central\n   • Add/edit nodes\n   • System settings\n   • Backup/restore\n   • Preferences\n\n👤 **Profile** - Your account\n   • Personal info\n   • Security settings\n   • Activity log\n   • Data export\n\n❓ **Help** - Knowledge base\n   • FAQs\n   • Tutorials\n   • Contact support\n\nWhere would you like to go? 😊`;
    }

    // Status colors / Indicators
    if (lower.match(/(status|color|indicator|green|red|yellow|orange|meaning)/)) {
      return `Let me decode those colors for you! 🎨\n\n**Node Status Colors:**\n\n🟢 **Active (Green)** - All good!\n   • Water level > 10 meters\n   • Sensor online & working\n   • No issues detected\n   • Keep monitoring normally\n\n🟡 **Warning (Yellow)** - Pay attention\n   • Water level 5-10 meters\n   • Still safe, but decreasing\n   • Monitor more frequently\n   • Consider water conservation\n\n🟠 **Low (Orange)** - Take action soon\n   • Water level 0-5 meters\n   • Getting critically low\n   • Plan alternative sources\n   • Alert relevant people\n\n🔴 **Critical (Red)** - Immediate action!\n   • Water ≤ 0 meters (empty/error)\n   • Sensor offline for 5+ minutes\n   • System error detected\n   • Check sensor immediately!\n\n⚪ **Inactive (Gray)** - Not monitoring\n   • Node exists but deactivated\n   • Not collecting data\n   • Enable in Settings if needed\n\n**Pro Tip:** You can customize these thresholds in Settings → System to match your specific needs!\n\nMake sense? 👍`;
    }

    // Formula / Math / Calculation
    if (lower.match(/(formula|calculate|math|equation|h1|h2)/)) {
      return `Let's break down the water height formula! 🧮\n\n**The Formula:**\n**H = h₁ - h₂**\n\nSimple subtraction, but each variable is critical!\n\n**What Each Means:**\n\n📏 **h₁** (Cable Length)\n   • Distance: Ground → End of cable\n   • FIXED value (you measure once)\n   • YOU set this in Settings\n   • Must be VERY accurate!\n\n📡 **h₂** (Sensor Reading)\n   • Distance: Ground → Water surface\n   • CHANGES in real-time\n   • From ultrasonic sensor\n   • Updates automatically\n\n💧 **H** (Water Height)\n   • Actual water depth in well\n   • CALCULATED automatically\n   • h₁ minus h₂\n   • What you see on Dashboard\n\n**Real Example:**\nYour well setup:\n• Cable goes 50m deep (h₁ = 50)\n• Sensor reads 45m to water (h₂ = 45)\n• Water depth: 50 - 45 = **5 meters** ✅\n\nAs water rises:\n• h₂ becomes 40m\n• H = 50 - 40 = **10 meters** ✅\n\nAs water lowers:\n• h₂ becomes 48m  \n• H = 50 - 48 = **2 meters** (Low!) ⚠️\n\nIf h₂ ≥ h₁:\n• Math gives negative\n• System shows 0m (error)\n• Check your h₁ value!\n\nCrystal clear? 💎`;
    }

    // Password / Login / Security
    if (lower.match(/(password|login|forgot|reset|security|2fa|two factor)/)) {
      return `Let's secure your account! 🔐\n\n**Change Password:**\n1️⃣ Go to **Profile** → **Security tab**\n2️⃣ Enter current password\n3️⃣ Enter new password (min 6 chars)\n4️⃣ Confirm new password\n5️⃣ Click "Change Password"\n6️⃣ You'll be logged out - sign in again\n\n**Forgot Password:**\n• Go to Login page\n• Click "Forgot Password?" link\n• Enter your email\n• Check inbox for reset link\n• Link valid for 1 hour\n• Set new password\n\n**Enable Two-Factor Authentication:**\n1️⃣ Profile → Security tab\n2️⃣ Find "Two-Factor Authentication"\n3️⃣ Click "Enable 2FA"\n4️⃣ Follow setup wizard\n5️⃣ Scan QR code with authenticator app\n6️⃣ Enter verification code\n\n**Security Tips:**\n✓ Use strong, unique passwords\n✓ Enable 2FA for extra security\n✓ Don't share login credentials\n✓ Log out on shared devices\n✓ Check activity log regularly\n\nYour account, your fortress! 🏰`;
    }

    // Help / Support / Contact
    if (lower.match(/(help|support|contact|call|email|assistance|stuck)/)) {
      return `I'm here to help, and so is our team! 🤝\n\n**Get Support:**\n\n📧 **Email Support**\n   • support@waleki.com\n   • Response time: < 24 hours\n   • Include screenshots if possible\n   • Mention your node IDs\n\n📞 **Phone Support**\n   • +255 XXX XXX XXX\n   • Mon-Fri: 8 AM - 6 PM EAT\n   • Weekend: Emergency only\n   • Have account info ready\n\n💬 **Live Chat**\n   • Right here with me! (for quick questions)\n   • 24/7 availability\n   • Instant responses\n   • No waiting!\n\n📚 **Help Center**\n   • Click "Help" in navbar\n   • 30+ detailed articles\n   • Step-by-step guides\n   • Search by keyword\n\n**What I Can Help With:**\n✓ Adding/configuring nodes\n✓ Understanding readings\n✓ Troubleshooting issues\n✓ System navigation\n✓ Calculations & formulas\n✓ Settings & preferences\n✓ Quick how-tos\n\nWhat do you need help with? 😊`;
    }

    // Default / Unknown
    return `Hmm, I'm not quite sure about that one! 🤔\n\nBut I'm always learning! Here's what I'm really good at:\n\n**Popular Topics:**\n• 🔧 "How do I add a node?"\n• 💧 "Why does water show 0m?"\n• 🔔 "Enable notifications"\n• 📏 "Explain the water formula"\n• 🚨 "Sensor is offline"\n• ⚙️ "Change settings"\n• 💾 "Backup my configuration"\n• 📊 "View analytics"\n• 🔐 "Reset my password"\n\n**Or Just Chat:**\n• Ask how I'm doing\n• Say hello\n• Tell me what you need\n\nI'm here to help! What's on your mind? 😊`;
  };

  // Handle send message
  const handleSend = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      type: 'user',
      message: inputMessage,
      timestamp: new Date()
    };
    setMessages([...messages, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');

    // Show typing indicator
    setIsTyping(true);

    // Simulate realistic typing delay (longer for longer responses)
    const typingDelay = Math.min(800 + (currentInput.length * 20), 2000);
    
    setTimeout(() => {
      const botResponse = {
        type: 'bot',
        message: getBotResponse(currentInput),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, typingDelay);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get user avatar (profile photo or initials)
  const getUserAvatar = () => {
    if (currentUser?.photoURL) {
      return <img src={currentUser.photoURL} alt="You" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />;
    }
    const initials = currentUser?.displayName
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';
    return <span>{initials}</span>;
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes typing {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        .chatbot-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
        }

        /* Avatar Button */
        .chatbot-avatar {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          transition: all 0.3s ease;
          border: 4px solid white;
          color: white;
          animation: pulse 2s ease-in-out infinite;
        }

        .chatbot-avatar:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
        }

        .chatbot-avatar.open {
          animation: none;
        }

        /* Chat Window */
        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 400px;
          max-height: ${isMinimized ? '60px' : '600px'};
          background: white;
          border-radius: 16px;
          box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideUp 0.3s ease;
          transition: max-height 0.3s ease;
        }

        /* Header */
        .chat-header {
          padding: 20px;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .header-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
        }

        .header-text h3 {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 2px;
        }

        .header-text p {
          font-size: 12px;
          opacity: 0.9;
        }

        .header-actions {
          display: flex;
          gap: 8px;
        }

        .header-btn {
          width: 32px;
          height: 32px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: white;
          backdrop-filter: blur(10px);
        }

        .header-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        /* Messages */
        .chat-messages {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: ${isMinimized ? 'none' : 'flex'};
          flex-direction: column;
          gap: 16px;
          background: #FAFAFA;
          max-height: 440px;
        }

        .chat-messages::-webkit-scrollbar {
          width: 6px;
        }

        .chat-messages::-webkit-scrollbar-track {
          background: #F0F0F0;
        }

        .chat-messages::-webkit-scrollbar-thumb {
          background: #CCC;
          border-radius: 3px;
        }

        .message {
          display: flex;
          gap: 10px;
          animation: slideUp 0.2s ease;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 700;
        }

        .message-avatar.bot {
          background: #000;
          color: white;
        }

        .message-avatar.user {
          background: #E8E8E8;
          color: #000;
        }

        .message-content {
          max-width: 75%;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-line;
        }

        .message.bot .message-content {
          background: white;
          color: #000;
          border: 1px solid #E8E8E8;
        }

        .message.user .message-content {
          background: #000;
          color: white;
        }

        .message-content strong {
          font-weight: 700;
        }

        /* Typing Indicator */
        .typing-indicator {
          display: flex;
          gap: 10px;
          padding: 12px 16px;
          background: white;
          border-radius: 12px;
          width: fit-content;
          border: 1px solid #E8E8E8;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #999;
          border-radius: 50%;
          animation: typing 1.4s ease-in-out infinite;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        /* Input */
        .chat-input-wrapper {
          padding: 16px;
          background: white;
          border-top: 1px solid #E8E8E8;
          display: ${isMinimized ? 'none' : 'flex'};
          gap: 12px;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid #E8E8E8;
          border-radius: 12px;
          font-size: 14px;
          outline: none;
          transition: all 0.2s ease;
          font-family: inherit;
          resize: none;
          max-height: 100px;
        }

        .chat-input:focus {
          border-color: #000;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          background: #000;
          color: white;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .send-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .chat-window {
            width: calc(100vw - 48px);
            max-width: 400px;
          }

          .chatbot-container {
            right: 16px;
            bottom: 16px;
          }
        }
      `}</style>

      <div className="chatbot-container">
        {/* Chat Window */}
        {isOpen && (
          <div className="chat-window">
            {/* Header */}
            <div className="chat-header">
              <div className="header-info">
<div className="header-avatar">
  <img src="/assets/chatbot.png" alt="Bot" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
</div>
                <div className="header-text">
                  <h3>Waleki Assistant</h3>
                  <p>Always here to help</p>
                </div>
              </div>
              <div className="header-actions">
                <button
                  className="header-btn"
                  onClick={() => setIsMinimized(!isMinimized)}
                  title={isMinimized ? 'Maximize' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button
                  className="header-btn"
                  onClick={() => setIsOpen(false)}
                  title="Close"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  <div className={`message-avatar ${msg.type}`}>
                    {msg.type === 'bot' ? (
    <img src="/assets/chatbot.png" alt="Bot" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
  ) : (
    getUserAvatar()
  )}
                  </div>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}

              {/* Typing Indicator */}
                {isTyping && (
  <div className="message bot">
    <div className="message-avatar bot">
      <img src="/assets/chatbot.png" alt="Bot" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    </div>
    <div className="typing-indicator">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="chat-input-wrapper">
              <textarea
                ref={inputRef}
                className="chat-input"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                rows="1"
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!inputMessage.trim()}
                title="Send message"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Avatar Button */}
<div
  className={`chatbot-avatar ${isOpen ? 'open' : ''}`}
  onClick={() => setIsOpen(!isOpen)}
  title="Chat with Waleki Assistant"
>
  {isOpen ? <X size={28} /> : (
    <img src="/assets/chatbot.png" alt="Bot" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
  )}
</div>
      </div>
    </>
  );
};

export default Chatbot;