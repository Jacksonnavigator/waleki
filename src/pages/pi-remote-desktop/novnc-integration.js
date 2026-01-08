// novnc-integration.js
// Handles fullscreen for iframe

document.addEventListener('DOMContentLoaded', function() {
  const btn = document.getElementById('fullscreen-btn');
  const iframe = document.getElementById('vnc-iframe');
  btn.onclick = function() {
    if (iframe.requestFullscreen) {
      iframe.requestFullscreen();
    } else if (iframe.webkitRequestFullscreen) {
      iframe.webkitRequestFullscreen();
    } else if (iframe.msRequestFullscreen) {
      iframe.msRequestFullscreen();
    }
  };
});
