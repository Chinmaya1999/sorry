/* =========================================================
   ✏️  EDIT THIS PART — make it yours!
   ========================================================= */
const CONFIG = {
  herName: "My Love",          // her name or nickname
  myName: "Your Love",         // your name
  letter: [
    "I know I hurt you, and I am so, so sorry.",
    "I was wrong. No excuses — you deserved better from me, and I hate that I made your heart ache.",
    "Seeing you sad is the worst feeling in my world. Your smile is my favourite place to live.",
    "You are patient, you are kind, you are the best thing that ever happened to me.",
    "I don't want to lose you. I want to learn, to listen, and to love you the way you deserve.",
  ],
  promises: [
    "💗 I will listen to you — truly listen.",
    "🌙 I will never take your love for granted.",
    "🌹 I will make you smile every single day.",
    "🤝 I will be better, for you and for us.",
  ],
  thanks: "Thank you, {name} 💖",
  thanksSub: "I promise to spend my whole life making this up to you.\nI love you more than words can say.",
  noTexts: ["No", "Are you sure? 🥺", "Please? 💔", "Think again 😢", "I'm sorry 🥹", "Pretty please 🌹", "Don't do this 😭", "Just say yes! 💖"],
};
/* ========================================================= */

const $ = (s) => document.querySelector(s);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const TAU = Math.PI * 2;
const bg = $("#bg"), fx = $("#fx");
const bctx = bg.getContext("2d"), fctx = fx.getContext("2d");
let W, H, DPR;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  for (const c of [bg, fx]) { c.width = W * DPR; c.height = H * DPR; }
  bctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  fctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  buildHeart();
}
addEventListener("resize", resize);

/* ---------- Background: stars, shooting stars, floating hearts ---------- */
const stars = Array.from({ length: 160 }, () => ({
  x: Math.random(), y: Math.random(), r: Math.random() * 1.4 + .3,
  t: Math.random() * TAU, s: Math.random() * 2 + .5,
}));
const shooters = [];
const floaters = [];

function spawnFloater(x, y, burst) {
  floaters.push({
    x: x ?? Math.random() * W, y: y ?? H + 20,
    vx: burst ? (Math.random() - .5) * 6 : (Math.random() - .5) * .5,
    vy: burst ? -Math.random() * 6 - 1 : -Math.random() * 1 - .4,
    size: Math.random() * 14 + 8, rot: Math.random() * TAU, vr: (Math.random() - .5) * .03,
    a: 1, hue: 330 + Math.random() * 30, g: burst ? .08 : 0,
  });
}
function heartPath(c, s) {
  c.beginPath();
  c.moveTo(0, s * .3);
  c.bezierCurveTo(-s, -s * .4, -s * .5, -s, 0, -s * .4);
  c.bezierCurveTo(s * .5, -s, s, -s * .4, 0, s * .3);
  c.closePath();
}

function drawBg(t) {
  bctx.clearRect(0, 0, W, H);
  for (const s of stars) {
    const a = .4 + .6 * Math.abs(Math.sin(t / 1000 * s.s + s.t));
    bctx.fillStyle = `rgba(255,235,245,${a})`;
    bctx.beginPath(); bctx.arc(s.x * W, s.y * H, s.r, 0, TAU); bctx.fill();
  }
  if (Math.random() < .012) shooters.push({ x: Math.random() * W, y: Math.random() * H * .4, vx: 9 + Math.random() * 5, vy: 4 + Math.random() * 3, life: 1 });
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.x += s.vx; s.y += s.vy; s.life -= .018;
    const g = bctx.createLinearGradient(s.x, s.y, s.x - s.vx * 9, s.y - s.vy * 9);
    g.addColorStop(0, `rgba(255,255,255,${s.life})`); g.addColorStop(1, "rgba(255,150,200,0)");
    bctx.strokeStyle = g; bctx.lineWidth = 2;
    bctx.beginPath(); bctx.moveTo(s.x, s.y); bctx.lineTo(s.x - s.vx * 9, s.y - s.vy * 9); bctx.stroke();
    if (s.life <= 0) shooters.splice(i, 1);
  }
  if (Math.random() < .08 && floaters.length < 70) spawnFloater();
  for (let i = floaters.length - 1; i >= 0; i--) {
    const f = floaters[i];
    f.vy += f.g; f.x += f.vx + Math.sin(t / 700 + f.rot) * .3; f.y += f.vy; f.rot += f.vr;
    if (f.g) f.a -= .008;
    bctx.save(); bctx.translate(f.x, f.y); bctx.rotate(Math.sin(f.rot) * .4);
    bctx.globalAlpha = Math.max(0, Math.min(f.a, .85)) * .8;
    bctx.fillStyle = `hsl(${f.hue},100%,68%)`;
    bctx.shadowColor = `hsl(${f.hue},100%,60%)`; bctx.shadowBlur = 14;
    heartPath(bctx, f.size); bctx.fill(); bctx.restore();
    if (f.y < -40 || f.a <= 0 || f.y > H + 60) floaters.splice(i, 1);
  }
}

