let selectedPhotoUrl = null;

// Initialize when DOM is ready
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

function setupCameraHandling() {
    const triggerBtn = document.getElementById('btn-trigger-camera');
    const photoInput = document.getElementById('f-photo-input');
    const previewCard = document.getElementById('photo-preview-card');
    const previewImg = document.getElementById('f-preview-img');
    const removeBtn = document.getElementById('btn-remove-photo');

    if (!triggerBtn || !photoInput) return;

    triggerBtn.addEventListener('click', function () {
        photoInput.click();
    });

    photoInput.addEventListener('change', function (e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            compressImage(event.target.result, 700, 0.72, function (compressedDataUrl) {
                selectedPhotoUrl = compressedDataUrl;
                previewImg.src = compressedDataUrl;
                previewCard.classList.remove('hidden');
                triggerBtn.innerText = '🔄 Retake Photo';
            });
        };
        reader.readAsDataURL(file);
    });

    if (removeBtn) {
        removeBtn.addEventListener('click', function () {
            selectedPhotoUrl = null;
            photoInput.value = '';
            previewCard.classList.add('hidden');
            triggerBtn.innerText = '📸 Take Flower Photo';
        });
    }
}

function compressImage(base64Str, maxWidth, quality, callback) {
    const img = new Image();
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
    img.src = base64Str;
}

function setupButtons() {
    const btnLetter = document.getElementById('btn-create-letter');
    const btnFlower = document.getElementById('btn-create-flower');
    const btnCopy = document.getElementById('btn-copy');
    const btnShare = document.getElementById('btn-share-native');

    if (btnLetter) {
        btnLetter.addEventListener('click', function () {
            createGiftLink('letter');
        });
    }

    if (btnFlower) {
        btnFlower.addEventListener('click', function () {
            createGiftLink('flower');
        });
    }

    if (btnCopy) btnCopy.addEventListener('click', copyLink);
    if (btnShare) btnShare.addEventListener('click', nativeShare);
}

/* =========================================================
   GENERATE DIRECT URL PARAMETER LINK
   ========================================================= */

async function createGiftLink(type) {
    const baseUrl = window.location.origin + window.location.pathname;
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

        try {
            const uploadedImgUrl = await uploadPhotoToWeb(selectedPhotoUrl);
            url.searchParams.set('type', 'flower');
            url.searchParams.set('img', uploadedImgUrl);
            url.searchParams.set('note', note);

            finishLinkGeneration(url.toString(), createBtn);
        } catch (err) {
            alert('Could not upload photo. Please check your internet connection.');
            createBtn.innerText = '✨ Generate Gift Link';
            createBtn.disabled = false;
        }
    }
}

async function uploadPhotoToWeb(base64Data) {
    const blob = await (await fetch(base64Data)).blob();
    const formData = new FormData();
    formData.append('file', blob, 'flower.jpg');

    const response = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
    });

    const data = await response.json();
    if (data && data.status === 'success' && data.data && data.data.url) {
        return data.data.url.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
    }
    throw new Error('Upload failed');
}

function finishLinkGeneration(fullUrl, createBtn) {
    const shareInput = document.getElementById('share-link');
    const resultBox = document.getElementById('result-box');

    shareInput.value = fullUrl;
    resultBox.style.display = 'block';

    createBtn.innerText = '✨ Generate Gift Link';
    createBtn.disabled = false;
    resultBox.scrollIntoView({ behavior: 'smooth' });
}

function copyLink() {
    const linkInput = document.getElementById('share-link');
    if (!linkInput || !linkInput.value) return;

    linkInput.select();
    document.execCommand('copy');
    alert('Link Copied! 💙 Copy this into TinyURL if you want it short!');
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

/* =========================================================
   CHECK & DISPLAY GIFT ON RECEIVER END
   ========================================================= */

function checkUrlForGift() {
    let searchStr = window.location.search;
    if (!searchStr && window.location.hash) {
        searchStr = '?' + window.location.hash.substring(1);
    }

    const params = new URLSearchParams(searchStr);
    const type = params.get('type') || params.get('t');

    if (type) {
        const senderView = document.getElementById('sender-view');
        const receiverView = document.getElementById('receiver-view');

        if (senderView) senderView.style.display = 'none';
        if (receiverView) receiverView.style.display = 'block';

        renderGift(type, params);
    }
}

function renderGift(type, params) {
    const display = document.getElementById('gift-display');
    if (!display) return;

    if (type === 'letter' || type === 'l') {
        const to = params.get('to') || params.get('name') || 'You';
        const msg = params.get('msg') || '';
        const from = params.get('from') || 'Someone special';

        display.innerHTML =
            '<div class="envelope">' +
                '<div class="letter-to">Dear ' + escapeHtml(to) + ',</div>' +
                '<div class="letter-text">' + escapeHtml(msg) + '</div>' +
                '<div class="letter-from">Love,<br>' + escapeHtml(from) + '</div>' +
            '</div>';
    } else if (type === 'flower' || type === 'f') {
        const img = params.get('img');
        const note = params.get('note') || 'For you 💙';

        let imgHtml = '';
        if (img) {
            imgHtml =
                '<div class="received-photo-card">' +
                    '<img src="' + escapeHtml(img) + '" alt="Flower photo">' +
                '</div>';
        }

        display.innerHTML =
            imgHtml +
            '<div class="gift-message">“' + escapeHtml(note) + '”</div>';
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