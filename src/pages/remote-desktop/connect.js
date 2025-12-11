// connect.js
// noVNC connection logic for Raspberry Pi dashboard
// Edit the wsUrl as needed for your Pi's network

let rfb = null;
const wsUrl = 'ws://100.94.99.122:8081'; // <-- Update this as needed

const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const passwordInput = document.getElementById('vnc-password');
const errorDiv = document.getElementById('auth-error');
const container = document.getElementById('noVNC_container');
const screen = document.getElementById('noVNC_screen');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const disconnectBtn = document.getElementById('disconnect-btn');

function showError(msg) {
const wsUrl = 'ws://100.94.99.122:8081'; // <-- Update this as needed

// --- IMPORTANT ---
// 1. Update wsUrl below to match your Pi's LAN or Tailscale IP if it changes.
//    Example: ws://192.168.1.42:8081 or ws://100.x.x.x:8081
// 2. This page is protected by dashboard admin login (see RemoteDesktop.jsx)
// 3. Only logged-in users can access; add role checks in RemoteDesktop.jsx if needed.
// 4. For security, VNC password is required before connecting.
// 5. To change fullscreen or UI, edit this file and style.css.
}

function connectVNC(password) {
  try {
    rfb = new window.RFB(screen, wsUrl, {
      credentials: { password }
    });
    rfb.addEventListener('connect', () => {
      authModal.style.display = 'none';
      container.style.display = 'block';
      screen.focus();
    });
    rfb.addEventListener('disconnect', () => {
      showError('Disconnected from VNC server.');
      container.style.display = 'none';
      authModal.style.display = 'block';
    });
    rfb.addEventListener('securityfailure', (e) => {
      showError('Authentication failed.');
    });
    rfb.scaleViewport = true;
    rfb.resizeSession = true;
  } catch (e) {
    showError('Connection error: ' + e.message);
  }
}

authBtn.onclick = () => {
  const password = passwordInput.value;
  if (!password) {
    showError('Password required.');
    return;
  }
  showError('');
  connectVNC(password);
};

fullscreenBtn.onclick = () => {
  if (screen.requestFullscreen) {
    screen.requestFullscreen();
  } else if (screen.webkitRequestFullscreen) {
    screen.webkitRequestFullscreen();
  }
};

disconnectBtn.onclick = () => {
  if (rfb) rfb.disconnect();
};

// Optionally, auto-focus password input
passwordInput.focus();

// TODO: Add admin-only access logic in dashboard routing
// TODO: Update wsUrl if Pi IP changes
