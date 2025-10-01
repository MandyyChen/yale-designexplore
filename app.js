// DOM refs
const viewport = document.getElementById("viewport");
const world = document.getElementById("world");
const playerEl = document.getElementById("player");
const playerSprite = document.getElementById("playerSprite");

const spotsEls = document.querySelectorAll(".spot");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const closeButton = document.getElementById("closeButton");

const settingsButton = document.getElementById("settingsButton");
const settingsPopup = document.getElementById("settingsPopup");
const closeSettings = document.getElementById("closeSettings");

const progressBar = document.getElementById("progressBar");
const progressLabel = document.getElementById("progressLabel");

const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");

// world sizes
const WORLD_W = world.offsetWidth;
const WORLD_H = world.offsetHeight;

// player state
const player = {
  x: WORLD_W * 0.45,
  y: WORLD_H * 0.45,
  r: 20,          
  speed: 2.2
};

// parse spots (from % positions to world px)
const spots = Array.from(spotsEls).map(el => {
  const pctX = parseFloat(el.style.left);
  const pctY = parseFloat(el.style.top);
  const x = (pctX / 100) * WORLD_W;
  const y = (pctY / 100) * WORLD_H;
  return {
    id: el.dataset.id || `${pctX}-${pctY}`,
    el, x, y,
    r: 30, // spot image is 60x60
    discovered: false,
    info: el.dataset.info || "Hotspot"
  };
});

// HUD
function updateProgress() {
  const total = spots.length;
  const found = spots.filter(s => s.discovered).length;
  const pct = total ? Math.round((found / total) * 100) : 0;
  progressBar.style.width = pct + "%";
  progressLabel.textContent = `${found}/${total}`;
}

// camera
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }
function viewportSize() { return { w: viewport.clientWidth, h: viewport.clientHeight }; }
function updateCamera() {
  const { w: VPW, h: VPH } = viewportSize();
  const cx = clamp(player.x - VPW / 2, 0, WORLD_W - VPW);
  const cy = clamp(player.y - VPH / 2, 0, WORLD_H - VPH);
  world.style.transform = `translate(${-cx}px, ${-cy}px)`;
}

// render player
function renderPlayer() {
  playerEl.style.left = player.x + "px";
  playerEl.style.top  = player.y + "px";
}

// movement
const keys = {};
addEventListener("keydown", e => keys[e.code] = true);
addEventListener("keyup",   e => keys[e.code] = false);

function tick() {
  const s = (keys.ShiftLeft || keys.ShiftRight) ? player.speed * 1.6 : player.speed;
  if (keys.KeyA || keys.ArrowLeft)  player.x -= s;
  if (keys.KeyD || keys.ArrowRight) player.x += s;
  if (keys.KeyW || keys.ArrowUp)    player.y -= s;
  if (keys.KeyS || keys.ArrowDown)  player.y += s;

  // clamp to world
  player.x = clamp(player.x, player.r, WORLD_W - player.r);
  player.y = clamp(player.y, player.r, WORLD_H - player.r);

  // collisions
  for (const spt of spots) {
    if (!spt.discovered) {
      const dx = player.x - spt.x;
      const dy = player.y - spt.y;
      const dist = Math.hypot(dx, dy);
      if (dist < (player.r + spt.r)) {
        spt.discovered = true;
        spt.el.classList.add("discovered");
        popupText.textContent = spt.info;
        popup.classList.remove("hidden");
        updateProgress();
      }
    }
  }

  renderPlayer();
  updateCamera();
  requestAnimationFrame(tick);
}

// popups & settings
closeButton.addEventListener("click", () => popup.classList.add("hidden"));
settingsButton.addEventListener("click", () => settingsPopup.classList.remove("hidden"));
closeSettings.addEventListener("click", () => settingsPopup.classList.add("hidden"));

// music
let musicStarted = false;
function tryStartMusic() {
  if (!musicStarted && bgMusic && musicToggle && !musicToggle.checked) {
    bgMusic.play().catch(()=>{});
    musicStarted = true;
  }
}
addEventListener("keydown", tryStartMusic);
addEventListener("click", tryStartMusic);
musicToggle.addEventListener("change", () => {
  if (musicToggle.checked) bgMusic.pause();
  else bgMusic.play().catch(()=>{});
});

// init
function init() {
  // position DOM spots by world coords
  for (const s of spots) {
    s.el.style.left = s.x + "px";
    s.el.style.top  = s.y + "px";
    s.el.style.transform = "translate(-50%, -50%)";
  }
  renderPlayer();
  updateProgress();
  updateCamera();
  requestAnimationFrame(tick);
}
window.addEventListener("DOMContentLoaded", init);
window.addEventListener("resize", updateCamera);