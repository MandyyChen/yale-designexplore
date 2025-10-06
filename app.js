
// ----- DOM refs -----
const gmOpenDex    = document.getElementById("gm-openDex");
const gmDexOverlay = document.getElementById("gm-dexOverlay");
const gmCloseDex   = document.getElementById("gm-closeDex");
const gmDexList    = document.getElementById("gm-dexList");

const gmViewport = document.getElementById("gm-viewport");
const gmWorld = document.getElementById("gm-world");
const gmMapImg = document.querySelector(".gm-map-image");
const gmPlayerEl = document.getElementById("gm-player");
const gmPlayerSprite = document.getElementById("gm-playerSprite");

const gmSpotsEls = document.querySelectorAll(".gm-spot");
const gmPopup = document.getElementById("gm-popup");
const gmPopupText = document.getElementById("gm-popupText");
const gmCloseButton = document.getElementById("gm-closeButton");

const gmOpenSettings = document.getElementById("gm-openSettings");
const gmSettingsOverlay = document.getElementById("gm-settingsOverlay");
const gmCloseSettings = document.getElementById("gm-closeSettings");

const gmProgressBar = document.getElementById("gm-progressBar");
const gmProgressLabel = document.getElementById("gm-progressLabel");
const gmExitBtn = document.getElementById("gm-exit");

// Music
const bgMusic = document.getElementById("bgMusic");
const gmMusicToggle = document.getElementById("gm-musicToggle");

// Completion audio
const completionSound = new Audio("completion.mp3");
let completionPlayed = false;

// ----- World size -----
let GM_WORLD_W = 2400;
let GM_WORLD_H = 1600;

function gmSizeWorldFromImage() {
  if (gmMapImg && gmMapImg.naturalWidth > 0) {
    GM_WORLD_W = gmMapImg.naturalWidth;
    GM_WORLD_H = gmMapImg.naturalHeight;
  } else if (gmViewport) {
    GM_WORLD_W = gmViewport.clientWidth || GM_WORLD_W;
    GM_WORLD_H = gmViewport.clientHeight || GM_WORLD_H;
  }
  gmWorld.style.width = GM_WORLD_W + "px";
  gmWorld.style.height = GM_WORLD_H + "px";
}

// ----- Player -----
const gmPlayer = { x: 0, y: 0, r: 20, speed: 2.2 };
let currentDir = "down";


const TOTAL_FRAMES = 3;
const FRAME_W = 27; 
let frameX = 0;
let frameTimer = 0;

function gmRenderPlayer() {
  gmPlayerEl.style.left = gmPlayer.x + "px";
  gmPlayerEl.style.top = gmPlayer.y + "px";
}

function gmAnimatePlayer() {
  frameTimer++;
  if (frameTimer % 10 === 0) {
    frameX = (frameX + 1) % TOTAL_FRAMES;
    gmPlayerSprite.style.objectPosition = `-${frameX * FRAME_W}px 0`;
  }
}

function gmSetDirection(dir) {
  if (dir === currentDir) return;
  currentDir = dir;
  gmPlayerSprite.src =
    dir === "up"
      ? "lyra_up.png"
      : dir === "left"
      ? "lyra_left.png"
      : dir === "right"
      ? "lyra_right.png"
      : "lyra_down.png";
  frameX = 0;
  gmPlayerSprite.style.objectPosition = "0 0";
}

// ----- Spots -----
let gmSpots = [];

function gmPositionSpots() {
  gmSpots = Array.from(gmSpotsEls).map((el) => {
    const pctX = parseFloat(el.style.left);
    const pctY = parseFloat(el.style.top);
    const x = (pctX / 100) * GM_WORLD_W;
    const y = (pctY / 100) * GM_WORLD_H;
    el.style.left = x + "px";
    el.style.top = y + "px";
    el.style.transform = "translate(-50%, -50%)";
    return {
      id: el.dataset.id || `${pctX}-${pctY}`,
      tpl: el.dataset.tpl || "",
      el,
      x,
      y,
      r: 30,
      discovered: false,
    };
  });
}

