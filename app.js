// =============================================
//  KNGL RP ALL STREAMERS — App Logic
// =============================================

let countdownInterval;
let countdownValue = 60;

window.addEventListener("load", () => {
  const splash = document.getElementById("intro-splash");
  setTimeout(() => {
    splash.classList.add("fade-out");
    setTimeout(() => {
      splash.style.display = "none";
    }, 680);
  }, 2400);

  loadStreamers();
});

// ─── LOAD ────────────────────────────────────
async function loadStreamers() {
  resetCountdown();
  const live = [],
    offline = [];

  for (const s of STREAMERS) {
    const status = await fetchStatus(s);
    const merged = { ...s, ...status };
    (merged.isLive ? live : offline).push(merged);
  }

  renderAll(live, offline);
  updateNav(live.length);
}

// ─── FETCH ───────────────────────────────────
async function fetchStatus(s) {
  if (s.platform === "twitch") return fetchTwitch(s);
  if (s.platform === "kick") return fetchKick(s);
  if (s.platform === "youtube") return { isLive: false, viewers: 0 };
  return { isLive: false, viewers: 0 };
}

async function fetchTwitch(s) {
  const embed = `https://player.twitch.tv/?channel=${s.channelId}&parent=${location.hostname}&autoplay=false&muted=true`;

  if (TWITCH_CLIENT_ID && TWITCH_TOKEN) {
    try {
      const r = await fetch(
        `https://api.twitch.tv/helix/streams?user_login=${s.channelId}`,
        {
          headers: {
            "Client-ID": TWITCH_CLIENT_ID,
            Authorization: `Bearer ${TWITCH_TOKEN}`,
          },
        },
      );
      if (r.ok) {
        const d = await r.json();
        const stream = d.data?.[0];
        if (stream)
          return {
            isLive: true,
            viewers: stream.viewer_count || 0,
            embedUrl: embed,
          };
      }
    } catch (_) {}
  }

  return { isLive: true, viewers: 0, embedUrl: embed, unknownViewers: true };
}

async function fetchKick(s) {
  const embed = `https://player.kick.com/${s.channelId}?autoplay=false&muted=true`;
  try {
    const r = await fetch(
      `https://kick.com/api/v2/channels/${s.channelId}/livestream`,
    );
    if (r.ok) {
      const d = await r.json();
      if (d.data)
        return {
          isLive: true,
          viewers: d.data.viewer_count || 0,
          embedUrl: embed,
        };
    }
  } catch (_) {}
  return { isLive: false, viewers: 0 };
}

/*
async function fetchKick(s) {
  const embed = `https://player.kick.com/${s.channelId}?autoplay=false&muted=true`;
  try {
    const r = await fetch(`https://kick.com/api/v1/channels/${s.channelId}`);
    if (r.ok) {
      const d = await r.json();
      if (d.livestream)
        return {
          isLive: true,
          viewers: d.livestream.viewer_count || 0,
          embedUrl: embed,
        };
    }
  } catch (_) {}
  return { isLive: false, viewers: 0 };
}
*/

