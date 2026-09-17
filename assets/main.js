/* TECHIE HESHAN v3 — shared site JS. Home features are guarded. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(hover:none),(pointer:coarse)').matches;

  /* ---------- BOOT SEQUENCE ---------- */
  var boot = document.getElementById('boot');
  if (boot) {
    setTimeout(function () { boot.classList.add('done'); }, reduced ? 200 : 1900);
  }

  /* ---------- FOOTER YEAR ---------- */
  var yr = document.getElementById('yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- CUSTOM CURSOR ---------- */
  if (!coarse && !reduced) {
    var cur = document.createElement('div'); cur.className = 'cur';
    var dot = document.createElement('div'); dot.className = 'cur-dot';
    document.body.appendChild(cur); document.body.appendChild(dot);
    var mx = window.innerWidth / 2, my = window.innerHeight / 2, cx = mx, cy = my;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
    });
    (function anim() {
      cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18;
      cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
      requestAnimationFrame(anim);
    })();
    var hoverSel = 'a,button,input,textarea,.card,.brow,.buy-btn,.svc-row,.stat-card,.proc-step,.video-ph';
    document.querySelectorAll(hoverSel).forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { cur.classList.remove('hover'); });
    });
    window.addEventListener('mouseleave', function () { cur.style.opacity = '0'; dot.style.opacity = '0'; });
    window.addEventListener('mouseenter', function () { cur.style.opacity = ''; dot.style.opacity = ''; });
  }

  /* ---------- MOBILE NAV ---------- */
  var burger = document.getElementById('burger');
  var navLinks = document.getElementById('navLinks');
  if (burger && navLinks) {
    burger.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- NAV HIDE ON SCROLL + PROGRESS BAR ---------- */
  var navEl = document.querySelector('nav');
  var prog = document.createElement('div'); prog.className = 'progress';
  document.body.appendChild(prog);
  var lastY = 0;
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    prog.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    if (navEl) {
      navEl.classList.toggle('scrolled', y > 40);
      if (y > 220 && y > lastY) navEl.classList.add('up');
      else navEl.classList.remove('up');
    }
    lastY = y;
  }, { passive: true });

  /* ---------- REVEAL ON SCROLL ---------- */
  var els = document.querySelectorAll('.reveal');
  if (els.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      els.forEach(function (e) { io.observe(e); });
    } else {
      els.forEach(function (e) { e.classList.add('in'); });
    }
  }

  /* ---------- SPOTLIGHT CARDS ---------- */
  if (!reduced) {
    document.querySelectorAll('.card').forEach(function (c) {
      c.addEventListener('mousemove', function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty('--cx', (e.clientX - r.left) + 'px');
        c.style.setProperty('--cy', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  if (!reduced && !coarse) {
    document.querySelectorAll('.magnetic').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + dx * 0.18 + 'px,' + dy * 0.18 + 'px)';
      });
      btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
    });
  }

  /* ---------- HERO SPOTLIGHT MASK ---------- */
  var heroBg = document.querySelector('.hero-bg');
  if (heroBg && !reduced && !coarse) {
    var hero = document.querySelector('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      heroBg.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
      heroBg.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
    });
  }

  /* ---------- NFC MORSE: H × 3 ----------
     The first touch anywhere on the contact profile is deliberately captured
     as the hidden brand-signature activation. Later touches work normally. */
  var morseStatus = document.getElementById('morseStatus');
  var morseSurface = document.querySelector('[data-morse-surface]');
  var morseReplay = document.getElementById('morseReplay');
  if (morseStatus && !reduced) {
    var morseStarted = false;
    var playH = function (replay) {
      if (morseStarted && !replay) return;
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) { morseStatus.lastChild.nodeValue = 'Morse unavailable on this browser'; return; }
      var ctx = new AudioCtx();
      var begin = function () {
        if (morseStarted && !replay) return;
        morseStarted = true;
        var t = ctx.currentTime + 0.08;
        for (var letter = 0; letter < 3; letter++) {
          for (var dot = 0; dot < 4; dot++) {
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            var at = t + (letter * 1.18) + (dot * 0.19);
            osc.type = 'sine'; osc.frequency.value = 720;
            gain.gain.setValueAtTime(0.0001, at);
            gain.gain.exponentialRampToValueAtTime(0.42, at + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.15);
            osc.connect(gain); gain.connect(ctx.destination);
            osc.start(at); osc.stop(at + 0.17);
          }
        }
        morseStatus.lastChild.nodeValue = 'H · H · H transmitted';
        if (morseReplay) setTimeout(function () { morseReplay.hidden = false; }, 3300);
      };
      /* Scheduling before resume keeps the audio within the tap gesture. */
      begin();
      ctx.resume().catch(function () {
        morseStatus.lastChild.nodeValue = 'Sound will begin with your next touch';
      });
    };
    if (morseSurface) {
      morseSurface.addEventListener('click', function (event) {
        if (morseStarted) return;
        /* First tap is consumed, even if it landed on a social link. */
        event.preventDefault();
        event.stopImmediatePropagation();
        playH(false);
      }, { capture: true });
    }
    if (morseReplay) morseReplay.addEventListener('click', function () { playH(true); });
  }

  /* ---------- STAT COUNTUP ---------- */
  document.querySelectorAll('[data-count]').forEach(function (n) {
    var target = parseFloat(n.getAttribute('data-count'));
    var suffix = n.getAttribute('data-suffix') || '';
    var seen = false;
    var render = function (v) {
      var out = Number.isInteger(target) ? Math.round(v).toLocaleString() : v.toFixed(1);
      n.textContent = out + suffix;
    };
    if (reduced) { render(target); return; }
    var run = function () {
      if (seen) return; seen = true;
      var start = performance.now(), dur = 1400;
      (function step(t) {
        var p = Math.min((t - start) / dur, 1);
        var e = 1 - Math.pow(1 - p, 3);
        render(target * e);
        if (p < 1) requestAnimationFrame(step);
      })(start);
    };
    if ('IntersectionObserver' in window) {
      var so = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { run(); so.unobserve(n); } });
      }, { threshold: 0.4 });
      so.observe(n);
    } else run();
  });

  /* ---------- TOC SCROLL-SPY ---------- */
  var tocLinks = document.querySelectorAll('.toc-box a[href^="#"]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    tocLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var t = document.getElementById(id);
      if (t) map[id] = a;
    });
    var to = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var link = map[en.target.id];
        if (!link) return;
        if (en.isIntersecting) {
          tocLinks.forEach(function (l) { l.classList.remove('on'); });
          link.classList.add('on');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) {
      var t = document.getElementById(id); if (t) to.observe(t);
    });
  }

  /* ---------- COPY CODE ---------- */
  var copyText = function (txt, btn) {
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'COPIED';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(txt).then(done);
    } else {
      var ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) {}
      document.body.removeChild(ta);
    }
  };
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var win = btn.closest('.code-win');
      var code = win ? win.querySelector('pre') : null;
      if (code) copyText(code.textContent, btn);
    });
  });

  /* ---------- NEWSLETTER (demo) ---------- */
  var nlBtn = document.getElementById('nlBtn');
  if (nlBtn) {
    var input = document.getElementById('nlEmail');
    var note = document.getElementById('nlNote');
    nlBtn.addEventListener('click', function () {
      var v = input.value.trim();
      if (!v || v.indexOf('@') < 1) {
        note.textContent = 'Enter a valid email to subscribe';
        input.focus();
        return;
      }
      note.textContent = 'You\u2019re on the list \u2014 first issue lands this week (demo)';
      input.value = '';
    });
  }

  /* ---------- COMMENTS (client-side demo) ----------
     Persists to localStorage. Swap for Giscus / Utterances / Cusdis
     for real cross-device comments. */
  var cList = document.getElementById('cList');
  var cForm = document.getElementById('cForm');
  var cCount = document.getElementById('cCount');
  if (cList && cForm) {
    var key = 'th_comments_' + location.pathname;
    var render = function () {
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
      cList.innerHTML = '';
      if (!arr.length) {
        cList.innerHTML = '<div class="c-empty">No comments yet \u2014 be the first.</div>';
      } else {
        arr.forEach(function (c) {
          var el = document.createElement('div');
          el.className = 'c-item';
          var initial = (c.name || '?').trim().charAt(0).toUpperCase();
          el.innerHTML =
            '<div class="c-avatar">' + initial + '</div>' +
            '<div class="c-body">' +
              '<b>' + escapeHtml(c.name) + '</b>' +
              '<time>' + new Date(c.t).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + '</time>' +
              '<p>' + escapeHtml(c.msg) + '</p>' +
            '</div>';
          cList.appendChild(el);
        });
      }
      if (cCount) cCount.textContent = arr.length + (arr.length === 1 ? ' comment' : ' comments');
    };
    var escapeHtml = function (s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
      });
    };
    cForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = cForm.querySelector('[name=name]').value.trim();
      var msg = cForm.querySelector('[name=msg]').value.trim();
      if (!name || !msg) return;
      var arr = [];
      try { arr = JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) {}
      arr.unshift({ name: name.slice(0, 40), msg: msg.slice(0, 900), t: Date.now() });
      try { localStorage.setItem(key, JSON.stringify(arr.slice(0, 50))); } catch (e) {}
      cForm.querySelector('[name=msg]').value = '';
      render();
    });
    render();
  }

  /* ---------- BLINK SIMULATOR (home) ---------- */
  var runBtn = document.getElementById('runBtn');
  if (runBtn) {
    var lamp = document.getElementById('ledLamp');
    var box = document.getElementById('serialBox');
    var wire = document.getElementById('simWire');
    var running = false, timer = null, on = false, t = 0;
    var srl = function (msg, hot) {
      var d = document.createElement('div');
      d.className = 'line' + (hot ? ' hot' : '');
      var stamp = (t / 1000).toFixed(1); while (stamp.length < 5) stamp = '0' + stamp;
      d.innerHTML = '<b>' + stamp + 's</b>' + msg;
      box.appendChild(d);
      while (box.querySelectorAll('.line').length > 10) box.querySelectorAll('.line')[0].remove();
      box.scrollTop = box.scrollHeight;
    };
    runBtn.addEventListener('click', function () {
      if (running) {
        running = false; clearInterval(timer);
        lamp.classList.remove('on'); if (wire) wire.classList.remove('hot');
        box.classList.remove('live'); runBtn.classList.remove('stop');
        runBtn.innerHTML = '&#9654; RUN'; srl('Sketch halted.', true);
        return;
      }
      running = true; t = 0; on = false;
      box.classList.add('live'); runBtn.classList.add('stop');
      runBtn.innerHTML = '&#9632; STOP';
      box.querySelectorAll('.line').forEach(function (l) { l.remove(); });
      srl('Compiling blink.ino \u2026');
      srl('Upload complete \u2192 ESP32 @ GPIO 2', true);
      timer = setInterval(function () {
        t += 600; on = !on;
        lamp.classList.toggle('on', on);
        if (wire) wire.classList.toggle('hot', on);
        srl('LED ' + (on ? 'ON' : 'OFF'));
      }, 600);
    });
  }

  /* ---------- 3D BOARD (home) ---------- */
  var host = document.getElementById('board3d');
  if (host) {
    if (!window.THREE) { host.classList.add('fail'); return; }
    try {
      var W = host.clientWidth, H = host.clientHeight;
      var scene = new THREE.Scene();
      var cam = new THREE.PerspectiveCamera(38, W / H, 0.1, 100);
      cam.position.set(0, 2.5, 4.6); cam.lookAt(0, 0, 0);
      var ren = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      ren.setSize(W, H);
      host.insertBefore(ren.domElement, host.firstChild);

      scene.add(new THREE.AmbientLight(0xffffff, 0.42));
      var key = new THREE.PointLight(0xffffff, 1.1); key.position.set(3, 4, 4); scene.add(key);
      var fill = new THREE.PointLight(0xffffff, 0.4); fill.position.set(-4, 3, -3); scene.add(fill);

      var g = new THREE.Group(); scene.add(g);
      g.add(new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.12, 2.1),
        new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.55, metalness: 0.3 })));

      var traceM = new THREE.MeshStandardMaterial({ color: 0x8c8c8c, roughness: 0.4, metalness: 0.6 });
      for (var i = 0; i < 6; i++) {
        var tr = new THREE.Mesh(new THREE.BoxGeometry(1.1 + Math.random() * 1.2, 0.012, 0.028), traceM);
        tr.position.set(-0.25 + Math.random() * 0.5, 0.067, -0.72 + i * 0.29); g.add(tr);
      }
      var chip = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.09, 0.95),
        new THREE.MeshStandardMaterial({ color: 0xa6a6a6, roughness: 0.22, metalness: 0.95 }));
      chip.position.set(-0.5, 0.105, 0); g.add(chip);
      var ant = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.02, 1.85),
        new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.85 }));
      ant.position.set(-1.3, 0.075, 0); g.add(ant);
      var usb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.12, 0.5),
        new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.28, metalness: 0.9 }));
      usb.position.set(1.42, 0.12, 0); g.add(usb);
      var pinG = new THREE.CylinderGeometry(0.032, 0.032, 0.17, 8);
      var pinM = new THREE.MeshStandardMaterial({ color: 0xc8c8c8, roughness: 0.28, metalness: 0.92 });
      for (var r = 0; r < 2; r++) for (var c = 0; c < 12; c++) {
        var p = new THREE.Mesh(pinG, pinM);
        p.position.set(-1.1 + c * 0.2, 0.12, r === 0 ? -0.92 : 0.92); g.add(p);
      }
      var capM = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.6 });
      for (var k = 0; k < 7; k++) {
        var cpt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.05, 0.06), capM);
        cpt.position.set(0.2 + Math.random() * 0.9, 0.085, -0.6 + Math.random() * 1.2);
        cpt.rotation.y = Math.random() * Math.PI; g.add(cpt);
      }
      var ledM = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.4 });
      var led = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.06, 0.12), ledM);
      led.position.set(0.62, 0.09, -0.52); g.add(led);
      g.rotation.x = 0.14;

      var mx = 0, my = 0, tx = 0, tyy = 0, scrollTilt = 0, targetScroll = 0;
      window.addEventListener('mousemove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5);
        tyy = (e.clientY / window.innerHeight - 0.5);
      }, { passive: true });
      window.addEventListener('scroll', function () {
        targetScroll = Math.min(window.scrollY / window.innerHeight, 1) * 0.6;
      }, { passive: true });

      var t0 = performance.now();
      (function loop(t) {
        var s = (t - t0) / 1000;
        mx += (tx - mx) * 0.03; my += (tyy - my) * 0.03;
        scrollTilt += (targetScroll - scrollTilt) * 0.04;
        g.rotation.y = s * 0.06 + mx * 0.25 + scrollTilt;
        g.rotation.x = 0.14 + my * 0.18 + scrollTilt * 0.2;
        ledM.emissiveIntensity = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(s * 0.8));
        ren.render(scene, cam);
        requestAnimationFrame(loop);
      })(t0);

      window.addEventListener('resize', function () {
        var w2 = host.clientWidth, h2 = host.clientHeight;
        cam.aspect = w2 / h2; cam.updateProjectionMatrix(); ren.setSize(w2, h2);
      });
    } catch (err) { host.classList.add('fail'); }
  }
})();
