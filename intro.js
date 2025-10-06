const LINES = [
  "hey—welcome to yale!",
  "this place is full of studios, workshops, and hidden creative corners.",
  "you’ll meet clubs that design, build, and dream in every direction.",
  "ready to start your journey through yale’s art & design world?"
];

const dialogEl = document.getElementById("dialogText");
const hintEl = document.getElementById("hint");

let lineIndex = 0;
let charIndex = 0;
let typing = false;
let skipCurrent = false;

const NORMAL_SPEED = 33; // ms per character

function updateHint() {
  if (lineIndex < LINES.length - 1) {
    hintEl.textContent = "click / tap / press space to advance";
  } else {
    hintEl.textContent = "press space or enter to start the game";
  }
}

function typeNextChar() {
  if (!dialogEl) return;
  if (skipCurrent) return;

  const line = LINES[lineIndex];
  charIndex++;
  dialogEl.innerHTML = line.slice(0, charIndex) + '<span class="cursor">▮</span>';

  if (charIndex < line.length) {
    typing = true;
    setTimeout(typeNextChar, NORMAL_SPEED);
  } else {
    typing = false;
    dialogEl.textContent = line;
    updateHint();
  }
}

/* ===== button sound ===== */
const buttonSound = new Audio("buttonsound.mp3");
buttonSound.volume = 0.7;

function playButtonSound() {
  const soundClone = buttonSound.cloneNode();
  soundClone.volume = 0.7;
  soundClone.play().catch(err => console.warn("Button sound blocked:", err));
}

function advanceDialogue() {
  playButtonSound(); 

  if (!dialogEl) return;


  if (typing) {
    skipCurrent = true;
    typing = false;
    dialogEl.textContent = LINES[lineIndex];
    updateHint();
    return;
  }


  if (lineIndex === LINES.length - 1) {
    window.location.href = "map.html";
    return;
  }


  lineIndex++;
  charIndex = 0;
  skipCurrent = false;
  typeNextChar();
}

document.addEventListener("click", advanceDialogue);
document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    advanceDialogue();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  typeNextChar();
});


const bgMusic = document.getElementById("bgMusic");
let musicStarted = false;

function startMusicIfAllowed() {
  if (!bgMusic || musicStarted) return;
  bgMusic.volume = 0.5;
  const p = bgMusic.play();
  if (p && typeof p.then === "function") {
    p.then(() => { musicStarted = true; removeGestureListeners(); })
     .catch(err => console.warn("Music play() blocked or failed:", err));
  } else {
    musicStarted = true;
    removeGestureListeners();
  }
}

function addGestureListeners() {
  ["pointerdown", "click", "touchstart", "keydown"].forEach(evt =>
    window.addEventListener(evt, startMusicIfAllowed, { passive: true })
  );
}

function removeGestureListeners() {
  ["pointerdown", "click", "touchstart", "keydown"].forEach(evt =>
    window.removeEventListener(evt, startMusicIfAllowed, { passive: true })
  );
}

addGestureListeners();