/* ---------- Particle heart ---------- */
let targets = [];
const parts = [];
let heartScale = 1, heartCY = .45, heartMode = "idle"; // idle | scatter | off

function buildHeart() {
  const size = Math.min(W, H) * (W < 600 ? .019 : .021);
  targets = [];
  const N = W < 600 ? 700 : 1100;
  for (let i = 0; i < N; i++) {
    const t = Math.random() * TAU;
    const k = Math.sqrt(Math.random()); // fill
    const edge = Math.random() < .55 ? 1 : k;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    targets.push({ x: x * edge * size, y: y * edge * size });
  }
  while (parts.length < targets.length) {
    parts.push({ x: Math.random() * W, y: Math.random() * H, vx: 0, vy: 0, hue: 320 + Math.random() * 40, r: Math.random() * 1.8 + .8, tw: Math.random() * TAU });
  }
  parts.length = targets.length;
}

function drawHeart(t) {
  fctx.clearRect(0, 0, W, H);
  if (heartMode === "off") return;
  const beat = 1 + .06 * Math.pow(Math.max(0, Math.sin(t / 260)), 6) * 3 + .015 * Math.sin(t / 900);
  const cx = W / 2, cy = H * heartCY;
  fctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i], tg = targets[i];
    if (heartMode === "idle") {
      const tx = cx + tg.x * beat * heartScale, ty = cy + tg.y * beat * heartScale;
      p.vx += (tx - p.x) * .012; p.vy += (ty - p.y) * .012;
      p.vx *= .9; p.vy *= .9;
    } else { p.vy += .05; p.vx *= .995; }
    p.x += p.vx; p.y += p.vy;
    const a = .55 + .45 * Math.sin(t / 300 + p.tw);
    fctx.fillStyle = `hsla(${p.hue},100%,65%,${a})`;
    fctx.beginPath(); fctx.arc(p.x, p.y, p.r, 0, TAU); fctx.fill();
  }
  fctx.globalCompositeOperation = "source-over";
}

function explodeHeart(power = 14) {
  heartMode = "scatter";
  for (const p of parts) {
    const a = Math.random() * TAU, v = Math.random() * power;
    p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v - 2;
  }
}
function reformHeart() { heartMode = "idle"; }

/* ---------- Fireworks (for the grand finale) ---------- */
const sparks = [];
function firework(x, y) {
  const hue = 300 + Math.random() * 70, n = 70;
  for (let i = 0; i < n; i++) {
    // heart-shaped burst
    const t = (i / n) * TAU;
    const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    sparks.push({ x, y, vx: hx * .3 * (.7 + Math.random() * .3), vy: hy * .3 * (.7 + Math.random() * .3), life: 1, hue: hue + Math.random() * 30 });
  }
}
function drawSparks() {
  fctx.globalCompositeOperation = "lighter";
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.vy += .05; s.vx *= .985; s.vy *= .985; s.x += s.vx; s.y += s.vy; s.life -= .011;
    fctx.fillStyle = `hsla(${s.hue},100%,65%,${Math.max(s.life, 0)})`;
    fctx.beginPath(); fctx.arc(s.x, s.y, 2.2, 0, TAU); fctx.fill();
    if (s.life <= 0) sparks.splice(i, 1);
  }
  fctx.globalCompositeOperation = "source-over";
}

/* ---------- Main loop ---------- */
function loop(t) {
  drawBg(t); drawHeart(t); drawSparks();
  requestAnimationFrame(loop);
}

/* ---------- Music (soft generated lullaby, no files needed) ---------- */
let ac, master, musicOn = false, musicTimer;
const CHORDS = [
  [57, 60, 64, 69], // Am
  [53, 57, 60, 65], // F
  [48, 52, 55, 60], // C
  [55, 59, 62, 67], // G
];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function note(freq, when, dur, vol, type = "sine") {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(vol, when + .03);
  g.gain.exponentialRampToValueAtTime(.0001, when + dur);
  o.connect(g); g.connect(master); o.start(when); o.stop(when + dur + .05);
}
function startMusic() {
  if (!ac) {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    master = ac.createGain(); master.gain.value = .5;
    const delay = ac.createDelay(); delay.delayTime.value = .38;
    const fb = ac.createGain(); fb.gain.value = .35;
    delay.connect(fb); fb.connect(delay);
    master.connect(ac.destination); master.connect(delay); delay.connect(ac.destination);
  }
  ac.resume(); musicOn = true; $("#mute").textContent = "🔊";
  let bar = 0, next = ac.currentTime + .1;
  clearInterval(musicTimer);
  musicTimer = setInterval(() => {
    while (next < ac.currentTime + .6) {
      const ch = CHORDS[bar % 4], step = .42;
      note(mtof(ch[0] - 12), next, step * 8, .12, "triangle"); // bass pad
      const pat = [0, 1, 2, 3, 2, 1, 2, 3];
      pat.forEach((n, i) => note(mtof(ch[n] + 12), next + i * step, step * 2.2, .09));
      if (bar % 4 === 3) note(mtof(ch[3] + 24), next + step * 6, step * 3, .06);
      next += step * 8; bar++;
    }
  }, 200);
}
function stopMusic() { clearInterval(musicTimer); musicOn = false; $("#mute").textContent = "🔇"; if (ac) ac.suspend(); }
$("#mute").onclick = () => (musicOn ? stopMusic() : startMusic());

