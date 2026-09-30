// ========================================
// CONFIG & STATE
// ========================================
const TOTAL_SCREENS = 14; // screens 0 through 13
let currentScreen = 0;
let userName = '';
let isTransitioning = false;
let musicPlaying = false;
let audioCtx = null;
let musicInterval = null;

// ========================================
// DOM REFERENCES
// ========================================
const starsCanvas = document.getElementById('starsCanvas');
const ctx = starsCanvas.getContext('2d');
const nameInput = document.getElementById('nameInput');
const startBtn = document.getElementById('startBtn');
const musicBtn = document.getElementById('musicBtn');
const transitionOverlay = document.getElementById('transitionOverlay');
const progressDotsContainer = document.getElementById('progressDots');
const moonEl = document.getElementById('moon');
const cloud1 = document.getElementById('cloud1');
const cloud2 = document.getElementById('cloud2');
const finalGlow = document.getElementById('finalGlow');
const herNameSpan = document.getElementById('herName');

// ========================================
// STARS BACKGROUND
// ========================================
let stars = [];

function resizeCanvas() {
    starsCanvas.width = window.innerWidth;
    starsCanvas.height = window.innerHeight;
}

function createStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
        stars.push({
            x: Math.random() * starsCanvas.width,
            y: Math.random() * starsCanvas.height,
            radius: Math.random() * 2 + 0.5,
            alpha: Math.random(),
            alphaSpeed: Math.random() * 0.02 + 0.005,
            alphaDir: Math.random() > 0.5 ? 1 : -1
        });
    }
}

