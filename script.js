// Mapping nada (frekuensi dalam Hz) untuk piano
const noteFrequencies = {
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99, // G’ (lebih tinggi dari G4)
};

// Inisialisasi AudioContext
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

// Fungsi untuk memainkan nada dengan OscillatorNode
function playTone(frequency) {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.01);
  oscillator.start();
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  oscillator.stop(audioCtx.currentTime + 0.5);
}

// Fungsi untuk animasi key ditekan
function animateKey(keyElement) {
  keyElement.classList.add("pressed");
  setTimeout(() => {
    keyElement.classList.remove("pressed");
  }, 150);
}

// Event listener untuk input keyboard
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  const key = e.key.toLowerCase();
  const keyElement = document.querySelector(`.key[data-key="${key}"]`);
  if (keyElement) {
    const note = keyElement.getAttribute("data-note");
    const frequency = noteFrequencies[note];
    if (frequency) {
      // Pastikan audio context aktif
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      playTone(frequency);
      animateKey(keyElement);
    }
  }
});

// Event listener untuk klik pada key
document.querySelectorAll(".key").forEach((keyElement) => {
  keyElement.addEventListener("click", () => {
    const note = keyElement.getAttribute("data-note");
    const frequency = noteFrequencies[note];
    if (frequency) {
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      playTone(frequency);
      animateKey(keyElement);
    }
  });
});

// Disable scrolling on page load
// document.body.classList.add("no-scroll");

// Tombol untuk memulai AudioContext
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  startButton.style.display = "none"; // Sembunyikan tombol setelah diklik

  // Re-enable scrolling
  //   document.body.classList.remove("no-scroll");

  // Scroll ke bagian piano
  document
    .getElementById("pianoSection")
    .scrollIntoView({ behavior: "smooth" });

  // Mulai tutorial falling notes
  currentNoteIndex = 0; // Reset indeks note
  isPaused = false; // Pastikan tidak dalam status jeda
  startTutorial(); // Mulai tutorial
});

// Tutorial Falling Notes untuk lagu "Happy Birthday"
// Versi lagu:
// Line 1: G, G, A, G, C, B   => a, a, s, a, f, d
// Line 2: G, G, A, G, D, C   => a, a, s, a, j, f
// Line 3: G, G, G', E, C, B, A   => a, a, ;, k, f, d, s
// Line 4: F, F, E, C, D, C   => l, l, k, f, j, f
const tutorialSequence = [
  // Line 1
  { key: "a", delay: 0 },
  { key: "a", delay: 800 },
  { key: "s", delay: 1600 },
  { key: "a", delay: 2400 },
  { key: "f", delay: 3200 },
  { key: "d", delay: 4000 },
  // Line 2
  { key: "a", delay: 5000 },
  { key: "a", delay: 5800 },
  { key: "s", delay: 6600 },
  { key: "a", delay: 7400 },
  { key: "j", delay: 8200 },
  { key: "f", delay: 9000 },
  // Line 3
  { key: "a", delay: 10000 },
  { key: "a", delay: 10800 },
  { key: ";", delay: 11600 },
  { key: "k", delay: 12400 },
  { key: "f", delay: 13200 },
  { key: "d", delay: 14000 },
  { key: "s", delay: 14800 },
  // Line 4
  { key: "l", delay: 15800 },
  { key: "l", delay: 16600 },
  { key: "k", delay: 17400 },
  { key: "f", delay: 18200 },
  { key: "j", delay: 19000 },
  { key: "f", delay: 19800 },
];

let isPaused = false; // Status jeda
let currentNoteIndex = 0; // Indeks note yang sedang diproses
let timeoutId = null; // ID untuk timeout yang sedang berjalan
const FALL_DURATION = 2000; // durasi animasi jatuh (ms)

// Fungsi untuk membuat falling note
function createFallingNote(noteObj) {
  const { key } = noteObj;
  const keyElement = document.querySelector(`.key[data-key="${key}"]`);
  const pianoWrapper = document.querySelector(".piano-wrapper");
  if (!keyElement || !pianoWrapper) return;

  // Hitung posisi horizontal falling note berdasarkan key
  const keyRect = keyElement.getBoundingClientRect();
  const wrapperRect = pianoWrapper.getBoundingClientRect();
  const noteWidth = 50;
  const left =
    keyRect.left - wrapperRect.left + (keyRect.width - noteWidth) / 2;

  const fallingNote = document.createElement("div");
  fallingNote.classList.add("falling-note");
  fallingNote.style.left = left + "px";
  fallingNote.innerText = key.toUpperCase();

  // Tambahkan properti untuk melacak waktu
  fallingNote.startTime = Date.now(); // Waktu mulai
  fallingNote.remainingTime = FALL_DURATION; // Durasi penuh

  // Tempatkan falling note ke container
  document.getElementById("fallingNotesContainer").appendChild(fallingNote);

  // Fungsi untuk menghapus note setelah durasi selesai
  const removeNote = () => {
    fallingNote.remove();
  };

  // Simpan timeout ID untuk penghapusan
  fallingNote.timeoutId = setTimeout(removeNote, FALL_DURATION);
}

// Fungsi untuk menjeda animasi dan penghapusan falling notes
function pauseFallingNotes() {
  const fallingNotes = document.querySelectorAll(".falling-note");
  fallingNotes.forEach((note) => {
    const elapsedTime = Date.now() - note.startTime; // Waktu yang telah berlalu
    note.remainingTime -= elapsedTime; // Hitung waktu tersisa
    clearTimeout(note.timeoutId); // Batalkan penghapusan
    note.style.animationPlayState = "paused"; // Jeda animasi
  });
}

// Fungsi untuk melanjutkan animasi dan penghapusan falling notes
function resumeFallingNotes() {
  const fallingNotes = document.querySelectorAll(".falling-note");
  fallingNotes.forEach((note) => {
    note.startTime = Date.now(); // Reset waktu mulai
    note.timeoutId = setTimeout(() => {
      note.remove();
    }, note.remainingTime); // Atur ulang penghapusan
    note.style.animationPlayState = "running"; // Lanjutkan animasi
  });
}

// Event listener untuk keydown tombol "P" (Pause/Resume)
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "p") {
    isPaused = !isPaused;
    if (isPaused) {
      pauseFallingNotes();
    } else {
      resumeFallingNotes();
    }
  }
});

// Fungsi untuk memulai tutorial falling notes
function startTutorial() {
  if (currentNoteIndex >= tutorialSequence.length) return; // Jika semua note sudah dibuat, hentikan

  const noteObj = tutorialSequence[currentNoteIndex];
  timeoutId = setTimeout(() => {
    if (!isPaused) {
      createFallingNote(noteObj);
      currentNoteIndex++; // Lanjutkan ke note berikutnya
      startTutorial(); // Panggil fungsi ini lagi untuk note berikutnya
    }
  }, noteObj.delay - (currentNoteIndex > 0 ? tutorialSequence[currentNoteIndex - 1].delay : 0));
}

// Event listener untuk keydown tombol "O" (Start Tutorial)
window.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "o") {
    currentNoteIndex = 0; // Reset indeks note
    isPaused = false; // Pastikan tidak dalam status jeda
    startTutorial(); // Mulai tutorial
  }
});
