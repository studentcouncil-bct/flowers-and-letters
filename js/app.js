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
        btnCreateLetter.addEventListener('click', function () {
            generateLink('letter');
        });
    }

    if (btnCreateFlower) {
        btnCreateFlower.addEventListener('click', function () {
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
    let data;

    if (type === 'letter') {
        data = {
            type: 'letter',
            name: (document.getElementById('l-name').value || 'Beautiful').trim(),
            msg: (document.getElementById('l-msg').value || 'I am thinking of you.').trim(),
            from: (document.getElementById('l-from').value || 'Me').trim()
        };
    } else {
        data = {
            type: 'flower',
            flower: document.getElementById('f-type').value,
            note: (document.getElementById('f-note').value || 'For you 💙').trim()
        };
    }

    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const finalLink = baseUrl + '?gift=' + encoded;

    if (window.location.protocol === 'file:') {
        alert('Open this site from your live GitHub link so the gift link works on her phone.');
    }

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
            // User cancelled share dialog
        }
    } else {
        copyLink();
    }
}

function checkIncomingGift() {
    const params = new URLSearchParams(window.location.search);
    const gift = params.get('gift');

    if (gift) {
        document.getElementById('sender-view').style.display = 'none';
        document.getElementById('receiver-view').style.display = 'block';
        openGift(gift);
    }
}

function openGift(encodedData) {
    const display = document.getElementById('gift-display');

    try {
        const json = decodeURIComponent(escape(atob(encodedData)));
        const data = JSON.parse(json);

        if (data.type === 'letter') {
            display.innerHTML =
                '<div class="envelope">' +
                    '<div class="letter-to">Dear ' + escapeHtml(data.name) + ',</div>' +
                    '<div class="letter-text">' + escapeHtml(data.msg) + '</div>' +
                    '<div class="letter-from">Love,<br>' + escapeHtml(data.from) + '</div>' +
                '</div>' +
                '<p class="tap-hint">Made just for you</p>';
        } else if (data.type === 'flower') {
            display.innerHTML =
                '<p class="flower-subtext">Someone sent you this...</p>' +
                '<div class="digital-flower">' + (data.flower || '🪻') + '</div>' +
                '<div class="gift-message">“' + escapeHtml(data.note || 'For you 💙') + '”</div>' +
                '<p class="tap-hint">Hold this little moment ✨</p>';
        } else {
            throw new Error('Unknown gift type');
        }
    } catch (e) {
        display.innerHTML =
            '<h3 class="error-title">This gift link looks broken 💔</h3>' +
            '<p class="tap-hint">Ask them to send it again</p>';
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