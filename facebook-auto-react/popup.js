document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings
  browser.storage.local.get(['isRunning', 'reactionType']).then((result) => {
    if (result.isRunning) {
      statusDiv.textContent = 'Status: Running';
      statusDiv.className = 'running';
    } else {
      statusDiv.textContent = 'Status: Stopped';
      statusDiv.className = 'stopped';
    }
  });

  startBtn.addEventListener('click', function() {
    const selectedReaction = 'like';
    
    browser.storage.local.set({
      isRunning: true,
      reactionType: selectedReaction
    }).then(() => {
      statusDiv.textContent = 'Status: Running';
      statusDiv.className = 'running';
      
      // Kirim pesan ke semua tab Facebook
      browser.tabs.query({url: "*://*.facebook.com/*"}).then((tabs) => {
        tabs.forEach(tab => {
          browser.tabs.sendMessage(tab.id, {
            action: 'start',
            reaction: selectedReaction
          }).catch(() => {
            // Ignore errors for tabs where content script isn't loaded
          });
        });
      });
    });
  });

  stopBtn.addEventListener('click', function() {
    browser.storage.local.set({isRunning: false}).then(() => {
      statusDiv.textContent = 'Status: Stopped';
      statusDiv.className = 'stopped';
      
      // Kirim pesan ke semua tab Facebook
      browser.tabs.query({url: "*://*.facebook.com/*"}).then((tabs) => {
        tabs.forEach(tab => {
          browser.tabs.sendMessage(tab.id, {action: 'stop'}).catch(() => {
            // Ignore errors
          });
        });
      });
    });
  });
});