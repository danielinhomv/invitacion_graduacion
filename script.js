/* ============================================================
   INVITACIÓN DIGITAL · PROMOCIÓN
   ------------------------------------------------------------
   Todo lo que normalmente querrás editar está en CONFIG.
   Archivos esperados en la misma carpeta:
     - foto-grupal.jpg      (foto de toda la promoción)
     - foto-individual.jpg  (foto de graduación individual)
     - musica.mp3           (música de fondo)
   ============================================================ */
   'use strict';

   const CONFIG = {
       // WhatsApp de la unidad educativa (código de país + número, sin + ni espacios)
       whatsapp: '59168881147',
   
       // Datos de la promoción
       promo: "D'COUSS",
       year: '2026',
       school: 'COL. HNOS. CAVANIS',                // texto de la cinta
       schoolFull: 'Colegio Hnos. Cavanis',// texto del mensaje de WhatsApp
       slogan: 'Juntos estamos siempre unidos por un sueño',
       tutor: '',                                   // ej: 'MARÍA PÉREZ' (si queda vacío se usa un texto general)
   
       // Datos del evento
       weekday: 'Viernes',
       dayNum: '04',
       month: 'Diciembre',
       monthMsg: 'diciembre',                       // mes en minúscula para el mensaje
       time: '20:00 pm',
       venueKind: 'Local de Eventos',
       venueName: 'La Sede',
       venueCity: 'Santa cruz de la sierra',
       mapsUrl: 'https://maps.app.goo.gl/UhP8FCr1KtZ5tcQg8?g_st=aw',                                 // ej: 'https://maps.app.goo.gl/xxxx' (muestra el botón "Cómo llegar")
   
       maxGuests: 8,
   
       // La música empieza en este segundo (y vuelve a él cuando se repite)
       musicStart: 19,
   };
   
   /* ------------------------------------------------------------
      Utilidades
      ------------------------------------------------------------ */
   const $ = (s, r = document) => r.querySelector(s);
   const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
   const rnd = (a, b) => a + Math.random() * (b - a);
   const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
   const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
   
   const stage = $('#stage');
   const scenes = $$('.scene');
   const TOTAL = scenes.length;
   
   // Duración (ms) de cada escena. La última se queda fija (formulario).
   const DURATIONS = [5600, 4800, 7600, 8000, 8000, 9000, 0];
   
   let current = 0;
   let opened = false;
   let segs = [];
   
   /* ------------------------------------------------------------
      Textos desde CONFIG
      ------------------------------------------------------------ */
   function applyConfig() {
       $$('[data-bind]').forEach(el => { el.textContent = CONFIG[el.dataset.bind] ?? ''; });
   
       const letter = (CONFIG.promo.match(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/) || ['D'])[0].toUpperCase();
       $('#sealLetter').textContent = letter;
   
       document.title = `Invitación · Promoción ${CONFIG.promo} ${CONFIG.year}`;
   
       $('#tutorPara').innerHTML = CONFIG.tutor
           ? `Y de manera muy especial, a nuestro(a) tutor(a),<br><strong>${esc(CONFIG.tutor)}</strong>, gracias por acompañarnos, orientarnos y formar parte de esta historia.`
           : 'Y de manera muy especial, a quienes nos acompañaron, nos orientaron y formaron parte de esta historia.';
   
       if (CONFIG.mapsUrl) {
           const a = $('#mapsBtn');
           a.href = CONFIG.mapsUrl;
           a.hidden = false;
       }
   }
   
   /* Reduce el tamaño de letra de los textos con data-fit hasta que quepan */
   function fitAll() {
       $$('[data-fit]').forEach(el => {
           el.style.fontSize = '';
           let fs = parseFloat(getComputedStyle(el).fontSize);
           let guard = 0;
           while (el.scrollWidth > el.clientWidth + 1 && fs > 12 && guard++ < 80) {
               fs -= 1;
               el.style.fontSize = fs + 'px';
           }
       });
   }
   
   /* ------------------------------------------------------------
      Globos y serpentinas
      ------------------------------------------------------------ */
   // [lado, desplazamiento lateral, desplazamiento vertical, ancho, tipo, rotación]  (en cqw)
   const BALLOONS = {
       top: [
           ['l', -7, -6, 26, 'maroon', -14], ['l', 9, -9, 23, 'clear', 8], ['l', -5, 12, 21, 'cream', -8],
           ['l', 13, 8, 19, 'pearl', 12], ['l', -9, 28, 17, 'clear', -6],
           ['r', -7, -6, 26, 'cream', 14], ['r', 9, -9, 23, 'maroon', -8], ['r', -5, 12, 21, 'clear', 8],
           ['r', 13, 8, 19, 'maroon', -12], ['r', -9, 28, 17, 'pearl', 6],
       ],
       bottom: [
           ['l', -8, -6, 25, 'cream', -10], ['l', 8, -9, 22, 'maroon', 6], ['l', -5, 12, 21, 'maroon', -6],
           ['l', 10, 14, 18, 'clear', 10],
           ['r', -8, -6, 25, 'maroon', 10], ['r', 8, -9, 22, 'cream', -6], ['r', -5, 12, 21, 'clear', 6],
           ['r', 10, 14, 18, 'pearl', -10],
       ],
   };
   
   function buildBalloons() {
       Object.entries(BALLOONS).forEach(([key, list]) => {
           const host = $('#balloons-' + key);
           list.forEach(([side, x, y, w, type, rot], i) => {
               const b = document.createElement('div');
               b.className = `balloon b-${type}`;
               b.style.setProperty('--w', w);
               b.style.setProperty('--r', rot);
               b.style.setProperty('--d', (-(i * 0.9)).toFixed(1) + 's');
               b.style.setProperty('--t', (5 + (i % 3)).toFixed(1) + 's');
               b.style[side === 'l' ? 'left' : 'right'] = x + 'cqw';
               b.style[key === 'top' ? 'top' : 'bottom'] = y + 'cqw';
               host.appendChild(b);
           });
       });
   }
   
   // [lado, x, largo, amplitud, longitud de onda, color, retraso]
   const STREAMERS = [
       ['l', 5, 78, 4.5, 15, '#f6e9c1', 0], ['l', 13, 108, 3.5, 19, '#c75069', .3],
       ['l', 22, 62, 5, 13, '#fffbee', .15], ['l', 30, 88, 3.5, 17, '#e9d6a0', .45],
       ['r', 5, 84, 4.5, 16, '#e9d6a0', .1], ['r', 13, 64, 5, 14, '#fffbee', .35],
       ['r', 22, 104, 3.5, 20, '#c75069', .2], ['r', 30, 76, 4, 15, '#f6e9c1', .5],
   ];
   
   function buildStreamers() {
       const host = $('#streamers');
       const ns = 'http://www.w3.org/2000/svg';
       STREAMERS.forEach(([side, x, len, amp, wl, color, delay]) => {
           const w = amp * 2 + 3;
           const svg = document.createElementNS(ns, 'svg');
           svg.setAttribute('viewBox', `0 0 ${w} ${len}`);
           svg.classList.add('streamer');
           svg.style.width = w + 'cqw';
           svg.style.height = len + 'cqw';
           svg.style[side === 'l' ? 'left' : 'right'] = x + 'cqw';
           svg.style.setProperty('--d', delay + 's');
           svg.style.setProperty('--t', (4 + Math.random() * 2.5).toFixed(1) + 's');
   
           let d = '';
           for (let y = 0; y <= len; y += 1) {
               const px = w / 2 + amp * Math.sin((y / wl) * Math.PI * 2);
               d += (y === 0 ? 'M' : 'L') + px.toFixed(2) + ' ' + y;
           }
           const main = document.createElementNS(ns, 'path');
           main.setAttribute('d', d);
           main.setAttribute('fill', 'none');
           main.setAttribute('stroke', color);
           main.setAttribute('stroke-width', '1.5');
           main.setAttribute('stroke-linecap', 'round');
           main.setAttribute('opacity', '.92');
   
           const hi = document.createElementNS(ns, 'path');
           hi.setAttribute('d', d);
           hi.setAttribute('fill', 'none');
           hi.setAttribute('stroke', 'rgba(255,255,255,.55)');
           hi.setAttribute('stroke-width', '.35');
           hi.setAttribute('transform', 'translate(.35 0)');
   
           svg.append(main, hi);
           host.appendChild(svg);
       });
   }
   
   /* ------------------------------------------------------------
      Canvas: polvo brillante, bokeh, destellos y confeti
      ------------------------------------------------------------ */
   const cv = $('#fx');
   const ctx = cv.getContext('2d');
   let W = 0, H = 0, DPR = 1;
   let dust = [], bokeh = [], glints = [], confetti = [];
   
   function resizeCanvas() {
       const r = stage.getBoundingClientRect();
       DPR = Math.min(window.devicePixelRatio || 1, 2);
       W = r.width; H = r.height;
       cv.width = Math.round(W * DPR);
       cv.height = Math.round(H * DPR);
       ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
   }
   
   function seedParticles() {
       dust = []; bokeh = [];
       const n = Math.min(160, Math.round((W * H) / 5200));
       for (let i = 0; i < n; i++) {
           dust.push({
               x: rnd(0, W), y: rnd(0, H), r: rnd(.5, 2.1), vx: rnd(-.08, .08), vy: rnd(-.35, -.08),
               ph: rnd(0, 6.28), sp: rnd(.01, .04), a: rnd(.35, 1)
           });
       }
       for (let i = 0; i < 12; i++) {
           bokeh.push({
               x: rnd(0, W), y: rnd(0, H), r: rnd(W * .012, W * .04), vy: rnd(-.25, -.08),
               ph: rnd(0, 6.28), sp: rnd(.004, .012), a: rnd(.05, .14)
           });
       }
   }
   
   function glitterBurst() {
       for (let i = 0; i < 70; i++) {
           glints.push({
               x: rnd(-W * .15, W * .25), y: H * .62 + rnd(-H * .28, H * .28),
               vx: rnd(7, 14), vy: rnd(-5, -1.5), r: rnd(.8, 2.4), life: 0, max: Math.round(rnd(40, 75))
           });
           glints[glints.length - 1].life = glints[glints.length - 1].max;
       }
   }
   
   function confettiBurst(count = 110, x = W / 2, y = H * .7, spread = 1, lean = 0) {
       const colors = ['#7b1e2e', '#c75069', '#f6e9c1', '#fffbee', '#d3bb7f', '#ffffff'];
       for (let i = 0; i < count; i++) {
           const ang = -Math.PI / 2 + lean + rnd(-.9, .9) * spread;
           const sp = rnd(7, 17);
           confetti.push({
               x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: .3,
               w: rnd(5, 9), h: rnd(8, 14), rot: rnd(0, 6.28), vr: rnd(-.25, .25),
               spin: rnd(0, 6.28), c: colors[(Math.random() * colors.length) | 0],
           });
       }
   }
   
   function frame() {
       requestAnimationFrame(frame);
       if (document.hidden || !W) return;
   
       ctx.clearRect(0, 0, W, H);
       ctx.globalCompositeOperation = 'lighter';
   
       for (const b of bokeh) {
           b.y += b.vy; b.ph += b.sp;
           if (b.y < -b.r) { b.y = H + b.r; b.x = rnd(0, W); }
           const a = b.a * (.6 + .4 * Math.sin(b.ph));
           const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
           g.addColorStop(0, `rgba(255,232,180,${a})`);
           g.addColorStop(1, 'rgba(255,232,180,0)');
           ctx.fillStyle = g;
           ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 6.283); ctx.fill();
       }
   
       for (const p of dust) {
           p.x += p.vx + Math.sin(p.ph) * .1;
           p.y += p.vy; p.ph += p.sp;
           if (p.y < -4) { p.y = H + 4; p.x = rnd(0, W); }
           const a = p.a * (.5 + .5 * Math.sin(p.ph * 3));
           ctx.fillStyle = `rgba(255,238,196,${a})`;
           ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
       }
   
       for (let i = glints.length - 1; i >= 0; i--) {
           const g = glints[i];
           g.x += g.vx; g.y += g.vy; g.life--;
           if (g.life <= 0) { glints.splice(i, 1); continue; }
           const a = g.life / g.max;
           ctx.fillStyle = `rgba(255,240,200,${a})`;
           ctx.beginPath(); ctx.arc(g.x, g.y, g.r * a + .3, 0, 6.283); ctx.fill();
       }
   
       ctx.globalCompositeOperation = 'source-over';
       for (let i = confetti.length - 1; i >= 0; i--) {
           const c = confetti[i];
           c.vx *= .985; c.vy += c.g; c.x += c.vx; c.y += c.vy; c.rot += c.vr; c.spin += .15;
           if (c.y > H + 30) { confetti.splice(i, 1); continue; }
           ctx.save();
           ctx.translate(c.x, c.y);
           ctx.rotate(c.rot);
           ctx.scale(1, Math.cos(c.spin));
           ctx.fillStyle = c.c;
           ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
           ctx.restore();
       }
   }
   
   /* ------------------------------------------------------------
      Audio
      ------------------------------------------------------------ */
   const audio = $('#bgm');
   const soundBtn = $('#sound');
   let fadeTimer = null;
   let resumeOnShow = false;
   
   /* La música empieza (y se reinicia al terminar) en CONFIG.musicStart segundos */
   function seekStart() {
       const s = Number(CONFIG.musicStart) || 0;
       if (s <= 0) return;
       const go = () => { if (audio.duration && s < audio.duration) audio.currentTime = s; };
       if (audio.readyState >= 1) go();
       else audio.addEventListener('loadedmetadata', go, { once: true });
   }
   audio.loop = false;
   audio.addEventListener('ended', () => {
       seekStart();
       audio.play().catch(() => { });
   });
   seekStart();
   
   function setSoundUI(on) {
       soundBtn.dataset.on = on ? '1' : '0';
       soundBtn.setAttribute('aria-pressed', String(on));
       soundBtn.setAttribute('aria-label', on ? 'Silenciar música' : 'Activar música');
   }
   
   function fadeTo(v) {
       clearInterval(fadeTimer);
       fadeTimer = setInterval(() => {
           const d = v - audio.volume;
           if (Math.abs(d) < .03) { audio.volume = v; clearInterval(fadeTimer); }
           else audio.volume = Math.min(1, Math.max(0, audio.volume + Math.sign(d) * .03));
       }, 60);
   }
   
   function startAudio() {
       audio.muted = false;
       audio.volume = 0;
       const p = audio.play();
       if (p && p.then) p.then(() => { fadeTo(.75); setSoundUI(true); }).catch(() => setSoundUI(false));
   }
   
   soundBtn.addEventListener('click', () => {
       if (audio.paused) {
           audio.muted = false;
           audio.volume = .75;
           const p = audio.play();
           if (p && p.then) p.then(() => setSoundUI(true)).catch(() => { });
       } else {
           audio.muted = !audio.muted;
           setSoundUI(!audio.muted);
       }
   });
   
   document.addEventListener('visibilitychange', () => {
       if (document.hidden) {
           resumeOnShow = !audio.paused;
           if (resumeOnShow) audio.pause();
       } else if (resumeOnShow) {
           audio.play().catch(() => { });
           resumeOnShow = false;
       }
   });
   
   /* ------------------------------------------------------------
      Escenas, progreso y navegación
      ------------------------------------------------------------ */
   function buildProgress() {
       const wrap = $('#progress');
       wrap.innerHTML = '';
       for (let i = 0; i < TOTAL; i++) {
           const s = document.createElement('span');
           s.className = 'seg';
           s.innerHTML = '<i></i>';
           wrap.appendChild(s);
       }
       segs = $$('.seg', wrap);
       segs.forEach((s, i) => {
           $('i', s).addEventListener('animationend', () => { if (i === current) next(); });
       });
   }
   
   function runProgress(i) {
       const seg = segs[i];
       seg.classList.remove('running');
       seg.style.setProperty('--dur', DURATIONS[i] + 'ms');
       void seg.offsetWidth;
       seg.classList.add('running');
   }
   
   function goTo(i) {
       i = Math.max(0, Math.min(TOTAL - 1, i));
       const prev = current;
       current = i;
       stage.dataset.scene = String(i);
   
       scenes.forEach((sc, idx) => {
           if (idx === i) {
               sc.classList.remove('is-active');
               void sc.offsetWidth;            // reinicia las animaciones de la escena
               sc.classList.add('is-active');
           } else {
               sc.classList.remove('is-active');
           }
       });
   
       segs.forEach((s, idx) => {
           s.classList.remove('running');
           s.classList.toggle('done', idx < i);
       });
   
       if (i === TOTAL - 1) {
           segs[i].classList.add('done');
           celebrate();
       } else if (i > 0 || opened) {
           runProgress(i);
       }
   
       if (prev !== i) glitterBurst();
   }
   
   const next = () => { if (current < TOTAL - 1) goTo(current + 1); };
   const prev = () => { if (current > 0) goTo(current - 1); };
   
   function openEnvelope() {
       if (opened) return;
       opened = true;
       $('#scene-0').classList.add('is-open');
       startAudio();
       confettiBurst(120, W / 2, H * .72, 1);
       setTimeout(() => { if (current === 0) runProgress(0); }, 1400);
   }
   
   function celebrate() {
       confettiBurst(60, W * .1, H * .8, .6, .5);
       confettiBurst(60, W * .9, H * .8, .6, -.5);
   }
   
   /* Toques: izquierda = atrás, derecha = adelante. Mantener presionado = pausa */
   const isInteractive = t => t.closest('button, a, input, select, textarea, label, form');
   let holdTimer = null, held = false, downInteractive = false;
   
   function setPaused(p) { stage.classList.toggle('is-paused', p); }
   
   function handleTap(e) {
       if (!opened) { openEnvelope(); return; }
       const r = stage.getBoundingClientRect();
       const x = (e.clientX - r.left) / r.width;
       if (x < .28) prev(); else next();
   }
   
   stage.addEventListener('pointerdown', e => {
       downInteractive = !!isInteractive(e.target);
       if (downInteractive) return;
       held = false;
       clearTimeout(holdTimer);
       holdTimer = setTimeout(() => { held = true; setPaused(true); }, 260);
   });
   
   function endPress(e) {
       clearTimeout(holdTimer);
       if (downInteractive) { downInteractive = false; return; }
       if (held) { held = false; setPaused(false); return; }
       if (e.type === 'pointerup') handleTap(e);
   }
   stage.addEventListener('pointerup', endPress);
   stage.addEventListener('pointercancel', endPress);
   
   $('#envelope').addEventListener('click', openEnvelope);
   
   document.addEventListener('keydown', e => {
       if (e.target.matches('input, textarea, select')) return;
       if (e.key === 'ArrowRight' || (e.key === ' ' && !isInteractive(e.target))) {
           e.preventDefault();
           if (!opened) openEnvelope(); else next();
       } else if (e.key === 'ArrowLeft') {
           prev();
       }
   });
   
   /* ------------------------------------------------------------
      Confirmación de asistencia → WhatsApp
      ------------------------------------------------------------ */
   const form = $('#rsvp');
   const nameInput = $('#guestName');
   const hint = $('#rsvpHint');
   let guests = 1;
   
   (function prefillName() {
       const p = new URLSearchParams(location.search);
       const inv = p.get('invitado') || p.get('nombre');
       if (inv) nameInput.value = inv.slice(0, 60);
   })();
   
   function renderGuests() { $('#guestCount').textContent = String(guests); }
   $('#guestMinus').addEventListener('click', () => { guests = Math.max(1, guests - 1); renderGuests(); });
   $('#guestPlus').addEventListener('click', () => { guests = Math.min(CONFIG.maxGuests, guests + 1); renderGuests(); });
   
   const attendance = () => $('input[name="asistencia"]:checked').value === 'si';
   
   function syncAttendance() {
       const yes = attendance();
       $('#guestsRow').hidden = !yes;
       $('#waLabel').textContent = yes ? 'Confirmar por WhatsApp' : 'Avisar por WhatsApp';
       hint.textContent = ''; hint.classList.remove('error');
   }
   $$('input[name="asistencia"]').forEach(r => r.addEventListener('change', syncAttendance));
   
   function buildMessage(name, yes, n) {
       const head = `Promoción ${CONFIG.year} ${CONFIG.promo}`;
       if (yes) {
         return [
           `¡Hola! Soy *${name}*.`,
           '',
           `Confirmo mi asistencia a la *${head}* de la ${CONFIG.schoolFull}.`,
           '',
           `*Fecha:* ${CONFIG.weekday} ${Number(CONFIG.dayNum)} de ${CONFIG.monthMsg}`,
           `*Hora:* ${CONFIG.time}`,
           `*Lugar:* ${CONFIG.venueName}, ${CONFIG.venueCity}`,
           `*Total de asistentes:* ${n}`,
           '',
           '¡Gracias por la invitación!',
         ].join('\n');
       }
       return [
         `¡Hola! Soy *${name}*.`,
         '',
         `Lamentablemente no podré asistir a la *${head}* de la ${CONFIG.schoolFull}.`,
         '',
         'Gracias por la invitación y muchas felicidades.',
       ].join('\n');
     }
   
   form.addEventListener('submit', e => {
       e.preventDefault();
       const name = nameInput.value.trim().replace(/\s+/g, ' ');
   
       if (!name) {
           nameInput.classList.remove('error'); void nameInput.offsetWidth;
           nameInput.classList.add('error');
           hint.textContent = 'Escribe tu nombre para continuar.';
           hint.classList.add('error');
           nameInput.focus();
           return;
       }
       nameInput.classList.remove('error');
       hint.classList.remove('error');
   
       const url = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(buildMessage(name, attendance(), guests))}`;
       hint.textContent = 'Abriendo WhatsApp con tu mensaje listo…';
   
       const w = window.open(url, '_blank', 'noopener');
       if (!w) location.href = url;
   });
   
   /* ------------------------------------------------------------
      Inicio
      ------------------------------------------------------------ */
   applyConfig();
   buildProgress();
   buildBalloons();
   buildStreamers();
   syncAttendance();
   renderGuests();
   
   resizeCanvas();
   seedParticles();
   goTo(0);
   fitAll();
   requestAnimationFrame(frame);
   
   if ('ResizeObserver' in window) {
       new ResizeObserver(() => { resizeCanvas(); seedParticles(); fitAll(); }).observe(stage);
   } else {
       window.addEventListener('resize', () => { resizeCanvas(); seedParticles(); fitAll(); });
   }
   if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitAll);