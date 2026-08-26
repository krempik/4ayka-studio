// SPLASH SCREEN
(function() {
    const splash = document.getElementById('splash');
    const fill = document.getElementById('splash-fill');
    const splashText = document.getElementById('splash-text');
    if (!splash) return;

    const messages = [
        '[+] Initializing system...',
        '[+] Loading kernel modules...',
        '[+] Compiling shaders...',
        '[+] Spawning matrix rain...',
        '[+] Encrypting connections...',
        '[+] Starting 4ayka OS...',
        '[+] System ready.'
    ];

    let progress = 0;
    let msgIndex = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 18 + 5;
        if (progress > 100) progress = 100;
        fill.style.width = progress + '%';

        if (progress > (msgIndex + 1) * (100 / messages.length) && msgIndex < messages.length - 1) {
            msgIndex++;
            splashText.textContent = messages[msgIndex];
        }

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => splash.classList.add('hidden'), 400);
            setTimeout(() => { splash.remove(); }, 1100);
        }
    }, 120);
})();

// MATRIX RAIN
const canvas = document.getElementById('matrix');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/~`アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const fontSize = 14;
let columns = Math.floor(canvas.width / fontSize);
let drops = Array(columns).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(10, 10, 10, 0.04)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff41';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

setInterval(drawMatrix, 50);

window.addEventListener('resize', () => {
    columns = Math.floor(canvas.width / fontSize);
    drops = Array(columns).fill(1);
});

// TYPING EFFECT
const typedText = document.getElementById('typed-text');
const outputLine = document.getElementById('output-line');
const phrases = [
    { cmd: 'python3 -c "import tblocks"', out: '[+] T-Blocks v2.0 loaded. 4 modes, 8 powerups, 3 bosses.' },
    { cmd: 'curl -X POST /api/auth/login', out: '[+] JWT token issued. H4ck Messenger online.' },
    { cmd: 'git log --oneline -2', out: 'f4k3c0d H4ck: E2E encryption\n7a2b1e9 T-Blocks: boss battle mode' },
    { cmd: 'ls -la /projects/', out: 'tblocks/  messenger/' },
    { cmd: 'echo "4ayka studio"', out: '4ayka studio' },
    { cmd: 'python3 -m http.server 8080', out: '[+] Serving on port 8080. All systems go.' },
    { cmd: 'cat /proc/uptime', out: '9999999.00 9999999.00' },
    { cmd: 'wc -l tblocks/index.html', out: '721 tblocks/index.html' },
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isWaiting = false;

function typeEffect() {
    const current = phrases[phraseIndex];

    if (isWaiting) return;

    if (!isDeleting) {
        typedText.textContent = current.cmd.substring(0, charIndex + 1);
        charIndex++;

        if (charIndex === current.cmd.length) {
            isWaiting = true;
            setTimeout(() => {
                outputLine.textContent = current.out;
                outputLine.style.color = '#00ff41';
                isWaiting = false;
                isDeleting = true;
                setTimeout(typeEffect, 2000);
            }, 500);
            return;
        }
        setTimeout(typeEffect, 50 + Math.random() * 50);
    } else {
        outputLine.textContent = '';
        typedText.textContent = current.cmd.substring(0, charIndex);
        charIndex--;

        if (charIndex < 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            charIndex = 0;
            setTimeout(typeEffect, 500);
            return;
        }
        setTimeout(typeEffect, 20);
    }
}

setTimeout(typeEffect, 1000);

// SCROLL REVEAL
const revealElements = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => observer.observe(el));

// COUNTER ANIMATION
const statNumbers = document.querySelectorAll('.stat-number');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-target'));
            const duration = 1500;
            const start = performance.now();

            function update(now) {
                const elapsed = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.floor(target * eased);

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target;
                }
            }
            requestAnimationFrame(update);
            counterObserver.unobserve(el);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(el => counterObserver.observe(el));

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ACTIVE NAV LINK
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 100;
        if (window.scrollY >= top) {
            current = section.getAttribute('id');
        }
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
});

// BURGER
const burger = document.getElementById('burger');
const navLinksContainer = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    burger.classList.toggle('active');
    navLinksContainer.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        burger.classList.remove('active');
        navLinksContainer.classList.remove('active');
    });
});

// FOOTER CLOCK & UPTIME
const clockEl = document.getElementById('clock');
const uptimeEl = document.getElementById('uptime');
const startTime = Date.now();

function updateClock() {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    clockEl.textContent = time;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const h = String(Math.floor(elapsed / 3600)).padStart(2, '0');
    const m = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    uptimeEl.textContent = h + ':' + m + ':' + s;

    requestAnimationFrame(updateClock);
}
updateClock();

// FORM
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    const nick = this.querySelector('input[type="text"]').value || 'Anonymous';
    const email = this.querySelector('input[type="email"]').value || '';
    const message = this.querySelector('textarea').value || '';

    btn.textContent = '> sending...';
    btn.style.borderColor = 'var(--yellow)';
    btn.style.color = 'var(--yellow)';

    const text = encodeURIComponent(`Новое сообщение с сайта 4ayka Studio\n\nОт: ${nick}\nEmail: ${email}\n\nСообщение:\n${message}`);
    const tgUrl = `https://t.me/KR0VOSOS?text=${text}`;

    setTimeout(() => {
        window.open(tgUrl, '_blank');
        btn.textContent = '> [SENT] opening telegram...';
        btn.style.borderColor = 'var(--green)';
        btn.style.color = 'var(--green)';

        setTimeout(() => {
            btn.textContent = '> send --encrypt';
            btn.style.borderColor = '';
            btn.style.color = '';
            this.reset();
        }, 3000);
    }, 800);
});

