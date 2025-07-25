let isRunning = false;
let reactionInterval;
let selectedReaction = 'like';
let processedPosts = new Set(); // Menyimpan identifier unik untuk postingan yang sudah diproses/di-like

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    isRunning = true;
    selectedReaction = message.reaction || 'like';
    // Tidak perlu clear processedPosts saat start, biarkan terus menumpuk selama sesi berjalan
    // processedPosts.clear(); 
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
  // Gunakan interval yang lebih pendek untuk menangkap konten baru lebih cepat
  reactionInterval = setInterval(autoReactToPosts, 10000); // Kurangi menjadi 3 detik
  // Jalankan sekali segera setelah start
  setTimeout(autoReactToPosts, 500);
}

function stopAutoReact() {
  if (reactionInterval) {
    clearInterval(reactionInterval);
    reactionInterval = null;
  }
  // Jangan clear processedPosts saat stop, biarkan state-nya tetap
  // processedPosts.clear();
}

function autoReactToPosts() {
  if (!isRunning) return;

  try {
    // Selector spesifik untuk tombol "Like" pada postingan berdasarkan struktur yang diberikan
    // Target: div dengan aria-label="Like" yang berada di dalam container postingan
    const likeButtons = Array.from(document.querySelectorAll('div[aria-label="Like"]'));

    // Filter tombol yang valid (postingan, belum diproses, belum di-like)
    const validButtons = [];

    for (const button of likeButtons) {
      // --- Validasi 1: Apakah tombol ini bagian dari sebuah POSTINGAN? ---
      // Cari container postingan terdekat. Umumnya memiliki role="article" atau atribut data unik feed.
      const postContainer = button.closest('[role="article"], [data-sigil*="feed-story"], [data-pagelet^="Feed"], [aria-posinset]');
      
      // Jika tidak ditemukan container postingan, kemungkinan besar ini komentar atau UI lain.
      if (!postContainer) {
        continue; // Lewati tombol ini
      }

      // --- Validasi 2: Apakah tombol ini sudah BERUBAH dari "Like" menjadi reaksi lain (misalnya "Liked")? ---
      // Jika tombol sudah di-klik, teks atau struktur internalnya biasanya berubah.
      // Misalnya, bisa dicek apakah ada span dengan teks "Liked" atau perubahan atribut.
      // Atau, bisa dicek berdasarkan identifier unik postingan itu sendiri (lebih robust).
      
      // Cara yang lebih robust: Gunakan identifier unik dari postingan itu sendiri
      const postId = getPostId(postContainer);
      if (postId && processedPosts.has(postId)) {
         // console.log(`Post ${postId} sudah diproses.`);
         continue; // Lewati jika sudah diproses
      }

      // --- Validasi 3: Apakah tombol ini sudah diproses dalam sesi ini? ---
      // Gunakan kombinasi posisi dan konteks untuk membuat identifier yang unik untuk tombol ini
      // (meskipun sebenarnya postId lebih baik, ini sebagai cadangan)
      const rect = button.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue; // Lewati jika tidak terlihat
      
      const buttonIdentifier = `${Math.round(rect.top)}-${Math.round(rect.left)}-${postContainer.tagName}-${postContainer.children.length}`;
      if (processedPosts.has(buttonIdentifier)) {
          // console.log(`Button ${buttonIdentifier} sudah diproses.`); 
          continue; // Lewati jika sudah diproses
      }

      // Jika semua validasi lolos, tambahkan ke daftar valid
      validButtons.push({ button, postContainer, postId, buttonIdentifier });
    }

    if (validButtons.length > 0) {
      // Pilih satu tombol secara acak dari daftar yang valid
      const randomIndex = Math.floor(Math.random() * validButtons.length);
      const { button, postContainer, postId, buttonIdentifier } = validButtons[randomIndex];

      if (button && typeof button.click === 'function') {
        // Simpan identifier untuk mencegah pemrosesan ulang
        if (postId) {
            processedPosts.add(postId); // Utamakan postId
        } else {
            processedPosts.add(buttonIdentifier); // Cadangan
        }
        
        // Dapatkan posisi untuk scroll
        const rect = button.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetY = rect.top + scrollTop - 150; // Scroll sedikit di atas tombol

        // Klik tombol reaksi
        button.click();
        console.log(`✅ Auto reacted with ${selectedReaction} on a post. (Post ID: ${postId || 'N/A'})`);

        // Scroll ke posisi postingan
        setTimeout(() => {
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });
        }, 300); // Tunggu sebentar setelah klik

        // Tambahkan efek visual sederhana
        setTimeout(() => {
          addSimpleHighlight(button);
        }, 800);
        
      }
    } else {
        // console.log("Tidak ada tombol 'Like' pada postingan yang valid ditemukan.");
    }
  } catch (error) {
    console.error('Error in autoReactToPosts:', error);
  }
}

