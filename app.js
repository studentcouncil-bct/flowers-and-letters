document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    setupTabListeners();
    setupActionListeners();
    checkIncomingGift();
}

function setupTabListeners() {
    const tabLetter = document.getElementById('tab-letter');
    const tabFlower = document.getElementById('tab-flower');

    if (tabLetter) {
        tabLetter.addEventListener('click', function () {
            switchTab('letter');
        });
    }

    if (tabFlower) {
        tabFlower.addEventListener('click', function () {
            switchTab('flower');
        });
    }
}

function setupActionListeners() {
    const btnCreateLetter = document.getElementById('btn-create-letter');
    const btnCreateFlower = document.getElementById('btn-create-flower');
    const btnCopy = document.getElementById('btn-copy');

    if (btnCreateLetter) {
        btnCreateLetter.addEventListener('click', function (e) {
            e.preventDefault();
            generateLink('letter');
        });
    }

    if (btnCreateFlower) {
        btnCreateFlower.addEventListener('click', function (e) {
            e.preventDefault();
            generateLink('flower');
        });
    }

    if (btnCopy) {
        btnCopy.addEventListener('click', copyLink);
    }
}

function switchTab(tab) {
    const letterForm = document.getElementById('form-letter');
    const flowerForm = document.getElementById('form-flower');
    const tabLetter = document.getElementById('tab-letter');
    const tabFlower = document.getElementById('tab-flower');
    const resultBox = document.getElementById('result-box');

    if (!letterForm || !flowerForm) return;

    letterForm.classList.remove('active');
    flowerForm.classList.remove('active');
    tabLetter.classList.remove('active');
    tabFlower.classList.remove('active');

    if (tab === 'letter') {
        letterForm.classList.add('active');
        tabLetter.classList.add('active');
    } else {
        flowerForm.classList.add('active');
        tabFlower.classList.add('active');
    }

    if (resultBox) {
        resultBox.style.display = 'none';
    }
}

// Generates compact URL parameters + fetches tiny short link
function utf8ToBase64Url(str) {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    const chunkSize = 0x8000;

    for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }

    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function base64UrlToUtf8(str) {
    try {
        const padded = str.replace(/-/g, '+').replace(/_/g, '/') +
            '='.repeat((4 - (str.length % 4)) % 4);
        const binary = atob(padded);
        const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        return null;
    }
}

// Creates a compact receiver URL. The gift is stored in the URL fragment (#),
// so GitHub Pages serves index.html and this script immediately switches to the receiver view.
function generateLink(type) {
    let giftData = '';

    if (type === 'letter') {
        const nameVal = document.getElementById('l-name').value.trim() || 'Beautiful';
        const msgVal = document.getElementById('l-msg').value.trim() || 'I am thinking of you.';
        const fromVal = document.getElementById('l-from').value.trim() || 'Me';
        giftData = 'l|' + nameVal + '|' + msgVal + '|' + fromVal;
    } else {
        const flowerVal = document.getElementById('f-type').value;
        const noteVal = document.getElementById('f-note').value.trim() || 'For you 💙';
        giftData = 'f|' + flowerVal + '|' + noteVal;
    }

    const encodedGift = utf8ToBase64Url(giftData);
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const giftUrl = baseUrl + '#g=' + encodedGift;

    const shareInput = document.getElementById('share-link');
    const qrImg = document.getElementById('qr-image');
    const resultBox = document.getElementById('result-box');

    shareInput.value = giftUrl;
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=' +
        encodeURIComponent(giftUrl) + '&color=0284c7&bgcolor=ffffff';

    resultBox.style.display = 'block';

    setTimeout(function () {
        resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 50);
}

async function generateLink(type) {
    const nameVal =
        document.getElementById('l-name').value.trim() || 'Beautiful';

    const msgVal =
        document.getElementById('l-msg').value.trim() ||
        'I am thinking of you.';

    const fromVal =
        document.getElementById('l-from').value.trim() || 'Me';

    const gift = {
        type: 'letter',
        name: nameVal,
        message: msgVal,
        sender: fromVal
    };

    const API_URL = 'https://flowers-and-letters.stamarieeee3468.workers.dev/';

    try {
        const response = await fetch(API_URL + '/api/gifts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(gift)
        });

        if (!response.ok) {
            throw new Error('Failed to create gift');
        }

        const data = await response.json();

        const shareInput = document.getElementById('share-link');
        const resultBox = document.getElementById('result-box');

        shareInput.value = data.url;
        resultBox.style.display = 'block';

        setTimeout(function () {
            resultBox.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 50);

    } catch (error) {
        console.error(error);
        alert('Could not create the gift. Please try again.');
    }
}

async function copyLink() {
    const value = document.getElementById('share-link').value;

    try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
        } else {
            const input = document.getElementById('share-link');
            input.focus();
            input.select();
            document.execCommand('copy');
        }
        alert('Short link copied 💙 Send it to her!');
    } catch (e) {
        alert('Long-press the link box to copy it.');
    }
}

