let isRunning = false;
let reactionInterval;
let selectedReaction = 'like';
let processedPosts = new Set();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    isRunning = true;
    selectedReaction = message.reaction;
    processedPosts.clear();
    startAutoReact();
  } else if (message.action === 'stop') {
    isRunning = false;
    stopAutoReact();
  }
});

function startAutoReact() {
  if (reactionInterval) {
    clearInterval(reactionInterval);
  }
  reactionInterval = setInterval(autoReactToPosts, 10000);
  setTimeout(autoReactToPosts, 1000);
}

function stopAutoReact() {
  if (reactionInterval) {
    clearInterval(reactionInterval);
    reactionInterval = null;
  }
  processedPosts.clear();
}

function autoReactToPosts() {
  if (!isRunning) return;
  
  try {
    // Selector untuk tombol reaksi
    const selectors = {
      'like': '[aria-label="Like"]',
      'love': '[aria-label="Love"]',
      'haha': '[aria-label="Haha"]',
      'wow': '[aria-label="Wow"]',
      'sad': '[aria-label="Sad"]',
      'angry': '[aria-label="Angry"]'
    };
    
    const selector = selectors[selectedReaction] || '[aria-label="Like"]';
    const allButtons = Array.from(document.querySelectorAll(selector));
    
    // Filter tombol yang belum diproses dan merupakan postingan
    const validButtons = allButtons.filter(button => {
      const rect = button.getBoundingClientRect();
      const identifier = `${Math.round(rect.top)}-${Math.round(rect.left)}`;
      return !processedPosts.has(identifier) && isPostButton(button);
    });
    
    // Jika tidak ada tombol valid, gunakan semua tombol (reset)
    let buttonsToProcess = validButtons;
    if (validButtons.length === 0 && allButtons.length > 0) {
      processedPosts.clear();
      buttonsToProcess = allButtons.filter(button => isPostButton(button));
    }
    
    // Batasi hanya 4 tombol pertama
    const limitedButtons = buttonsToProcess.slice(0, 4);
    
    if (limitedButtons.length > 0) {
      // Pilih tombol secara acak
      const randomIndex = Math.floor(Math.random() * limitedButtons.length);
      const button = limitedButtons[randomIndex];
      
      if (button) {
        // Tandai sebagai diproses
        const rect = button.getBoundingClientRect();
        const identifier = `${Math.round(rect.top)}-${Math.round(rect.left)}`;
        processedPosts.add(identifier);
        
        // Dapatkan posisi untuk scroll
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 100;
        
        // Klik tombol reaksi
        button.click();
        console.log(`Auto reacted with ${selectedReaction}`);
        
        // Scroll dan tambahkan efek visual
        setTimeout(() => {
          // Scroll ke posisi
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });
          
          // Tambahkan efek visual sederhana
          addSimpleHighlight(button);
          
        }, 500);
      }
    }
  } catch (error) {
    console.log('Error:', error);
  }
}

function isPostButton(button) {
  try {
    // Hindari tombol komentar dengan mencari container komentar
    const commentContainer = button.closest('[data-sigil*="comment"]');
    if (commentContainer) {
      return false;
    }
    
    // Cek apakah ini tombol postingan berdasarkan posisi
    const rect = button.getBoundingClientRect();
    
    // Tombol komentar biasanya berada di posisi yang lebih tinggi dan dekat dengan bagian atas
    if (rect.top < 200) {
      return false; // Kemungkinan besar komentar
    }
    
    return true;
  } catch (error) {
    return true;
  }
}

function addSimpleHighlight(button) {
  try {
    // Buat elemen highlight sederhana
    const highlight = document.createElement('div');
    highlight.style.position = 'fixed';
    highlight.style.top = '20px';
    highlight.style.left = '50%';
    highlight.style.transform = 'translateX(-50%)';
    highlight.style.backgroundColor = '#42b72a';
    highlight.style.color = 'white';
    highlight.style.padding = '10px 20px';
    highlight.style.borderRadius = '20px';
    highlight.style.zIndex = '9999';
    highlight.style.fontFamily = 'Arial, sans-serif';
    highlight.style.fontSize = '14px';
    highlight.style.fontWeight = 'bold';
    highlight.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    highlight.textContent = `✅ Reaksi ${selectedReaction} berhasil!`;
    
    // Tambahkan ke body
    document.body.appendChild(highlight);
    
    // Hapus setelah 3 detik
    setTimeout(() => {
      if (highlight.parentNode) {
        highlight.parentNode.removeChild(highlight);
      }
    }, 3000);
    
    // Scroll ke posisi tombol yang diklik
    const rect = button.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - 200;
    
    setTimeout(() => {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth'
      });
    }, 1000);
    
  } catch (error) {
    console.log('Error adding highlight:', error);
  }
}

// Cleanup processed posts setiap 30 detik
setInterval(() => {
  if (processedPosts.size > 30) {
    processedPosts.clear();
  }
}, 30000);

// Load initial state
browser.storage.local.get(['isRunning', 'reactionType']).then((result) => {
  if (result.isRunning) {
    isRunning = true;
    selectedReaction = result.reactionType || 'like';
  }
});

window.addEventListener('beforeunload', stopAutoReact);