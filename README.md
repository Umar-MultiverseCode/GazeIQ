# ⚡ GazeIQ: Neural-Powered Video Playback Engine

**GazeIQ** is a next-generation, privacy-first browser extension that leverages local Machine Learning to intelligently pause and resume your video streams based on your visual attention. 

It ensures you never miss a second of your favorite content while maintaining 100% on-device data processing.

---

## 🚀 Why I Built GazeIQ

I built this project to solve a personal frustration: missing crucial moments in movies when I looked away or got distracted. Instead of relying on cloud APIs that compromise privacy, I engineered a solution that runs **entirely inside the browser's local sandbox** using WebGL acceleration and TensorFlow.js.

## ✨ Core Features

- **🧠 Edge AI Processing**: Uses `TensorFlow.js` and a lightweight `BlazeFace` model to detect facial presence with near-zero latency, directly in the browser.
- **⚡ Advanced Playback Sync**: Instantly halts DOM video elements and seamlessly resumes playback the millisecond your gaze returns.
- **🛡️ Zero-Knowledge Architecture**: No cloud servers, no API calls, no tracking. Your webcam stream never leaves your local GPU memory.
- **📺 Universal Compatibility**: Injected scripts automatically bind to HTML5 video players on platforms like **YouTube**, **Netflix**, **Prime Video**, and **Hotstar**.
- **📊 Neural Dashboard**: Tracks your engagement metrics locally and visualizes your viewing session intervals.

## 🛠️ Technical Architecture

- **Core Extensions API**: Implements Manifest V3 Service Workers and Offscreen Documents to bypass modern extension limitations.
- **Machine Learning**: `TensorFlow.js` with WebGL backend for hardware-accelerated face detection at ~30 FPS.
- **UI/UX System**: Glassmorphic UI with CSS variables, built entirely in Vanilla JS without heavy framework overhead.
- **Build Pipeline**: Optimized with `esbuild` for ultra-fast bundling.

## 💻 Installation (Developer Mode)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Umar-MultiverseCode/GazeIQ.git
   cd GazeIQ
   ```

2. **Install & Build Engine:**
   ```bash
   npm install
   node bundle.js
   ```

3. **Deploy to Browser:**
   - Go to `chrome://extensions/`
   - Enable **Developer mode**.
   - Click **Load unpacked** and select the `GazeIQ` directory.
   - Click the GazeIQ extension icon, initialize optics, and experience neural playback control!

## 🤝 Open for Feedback

I'm constantly looking to improve this architecture. If you have thoughts on optimizing TensorFlow.js in service workers or improving the UI, feel free to reach out or drop an issue!

---

*Engineered with 💜 for seamless streaming.*
