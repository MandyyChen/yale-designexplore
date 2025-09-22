const LINES = [
  "hey—nice to meet you. welcome to yale!",
  "you're about to embark on a journey to explore yale's art & design scene.",
  "discover spaces, clubs, and classes that shape creative life here.",
  "ready? safe travels!"
];

const dialogEl = document.getElementById("dialogText");
const startBtn = document.getElementById("startBtn");
const card = document.getElementById("dialogCard");
const hintEl = document.getElementById("hint");

let lineIndex = 0;
let charIndex = 0;
let typing = false;
let skipCurrent = false;

const NORMAL_SPEED = 28; // ms per character

function revealStart() {
  startBtn.classList.remove("hidden");

  if (hintEl) hintEl.classList.add("hidden");
}

function typeNextChar() {
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

    if (lineIndex === LINES.length - 1) {
      revealStart();
    }
  }
}

function advanceDialogue() {

  if (typing) {
    skipCurrent = true;
    typing = false;
    dialogEl.textContent = LINES[lineIndex];

    if (lineIndex === LINES.length - 1) {
      revealStart();
    }
    return;
  }

  if (lineIndex < LINES.length - 1) {
    lineIndex++;
    charIndex = 0;
    skipCurrent = false;
    typeNextChar();
  } else {
    revealStart();
  }
}

document.addEventListener("click", advanceDialogue);
document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    advanceDialogue();
  }
});

window.addEventListener("DOMContentLoaded", typeNextChar);