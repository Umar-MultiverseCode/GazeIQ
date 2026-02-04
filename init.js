document.getElementById('grantBtn').addEventListener('click', async () => {
  const errorMsg = document.getElementById('errorMsg');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    errorMsg.style.color = '#4caf50';
    errorMsg.innerText = 'Camera access granted! You can close this tab and use the GazeIQ popup now.';
    document.getElementById('grantBtn').style.display = 'none';
  } catch (err) {
    errorMsg.style.color = '#ff6b6b';
    errorMsg.innerText = 'Error: ' + err.message + '\n\nPlease ensure your webcam is connected and you did not block access.';
  }
});