// THEME TOGGLE
const themeToggle = document.getElementById('theme-toggle');
let isLight = false;
try { isLight = localStorage.getItem('4ayka_theme') === 'light'; } catch(e) {}
if (isLight) { document.body.classList.add('light'); themeToggle.textContent = '\u2600'; }

themeToggle.addEventListener('click', () => {
    isLight = !isLight;
    document.body.classList.toggle('light', isLight);
    themeToggle.textContent = isLight ? '\u2600' : '\u263D';
    try { localStorage.setItem('4ayka_theme', isLight ? 'light' : 'dark'); } catch(e) {}
});

// RANDOM GLITCH EFFECT ON PAGE
function randomGlitch() {
    document.body.style.filter = 'hue-rotate(' + (Math.random() * 360) + 'deg)';
    setTimeout(() => {
        document.body.style.filter = 'none';
    }, 50);
}

setInterval(() => {
    if (Math.random() > 0.95) {
        randomGlitch();
    }
}, 2000);

// INTERACTIVE TERMINAL
const termOutput = document.getElementById('terminal-output');
const termInput = document.getElementById('interactive-input');
const termBody = document.getElementById('interactive-body');
const termSection = document.getElementById('terminal');

const commands = {
    help: () => ({
        text: `Доступные команды:
  help       - эта справка
  about      - кто мы
  projects   - наши проекты
  tblocks    - ссылка на T-Blocks
  h4ck       - ссылка на H4ck Messenger
  github     - ссылка на GitHub
  telegram   - написать в Telegram
  email      - отправить email
  tech       - наш стек
  uptime     - сколько сайт работает
  clear      - очистить терминал
  hack       - ???
  matrix     - ???
  whoami     - кто ты?`,
        cls: 'term-info'
    }),
    about: () => ({
        text: '4ayka Studio - инди-студия разработки.\nДелаем браузерные игры и E2E мессенджеры.\nVanilla JS + Python. Без фреймворков. Без компромиссов.',
        cls: 'term-success'
    }),
    projects: () => ({
        text: '[ACTIVE] H4ck Messenger - E2E encrypted messenger (FastAPI + WebSocket)\n[DONE]   T-Blocks v2.0 - Tetris++ with 4 modes, 3 bosses, 8 powerups (~1400 lines)',
        cls: 'term-out'
    }),
    tblocks: () => {
        window.open('https://krempik.github.io/tblocks', '_blank');
        return { text: '[+] Opening T-Blocks in new tab...', cls: 'term-success' };
    },
    h4ck: () => {
        window.open('https://github.com/krempik/messenger', '_blank');
        return { text: '[+] Opening H4ck Messenger repo...', cls: 'term-success' };
    },
    github: () => {
        window.open('https://github.com/krempik', '_blank');
        return { text: '[+] Opening github.com/krempik...', cls: 'term-success' };
    },
    telegram: () => {
        window.open('https://t.me/KR0VOSOS', '_blank');
        return { text: '[+] Opening Telegram @KR0VOSOS...', cls: 'term-success' };
    },
    email: () => {
        window.location.href = 'mailto:kremp577@gmail.com';
        return { text: '[+] Opening email client...', cls: 'term-success' };
    },
    tech: () => ({
        text: 'Backend:   Python, FastAPI, SQLAlchemy, WebSockets\nFrontend:  HTML5 Canvas, Vanilla JS, Web Crypto API\nEncryption: RSA-2048, AES-256-GCM\nAudio:     Web Audio API (procedural synthesis)',
        cls: 'term-out'
    }),
    uptime: () => {
        const s = Math.floor((Date.now() - startTime) / 1000);
        const h = String(Math.floor(s / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        return { text: h + ':' + m + ':' + sec, cls: 'term-success' };
    },
    clear: () => {
        termOutput.innerHTML = '';
        return { text: '', cls: '' };
    },
    hack: () => {
        const chars = '0123456789ABCDEF';
        let progress = '';
        for (let i = 0; i < 20; i++) {
            progress += chars[Math.floor(Math.random() * chars.length)];
        }
        return { text: '[+] Initializing hack sequence...\n[+] Bypassing firewall... ' + progress + '\n[+] Access granted. Just kidding. :)', cls: 'term-success' };
    },
    matrix: () => {
        document.getElementById('matrix').style.opacity = '0.3';
        setTimeout(() => { document.getElementById('matrix').style.opacity = '0.07'; }, 3000);
        return { text: '[+] Matrix intensity increased. Wake up, Neo...', cls: 'term-info' };
    },
    whoami: () => ({
        text: 'visitor@4ayka-studio\nuid=1337(visitor) gid=1337(hackers)',
        cls: 'term-out'
    }),
    ls: () => ({
        text: 'index.html  style.css  script.js  tblocks.html',
        cls: 'term-out'
    }),
    pwd: () => ({
        text: '/home/guest/4ayka-studio',
        cls: 'term-out'
    }),
    date: () => ({
        text: new Date().toLocaleString('ru-RU'),
        cls: 'term-out'
    }),
    uname: () => ({
        text: '4ayka-studio 1.0 x86_64 JavaScript/V8 Browser',
        cls: 'term-out'
    }),
    neofetch: () => ({
        text: '       _        _   _                _    \n      / \\   ___| |_(_)_ __ ___   ___| |_ \n     / _ \\ / __| __| | \'_ ` _ \\ / _ \\ __|\n    / ___ \\ (__| |_| | | | | | |  __/ |_ \n   /_/   \\_\\___|\\__|_|_| |_| |_|\\___|\\__|\n   \n   4ayka Studio | krempik\n   Stack: Python + JS + Canvas\n   Status: CODING',
        cls: 'term-success'
    }),
};

const defaultReply = (cmd) => ({
    text: 'bash: ' + cmd + ': команда не найдена. Введи help для списка.',
    cls: 'term-error'
});

function addTermLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'term-line ' + cls;
    div.textContent = text;
    termOutput.appendChild(div);
}

function addTermCmd(cmd) {
    const div = document.createElement('div');
    div.className = 'term-line term-cmd';
    div.textContent = '$ ' + cmd;
    termOutput.appendChild(div);
}

function scrollTerm() {
    termBody.scrollTop = termBody.scrollHeight;
}

function processCommand(cmd) {
    const trimmed = cmd.trim().toLowerCase();
    if (!trimmed) return;

    addTermCmd(cmd);
    const handler = commands[trimmed];
    const result = handler ? handler(trimmed) : defaultReply(trimmed);
    if (result.text) addTermLine(result.text, result.cls);
    scrollTerm();
}

if (termInput) {
    termInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const cmd = this.textContent;
            this.textContent = '';
            processCommand(cmd);
        }
    });

    termInput.addEventListener('focus', function() {
        termBody.style.borderColor = 'var(--green-dim)';
    });

    termInput.addEventListener('blur', function() {
        termBody.style.borderColor = 'var(--border)';
    });

    termSection.addEventListener('click', function() {
        termInput.focus();
    });

    addTermLine('4ayka Studio Interactive Shell v1.0', 'term-info');
    addTermLine('Type "help" for available commands.\n', 'term-out');
}