// Fungsi untuk mencoba mendapatkan ID unik dari sebuah postingan
function getPostId(postContainerElement) {
  try {
     // Metode 1: Coba cari atribut data yang unik untuk postingan
     // Ini sangat tergantung pada struktur DOM Facebook saat ini
     let postId = postContainerElement.getAttribute('data-store')?.match(/"post_id":"(\d+)"/)?.[1];
     if (postId) return `post_${postId}`;

     postId = postContainerElement.getAttribute('id')?.match(/^(.*)$/)?.[1]; // Contoh jika ada ID
     if (postId) return postId;

     // Metode 2: Gunakan kombinasi atribut unik jika tidak ada ID jelas
     const timestamp = postContainerElement.getAttribute('data-timestamp');
     const permalink = postContainerElement.querySelector('a[href*="permalink"]')?.href;
     if (timestamp && permalink) {
        // Buat hash sederhana dari permalink dan timestamp
        return `hash_${simpleHash(permalink + timestamp)}`;
     }

     // Jika tidak bisa, kembalikan null
     return null;
  } catch (e) {
     console.warn("Could not determine post ID:", e);
     return null;
  }
}

// Fungsi hash sederhana untuk membuat identifier unik
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36); // Convert to base36 string
}


function addSimpleHighlight(button) {
  try {
    const highlight = document.createElement('div');
    highlight.style.position = 'fixed';
    highlight.style.top = '20px';
    highlight.style.left = '50%';
    highlight.style.transform = 'translateX(-50%)';
    highlight.style.backgroundColor = '#42b72a';
    highlight.style.color = 'white';
    highlight.style.padding = '10px 20px';
    highlight.style.borderRadius = '20px';
    highlight.style.zIndex = '10000'; // Pastikan di atas elemen lain
    highlight.style.fontFamily = 'Arial, sans-serif';
    highlight.style.fontSize = '14px';
    highlight.style.fontWeight = 'bold';
    highlight.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
    highlight.style.opacity = '0';
    highlight.style.transition = 'opacity 0.3s ease-in-out';
    highlight.textContent = `✅ Reaksi ${selectedReaction} berhasil!`;

    document.body.appendChild(highlight);

    // Fade in
    setTimeout(() => { highlight.style.opacity = '1'; }, 10);
    
    // Fade out and remove
    setTimeout(() => {
      highlight.style.opacity = '0';
      setTimeout(() => {
        if (highlight.parentNode) {
          highlight.parentNode.removeChild(highlight);
        }
      }, 300);
    }, 2700); // Tampil selama ~3 detik

  } catch (error) {
    console.error('Error adding highlight:', error);
  }
}

// Cleanup processed posts setiap beberapa menit untuk mencegah memory leak
// Tapi jangan terlalu sering agar tidak mereset status 'sudah di-like'
setInterval(() => {
  const maxSize = 200; // Batasi ukuran Set
  if (processedPosts.size > maxSize) {
    // Hapus sebagian awal (FIFO-like behavior)
    const keysToDelete = Array.from(processedPosts.keys()).slice(0, 50);
    keysToDelete.forEach(key => processedPosts.delete(key));
    console.log(`🧹 Cleaned up processedPosts cache. New size: ${processedPosts.size}`);
  }
}, 60000); // Setiap 1 menit

// Muat state awal dari storage
browser.storage.local.get(['isRunning', 'reactionType']).then((result) => {
  if (result.isRunning) {
    isRunning = true;
    selectedReaction = result.reactionType || 'like';
    console.log("🔄 Content script loaded, resuming auto-react state.");
    startAutoReact(); // Mulai otomatis jika sebelumnya running
  }
});

// Bersihkan saat tab ditutup/unload
window.addEventListener('beforeunload', () => {
    stopAutoReact();
    console.log("🛑 Auto-react stopped on page unload.");
});