let offscreenDocumentReady = false;

async function setupOffscreenDocument(path) {
  if (await chrome.offscreen.hasDocument()) {
    console.log("Offscreen doc already exists.");
    return;
  }
  console.log("Creating offscreen document...");
  await chrome.offscreen.createDocument({
    url: path,
    reasons: ['USER_MEDIA'],
    justification: 'Running face tracking in background to pause video'
  });
  console.log("Offscreen document created.");
  offscreenDocumentReady = true;
}

// System Idle Detection
chrome.idle.setDetectionInterval(900); // 15 minutes of input inactivity
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState !== 'active') {
    broadcastFaceStatus('absent'); // Assume absent to save power/video
  }
});

function broadcastFaceStatus(status) {
  const urlPatterns = [
    "*://*.youtube.com/*",
    "*://*.netflix.com/*",
    "*://*.primevideo.com/*",
    "*://*.amazon.com/*",
    "*://*.amazon.in/*",
    "*://*.amazon.co.uk/*",
    "*://*.hotstar.com/*"
  ];
  chrome.tabs.query({ url: urlPatterns }, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        action: status === "absent" ? "pause" : "play"
      }).catch(err => {});
    });
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TRACKING') {
    setupOffscreenDocument('headless/tracker.html').then(() => {
      chrome.runtime.sendMessage({ type: 'TRACKING_STARTED' }).catch(() => {});
      sendResponse({ status: "started" });
    });
    return true; 
  }
  if (message.type === 'STOP_TRACKING') {
    chrome.offscreen.closeDocument(() => {
      offscreenDocumentReady = false;
      chrome.runtime.sendMessage({ type: 'TRACKING_STOPPED' });
      sendResponse({ status: "stopped" });
    });
    return true;
  }
  
  if (message.type === 'DEBUG_LOG') {
    chrome.storage.local.set({ lastLog: message.msg });
  }

  if (message.type === 'FACE_STATUS') {
    console.log("Face status:", message.status);
    broadcastFaceStatus(message.status);
  }

  if (message.type === 'RECORD_WATCH_TIME') {
    const today = new Date().toISOString().split('T')[0]; // simple local date
    chrome.storage.local.get(['watchHistory'], (res) => {
      let history = res.watchHistory || {};
      if (!history[today]) history[today] = {};
      if (!history[today][message.platform]) history[today][message.platform] = {};
      
      const currentVal = history[today][message.platform][message.title] || 0;
      history[today][message.platform][message.title] = currentVal + message.duration;
      
      chrome.storage.local.set({ watchHistory: history });
    });
  }
  
  if (message.type === 'UPDATE_OVERLAY') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { action: "updateOverlay", visible: message.visible }).catch(() => {});
      });
    });
  }
});