function drawStars() {
    ctx.clearRect(0, 0, starsCanvas.width, starsCanvas.height);

    stars.forEach(function (star) {
        star.alpha += star.alphaSpeed * star.alphaDir;

        if (star.alpha >= 1) {
            star.alpha = 1;
            star.alphaDir = -1;
        }
        if (star.alpha <= 0.1) {
            star.alpha = 0.1;
            star.alphaDir = 1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(180, 200, 255, ' + star.alpha + ')';
        ctx.fill();
    });

    requestAnimationFrame(drawStars);
}

// Initialize stars
resizeCanvas();
createStars(200);
drawStars();

window.addEventListener('resize', function () {
    resizeCanvas();
    createStars(200);
});

// ========================================
// PROGRESS DOTS
// ========================================
function createDots() {
    progressDotsContainer.innerHTML = '';
    // Dots for screens 1 through 12
    for (let i = 1; i <= TOTAL_SCREENS - 2; i++) {
        var dot = document.createElement('div');
        dot.className = 'dot';
        dot.id = 'dot' + i;
        progressDotsContainer.appendChild(dot);
    }
}

function updateDots() {
    var dots = document.querySelectorAll('.dot');
    dots.forEach(function (dot, index) {
        var screenIndex = index + 1;
        dot.classList.remove('active', 'passed');

        if (screenIndex === currentScreen) {
            dot.classList.add('active');
        } else if (screenIndex < currentScreen) {
            dot.classList.add('passed');
        }
    });
}

createDots();

// ========================================
// SCREEN MANAGEMENT
// ========================================
function showScreen(index) {
    var allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(function (s) {
        s.classList.remove('active');
    });

    var target = document.getElementById('screen' + index);
    if (target) {
        target.classList.add('active');
    }
}

function goToScreen(index) {
    if (isTransitioning) return;
    isTransitioning = true;

    transitionOverlay.classList.add('active');

    setTimeout(function () {
        showScreen(index);
        currentScreen = index;
        updateDots();
        triggerScreenEffects(index);

        setTimeout(function () {
            transitionOverlay.classList.remove('active');
            isTransitioning = false;
        }, 400);
    }, 500);
}

function nextScreen() {
    if (currentScreen >= TOTAL_SCREENS - 1) return;
    goToScreen(currentScreen + 1);
}

// ========================================
// SCREEN EFFECTS
// ========================================
function triggerScreenEffects(index) {
    // Progress dots visibility
    if (index >= 1 && index <= 12) {
        progressDotsContainer.classList.add('visible');
    } else {
        progressDotsContainer.classList.remove('visible');
    }

    // Moon appears at screen 4
    if (index >= 4) {
        moonEl.classList.add('visible');
    }

    // Clouds appear at screen 10
    if (index >= 10) {
        cloud1.classList.add('visible');
        cloud2.classList.add('visible');
    }

    // Music button visible from screen 1
    if (index >= 1) {
        musicBtn.classList.add('visible');
    }

    // Shooting stars at screen 5
    if (index === 5) {
        triggerShootingStars();
    }

    // Float emojis at screen 8
    if (index === 8) {
        spawnFloatingEmojis(['💙', '✨', '💫', '🌟', '💙'], 5);
    }

    // Zzz at screen 11
    if (index === 11) {
        spawnZzz();
    }

    // Final screen 13
    if (index === 13) {
        herNameSpan.textContent = userName || 'you';
        finalGlow.classList.add('visible');
        triggerHeartRain();
        spawnFloatingEmojis(['💙', '❤️', '✨', '💫', '🌙', '⭐', '💙', '❤️'], 15);
        createStars(400); // Double the stars for the finale
    }
}

// ========================================
// SHOOTING STARS
// ========================================
function triggerShootingStars() {
    for (var i = 0; i < 3; i++) {
        (function (delay) {
            setTimeout(function () {
                var star = document.createElement('div');
                star.className = 'shooting-star';
                star.style.top = (Math.random() * 40) + '%';
                star.style.right = '-50px';
                star.style.animation = 'shootingStar ' + (1.5 + Math.random()) + 's ease forwards';
                document.body.appendChild(star);

                setTimeout(function () {
                    star.remove();
                }, 3000);
            }, delay);
        })(i * 800);
    }
}

// ========================================
// FLOATING EMOJIS
// ========================================
function spawnFloatingEmojis(emojis, count) {
    for (var i = 0; i < count; i++) {
        (function (delay) {
            setTimeout(function () {
                var emoji = document.createElement('div');
                emoji.className = 'float-emoji';
                emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
                emoji.style.left = (Math.random() * 80 + 10) + '%';
                emoji.style.bottom = '10%';
                emoji.style.animationDuration = (3 + Math.random() * 3) + 's';
                document.body.appendChild(emoji);

                setTimeout(function () {
                    emoji.remove();
                }, 6000);
            }, delay);
        })(i * 300);
    }
}

// ========================================
// ZZZ SLEEP ANIMATION
// ========================================
function spawnZzz() {
    var positions = [
        { x: '60%', y: '35%' },
        { x: '65%', y: '30%' },
        { x: '70%', y: '25%' }
    ];

    positions.forEach(function (pos, i) {
        setTimeout(function () {
            var z = document.createElement('div');
            z.className = 'zzz';
            z.textContent = 'z';
            z.style.left = pos.x;
            z.style.top = pos.y;
            z.style.fontSize = (1.5 + i * 0.5) + 'rem';
            document.body.appendChild(z);

            setTimeout(function () {
                z.remove();
            }, 3000);
        }, i * 600);
    });
}

// ========================================
// HEART RAIN
// ========================================
function triggerHeartRain() {
    var hearts = ['💙', '❤️', '💜', '💗'];

    for (var i = 0; i < 30; i++) {
        (function (delay) {
            setTimeout(function () {
                var heart = document.createElement('div');
                heart.className = 'heart-rain';
                heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
                heart.style.left = (Math.random() * 100) + '%';
                heart.style.animationDuration = (3 + Math.random() * 4) + 's';
                document.body.appendChild(heart);

                setTimeout(function () {
                    heart.remove();
                }, 8000);
            }, delay);
        })(i * 200);
    }
}

// ========================================
// RIPPLE EFFECT
// ========================================
function createRipple(x, y) {
    var ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = (x - 75) + 'px';
    ripple.style.top = (y - 75) + 'px';
    document.body.appendChild(ripple);

    setTimeout(function () {
        ripple.remove();
    }, 800);
}

// ========================================
// SPARKLE EFFECT
// ========================================
function createSparkles(x, y, count) {
    count = count || 5;

    for (var i = 0; i < count; i++) {
        var sparkle = document.createElement('div');
        sparkle.className = 'sparkle';

        var angle = (Math.PI * 2 / count) * i;
        var dist = 30 + Math.random() * 40;

        sparkle.style.left = (x + Math.cos(angle) * dist) + 'px';
        sparkle.style.top = (y + Math.sin(angle) * dist) + 'px';
        sparkle.innerHTML = '<div class="sparkle-inner"></div>';
        document.body.appendChild(sparkle);

        (function (el) {
            setTimeout(function () {
                el.remove();
            }, 800);
        })(sparkle);
    }
}

// ========================================
// MUSIC (Web Audio API - No files needed)
// ========================================
function createMusic() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Soft ambient lullaby notes
    var notes = [
        { freq: 523.25, time: 0 },     // C5
        { freq: 659.25, time: 0.8 },   // E5
        { freq: 587.33, time: 1.6 },   // D5
        { freq: 523.25, time: 2.4 },   // C5
        { freq: 493.88, time: 3.2 },   // B4
        { freq: 440.00, time: 4.0 },   // A4
        { freq: 493.88, time: 4.8 },   // B4
        { freq: 523.25, time: 5.6 },   // C5
        { freq: 440.00, time: 6.4 },   // A4
        { freq: 392.00, time: 7.2 },   // G4
        { freq: 440.00, time: 8.0 },   // A4
        { freq: 523.25, time: 8.8 }    // C5
    ];

    function playSequence() {
        if (!musicPlaying) return;

        var now = audioCtx.currentTime;

        notes.forEach(function (note) {
            // Main note
            var osc = audioCtx.createOscillator();
            var gain = audioCtx.createGain();
            var filter = audioCtx.createBiquadFilter();

            osc.type = 'sine';
            osc.frequency.value = note.freq;

            filter.type = 'lowpass';
            filter.frequency.value = 2000;

            gain.gain.setValueAtTime(0, now + note.time);
            gain.gain.linearRampToValueAtTime(0.08, now + note.time + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.7);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now + note.time);
            osc.stop(now + note.time + 0.8);

            // Harmony (lower octave)
            var osc2 = audioCtx.createOscillator();
            var gain2 = audioCtx.createGain();

            osc2.type = 'sine';
            osc2.frequency.value = note.freq * 0.5;

            gain2.gain.setValueAtTime(0, now + note.time);
            gain2.gain.linearRampToValueAtTime(0.03, now + note.time + 0.15);
            gain2.gain.exponentialRampToValueAtTime(0.001, now + note.time + 0.9);

            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);

            osc2.start(now + note.time);
            osc2.stop(now + note.time + 1.0);
        });
    }

    playSequence();

    musicInterval = setInterval(function () {
        if (musicPlaying) {
            playSequence();
        }
    }, 9600);
}