function gmUpdateProgress() {
  const total = gmSpots.length;
  const found = gmSpots.filter((s) => s.discovered).length;
  const pct = total ? Math.round((found / total) * 100) : 0;
  gmProgressBar.style.width = pct + "%";
  gmProgressLabel.textContent = `${found}/${total}`;

  if (!completionPlayed && found === total) {
    completionPlayed = true;
    completionSound.play().catch(() => {});
    setTimeout(() => {
      gmPopupText.innerHTML = `
        <div class="gm-popup-complete">
          <h2 class="gm-popup-title">🎉 Congratulations! 🎉</h2>
          <p>You’ve discovered all ${total} places!</p>
          <p>Thank you for exploring the Yale Design Map!</p>
        </div>`;
      gmPopup.classList.remove("gm-hidden");
    }, 300);
  }
}

// Open Pokédex
if (gmOpenDex) {
  gmOpenDex.addEventListener("click", () => {
    gmRenderDex();
    gmDexOverlay.classList.remove("gm-hidden");
  });
}

// Close Pokédex
if (gmCloseDex) {
  gmCloseDex.addEventListener("click", () => {
    gmDexOverlay.classList.add("gm-hidden");
  });
}

function gmRenderDex() {
  if (!gmDexList) return;
  gmDexList.innerHTML = "";

  gmSpots.forEach(spt => {
    const tpl = document.getElementById("tpl-" + spt.id);

    const card = document.createElement("div");
    card.className = "gm-dex-card" + (spt.discovered ? "" : " locked");

    const img = document.createElement("img");
    const tplImg = tpl?.content.querySelector(".gm-popup-img img");
    img.src = spt.discovered ? (tplImg?.getAttribute("src") || "spot.png") : "spot.png";
    img.alt = spt.id;

    const textWrap = document.createElement("div");
    const h3 = document.createElement("h3");
    const title = tpl?.content.querySelector(".gm-popup-title")?.textContent || spt.id;
    h3.textContent = spt.discovered ? title : "Unknown Location";

    const p = document.createElement("p");
    const firstP = tpl?.content.querySelector(".gm-popup-desc p")?.textContent || "";
    p.textContent = spt.discovered ? firstP : "Not yet discovered.";

    textWrap.appendChild(h3);
    textWrap.appendChild(p);
    card.appendChild(img);
    card.appendChild(textWrap);

    gmDexList.appendChild(card);
  });
}

// ----- Camera -----
function gmClamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
function gmViewportSize() {
  return { w: gmViewport.clientWidth, h: gmViewport.clientHeight };
}
function gmUpdateCamera() {
  const { w: VPW, h: VPH } = gmViewportSize();
  const cx = gmClamp(gmPlayer.x - VPW / 2, 0, GM_WORLD_W - VPW);
  const cy = gmClamp(gmPlayer.y - VPH / 2, 0, GM_WORLD_H - VPH);
  gmWorld.style.transform = `translate(${-cx}px, ${-cy}px)`;
}

// ----- Input / Movement -----
const gmKeys = {};
addEventListener("keydown", (e) => {
  gmKeys[e.code] = true;
  gmTryStartMusic();
});
addEventListener("keyup", (e) => {
  gmKeys[e.code] = false;
});

