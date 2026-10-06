// 4ayka Studio — index page behaviour.
// Theme, navigation, starfield, versions and the clock live in site.js, which
// is loaded on every page. This file is main-page specific.

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
    var nums = document.querySelectorAll('.stat-number[data-target]');
    if (!('IntersectionObserver' in window) || !nums.length) {
        Array.prototype.forEach.call(nums, function (el) {
            el.textContent = el.getAttribute('data-target');
        });
        return;
    }
    function runCount(el, target) {
        var start = null;
        function step(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / 1400, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target;
        }
        requestAnimationFrame(step);
    }
    var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var el = entry.target;
            io.unobserve(el);
            runCount(el, parseInt(el.getAttribute('data-target'), 10) || 0);
        });
    }, { threshold: 0.5 });
    Array.prototype.forEach.call(nums, function (el) { io.observe(el); });
})();

// ------------------------------- LIVE GITHUB STATS ---------------------------
// Pulls real numbers from the GitHub API (public repos, non-forks) and keeps
// them in localStorage for one hour so the unauthenticated rate limit is not
// an issue. On any failure the hardcoded fallback numbers stay in the card.
(function liveGitHubStats() {
    var stats = document.querySelectorAll('[data-live]');
    if (!stats.length) return;
    var reposEl = document.getElementById('stat-projects');
    var starsEl = document.getElementById('stat-stars');

    function apply(repos, stars) {
        if (reposEl && reposEl.getAttribute('data-target')) {
            reposEl.setAttribute('data-target', String(repos));
            reposEl.textContent = repos;
        }
        if (starsEl && starsEl.getAttribute('data-target')) {
            starsEl.setAttribute('data-target', String(stars));
            starsEl.textContent = stars;
        }
    }

    var KEY = '4ayka_github_stats';
    function readCache() {
        try {
            var raw = localStorage.getItem(KEY);
            if (!raw) return null;
            var data = JSON.parse(raw);
            if (!data || Date.now() > data.expires) return null;
            return data;
        } catch (e) {
            console.warn('github stats cache read failed', e);
            return null;
        }
    }
    function storeCache(repos, stars) {
        try {
            localStorage.setItem(KEY, JSON.stringify({
                repos: repos,
                stars: stars,
                expires: Date.now() + 60 * 60 * 1000
            }));
        } catch (e) {
            console.warn('github stats cache write failed', e);
        }
    }

    var cached = readCache();
    if (cached) {
        apply(cached.repos, cached.stars);
        return;
    }

    fetch('https://api.github.com/users/krempik/repos?per_page=100&type=public')
        .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        })
        .then(function (repos) {
            var owned = repos.filter(function (r) { return !r.fork; });
            var stars = owned.reduce(function (sum, r) { return sum + (r.stargazers_count || 0); }, 0);
            apply(owned.length, stars);
            storeCache(owned.length, stars);
        })
        .catch(function (e) {
            console.warn('github stats fallback kept', e);
        });
})();

// ----------------------------------- FORM ------------------------------------
(function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var btn = form.querySelector('.btn');
    var resetBtn = null;
    var fallback = document.getElementById('contact-fallback');
    var fallbackLink = fallback ? fallback.querySelector('a') : null;
    var copyBtn = fallback ? fallback.querySelector('[data-copy]') : null;
    var status = fallback ? fallback.querySelector('[data-status]') : null;
    var NICK = form.querySelector('#contact-nick');
    var EMAIL = form.querySelector('#contact-email');
    var MSG = form.querySelector('#contact-message');

    function buildText() {
        var nick = NICK.value.trim() || 'Гость';
        var email = EMAIL.value.trim();
        var message = MSG.value.trim();
        return 'Сообщение с сайта 4ayka Studio\n\nОт: ' + nick +
            (email ? '\nEmail: ' + email : '') + '\n\n' + message;
    }
    function buildUrl() {
        return 'https://t.me/KR0VOSOS?text=' + encodeURIComponent(buildText());
    }
    function setStatus(text) {
        if (status) status.textContent = text;
    }
    function resetForm() {
        form.reset();
        btn.textContent = 'Отправить в Telegram';
        btn.disabled = false;
        if (fallback) fallback.hidden = true;
        setStatus('');
    }

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        var url = buildUrl();
        btn.textContent = 'Открываю Telegram…';
        btn.disabled = true;

        // A popup blocker may return null — fall back to a visible link and a
        // copy button instead of silently "opening" nothing.
        var opened = null;
        try {
            opened = window.open(url, '_blank', 'noopener');
        } catch (err) {
            console.warn('popup window.open blocked', err);
            opened = null;
        }

        setTimeout(function () {
            if (fallback) {
                if (fallbackLink) fallbackLink.href = url;
                fallback.hidden = false;
            }
            setStatus(opened ? 'Открыл Telegram в новой вкладке.' : 'Всплывающее окно не пропустил браузер — открой вручную.');
            btn.textContent = 'Готово!';
            if (!resetBtn) {
                resetBtn = document.createElement('button');
                resetBtn.type = 'button';
                resetBtn.className = 'btn btn-ghost form-reset';
                resetBtn.textContent = 'Написать ещё';
                resetBtn.addEventListener('click', resetForm);
                form.appendChild(resetBtn);
            }
        }, 700);
    });

    if (copyBtn) {
        copyBtn.addEventListener('click', function () {
            var text = buildText();
            function done() { setStatus('Скопировано в буфер — вставь в любой чат с собой.'); }
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done).catch(function (err) {
                    console.warn('clipboard write failed', err);
                    fallbackCopy(text);
                    done();
                });
            } else {
                fallbackCopy(text);
                done();
            }
        });
    }

    function fallbackCopy(text) {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        try {
            ta.select();
            document.execCommand('copy');
        } catch (e) {
            console.warn('execCommand copy failed', e);
        } finally {
            document.body.removeChild(ta);
        }
    }
})();