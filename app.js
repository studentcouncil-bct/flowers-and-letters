let selectedPhotoUrl = null;

document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

function initApp() {
    setupTabs();
    setupCameraHandling();
    setupButtons();
    checkUrlForGift();
}

function setupTabs() {
    document.getElementById('tab-letter').addEventListener('click', function () {
        switchTab('letter');
    });

    document.getElementById('tab-flower').addEventListener('click', function () {
        switchTab('flower');
    });
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

    resultBox.style.display = 'none';
}

function setupCameraHandling() {
    const triggerBtn = document.getElementById('btn-trigger-camera');
    const photoInput = document.getElementById('f-photo-input');
    const previewCard = document.getElementById('photo-preview-card');
    const previewImg = document.getElementById('f-preview-img');
    const removeBtn = document.getElementById('btn-remove-photo');

    triggerBtn.addEventListener('click', function () {
        photoInput.click();
    });

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        // Compress and prepare photo
        const reader = new FileReader();
        reader.onload = function (event) {
            compressImage(event.target.result, 600, 0.7, function (compressedDataUrl) {
                selectedPhotoUrl = compressedDataUrl;
                previewImg.src = compressedDataUrl;
                previewCard.classList.remove('hidden');
                triggerBtn.innerText = '🔄 Retake Photo';
            });
        };
        reader.readAsDataURL(file);
    });

    removeBtn.addEventListener('click', function () {
        selectedPhotoUrl = null;
        photoInput.value = '';
        previewCard.classList.add('hidden');
        triggerBtn.innerText = '📸 Take Flower Photo';
    });
}

// Resizes photo so it uploads instantly
function compressImage(base64Str, maxWidth, quality, callback) {
    const img = new Image();
    img.src = base64Str;
    img.onload = function () {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', quality));
    };
}

function setupButtons() {
    document.getElementById('btn-create-letter').addEventListener('click', function () {
        createGiftLink('letter');
    });

    document.getElementById('btn-create-flower').addEventListener('click', function () {
        createGiftLink('flower');
    });

    document.getElementById('btn-copy').addEventListener('click', copyLink);
    document.getElementById('btn-share-native').addEventListener('click', nativeShare);
}

async function createGiftLink(type) {
    const baseUrl = window.location.href.split('?')[0].split('#')[0];
    const url = new URL(baseUrl);
    const createBtn = (type === 'letter') ? document.getElementById('btn-create-letter') : document.getElementById('btn-create-flower');

    createBtn.innerText = '⏳ Processing...';
    createBtn.disabled = true;

    if (type === 'letter') {
        const name = document.getElementById('l-name').value.trim() || 'Beautiful';
        const msg = document.getElementById('l-msg').value.trim() || 'Thinking of you!';
        const from = document.getElementById('l-from').value.trim() || 'Me';

        url.searchParams.set('type', 'letter');
        url.searchParams.set('to', name);
        url.searchParams.set('msg', msg);
        url.searchParams.set('from', from);

        finishLinkGeneration(url.toString(), createBtn);
    } else {
        const note = document.getElementById('f-note').value.trim() || 'For you 🌸';

        if (!selectedPhotoUrl) {
            alert('Please take or upload a flower photo first! 📸');
            createBtn.innerText = '✨ Generate Gift Link';
            createBtn.disabled = false;
            return;
        }

        // Upload photo to free anonymous host (tmpfiles.org)
        try {
            const uploadedImgUrl = await uploadPhotoToWeb(selectedPhotoUrl);
            url.searchParams.set('type', 'flower');
            url.searchParams.set('img', uploadedImgUrl);
            url.searchParams.set('note', note);

            finishLinkGeneration(url.toString(), createBtn);
        } catch (err) {
            alert('Could not upload photo. Please check internet connection.');
            createBtn.innerText = '✨ Generate Gift Link';
            createBtn.disabled = false;
        }
    }
}

// Anonymous instant free photo host
async function uploadPhotoToWeb(base64Data) {
    const blob = await (await fetch(base64Data)).blob();
    const formData = new FormData();
    formData.append('file', blob, 'flower.jpg');

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data.status === 'success') {
        // Change preview URL to direct download URL
        return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    } else {
        throw new Error('Upload failed');
    }
}

async function finishLinkGeneration(fullUrl, createBtn) {
    const shareInput = document.getElementById('share-link');
    const resultBox = document.getElementById('result-box');
    const statusText = document.getElementById('result-status-text');

    shareInput.value = fullUrl;
    resultBox.style.display = 'block';

    // Shorten URL automatically via TinyURL
    try {
        statusText.innerText = 'Shortening your link... 🪄';
        const shortRes = await fetch('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(fullUrl));
        if (shortRes.ok) {
            const shortUrl = await shortRes.text();
            if (shortUrl && shortUrl.startsWith('http')) {
                shareInput.value = shortUrl;
                statusText.innerText = 'Your short link is ready! 💙';
            }
        }
    } catch (e) {
        statusText.innerText = 'Your gift link is ready below.';
    }

    createBtn.innerText = '✨ Generate Gift Link';
    createBtn.disabled = false;
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

function copyLink() {
    const linkInput = document.getElementById('share-link');
    linkInput.select();
    document.execCommand('copy');
    alert('Short Link Copied! 💙');
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
        } catch (e) { }
    } else {
        copyLink();
    }
}

function checkUrlForGift() {
    const params = new URLSearchParams(window.location.search);
    const type = params.get('type');

    if (type) {
        document.getElementById('sender-view').style.display = 'none';
        document.getElementById('receiver-view').style.display = 'block';

        const display = document.getElementById('gift-display');

        if (type === 'letter') {
            display.innerHTML =
                '<div class="envelope">' +
                    '<div class="letter-to">Dear ' + escapeHtml(params.get('to') || 'You') + ',</div>' +
                    '<div class="letter-text">' + escapeHtml(params.get('msg') || '') + '</div>' +
                    '<div class="letter-from">Love,<br>' + escapeHtml(params.get('from') || '') + '</div>' +
                '</div>';
        } else if (type === 'flower') {
            display.innerHTML =
                '<div class="received-photo-card">' +
                    '<img src="' + escapeHtml(params.get('img')) + '" alt="Flower photo">' +
                '</div>' +
                '<div class="gift-message">“' + escapeHtml(params.get('note') || 'For you 💙') + '”</div>';
        }
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