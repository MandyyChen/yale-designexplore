// turn from html to js array
const spotArray = [
  { x: 40, y: 30, info: "DFA — human-centered design club #pleasejoin." },
  { x: 70, y: 60, info: "CCAM — collaborative arts & media, talks and tech." },
  { x: 100, y: 90, info: "Yale Art Gallery — explore the world of art." },
  { x: 130, y: 120, info: "Design Lab — hands-on design projects." },
  { x: 160, y: 150, info: "Maker Space — create and innovate." }
];

// load all necessary DOM elements
const player = document.getElementById("player");
const spots = document.querySelectorAll(".spot");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const closeBtn = document.getElementById("closeBtn");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPopup = document.getElementById("settingsPopup");
const closeSettings = document.getElementById("closeSettings");

// initial player position and movement speed
let pos = { x: 285, y: 185 };
const speed = 5;

const musicToggle = document.getElementById("musicToggle"); // checked = mute
const bgMusic = document.getElementById("bgMusic");

document.addEventListener("DOMContentLoaded", () => {
  if (!musicToggle.checked) {
    bgMusic.play().catch(() => {
    });
  }
});

let musicStarted = false;

// setup keyboard controls
document.addEventListener("keydown", (e) => {
  let moved = false;

  if (e.key === "ArrowUp") { pos.y -= speed; moved = true; }
  if (e.key === "ArrowDown") { pos.y += speed; moved = true; }
  if (e.key === "ArrowLeft") { pos.x -= speed; moved = true; }
  if (e.key === "ArrowRight") { pos.x += speed; moved = true; }

  if (moved) {
    if (!musicStarted && !musicToggle.checked) {
      bgMusic.play().catch(() => { });
      musicStarted = true;
    }
    updatePlayer();
    checkCollision();
  }
});

musicToggle.addEventListener("change", () => {
  if (musicToggle.checked) {
    bgMusic.pause();
  } else {
    bgMusic.play().catch(() => {});
  }
});

// update player position on screen
function updatePlayer() {
  player.style.left = pos.x + "px";
  player.style.top = pos.y + "px";
}

// if player overlaps a spot, show popup
function checkCollision() {
  const playerRect = player.getBoundingClientRect();

  spots.forEach((spot) => {
    const spotRect = spot.getBoundingClientRect();
    const overlap = !(
      playerRect.right < spotRect.left ||
      playerRect.left > spotRect.right ||
      playerRect.bottom < spotRect.top ||
      playerRect.top > spotRect.bottom
    );

    if (overlap) {
      popupText.textContent = spot.dataset.info;
      popup.classList.remove("hidden");
    }
  });
}

closeButton.addEventListener("click", () => {
  popup.classList.add("hidden");
});

settingsButton.addEventListener("click", () => {
  settingsPopup.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
  settingsPopup.classList.add("hidden");
});