/* ---------- Scenes ---------- */
function show(id) {
  document.querySelectorAll(".scene").forEach((s) => s.classList.remove("active"));
  $("#" + id).classList.add("active");
}

async function typeInto(el, text, speed = 32) {
  el.classList.add("cursor");
  for (const ch of text) { el.textContent += ch; await sleep(ch === "," || ch === "." || ch === "—" ? speed * 6 : speed); }
  el.classList.remove("cursor");
}

// Intro
$("#introTitle").textContent = `For you, ${CONFIG.herName} 💗`;
let started = false;
fx.addEventListener("pointerdown", async (e) => {
  if (started) return;
  started = true;
  startMusic();
  explodeHeart(18);
  for (let i = 0; i < 40; i++) spawnFloater(e.clientX, e.clientY, true);
  $(".hint").style.opacity = 0;
  await sleep(900);
  heartMode = "off"; // fade heart away, let the letter shine
  fctx.clearRect(0, 0, W, H);
  show("letter");
  const box = $("#letterBox");
  const hi = document.createElement("p");
  box.appendChild(hi);
  await typeInto(hi, `${CONFIG.herName},`, 60);
  await sleep(500);
  for (const line of CONFIG.letter) {
    const p = document.createElement("p");
    box.appendChild(p);
    await typeInto(p, line);
    box.scrollTop = box.scrollHeight;
    await sleep(700);
  }
  const sig = document.createElement("p");
  box.appendChild(sig);
  await typeInto(sig, `Forever yours, ${CONFIG.myName} 💞`, 50);
  box.scrollTop = box.scrollHeight;
  $("#toPromises").classList.add("show");
});

// Promises
$("#toPromises").onclick = async () => {
  show("promises");
  const ul = $("#cards"); ul.innerHTML = "";
  CONFIG.promises.forEach((txt) => { const li = document.createElement("li"); li.textContent = txt; ul.appendChild(li); });
  await sleep(900);
  for (const li of ul.children) { li.classList.add("in"); for (let i = 0; i < 5; i++) spawnFloater(innerWidth / 2 + (Math.random() - .5) * 200, innerHeight * .6, true); await sleep(1100); }
  $("#toAsk").classList.add("show");
};

// Ask
$("#toAsk").onclick = () => { show("ask"); setTimeout(() => $("#askHint").textContent = "💗", 1200); };

let noCount = 0, yesScale = 1;
const noBtn = $("#no"), yesBtn = $("#yes");
function dodge() {
  noCount++;
  yesScale = Math.min(yesScale + .22, 4.5);
  yesBtn.style.transform = `scale(${yesScale})`;
  yesBtn.style.margin = `0 ${yesScale * 18}px`;
  noBtn.textContent = CONFIG.noTexts[Math.min(noCount, CONFIG.noTexts.length - 1)];
  const r = noBtn.getBoundingClientRect();
  noBtn.classList.add("fly");
  const x = Math.random() * (innerWidth - r.width - 20) + 10;
  const y = Math.random() * (innerHeight - r.height - 20) + 10;
  noBtn.style.left = x + "px"; noBtn.style.top = y + "px";
  $("#askHint").textContent = ["", "Hehe, it ran away 🙈", "The No button is shy 🥺", "Please forgive me… 🌹", "You know you want to 💕"][Math.min(noCount, 4)];
}
noBtn.addEventListener("pointerenter", dodge);
noBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
noBtn.addEventListener("click", (e) => e.preventDefault());

// YES!
yesBtn.onclick = async () => {
  show("done");
  noBtn.style.display = "none";
  heartMode = "scatter"; // reset positions then reform
  parts.forEach((p) => { p.x = innerWidth / 2; p.y = innerHeight / 2; p.vx = (Math.random() - .5) * 30; p.vy = (Math.random() - .5) * 30; });
  heartMode = "idle"; heartCY = .3; heartScale = .75;
  for (let i = 0; i < 80; i++) spawnFloater(Math.random() * W, H + 10, false);
  const burst = () => { firework(Math.random() * W, Math.random() * H * .6 + 40); };
  for (let i = 0; i < 6; i++) setTimeout(burst, i * 350);
  setInterval(burst, 1400);
  setInterval(() => spawnFloater(Math.random() * W, H + 10, false), 120);
  const title = $("#thanks"), sub = $("#thanksSub");
  title.style.marginTop = "28vh";
  title.textContent = ""; sub.textContent = "";
  await typeInto(title, CONFIG.thanks.replace("{name}", CONFIG.herName), 70);
  sub.style.whiteSpace = "pre-line";
  await typeInto(sub, CONFIG.thanksSub, 45);
};

// Tap anywhere on the final scene for more fireworks
fx.addEventListener("pointerdown", (e) => {
  if ($("#done").classList.contains("active")) { firework(e.clientX, e.clientY); for (let i = 0; i < 6; i++) spawnFloater(e.clientX, e.clientY, true); }
});

resize();
requestAnimationFrame(loop);
