document.addEventListener('DOMContentLoaded', () => {
  const datePicker = document.getElementById('datePicker');
  const refreshBtn = document.getElementById('refreshBtn');
  const statsContainer = document.getElementById('statsContainer');
  const detailsContainer = document.getElementById('detailsContainer');

  // Set today as default
  const today = new Date().toISOString().split('T')[0];
  datePicker.value = today;

  function pad(num) {
    return num.toString().padStart(2, '0');
  }

  function formatDuration(ms) {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  }

  function getPlatformClass(platform) {
    const p = platform.toLowerCase();
    if (p.includes('youtube')) return 'platform-youtube';
    if (p.includes('netflix')) return 'platform-netflix';
    if (p.includes('prime') || p.includes('amazon')) return 'platform-prime';
    if (p.includes('hotstar')) return 'platform-hotstar';
    return '';
  }

  function renderData(date) {
    chrome.storage.local.get(['watchHistory'], (res) => {
      const history = res.watchHistory || {};
      const dayData = history[date];

      if (!dayData || Object.keys(dayData).length === 0) {
        statsContainer.innerHTML = '';
        detailsContainer.innerHTML = '<div class="empty-state"><h3>No Activity Found</h3><p>You didn\\\'t watch any tracked videos on this date.</p></div>';
        return;
      }

      let totalWatchTime = 0;
      const platformTotals = {};
      const allVideos = [];

      for (const [platform, videos] of Object.entries(dayData)) {
        let pTotal = 0;
        for (const [title, duration] of Object.entries(videos)) {
          pTotal += duration;
          allVideos.push({ platform, title, duration });
        }
        platformTotals[platform] = pTotal;
        totalWatchTime += pTotal;
      }

      // Render Overview
      let statsHtml = `<div class="stat-card">
        <div class="stat-title">Total Watch Time</div>
        <div class="stat-value">${formatDuration(totalWatchTime)}</div>
      </div>`;

      for (const [platform, total] of Object.entries(platformTotals)) {
        statsHtml += `<div class="stat-card">
          <div class="stat-title">${platform}</div>
          <div class="stat-value">${formatDuration(total)}</div>
        </div>`;
      }
      statsContainer.innerHTML = statsHtml;

      // Sort videos by duration
      allVideos.sort((a, b) => b.duration - a.duration);

      // Render Details
      let detailsHtml = '';
      for (const video of allVideos) {
        detailsHtml += `
          <div class="detail-item">
            <div class="detail-info">
              <h3><span class="platform-badge ${getPlatformClass(video.platform)}">${video.platform}</span> ${video.title}</h3>
            </div>
            <div class="detail-time">${formatDuration(video.duration)}</div>
          </div>
        `;
      }
      detailsContainer.innerHTML = detailsHtml;
    });
  }

  renderData(datePicker.value);

  datePicker.addEventListener('change', () => {
    renderData(datePicker.value);
  });

  refreshBtn.addEventListener('click', () => {
    renderData(datePicker.value);
  });

  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      chrome.storage.local.get(['watchHistory'], (res) => {
        const history = res.watchHistory || {};
        let csvContent = "data:text/csv;charset=utf-8,Date,Platform,Title,DurationSeconds\n";
        
        Object.keys(history).forEach(date => {
          Object.keys(history[date]).forEach(platform => {
            Object.keys(history[date][platform]).forEach(title => {
              const duration = Math.round(history[date][platform][title] / 1000);
              csvContent += `"${date}","${platform}","${title.replace(/"/g, '""')}","${duration}"\n`;
            });
          });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `GazeIQ_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    });
  }
});
