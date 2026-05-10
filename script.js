/* ============================================================
   MOTHERS DAY CARD — script.js
   No frameworks. Pure vanilla JS.
   ============================================================ */

/* ── Utility ── */
const $ = id => document.getElementById(id);
const rand = (min, max) => Math.random() * (max - min) + min;
const randInt = (min, max) => Math.floor(rand(min, max + 1));

/* ============================================================
   PAGE 1 — Setup
   ============================================================ */

/* ── Custom crosshair ── */
const crosshair = $('crosshair');
document.addEventListener('mousemove', e => {
  crosshair.style.left = e.clientX + 'px';
  crosshair.style.top  = e.clientY + 'px';
});

/* ── Ambient falling petals ── */
const petalContainer = $('petals');
const PETAL_COUNT = 18;
for (let i = 0; i < PETAL_COUNT; i++) {
  const p = document.createElement('div');
  p.className = 'petal';
  const size = rand(8, 16);
  p.style.cssText = `
    left: ${rand(0, 100)}%;
    width: ${size}px;
    height: ${size * 1.5}px;
    animation-duration: ${rand(6, 14)}s;
    animation-delay: ${rand(0, 12)}s;
    opacity: 0;
    transform: rotate(${rand(0, 360)}deg);
    background: hsl(${rand(330, 350)}, 80%, ${rand(78, 88)}%);
  `;
  petalContainer.appendChild(p);
}

/* ── Floating hearts & flowers on page 2 ── */
const floatingHeartsEl = $('floating-hearts');
const floatSymbols = ['♥', '♥', '♥', '🌸', '🌷', '🌺', '🌸', '♥', '🌷', '♥'];
const FHEART_COUNT = 28;
for (let i = 0; i < FHEART_COUNT; i++) {
  const h = document.createElement('div');
  h.className = 'fheart';
  h.textContent = floatSymbols[i % floatSymbols.length];
  const size = rand(0.75, 1.9);
  h.style.cssText = `
    left: ${rand(0, 100)}%;
    bottom: ${rand(-10, 10)}%;
    font-size: ${size}rem;
    animation-duration: ${rand(7, 17)}s;
    animation-delay: ${rand(0, 12)}s;
  `;
  floatingHeartsEl.appendChild(h);
}

/* ============================================================
   PARTICLE EXPLOSION
   ============================================================ */
const pCanvas  = $('particle-canvas');
const pCtx     = pCanvas.getContext('2d');
let particles  = [];
let animFrameP = null;

