// 4ayka Studio — main site scripts

(function initTheme() {
    var isLight = false;
    try { isLight = localStorage.getItem('4ayka_theme') === 'light'; } catch (e) { /* storage off */ }
    if (isLight) document.body.classList.add('light');
})();

// ------------------------------------ NAV ------------------------------------
(function initNav() {
    var nav = document.getElementById('nav');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
    var burger = document.getElementById('burger');
    var navLinks = document.querySelector('.nav-links');
    var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

    window.addEventListener('scroll', function () {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    window.addEventListener('scroll', function () {
        var current = '';
        var probe = window.scrollY + 140;
        sections.forEach(function (s) {
            if (probe >= s.offsetTop) current = s.getAttribute('id');
        });
        links.forEach(function (l) {
            l.classList.toggle('active', l.getAttribute('href') === '#' + current);
        });
    }, { passive: true });

    burger.addEventListener('click', function () {
        navLinks.classList.toggle('active');
    });

    links.forEach(function (l) {
        l.addEventListener('click', function () {
            navLinks.classList.remove('active');
        });
    });
})();

// ------------------------------- SPACE CANVAS --------------------------------
// Decor only: parallax starfield. DPR-aware, pauses when the tab is hidden,
// and honours prefers-reduced-motion via CSS (element hidden).
(function initSpace() {
    var canvas = document.getElementById('space');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');

    var W = 0, H = 0, dpr = 1;
    var stars = [];
    var MAX_STARS = 130;
    var running = true;

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        stars = Array(MAX_STARS).fill(0).map(spawn, true);
    }

    function spawn() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            r: Math.random() * 1.5 + 0.3,
            v: Math.random() * 0.35 + 0.08,
            hue: Math.random() < 0.18 ? 1 : 0
        };
    }

    function draw(ts) {
        if (!running) return;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < stars.length; i++) {
            var s = stars[i];
            s.x -= s.v;
            if (s.x < -2) s.x = W + 2;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, 6.2832);
            ctx.fillStyle = s.hue ? 'rgba(139,92,246,0.85)' : 'rgba(210,220,250,0.55)';
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    function pause() { running = false; }
    function resume() {
        if (!running) { running = true; requestAnimationFrame(draw); }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) pause(); else resume();
    });

    resize();
    requestAnimationFrame(draw);
})();

// --------------------------------- TYPEWRITER --------------------------------
(function initTyper() {
    var el = document.getElementById('typed');
    if (!el) return;
    var phrases = [
        'браузерные игры',
        'мультиплеер на WebSocket',
        'рогалики на Canvas',
        'инструменты для разработки',
        'сервер-авторитативную физику'
    ];
    var pi = 0, ci = 0, deleting = false;

    function tick() {
        var word = phrases[pi];
        el.textContent = word.substring(0, ci);
        if (!deleting) {
            ci++;
            if (ci > word.length) { deleting = true; setTimeout(tick, 2000); return; }
            setTimeout(tick, 70 + Math.random() * 60);
        } else {
            ci--;
            if (ci < 0) { deleting = false; pi = (pi + 1) % phrases.length; ci = 0; setTimeout(tick, 400); return; }
            setTimeout(tick, 26);
        }
    }
    setTimeout(tick, 600);
})();

// ---------------------------------- REVEAL -----------------------------------
(function initReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
        Array.prototype.forEach.call(els, function (el) { el.classList.add('revealed'); });
        return;
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    Array.prototype.forEach.call(els, function (el) { io.observe(el); });
})();

// ---------------------------------- COUNTERS ---------------------------------
(function initCounters() {
    var nums = document.querySelectorAll('.stat-number');
    if (!('IntersectionObserver' in window) || !nums.length) return;
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            var target = parseInt(el.getAttribute('data-target'), 10) || 0;
            var start = null;
            io.unobserve(el);
            function step(ts) {
                if (start === null) start = ts;
                var p = Math.min((ts - start) / 1400, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                el.textContent = Math.round(target * eased);
                if (p < 1) requestAnimationFrame(step);
                else el.textContent = target;
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
})();

// ------------------------------------ THEME ----------------------------------
(function initThemeToggle() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    var isLight = document.body.classList.contains('light');
    btn.textContent = isLight ? '\u2600' : '\u263D';
    btn.addEventListener('click', function () {
        isLight = !isLight;
        document.body.classList.toggle('light', isLight);
        btn.textContent = isLight ? '\u2600' : '\u263D';
        try { localStorage.setItem('4ayka_theme', isLight ? 'light' : 'dark'); } catch (e) { /* storage off */ }
    });
})();

// ----------------------------------- FORM ------------------------------------
(function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = form.querySelector('.btn');
        var nick = form.querySelector('#contact-nick').value.trim() || 'Гость';
        var email = form.querySelector('#contact-email').value.trim();
        var message = form.querySelector('#contact-message').value.trim();

        var text = 'Сообщение с сайта 4ayka Studio\n\nОт: ' + nick +
            (email ? '\nEmail: ' + email : '') + '\n\n' + message;
        var url = 'https://t.me/KR0VOSOS?text=' + encodeURIComponent(text);

        btn.textContent = 'Открываю Telegram…';
        btn.disabled = true;
        setTimeout(function () {
            window.open(url, '_blank');
            btn.textContent = 'Готово! Ты молодец :)';
            setTimeout(function () {
                btn.textContent = 'Отправить в Telegram';
                btn.disabled = false;
                form.reset();
            }, 2500);
        }, 400);
    });
})();

// --------------------------------- VERSIONS ----------------------------------
// Pull the real release version from each repo's VERSION file (raw GitHub is
// always served, unlike the /api/version endpoints behind a running server).
// On any failure the hardcoded span text stays as the offline fallback.
(function initVersions() {
    var map = {
        'version-slingor': 'https://raw.githubusercontent.com/krempik/slingor/main/VERSION',
        'version-tblocks': 'https://raw.githubusercontent.com/krempik/tblocks/main/VERSION',
        'version-messenger': 'https://raw.githubusercontent.com/krempik/messenger/main/VERSION',
        'version-dungeon': 'https://raw.githubusercontent.com/krempik/dungeon/main/VERSION'
    };
    Object.keys(map).forEach(function (id) {
        fetch(map[id])
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.text();
            })
            .then(function (text) {
                var v = text.trim();
                var el = document.getElementById(id);
                if (el && v) el.textContent = 'v' + v;
            })
            .catch(function () { /* keep the hardcoded fallback */ });
    });
})();

// ----------------------------------- CLOCK -----------------------------------
(function initClock() {
    var el = document.getElementById('clock');
    if (!el) return;
    function tick() {
        el.textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        setTimeout(tick, 30000);
    }
    tick();
})();