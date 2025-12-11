# Remote Desktop (noVNC) Integration

## How to Update WebSocket URL

1. Edit `connect.js` in this folder.
2. Change the line:
   const wsUrl = 'ws://<YOUR-PI-IP>:8081';
   Replace <YOUR-PI-IP> with your Raspberry Pi's LAN or Tailscale IP.
   Example: ws://192.168.1.42:8081 or ws://100.x.x.x:8081
3. Save and redeploy/rebuild your dashboard if needed.

## Security
- Only logged-in users can access this page (see `RemoteDesktop.jsx`).
- To restrict to admins only, add role logic in `RemoteDesktop.jsx`.
- VNC password is always required before connecting.

## Pi Setup
- Place `start-vnc-web.sh` in `/home/pi/` on your Pi.
- Make it executable: `chmod +x /home/pi/start-vnc-web.sh`
- Place `vnc-websockify.service` in `/etc/systemd/system/`.
- Enable and start on boot:
  sudo systemctl daemon-reload
  sudo systemctl enable vnc-websockify
  sudo systemctl start vnc-websockify

## Test Steps
1. Login to dashboard as admin.
2. Open "Open Pi Desktop (VNC)" from dashboard menu.
3. Enter VNC password and connect.
4. Test fullscreen, mouse, keyboard.
5. If Pi IP changes, update `wsUrl` as above.

## For future editing
- UI: edit `index.html`, `style.css`, `connect.js`.
- Auth: edit `RemoteDesktop.jsx` for access control.
- noVNC docs: https://github.com/novnc/noVNC