function resizeParticleCanvas() {
  pCanvas.width  = window.innerWidth;
  pCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.vx = rand(-9, 9);
    this.vy = rand(-12, -2);
    this.gravity = 0.28;
    this.alpha = 1;
    this.decay = rand(0.012, 0.024);
    this.size = rand(4, 11);
    /* Hearts or circles */
    this.isHeart = Math.random() > 0.45;
    const hues = [340, 350, 320, 30, 50]; // pink, gold
    this.color = `hsl(${hues[randInt(0, hues.length - 1)]}, 85%, 62%)`;
  }
  update() {
    this.vx *= 0.97;
    this.vy += this.gravity;
    this.x  += this.vx;
    this.y  += this.vy;
    this.alpha -= this.decay;
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle   = this.color;
    if (this.isHeart) {
      drawHeart(ctx, this.x, this.y, this.size);
    } else {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawHeart(ctx, x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.25);
  ctx.bezierCurveTo( s * 0.5, -s * 0.9,  s * 1.1,  s * 0.3, 0,  s * 0.8);
  ctx.bezierCurveTo(-s * 1.1,  s * 0.3, -s * 0.5, -s * 0.9, 0, -s * 0.25);
  ctx.fill();
  ctx.restore();
}

function spawnParticles(x, y) {
  for (let i = 0; i < 90; i++) {
    particles.push(new Particle(x, y));
  }
}

function animateParticles() {
  pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
  particles = particles.filter(p => p.alpha > 0);
  particles.forEach(p => { p.update(); p.draw(pCtx); });
  if (particles.length > 0) {
    animFrameP = requestAnimationFrame(animateParticles);
  }
}

/* ============================================================
   CONFETTI
   ============================================================ */
const cCanvas  = $('confetti-canvas');
const cCtx     = cCanvas.getContext('2d');
let confettis  = [];
let animFrameC = null;

function resizeConfettiCanvas() {
  cCanvas.width  = window.innerWidth;
  cCanvas.height = window.innerHeight;
}
resizeConfettiCanvas();
window.addEventListener('resize', resizeConfettiCanvas);

class Confetto {
  constructor() {
    this.reset();
    this.y = rand(-50, -10); // start above screen
  }
  reset() {
    this.x = rand(0, window.innerWidth);
    this.y = rand(-80, -10);
    this.w = rand(6, 12);
    this.h = rand(4, 8);
    this.vx = rand(-2, 2);
    this.vy = rand(2.5, 5.5);
    this.rot = rand(0, Math.PI * 2);
    this.rotV = rand(-0.08, 0.08);
    this.alpha = 1;
    const c = ['#ffd6e7','#d4af37','#f0d87a','#ffadd0','#e8729a','#b5ead7','#c7ceea'];
    this.color = c[randInt(0, c.length - 1)];
  }
  update() {
    this.x   += this.vx;
    this.y   += this.vy;
    this.rot += this.rotV;
    if (this.y > window.innerHeight + 20) this.reset();
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

function startConfetti(count = 120) {
  confettis = [];
  for (let i = 0; i < count; i++) confettis.push(new Confetto());
  animConfetti();
}

function animConfetti() {
  cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
  confettis.forEach(c => { c.update(); c.draw(cCtx); });
  animFrameC = requestAnimationFrame(animConfetti);
}

function stopConfetti(delay = 3500) {
  setTimeout(() => {
    cancelAnimationFrame(animFrameC);
    cCtx.clearRect(0, 0, cCanvas.width, cCanvas.height);
  }, delay);
}

/* ============================================================
   BALLOONS
   ============================================================ */
const balloonColors = [
  '#ffd6e7','#ffadd0','#d4af37','#f0d87a',
  '#b5ead7','#c7ceea','#ffdac1','#ff9aa2'
];

function launchBalloons(count = 10) {
  const container = $('balloons');
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const b = document.createElement('div');
      b.className = 'balloon';
      const color = balloonColors[randInt(0, balloonColors.length - 1)];
      const dur   = rand(3.5, 6.5);
      const left  = rand(2, 90);
      b.style.cssText = `left: ${left}%; animation-duration: ${dur}s; animation-delay: 0s;`;
      b.innerHTML = `
        <div class="balloon-body" style="background:${color};"></div>
        <div class="balloon-knot" style="background:${color};"></div>
        <div class="balloon-string"></div>
      `;
      container.appendChild(b);
      /* Remove after animation ends */
      b.addEventListener('animationend', () => b.remove());
    }, i * 180);
  }
}

/* ============================================================
   MUSIC — Scheduled melody + harmony + bass, loops forever
   ============================================================ */
const musicBtn = $('music-btn');
let musicPlaying = false;
let audioCtx = null;
let masterGain = null;
let melodyTimeout = null;
let stopRequested = false;

/* Note frequencies (Hz) */
const NOTE = {
  C4:261.63, D4:293.66, E4:329.63, F4:349.23,
  G4:392.00, A4:440.00, B4:493.88,
  C5:523.25, D5:587.33, E5:659.25, F5:698.46,
  G5:783.99, A5:880.00,
  C3:130.81, G3:196.00, A3:220.00, F3:174.61, E3:164.81
};

/*  Gentle waltz-style melody — "Lullaby feel"
    Each entry: [noteKey, durationSecs]          */
const MELODY = [
  ['E5',0.5],['D5',0.5],['C5',0.5],
  ['E5',0.5],['G5',1.0],
  ['A5',0.5],['G5',0.5],['F5',0.5],
  ['E5',1.5],
  ['D5',0.5],['E5',0.5],['F5',0.5],
  ['G5',1.0],['E5',0.5],
  ['F5',0.5],['E5',0.5],['D5',0.5],
  ['C5',2.0],
  ['G4',0.5],['A4',0.5],['B4',0.5],
  ['C5',1.0],['E5',0.5],
  ['D5',0.5],['C5',0.5],['B4',0.5],
  ['A4',1.5],
  ['F5',0.5],['E5',0.5],['D5',0.5],
  ['E5',1.0],['C5',0.5],
  ['D5',0.5],['C5',0.5],['B4',0.5],
  ['C5',2.0],
];

/* Chord pads played in parallel (soft, long notes) */
const CHORDS = [
  {notes:['C4','E4','G4'], dur:4},
  {notes:['A3','C4','E4'], dur:4},
  {notes:['F3','A3','C4'], dur:4},
  {notes:['G3','B4','D5'], dur:4},
];

/* Bass line, one note per chord slot */
const BASS = ['C3','A3','F3','G3'];

function initAudio() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
}

/* Play a single note: sine/triangle, with attack+release envelope */
function playNote(freq, startTime, duration, volume, type = 'sine') {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  /* Very slight detune for warmth */
  osc.detune.setValueAtTime(rand(-4, 4), startTime);

  const atk = Math.min(0.06, duration * 0.15);
  const rel = Math.min(0.3, duration * 0.4);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + atk);
  gain.gain.setValueAtTime(volume, startTime + duration - rel);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.05);
}

