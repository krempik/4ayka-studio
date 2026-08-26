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
    { cmd: 'python3 -c "import tblocks"', out: '[+] T-Blocks loaded. 4 game modes, 6 powerups.' },
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
    btn.textContent = '> sending...';
    btn.style.borderColor = 'var(--yellow)';
    btn.style.color = 'var(--yellow)';

    setTimeout(() => {
        btn.textContent = '> [SENT] message encrypted & delivered';
        btn.style.borderColor = 'var(--green)';
        btn.style.color = 'var(--green)';

        setTimeout(() => {
            btn.textContent = '> send --encrypt';
            this.reset();
        }, 3000);
    }, 1500);
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
