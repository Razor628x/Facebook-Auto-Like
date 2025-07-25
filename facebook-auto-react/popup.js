document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusDiv = document.getElementById('status');
  const reactionType = document.getElementById('reactionType');

  // Load saved settings
  browser.storage.local.get(['isRunning', 'reactionType']).then((result) => {
    if (result.isRunning) {
      statusDiv.textContent = 'Status: Running';
      statusDiv.className = 'running';
    } else {
      statusDiv.textContent = 'Status: Stopped';
      statusDiv.className = 'stopped';
    }
    
    if (result.reactionType) {
      reactionType.value = result.reactionType;
    }
  });

  startBtn.addEventListener('click', function() {
    const selectedReaction = reactionType.value;
    
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