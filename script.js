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

// Tombol untuk memulai AudioContext
const startButton = document.getElementById("startButton");
startButton.addEventListener("click", () => {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  startButton.style.display = "none"; // Sembunyikan tombol setelah diklik

  // Scroll ke bagian piano
  document
    .getElementById("pianoSection")
    .scrollIntoView({ behavior: "smooth" });

  // Mulai tutorial falling notes
  tutorialSequence.forEach((noteObj) => {
    setTimeout(() => {
      createFallingNote(noteObj);
    }, noteObj.delay + 4000);
  });
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

  // Tempatkan falling note ke container
  document.getElementById("fallingNotesContainer").appendChild(fallingNote);

  // Setelah animasi selesai, hapus falling note
  setTimeout(() => {
    fallingNote.remove();
    // Simulasi animasi key
    const note = keyElement.getAttribute("data-note");
  }, FALL_DURATION);
}
