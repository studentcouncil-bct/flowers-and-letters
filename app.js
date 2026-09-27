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
    const btnShare = document.getElementById('btn-share');

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

    if (btnShare) {
        btnShare.addEventListener('click', nativeShare);
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

function generateLink(type) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const url = new URL(baseUrl);

    if (type === 'letter') {
        const nameVal = document.getElementById('l-name').value.trim() || 'Beautiful';
        const msgVal = document.getElementById('l-msg').value.trim() || 'I am thinking of you.';
        const fromVal = document.getElementById('l-from').value.trim() || 'Me';

        url.searchParams.set('type', 'letter');
        url.searchParams.set('name', nameVal);
        url.searchParams.set('msg', msgVal);
        url.searchParams.set('from', fromVal);
    } else {
        const flowerVal = document.getElementById('f-type').value;
        const noteVal = document.getElementById('f-note').value.trim() || 'For you 💙';

        url.searchParams.set('type', 'flower');
        url.searchParams.set('flower', flowerVal);
        url.searchParams.set('note', noteVal);
    }

    const finalLink = url.toString();

    const shareInput = document.getElementById('share-link');
    const qrImg = document.getElementById('qr-image');
    const resultBox = document.getElementById('result-box');

    shareInput.value = finalLink;

    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' +
        encodeURIComponent(finalLink) +
        '&color=0284c7&bgcolor=ffffff';

    resultBox.style.display = 'block';

    setTimeout(function () {
        resultBox.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
        });
    }, 50);
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
        alert('Link copied 💙 Send it to her!');
    } catch (e) {
        alert('Long-press the link box to copy it.');
    }
}

async function nativeShare() {
    const url = document.getElementById('share-link').value;
    if (!url) return;

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'A gift for you 💙',
                text: 'I made something for you — open this when you can 🌸',
                url: url
            });
        } catch (e) {
            // User cancelled share
        }
    } else {
        copyLink();
    }
}

function checkIncomingGift() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');

    if (type) {
        document.getElementById('sender-view').style.display = 'none';
        document.getElementById('receiver-view').style.display = 'block';
        openGift(params);
    }
}

function openGift(params) {
    const display = document.getElementById('gift-display');
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