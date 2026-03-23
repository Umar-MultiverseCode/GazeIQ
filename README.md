<div align="center">

# ⚡ GazeIQ 
**The Ultimate Privacy-First Cinematic Synapse Plugin**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/Umar-MultiverseCode/GazeIQ)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)](https://github.com/Umar-MultiverseCode/GazeIQ/releases)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-WebGL-FF6F00?style=for-the-badge&logo=tensorflow)](https://js.tensorflow.org/)
[![License](https://img.shields.io/badge/license-MIT-purple.svg?style=for-the-badge)](LICENSE)

*An advanced browser extension engineering local Machine Learning to pause and resume video streams entirely via neural attention metrics.*

</div>

---

## 📖 Table of Contents
- [Executive Overview](#-executive-overview)
- [Core Architecture & ML Infrastructure](#-core-architecture--ml-infrastructure)
- [Real-Time Tracking Logic](#-real-time-tracking-logic)
- [Universal DOM Integrations](#-universal-dom-integrations)
- [Performance & Hardware Starvation Telemetry](#-performance--hardware-starvation-telemetry)
- [Local Installation Protocol](#-local-installation-protocol)
- [Developer Contribution Standards](#-developer-contribution-standards)
- [License](#-license)

---

## 🚀 Executive Overview

**GazeIQ** represents a paradigm shift in autonomous hardware-accelerated media control. It was built out of pure necessity to bypass cloud-dependent surveillance APIs while solving the frequent issue of missing key cinematic events when distracted.

By operating **100% inside a WebGL-bound sandboxed thread**, GazeIQ computes over 30 FPS facial recognition matrices locally, instantly halting internal DOM video execution the millisecond the user's focus drifts away.

## 🧠 Core Architecture & ML Infrastructure

Designed to break modern **Manifest V3** constraints, GazeIQ spins up unprivileged backgrounds utilizing Chrome's Offscreen Document framework. 

* **Neural Edge Engine**: Employs `TensorFlow.js` wrapped directly around the `BlazeFace` topology array.
* **Service Daemon Orchestration**: Acts as a state-machine mediating signals between the high-compute `tracker.js` and the lightweight injected `player_controller.js`.
* **Zero-Knowledge Privacy**: Webcam tensors never convert to BLOBs. Hardware pointers process memory iteratively and dispose immediately, maintaining a complete data sink without external I/O.

## 🔭 Real-Time Tracking Logic

Unlike simple presence detectors, GazeIQ invokes a robust **Facial Landmark Telemetry** sub-engine that extracts precise $X/Y$ axis positioning of the eyes and nose parameters. 
It uses geometric triangulation bounding rather than baseline probability scores:
1. **Z-Axis Proximity**: Rejects non-optimal probability arrays `< 0.85` strictly limiting false positives.
2. **Horizontal Bounds Analysis**: Mathematically maps the nose coordinate against the biocular constraints, determining if the user looks away (`Mundi piche ghumana`).
3. **Muzzle Depression Tracker**: Estimates the ratio of eye height relative to nasal constraints to accurately detect physical distraction states (`Mu niche karna`).

## 📺 Universal DOM Integrations

The internal `player_controller.js` membrane binds mutation observers globally to inject logic across multiple generic `<video>` properties, flawlessly supporting:
- `YouTube`
- `Netflix`
- `Prime Video`
- `Disney+ Hotstar`

Our observers dynamically respect edge states, decoding isolated environments such as **Picture-in-Picture (PiP)** race conditions and overlapping hidden tabs.

## 🔋 Performance & Hardware Starvation Telemetry

We deeply respect system limitations. The active neural processing hooks into native `navigator.getBattery()` endpoints:
- **Energy Starvation Throttle**: If battery resources fall below `20%` uncharged, dynamic telemetry immediately cuts frame-pacing to `1 FPS`, maintaining system survivability.
- **Chrome Idle Detection**: After 15 minutes of OS-level inactivity, the service daemon broadcasts a strict `Absent` state, ceasing intensive WebGL compute loads until movement is recognized.
- **Analytics Exporter**: Integrates a client-side serializing pipeline, generating encoded CSV distributions of chronological media consumption directly via the `stats.html` glassmorphic dashboard.

---

## 💻 Local Installation Protocol

Given the aggressive internal compute integrations, ensure you have the latest NodeJS runtimes configured before local ingestion.

1. **Pull the Repository:**
   ```bash
   git clone https://github.com/Umar-MultiverseCode/GazeIQ.git
   cd GazeIQ
   ```

2. **Initialize Environment & Bind Dependencies:**
   ```bash
   npm install
   ```

3. **Establish Compilation Matrix:**
   ```bash
   # Executes the overarching esbuild compiler scripts merging neural configurations
   node bundle.js
   ```

4. **Deploy Application to Chromium Daemon:**
   - Navigate Chromium properties to `chrome://extensions/`
   - Elevate platform capabilities via **Developer Mode**.
   - Select **Load unpacked** and authorize the root `GazeIQ` directory bounds.
   - Interact with the GazeIQ extension parameters locally, **Initialize Optics**, and enjoy.

---

## 🤝 Developer Contribution Standards

GazeIQ maintains highly deterministic CI/CD validation patterns. Future iterations will mandate complete type safety pipelines. 

Please refer to `CONTRIBUTING.md` before resolving pipeline anomalies or pull requests. Architectural discourse and optimization debates happen in the native Issue Tracker.

---

## 📄 License

GazeIQ is strictly available under the Open Source **[MIT](LICENSE)** standard bounds. 

*Engineered with ❄️ precision for absolute edge AI privacy.*
