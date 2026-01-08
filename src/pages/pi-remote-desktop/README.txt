# Pi Remote Desktop Integration (noVNC)

## How to Update Pi IP

1. Edit `PiRemoteDesktop.jsx` in this folder.
2. Change the line:
   const PI_VNC_URL = 'http://<PI-IP>:6080/vnc.html';
   Replace <PI-IP> with your Raspberry Pi's LAN or Tailscale IP.
   Example: http://192.168.1.42:6080/vnc.html
3. Save and redeploy/rebuild your dashboard if needed.

## Security
- Only logged-in users can access this page (see `PiRemoteDesktop.jsx`).
- To restrict to admins only, add role logic in `PiRemoteDesktop.jsx`.
- VNC password is always required before connecting (handled by x11vnc).

## Pi Setup (already done)
- x11vnc running on port 5901 with password
- noVNC running on port 6080, mapping to 5901
- Systemd services: x11vnc.service, novnc.service

## Test Steps
1. Login to dashboard as user.
2. Open "Pi Remote Desktop" from dashboard menu.
3. Enter VNC password in the noVNC prompt.
4. Test fullscreen, mouse, keyboard.
5. If Pi IP changes, update `PI_VNC_URL` as above.

## For future editing
- UI: edit `index.html`, `styles.css`, `novnc-integration.js`.
- Auth: edit `PiRemoteDesktop.jsx` for access control.
- noVNC docs: https://github.com/novnc/noVNC
