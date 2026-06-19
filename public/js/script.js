/* ══════════════════════════════════════════
   TrackSphere — Tracker Script
   Socket.io v4 · Leaflet · Dark Map · Custom Markers
══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Socket.io Connection ─── */
  const socket = io();

  /* ─── Toast Helper ─── */
  const toast    = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastDot = document.getElementById('toastDot');
  let toastTimer;

  function showToast(msg, type = 'cyan') {
    clearTimeout(toastTimer);
    toastMsg.textContent = msg;
    toastDot.className   = `toast-dot toast-${type}`;
    toast.classList.add('show');
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* ─── Map Init ─── */
  const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
  }).setView([20, 0], 3);

  // Dark CartoDB Basemap
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }
  ).addTo(map);

  /* ─── Custom Marker Factory ─── */
  function makeMarkerIcon(color = '#00f5ff') {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="7" fill="${color}" opacity="0.9"/>
        <circle cx="18" cy="18" r="7" fill="none" stroke="white" stroke-width="1.5"/>
        <circle cx="18" cy="18" r="13" fill="none" stroke="${color}" stroke-width="1.2" opacity="0.5">
          <animate attributeName="r" from="7" to="18" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
        </circle>
      </svg>`;

    return L.divIcon({
      className: '',
      html: svg,
      iconSize:   [36, 36],
      iconAnchor: [18, 18],
      popupAnchor:[0, -22],
    });
  }

  /* ─── Marker Colors for different users ─── */
  const COLORS = ['#00f5ff','#7c3aed','#f000b8','#00ff88','#ff9500','#ff4466'];
  const userColors = {};
  let colorIdx = 0;

  function getUserColor(id) {
    if (!userColors[id]) {
      userColors[id] = COLORS[colorIdx % COLORS.length];
      colorIdx++;
    }
    return userColors[id];
  }

  /* ─── Markers Store ─── */
  const markers = {};

  /* ─── Geolocation: stream our own position ─── */
  if (navigator.geolocation) {
    showToast('Acquiring your location…', 'cyan');
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit('send-location', { latitude, longitude });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let msg = 'Location access denied.';
        if (error.code === 1) msg = 'Location permission denied. Please enable it in your browser.';
        if (error.code === 2) msg = 'Location unavailable. Check your GPS.';
        if (error.code === 3) msg = 'Location timed out. Retrying…';
        showToast(msg, 'red');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );
  } else {
    showToast('Geolocation not supported by this browser.', 'red');
  }

  /* ─── Socket Events ─── */
  socket.on('connect', () => {
    showToast('Connected to TrackSphere', 'green');
  });

  socket.on('disconnect', () => {
    showToast('Disconnected. Reconnecting…', 'red');
  });

  // Receive location updates
  socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    const color = getUserColor(id);

    if (markers[id]) {
      // Smooth move existing marker
      markers[id].setLatLng([latitude, longitude]);
    } else {
      // Create new marker
      markers[id] = L.marker([latitude, longitude], {
        icon: makeMarkerIcon(color),
      })
        .bindPopup(
          `<div style="font-family:'Outfit',sans-serif; min-width:140px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <div style="width:10px;height:10px;border-radius:50%;background:${color};box-shadow:0 0 6px ${color};flex-shrink:0;"></div>
              <strong style="color:#e2e8f0; font-size:0.9rem;">User ${id.slice(0, 6)}</strong>
            </div>
            <div style="color:#94a3b8; font-size:0.78rem; font-family:'JetBrains Mono',monospace;">
              ${latitude.toFixed(5)}, ${longitude.toFixed(5)}
            </div>
          </div>`
        )
        .addTo(map);

      // Only pan to first location or if it's our own socket
      if (id === socket.id || Object.keys(markers).length === 1) {
        map.setView([latitude, longitude], 14, { animate: true, duration: 1.2 });
        showToast('📍 Your location pinned on the map', 'green');
      }
    }
  });

  // Handle user disconnecting
  socket.on('user-disconnected', (id) => {
    if (markers[id]) {
      map.removeLayer(markers[id]);
      delete markers[id];
      delete userColors[id];
      showToast('A user has left the session', 'red');
    }
  });

  // Update user count badge
  socket.on('user-count', (count) => {
    const el = document.getElementById('userCountNum');
    if (el) el.textContent = count;
  });

})();
