document.addEventListener('DOMContentLoaded', async () => {
  const cameraBtn = document.getElementById('cameraBtn');
  const toggleBtn = document.getElementById('toggleBtn');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const statusText = document.getElementById('statusText');
  const debugText = document.getElementById('debugText');

  // Continually update debug text
  setInterval(() => {
    chrome.storage.local.get(['lastLog'], (res) => {
      if (res.lastLog) {
        debugText.innerText = '> ' + res.lastLog;
      }
    });
  }, 500);

  async function checkPermission() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasVideo = devices.some(device => device.kind === 'videoinput');
      if (!hasVideo) return false;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) { return false; }
  }

  const hasPerm = await checkPermission();
  
  if (hasPerm) {
    cameraBtn.style.display = 'none';
    toggleBtn.disabled = false;
    statusText.innerText = 'Ready to start.';
  } else {
    cameraBtn.innerText = 'Setup Camera Access';
    statusText.innerText = 'Camera access required.';
  }

  chrome.storage.local.get(['isTracking'], (result) => {
    if (result.isTracking && hasPerm) {
      toggleBtn.innerText = 'Stop GazeIQ';
      statusText.innerText = 'GazeIQ is active.';
    } else if (hasPerm) {
      toggleBtn.innerText = 'Start GazeIQ';
    }
  });

  cameraBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('init.html') });
  });

  if (dashboardBtn) {
    dashboardBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('stats.html') });
    });
  }

  const showOverlay = document.getElementById('showOverlay');
  
  chrome.storage.local.get(['isOverlayVisible'], (res) => {
    showOverlay.checked = res.isOverlayVisible || false;
  });

  showOverlay.addEventListener('change', () => {
    const visible = showOverlay.checked;
    chrome.storage.local.set({ isOverlayVisible: visible });
    chrome.runtime.sendMessage({ type: 'UPDATE_OVERLAY', visible });
  });

  toggleBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isTracking'], (result) => {
      const isTracking = result.isTracking || false;
      if (isTracking) {
        chrome.runtime.sendMessage({ type: 'STOP_TRACKING' }, (response) => {
          chrome.storage.local.set({ isTracking: false });
          toggleBtn.innerText = 'Start GazeIQ';
          statusText.innerText = 'Ready to start.';
        });
      } else {
        chrome.storage.local.set({ lastLog: 'Initializing...' });
        chrome.runtime.sendMessage({ type: 'START_TRACKING' }, (response) => {
          chrome.storage.local.set({ isTracking: true });
          toggleBtn.innerText = 'Stop GazeIQ';
          statusText.innerText = 'Starting GazeIQ tracker...';
        });
      }
    });
  });
});