function toggleMusic() {
    if (musicPlaying) {
        musicPlaying = false;
        musicBtn.textContent = '🔇';
        musicBtn.classList.remove('playing');
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
    } else {
        musicPlaying = true;
        musicBtn.textContent = '🎵';
        musicBtn.classList.add('playing');
        createMusic();
    }
}

// ========================================
// START EXPERIENCE
// ========================================
function startExperience() {
    userName = nameInput.value.trim();

    if (!userName) {
        nameInput.style.borderColor = '#ff6b8a';
        nameInput.setAttribute('placeholder', 'Please type a name...');
        nameInput.focus();

        setTimeout(function () {
            nameInput.style.borderColor = 'rgba(126, 181, 255, 0.4)';
        }, 1000);

        return;
    }

    // Start music automatically
    musicPlaying = true;
    musicBtn.textContent = '🎵';
    musicBtn.classList.add('playing');
    createMusic();

    goToScreen(1);
}

// ========================================
// EVENT LISTENERS
// ========================================

// Start button
startBtn.addEventListener('click', startExperience);

// Enter key on name input
nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        startExperience();
    }
});

// Music button
musicBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    toggleMusic();
});

// Main click/tap handler
document.addEventListener('click', function (e) {
    // Ignore clicks on screen 0 (name input)
    if (currentScreen === 0) return;

    // Ignore clicks on interactive elements
    if (
        e.target.closest('.music-btn') ||
        e.target.closest('.start-btn') ||
        e.target.closest('.name-input')
    ) {
        return;
    }

    // Create ripple at tap position
    createRipple(e.clientX, e.clientY);

    // Random sparkles on some taps
    if (Math.random() > 0.5) {
        createSparkles(e.clientX, e.clientY);
    }

    // On final screen, spawn extra emojis instead of advancing
    if (currentScreen >= TOTAL_SCREENS - 1) {
        spawnFloatingEmojis(['💙', '❤️', '💜'], 3);
        return;
    }

    // Advance to next screen
    nextScreen();
});

// Prevent double-tap zoom on mobile
var lastTouchEnd = 0;

document.addEventListener('touchend', function (e) {
    var now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);