# 🌍 TrackSphere — Real-Time Location Tracker

A stunning real-time location tracking platform built with **Node.js**, **Express**, **Socket.io**, and **Leaflet.js**.

## ✨ Features

- 🗺️ **Live Multi-User Tracking** — See all connected users as animated markers on a dark map
- ⚡ **Sub-50ms Latency** — WebSocket-powered via Socket.io v4
- 🌍 **Global Coverage** — CartoDB dark tile layer for a premium map experience
- 🔒 **Zero Storage** — Location data is never persisted; streams only between live clients
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile
- 🚀 **Zero Setup** — No sign-up, no config; open and go

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start in development mode (auto-restart)
npm run dev

# 3. Open your browser
open http://localhost:3000
```

## 📁 Project Structure

```
RealTime Tracker/
├── app.js              # Express + Socket.io server
├── views/
│   ├── landing.ejs     # Landing page (/)
│   └── index.ejs       # Live tracker (/tracker)
├── public/
│   ├── css/
│   │   ├── landing.css # Landing page styles
│   │   └── style.css   # Tracker page styles
│   └── js/
│       ├── landing.js  # Landing animations (particles, counters, globe)
│       └── script.js   # Tracker logic (Socket.io, Leaflet, markers)
└── package.json
```

## 🛣️ Routes

| Route      | Page              |
|------------|-------------------|
| `/`        | Landing Page      |
| `/tracker` | Live Tracker Map  |

## 🛠️ Tech Stack

| Tech         | Version  | Purpose                      |
|--------------|----------|------------------------------|
| Node.js      | ≥18.x    | Server runtime               |
| Express      | ^5.2.1   | HTTP server & routing        |
| Socket.io    | ^4.8.3   | Real-time WebSocket events   |
| EJS          | ^6.0.1   | Server-side HTML templating  |
| Leaflet.js   | 1.9.4    | Interactive map rendering    |
| CartoDB      | —        | Dark map tile layer          |

## 📜 License

ISC
