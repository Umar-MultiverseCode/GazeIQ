import * as tf from '@tensorflow/tfjs';
import * as blazeface from '@tensorflow-models/blazeface';

const video = document.getElementById('webcam');
let model;
let lastFaceDetectedTime = Date.now();
let tracking = false;
let currentState = 'present'; 

function emitDebug(msg) {
  console.log(msg);
  chrome.runtime.sendMessage({ type: 'DEBUG_LOG', msg }).catch(()=>{});
}

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 320, height: 240 },
    audio: false
  });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function detectFaces() {
  if (!tracking) return;
  
  try {
    const returnTensors = false;
    let predictions = await model.estimateFaces(video, returnTensors);

    let isLooking = false;

    if (predictions.length > 0) {
      const face = predictions[0];
      // Prevent crash regardless of TF.js version returning numeric array or float
      const prob = Array.isArray(face.probability) ? face.probability[0] : face.probability;
      
      // Calculate face bounding box dimensions
      const tl = face.topLeft;
      const br = face.bottomRight;
      
      let faceWidth = 100; // default safe value
      if (tl && br && Array.isArray(tl) && Array.isArray(br)) {
        faceWidth = br[0] - tl[0];
      }

      // Must be high probability (>0.85) AND large enough on screen (>40px)
      // This strictly prevents shadows/backgrounds from flickering pause/play
      if (prob > 0.85 && faceWidth > 40) {
        isLooking = true;
      }
    }

    if (isLooking) {
      lastFaceDetectedTime = Date.now();
      emitDebug("Face detected.");
      if (currentState === 'absent') {
        currentState = 'present';
        chrome.runtime.sendMessage({ type: 'FACE_STATUS', status: 'present' }).catch(()=>{});
      }
    } else {
      let timeSince = Date.now() - lastFaceDetectedTime;
      emitDebug("No face. Missing for: " + Math.round(timeSince/1000) + "s");
      
      if (timeSince >= 500) {
        if (currentState === 'present') {
          currentState = 'absent';
          chrome.runtime.sendMessage({ type: 'FACE_STATUS', status: 'absent' }).catch(()=>{});
        }
      }
    }
  } catch (e) {
    emitDebug("Prediction error: " + e.message);
  }

  setTimeout(detectFaces, 200); 
}

async function main() {
  try {
    emitDebug("Starting TF.js...");
    await tf.ready();
    emitDebug("TF.js ready. Loading face model...");
    // Explicitly set the backend just in case
    tf.setBackend('webgl').catch(() => tf.setBackend('cpu'));
    
    model = await blazeface.load();
    emitDebug("Model loaded. Waiting for camera...");
    
    await setupCamera();
    emitDebug("Camera active. Processing video stream!");
    
    video.play();
    tracking = true;
    lastFaceDetectedTime = Date.now(); 
    detectFaces();
  } catch (err) {
    emitDebug("Critical setup error: " + err.message);
  }
}

main();