// ─── RENDER ──────────────────────────────────
function renderAll(live, offline) {
  const grid = document.getElementById("streamers-grid");
  const offSec = document.getElementById("offline-section");
  const offGrid = document.getElementById("offline-grid");

  if (live.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📡</div>
        <p class="empty-title">Şu an aktif yayın yok</p>
        <p>Yayıncılar yayına başladığında burada belirecek.</p>
      </div>`;
  } else {
    grid.innerHTML = "";
    live.forEach((s, i) => grid.appendChild(makeCard(s, i, true)));
  }

  if (offline.length > 0) {
    offGrid.innerHTML = "";
    offline.forEach((s, i) => offGrid.appendChild(makeCard(s, i, false)));
    offSec.classList.remove("hidden");
  } else {
    offSec.classList.add("hidden");
  }

  document.getElementById("status-count").textContent = live.length;
}

function makeCard(s, index, isLive) {
  const card = document.createElement("div");
  card.className = `streamer-card ${isLive ? "live" : "offline"} platform-${s.platform}`;
  card.style.animationDelay = `${index * 55}ms`;

  const avatarHtml = s.avatar
    ? `<img class="avatar-img" src="${esc(s.avatar)}" alt="${esc(s.channelName)}" />`
    : `<div class="avatar-placeholder">${esc(s.channelName[0].toUpperCase())}</div>`;

  const viewerHtml = s.unknownViewers
    ? `<span class="viewers-unknown">— izleyici</span>`
    : `<span class="viewers-count">${fmtV(s.viewers)}</span><span class="viewers-label"> izleyici</span>`;

  card.innerHTML = `
    <div class="card-header">
      <div class="card-meta-left">
        ${avatarHtml}
        <div class="card-names">
          <div class="channel-name">${esc(s.channelName)}</div>
          <div class="character-name">
            ${esc(s.character)}
            ${s.role ? `<span class="role-tag">${esc(s.role)}</span>` : ""}
          </div>
        </div>
      </div>
      <div class="card-meta-right">
        <a href="${esc(s.profileUrl)}" target="_blank" rel="noopener"
           class="platform-link platform-${s.platform}">
          ${platformIcon(s.platform)}
          <span>${capFirst(s.platform)}</span>
        </a>
        ${
          isLive
            ? `
          <div class="live-indicator"><span class="live-dot-sm"></span> Canlı</div>
        `
            : `<div class="offline-badge">Çevrimdışı</div>`
        }
      </div>
    </div>
    ${
      isLive && s.embedUrl
        ? `
      <div class="embed-wrapper">
        <iframe src="${esc(s.embedUrl)}" frameborder="0" allowfullscreen
          scrolling="no" allow="autoplay; fullscreen" loading="lazy"></iframe>
      </div>`
        : ""
    }
    ${
      !isLive
        ? `
      <div class="offline-card-body">
        <a href="${esc(s.profileUrl)}" target="_blank" rel="noopener"
           class="visit-channel-btn">Kanala git →</a>
      </div>`
        : ""
    }
  `;

  return card;
}

// ─── NAV ─────────────────────────────────────
function updateNav(count) {
  const badge = document.getElementById("live-count-badge");
  document.getElementById("live-count-text").textContent = `${count} canlı`;
  count > 0 ? badge.classList.remove("hidden") : badge.classList.add("hidden");
}

// ─── COUNTDOWN ───────────────────────────────
function resetCountdown() {
  clearInterval(countdownInterval);
  countdownValue = 60;
  const el = document.getElementById("countdown");
  if (el) el.textContent = 60;
  countdownInterval = setInterval(() => {
    countdownValue--;
    if (el) el.textContent = countdownValue;
    if (countdownValue <= 0) {
      countdownValue = 60;
      if (el) el.textContent = 60;
    }
  }, 1000);
}

// ─── MODAL ───────────────────────────────────
document.getElementById("report-btn").addEventListener("click", () => {
  const m = document.getElementById("report-modal");
  m.classList.remove("hidden");
  requestAnimationFrame(() => m.classList.add("show"));
});

document
  .getElementById("modal-close-btn")
  .addEventListener("click", closeModal);
document.getElementById("report-modal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

function closeModal() {
  const m = document.getElementById("report-modal");
  m.classList.remove("show");
  setTimeout(() => m.classList.add("hidden"), 240);
}

function submitForm(e) {
  e.preventDefault();
  const name = document.getElementById("f-name").value.trim();
  const surname = document.getElementById("f-surname").value.trim();
  const email = document.getElementById("f-email").value.trim();
  const note = document.getElementById("f-note").value.trim();

  const subject = encodeURIComponent(`KNGL RP – Bildirim (${name} ${surname})`);
  const body = encodeURIComponent(
    `Gönderen: ${name} ${surname}\nE-posta: ${email}\n\nMesaj:\n${note}`,
  );
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  document.getElementById("report-form").classList.add("hidden");
  document.getElementById("form-success").classList.remove("hidden");
  setTimeout(closeModal, 2600);
}

// ─── HELPERS ─────────────────────────────────
function fmtV(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + "K" : String(n);
}
function capFirst(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function platformIcon(p) {
  const icons = {
    twitch: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>`,
    youtube: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>`,
    kick: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M4 2h4v8l5-8h4.5L12 12l5.5 10H13l-5-8v8H4V2z"/></svg>`,
  };
  return icons[p] || "";
}

// ─── Twitch API (opsiyonel) ───────────────────
const TWITCH_CLIENT_ID = "";
const TWITCH_TOKEN = "";
