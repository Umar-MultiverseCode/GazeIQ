let pausedByGazeIQ = false;
let sessionStartTime = null;

function getPlatform() {
  const host = window.location.hostname;
  if (host.includes("youtube")) return "YouTube";
  if (host.includes("netflix")) return "Netflix";
  if (host.includes("amazon") || host.includes("primevideo")) return "Prime Video";
  if (host.includes("hotstar")) return "Hotstar";
  return host;
}

function cleanTitle(title) {
  return title.replace(/ - YouTube$/, '').replace(/ - Netflix$/, '');
}

function recordSession() {
  if (sessionStartTime) {
    const elapsed = Date.now() - sessionStartTime;
    if (elapsed > 1000) {
      chrome.runtime.sendMessage({
        type: 'RECORD_WATCH_TIME',
        platform: getPlatform(),
        title: cleanTitle(document.title),
        duration: elapsed
      }).catch(e => {
        console.warn("[GazeIQ] Failed to record watch time:", e);
      });
    }
    sessionStartTime = null;
  }
}

function attachVideoListeners(vid) {
  if (!vid || vid.dataset.gazeiqBound) return;
  vid.dataset.gazeiqBound = "true";
  
  vid.addEventListener('play', () => {
    pausedByGazeIQ = false;
    if (!sessionStartTime) sessionStartTime = Date.now();
  });
  
  vid.addEventListener('pause', () => {
    recordSession();
  });
  
  // If the video is already playing when we attach
  if (!vid.paused && !sessionStartTime) {
    sessionStartTime = Date.now();
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateOverlay") {
    const overlay = document.getElementById('gazeiq-demo-overlay');
    if (message.visible) {
      if (!overlay) createOverlay();
      else overlay.style.display = 'block';
    } else if (overlay) {
      overlay.style.display = 'none';
    }
  }

  const video = document.querySelector('video');
  const statusLight = document.getElementById('gazeiq-status-light');
  const statusText = document.getElementById('gazeiq-status-text');

  if (message.action === "pause") {
    if (statusLight) {
      statusLight.style.background = '#8a2be2';
      statusLight.style.boxShadow = '0 0 20px #8a2be2, 0 0 40px #8a2be2';
      statusText.innerText = 'GAZE LOST: PAUSED';
      statusText.style.color = '#8a2be2';
    }
    if (video && !video.paused) {
      console.log("[GazeIQ] Face not detected. Pausing video.");
      pausedByGazeIQ = true;
      video.pause();
    }
  } else if (message.action === "play") {
    if (statusLight) {
      statusLight.style.background = '#00f2fe';
      statusLight.style.boxShadow = '0 0 20px #00f2fe';
      statusText.innerText = 'GAZE TRACKING: PLAYING';
      statusText.style.color = '#00f2fe';
    }
    if (video && video.paused && pausedByGazeIQ) {
      console.log("[GazeIQ] Face detected. Resuming video.");
      pausedByGazeIQ = false;
      video.play().catch(e => console.error("[GazeIQ] Auto-play prevented:", e));
    }
  }
});

function createOverlay() {
  const container = document.createElement('div');
  container.id = 'gazeiq-demo-overlay';
  container.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 320px;
    background: rgba(15, 19, 26, 0.7);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    padding: 16px;
    z-index: 999999;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
    font-family: 'Outfit', system-ui, -apple-system, sans-serif;
    color: white;
    cursor: move;
    transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 16px; background: rgba(255,255,255,0.03); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
      <div id="gazeiq-status-light" style="width: 10px; height: 10px; border-radius: 50%; background: #00f2fe; box-shadow: 0 0 20px #00f2fe; transition: all 0.3s ease;"></div>
      <span id="gazeiq-status-text" style="font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #00f2fe; transition: all 0.3s ease;">Gaze Tracking: Playing</span>
    </div>
    <div style="width: 100%; height: 180px; background: #000; border-radius: 16px; overflow: hidden; position: relative; box-shadow: inset 0 0 20px rgba(0,0,0,1);">
      <video id="gazeiq-demo-video" autoplay muted playsinline style="width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); opacity: 0.8;"></video>
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; background: linear-gradient(180deg, rgba(0,242,254,0.05) 0%, rgba(138,43,226,0.05) 100%);"></div>
      <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 60%; height: 60%; border: 1px dashed rgba(255,255,255,0.2); border-radius: 50%; pointer-events: none;"></div>
    </div>
  `;

  document.body.appendChild(container);

  // Request camera for the overlay
  navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
    .then(stream => {
      const v = document.getElementById('gazeiq-demo-video');
      if (v) v.srcObject = stream;
    })
    .catch(err => {
      console.warn("[GazeIQ] Overlay camera failed:", err);
    });

  // Simple drag logic
  let isDragging = false;
  let offset = { x: 0, y: 0 };

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    offset = {
      x: container.offsetLeft - e.clientX,
      y: container.offsetTop - e.clientY
    };
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    container.style.left = (e.clientX + offset.x) + 'px';
    container.style.top = (e.clientY + offset.y) + 'px';
    container.style.bottom = 'auto';
    container.style.right = 'auto';
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
}

// Initial check
chrome.storage.local.get(['isOverlayVisible'], (res) => {
  if (res.isOverlayVisible) createOverlay();
});

const videoElement = document.querySelector('video');
if (videoElement) {
  attachVideoListeners(videoElement);
}

// Some streaming sites are SPAs, the video element might change when navigating.
const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.addedNodes.length) {
      const vid = document.querySelector('video');
      if (vid) attachVideoListeners(vid);
    }
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Record if user navigates away
window.addEventListener('beforeunload', recordSession);