function checkIncomingGift() {
    // New compact format: https://site/#g=ENCODED_GIFT
    const hash = window.location.hash;

    if (hash.startsWith('#g=')) {
        const encodedGift = hash.slice(3);
        const compact = base64UrlToUtf8(encodedGift);

        if (compact) {
            document.getElementById('sender-view').style.display = 'none';
            document.getElementById('receiver-view').style.display = 'block';
            openGift(compact, new URLSearchParams());
            return;
        }
    }

    // Compatibility with the previous ?g= format and legacy links.
    const params = new URLSearchParams(window.location.search);
    const compact = params.get('g');
    const legacyType = params.get('type');

    if (compact || legacyType) {
        document.getElementById('sender-view').style.display = 'none';
        document.getElementById('receiver-view').style.display = 'block';
        openGift(compact, params);
    }
}

function openGift(compact, params) {
    const display = document.getElementById('gift-display');

    if (compact) {
        const parts = compact.split('|');
        const type = parts[0];

        if (type === 'l') {
            const name = parts[1] || 'Beautiful';
            const msg = parts[2] || 'I am thinking of you.';
            const from = parts[3] || 'Me';

            display.innerHTML =
                '<div class="envelope">' +
                    '<div class="letter-to">Dear ' + escapeHtml(name) + ',</div>' +
                    '<div class="letter-text">' + escapeHtml(msg) + '</div>' +
                    '<div class="letter-from">Love,<br>' + escapeHtml(from) + '</div>' +
                '</div>' +
                '<p class="tap-hint">Made just for you</p>';
            return;
        } else if (type === 'f') {
            const flower = parts[1] || '🪻';
            const note = parts[2] || 'For you 💙';

            display.innerHTML =
                '<p class="flower-subtext">Someone sent you this...</p>' +
                '<div class="digital-flower">' + escapeHtml(flower) + '</div>' +
                '<div class="gift-message">“' + escapeHtml(note) + '”</div>' +
                '<p class="tap-hint">Hold this little moment ✨</p>';
            return;
        }
    }

    // Fallback for legacy longer parameters (?type=letter&name=...)
    const type = params.get('type');
    if (type === 'letter') {
        const name = params.get('name') || 'Beautiful';
        const msg = params.get('msg') || 'I am thinking of you.';
        const from = params.get('from') || 'Me';

        display.innerHTML =
            '<div class="envelope">' +
                '<div class="letter-to">Dear ' + escapeHtml(name) + ',</div>' +
                '<div class="letter-text">' + escapeHtml(msg) + '</div>' +
                '<div class="letter-from">Love,<br>' + escapeHtml(from) + '</div>' +
            '</div>' +
            '<p class="tap-hint">Made just for you</p>';
    } else if (type === 'flower') {
        const flower = params.get('flower') || '🪻';
        const note = params.get('note') || 'For you 💙';

        display.innerHTML =
            '<p class="flower-subtext">Someone sent you this...</p>' +
            '<div class="digital-flower">' + escapeHtml(flower) + '</div>' +
            '<div class="gift-message">“' + escapeHtml(note) + '”</div>' +
            '<p class="tap-hint">Hold this little moment ✨</p>';
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}