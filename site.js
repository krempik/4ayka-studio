// 4ayka Studio — shared site behaviour.
// Loaded synchronously from <head> by every page so the theme is applied
// before the first paint. Everything wires up on DOMContentLoaded and every
// block bails out when its elements are missing, so the script is safe on
// index, blog, game pages and the PC simulator alike.
(function () {
    'use strict';

    var THEME_KEY = '4ayka_theme';
    var root = document.documentElement;
    var scriptEl = document.currentScript;
    var SITE_ROOT = scriptEl
        ? scriptEl.src.replace(/site\.js(?:\?.*)?$/, '')
        : new URL('.', location.href).href;

    // --------------------------------- theme ---------------------------------
    var light = resolveTheme();

    function resolveTheme() {
        var stored = null;
        try {
            stored = localStorage.getItem(THEME_KEY);
        } catch (e) {
            console.warn('theme: storage unavailable', e);
        }
        if (stored) return stored === 'light';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    }

    function paintTheme() {
        var btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.textContent = light ? '\u2600' : '\u263D';
        btn.setAttribute('aria-pressed', String(light));
    }

    function setTheme(next) {
        light = !!next;
        root.classList.toggle('light', light);
        try {
            localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
        } catch (e) {
            console.warn('theme: persist failed', e);
        }
        paintTheme();
    }

    root.classList.toggle('light', light);

    // Theme changes made in another tab are picked up here: the storage event
    // never fires in the tab that wrote the value, so every tab toggles itself.
    window.addEventListener('storage', function (e) {
        if (e.key !== THEME_KEY || e.newValue === null) return;
        light = e.newValue === 'light';
        root.classList.toggle('light', light);
        paintTheme();
    });

    // ---------------------------------- nav ----------------------------------
    function wireNav() {
        var nav = document.getElementById('nav');
        if (!nav) return;
        var burger = document.getElementById('burger');
        var links = document.getElementById('nav-links');
        var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
        var linkEls = Array.prototype.slice.call(nav.querySelectorAll('.nav-links a'));

        function onScroll() {
            nav.classList.toggle('scrolled', window.scrollY > 40);
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();

        // Highlight the current section — only for same-page anchors (#foo).
        var anchors = linkEls.filter(function (l) {
            return l.getAttribute('href').charAt(0) === '#';
        });
        if (anchors.length && sections.length) {
            window.addEventListener('scroll', function () {
                var probe = window.scrollY + 140;
                var current = '';
                sections.forEach(function (s) {
                    if (probe >= s.offsetTop) current = s.id;
                });
                anchors.forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + current);
                });
            }, { passive: true });
        }

        if (!burger || !links) return;

        function setOpen(open) {
            links.classList.toggle('active', open);
            burger.setAttribute('aria-expanded', String(open));
        }
        burger.addEventListener('click', function () {
            setOpen(!links.classList.contains('active'));
        });
        links.addEventListener('click', function (e) {
            if (e.target && e.target.closest && e.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') setOpen(false);
        });
        document.addEventListener('click', function (e) {
            if (e.target && !nav.contains(e.target)) setOpen(false);
        });
    }

    // ------------------------------- space canvas ----------------------------
    // Decor only: parallax starfield. DPR-aware, pauses when the tab is hidden
    // and is skipped entirely under prefers-reduced-motion.
    function wireSpace() {
        var canvas = document.getElementById('space');
        if (!canvas) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var ctx = canvas.getContext('2d');
        if (!ctx) return;

        var W = 0, H = 0, dpr = 1;
        var stars = [];
        var MAX_STARS = 130;
        var running = true;

        function spawn() {
            return {
                x: Math.random() * W,
                y: Math.random() * H,
                r: Math.random() * 1.5 + 0.3,
                v: Math.random() * 0.35 + 0.08,
                hue: Math.random() < 0.18 ? 1 : 0
            };
        }

        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            W = window.innerWidth;
            H = window.innerHeight;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            stars = Array(MAX_STARS).fill(0).map(spawn);
        }

        function draw() {
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

        window.addEventListener('resize', resize);
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                running = false;
            } else if (!running) {
                running = true;
                requestAnimationFrame(draw);
            }
        });

        resize();
        requestAnimationFrame(draw);
    }

    // --------------------------------- versions -------------------------------
    // Live release version from each repo's VERSION file (raw GitHub is always
    // served, unlike the /api/version endpoints behind a running server). On
    // failure the hardcoded span text stays as the offline fallback.
    function wireVersions() {
        var map = {
            'version-slingor': 'https://raw.githubusercontent.com/krempik/slingor/main/VERSION',
            'version-tblocks': 'https://raw.githubusercontent.com/krempik/tblocks/main/VERSION',
            'version-messenger': 'https://raw.githubusercontent.com/krempik/messenger/main/VERSION',
            'version-dungeon': 'https://raw.githubusercontent.com/krempik/dungeon/main/VERSION'
        };
        Object.keys(map).forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            fetch(map[id])
                .then(function (r) {
                    if (!r.ok) throw new Error('HTTP ' + r.status);
                    return r.text();
                })
                .then(function (text) {
                    var v = text.trim();
                    if (v) el.textContent = 'v' + v;
                })
                .catch(function (e) {
                    console.warn('version fallback for ' + id, e);
                });
        });
    }

    // ----------------------------------- clock --------------------------------
    function wireClock() {
        var el = document.getElementById('clock');
        if (!el) return;
        function tick() {
            el.textContent = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            setTimeout(tick, 30000);
        }
        tick();
    }

    // -------------------------------- service worker --------------------------
    // Registered at the site root (computed from this script's own URL) so one
    // worker covers /, /blog/ and /games/ alike. Network-first for HTML keeps
    // GitHub Pages deploys from going stale.
    function wireServiceWorker() {
        if (!('serviceWorker' in navigator)) return;
        if (location.protocol !== 'https:' && location.protocol !== 'http:') return;
        window.addEventListener('load', function () {
            navigator.serviceWorker.register(SITE_ROOT + 'sw.js')
                .catch(function (e) {
                    console.warn('service worker registration failed', e);
                });
        });
    }

    // ---------------------------------- start ---------------------------------
    function init() {
        paintTheme();
        var btn = document.getElementById('theme-toggle');
        if (btn) {
            btn.addEventListener('click', function () {
                setTheme(!light);
            });
        }
        wireNav();
        wireSpace();
        wireVersions();
        wireClock();
        wireServiceWorker();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.Site4 = {
        setTheme: setTheme,
        toggleTheme: function () { setTheme(!light); },
        isLight: function () { return light; },
        root: SITE_ROOT
    };
})();
