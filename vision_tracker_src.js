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
    // Battery optimization - throttle if battery is low
    if (navigator.getBattery) {
      const battery = await navigator.getBattery();
      if (battery.level < 0.2 && !battery.charging) {
        emitDebug("Battery critical. Throttling neural engine.");
        setTimeout(detectFaces, 1000); 
        return;
      }
    }

    const returnTensors = false;
    let predictions = await model.estimateFaces(video, returnTensors);

    let isLooking = false;

    if (predictions.length > 0) {
      const face = predictions[0];
      const prob = face.probability[0];
      
      // Balanced probability threshold to prevent false-negatives in bad lighting
      if (prob > 0.65) {
        // Enforce attention bounds using facial landmarks
        // landmarks: 0=rightEye, 1=leftEye, 2=nose, 3=mouth
        const rightEye = face.landmarks[0];
        const leftEye = face.landmarks[1];
        const nose = face.landmarks[2];

        // Check if head is turned significantly (nose outside of eyes horizontal bounds)
        // Adjust for mirrored video feed with a highly relaxed margin of 50px
        const minX = Math.min(rightEye[0], leftEye[0]) - 50;
        const maxX = Math.max(rightEye[0], leftEye[0]) + 50;
        
        const isLookingForward = (nose[0] >= minX && nose[0] <= maxX);
        
        // Ensure face is upright but extremely generous (laptop cameras point UP)
        const avgEyeY = (rightEye[1] + leftEye[1]) / 2;
        const lookingAtScreen = (nose[1] > avgEyeY - 20);

        if (isLookingForward && lookingAtScreen) {
          isLooking = true;
        } else {
          emitDebug("Face out of bounds (Looking away or down).");
        }
      }
    }

    if (isLooking) {
      lastFaceDetectedTime = Date.now();
      emitDebug("Face accurately tracking screen.");
      if (currentState === 'absent') {
        currentState = 'present';
        chrome.runtime.sendMessage({ type: 'FACE_STATUS', status: 'present' }).catch(()=>{});
      }
    } else {
      let timeSince = Date.now() - lastFaceDetectedTime;
      emitDebug("Attention lost. Missing for: " + Math.round(timeSince/1000) + "s");
      
      // Fast pause for strict tracking
      if (timeSince >= 300) {
        if (currentState === 'present') {
          currentState = 'absent';
          chrome.runtime.sendMessage({ type: 'FACE_STATUS', status: 'absent' }).catch(()=>{});
        }
      }
    }
  } catch (e) {
    emitDebug("Prediction error: " + e.message);
  }

  setTimeout(detectFaces, 250); 
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