function gmTick() {
  const s =
    gmKeys.ShiftLeft || gmKeys.ShiftRight
      ? gmPlayer.speed * 1.6
      : gmPlayer.speed;

  let moving = false;

  if (gmKeys.KeyA || gmKeys.ArrowLeft) {
    gmPlayer.x -= s;
    gmSetDirection("left");
    moving = true;
  }
  if (gmKeys.KeyD || gmKeys.ArrowRight) {
    gmPlayer.x += s;
    gmSetDirection("right");
    moving = true;
  }
  if (gmKeys.KeyW || gmKeys.ArrowUp) {
    gmPlayer.y -= s;
    gmSetDirection("up");
    moving = true;
  }
  if (gmKeys.KeyS || gmKeys.ArrowDown) {
    gmPlayer.y += s;
    gmSetDirection("down");
    moving = true;
  }

  gmPlayer.x = gmClamp(gmPlayer.x, gmPlayer.r, GM_WORLD_W - gmPlayer.r);
  gmPlayer.y = gmClamp(gmPlayer.y, gmPlayer.r, GM_WORLD_H - gmPlayer.r);

  if (moving) gmAnimatePlayer();

  // collisions
  for (const spt of gmSpots) {
    if (!spt.discovered) {
      const dx = gmPlayer.x - spt.x;
      const dy = gmPlayer.y - spt.y;
      if (Math.hypot(dx, dy) < gmPlayer.r + spt.r) {
        spt.discovered = true;
        spt.el.classList.add("discovered");
        gmUpdateProgress();

        const tplId = spt.tpl ? `tpl-${spt.tpl}` : `tpl-${spt.id}`;
        const tpl = document.getElementById(tplId);
        gmPopupText.innerHTML = "";
        if (tpl && "content" in tpl) {
          gmPopupText.appendChild(tpl.content.cloneNode(true));
        } else {
          const h2 = document.createElement("h2");
          h2.className = "gm-popup-title";
          h2.textContent = spt.id || "Spot";
          gmPopupText.appendChild(h2);
        }
        gmPopup.classList.remove("gm-hidden");
      }
    }
  }

  gmRenderPlayer();
  gmUpdateCamera();
  requestAnimationFrame(gmTick);
}

// ----- Settings overlay -----
if (gmOpenSettings) {
  gmOpenSettings.addEventListener("click", () => {
    gmSettingsOverlay.classList.remove("gm-hidden");
    gmSettingsOverlay.classList.add("gm-show");
  });
}
if (gmCloseSettings) {
  gmCloseSettings.addEventListener("click", () => {
    gmSettingsOverlay.classList.add("gm-hidden");
    gmSettingsOverlay.classList.remove("gm-show");
  });
}

// ----- Music -----
let gmMusicStarted = false;
function gmTryStartMusic() {
  if (!bgMusic) return;
  const muted = gmMusicToggle && gmMusicToggle.checked;
  if (!gmMusicStarted && !muted) {
    bgMusic.play().then(() => {
      gmMusicStarted = true;
    }).catch(() => {});
  }
}
if (gmMusicToggle) {
  gmMusicToggle.addEventListener("change", () => {
    if (gmMusicToggle.checked) bgMusic.pause();
    else bgMusic.play().catch(() => {});
  });
}
addEventListener("click", gmTryStartMusic);

// ----- Popup close -----
if (gmCloseButton)
  gmCloseButton.addEventListener("click", () =>
    gmPopup.classList.add("gm-hidden")
  );

// ----- Exit button -----
if (gmExitBtn) {
  gmExitBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}

// ----- Init -----
function gmInit() {
  gmSizeWorldFromImage();
  gmPlayer.x = GM_WORLD_W * 0.45;
  gmPlayer.y = GM_WORLD_H * 0.45;
  gmPositionSpots();
  gmRenderPlayer();
  gmUpdateProgress();
  gmUpdateCamera();
  requestAnimationFrame(gmTick);
}

window.addEventListener("DOMContentLoaded", () => {
  if (gmMapImg && gmMapImg.complete && gmMapImg.naturalWidth > 0) {
    gmInit();
  } else if (gmMapImg) {
    gmMapImg.addEventListener("load", gmInit, { once: true });
    setTimeout(() => {
      if (!gmWorld.style.width) gmInit();
    }, 700);
  }
});
window.addEventListener("resize", gmUpdateCamera);
