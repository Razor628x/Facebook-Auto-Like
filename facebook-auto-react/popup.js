document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');

  // Load saved settings (tetap menyimpan reactionType untuk kompatibilitas)
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
    // Set default reaction to 'like'
    const selectedReaction = 'like';
    
    browser.storage.local.set({
      isRunning: true,
      reactionType: selectedReaction
    }).then(() => {
      statusDiv.textContent = 'Status: Running';
      statusDiv.className = 'running';
      
      // Kirim pesan ke content script
      browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {
          action: 'start',
          reaction: selectedReaction
        });
      });
    });
  });

  stopBtn.addEventListener('click', function() {
    browser.storage.local.set({isRunning: false}).then(() => {
      statusDiv.textContent = 'Status: Stopped';
      statusDiv.className = 'stopped';
      
      // Kirim pesan ke content script
      browser.tabs.query({active: true, currentWindow: true}).then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {action: 'stop'});
      });
    });
  });
});