/* Schedule one full pass of melody + chords + bass */
function scheduleSong(startTime) {
  /* ── Melody ── */
  let t = startTime;
  for (const [key, dur] of MELODY) {
    if (NOTE[key]) playNote(NOTE[key], t, dur * 0.92, 0.22, 'sine');
    t += dur;
  }
  const songDuration = t - startTime;

  /* ── Chord pads (loop to fill song length) ── */
  let ct = startTime;
  let ci = 0;
  while (ct < startTime + songDuration) {
    const chord = CHORDS[ci % CHORDS.length];
    chord.notes.forEach(n => {
      if (NOTE[n]) playNote(NOTE[n], ct, chord.dur, 0.07, 'triangle');
    });
    /* Bass */
    const bassNote = BASS[ci % BASS.length];
    if (NOTE[bassNote]) playNote(NOTE[bassNote], ct, chord.dur * 0.6, 0.12, 'sine');
    ct += chord.dur;
    ci++;
  }

  return songDuration;
}

function startMusic() {
  initAudio();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  stopRequested = false;

  /* Fade master in */
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.9, audioCtx.currentTime + 1.8);

  /* Schedule first pass, then loop */
  function loop(startTime) {
    if (stopRequested) return;
    const dur = scheduleSong(startTime);
    /* Schedule next loop 0.05s before this one ends for seamless repeat */
    const delay = Math.max(0, (startTime + dur - audioCtx.currentTime - 0.05) * 1000);
    melodyTimeout = setTimeout(() => loop(startTime + dur), delay);
  }
  loop(audioCtx.currentTime + 0.1);
}

function stopMusic() {
  stopRequested = true;
  clearTimeout(melodyTimeout);
  if (!masterGain) return;
  masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
  masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
}

musicBtn.addEventListener('click', e => {
  e.stopPropagation();
  if (musicPlaying) {
    stopMusic();
    musicBtn.classList.remove('playing');
    musicBtn.title = 'Play music';
    $('music-icon').textContent = '♪';
  } else {
    startMusic();
    musicBtn.classList.add('playing');
    musicBtn.title = 'Pause music';
    $('music-icon').textContent = '♬';
  }
  musicPlaying = !musicPlaying;
});

/* ============================================================
   HEART SHOOT — Main interaction
   ============================================================ */
const heartTarget  = $('heart-target');
const instruction  = $('instruction');
const revealText   = $('reveal-text');
const page1        = $('page1');
const page2        = $('page2');
const page2Inner   = document.querySelector('.page2-inner');
let   fired        = false;

function fireHeart(clickX, clickY) {
  if (fired) return;
  fired = true;

  /* 1. Crosshair fire animation */
  crosshair.classList.add('fire');
  setTimeout(() => crosshair.classList.remove('fire'), 300);

  /* 2. Hide instruction + heart */
  instruction.classList.add('hidden');
  heartTarget.classList.add('hidden');

  /* 3. Particle explosion at click point */
  spawnParticles(clickX, clickY);
  animateParticles();

  /* 4. Confetti */
  startConfetti(140);
  stopConfetti(4000);

  /* 5. "Happy Mother's Day" text pop */
  setTimeout(() => {
    revealText.classList.add('show');
  }, 200);

  /* 6. Balloons */
  setTimeout(() => launchBalloons(12), 400);

  /* 7. Transition to page 2 after 2.8s */
  setTimeout(transitionToPage2, 2800);
}

function transitionToPage2() {
  page1.classList.add('fade-out');
  page2.classList.add('visible');

  setTimeout(() => {
    page1.style.display = 'none';
    document.body.style.overflow = 'auto'; // allow scroll on page 2
    /* trigger fade-in for content */
    page2Inner.classList.add('fadein');
  }, 900);
}

/* ── Click / tap on heart ── */
heartTarget.addEventListener('click', e => {
  const rect = heartTarget.getBoundingClientRect();
  fireHeart(rect.left + rect.width / 2, rect.top + rect.height / 2);
});
heartTarget.addEventListener('touchend', e => {
  e.preventDefault();
  const t = e.changedTouches[0];
  fireHeart(t.clientX, t.clientY);
}, { passive: false });

/* ── Also allow clicking anywhere (crosshair feel) ── */
document.addEventListener('click', e => {
  if (!fired && e.target !== heartTarget && !heartTarget.contains(e.target)) {
    /* Animate crosshair fire but don't do the full reveal */
    crosshair.classList.add('fire');
    setTimeout(() => crosshair.classList.remove('fire'), 250);
  }
});
