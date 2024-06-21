// Cookie functions
function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const parts = cookie.split('=');
        if (parts[0] === name) {
            return decodeURIComponent(parts[1]);
        }
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// Initialize users and current user from localStorage or cookies
let users = JSON.parse(localStorage.getItem('users')) || {};
let currentUser = getCookie('currentUser') || null;

console.log('Initial users:', users);
console.log('Initial currentUser:', currentUser);

// Sign up function
function signUp() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email in users) {
        alert('User already exists!');
    } else {
        users[email] = { password: password, photos: [] };
        localStorage.setItem('users', JSON.stringify(users));
        alert('User registered successfully!');
        login(email);
    }
}

// Login function
function login(email) {
    const password = users[email].password;

    if (email in users && users[email].password === password) {
        currentUser = email;
        setCookie('currentUser', currentUser, 7); // Set cookie for 7 days
        alert('Logged in successfully!');
        updateUI();
    } else {
        alert('Invalid email or password!');
    }
}

// Switch account function
function switchAccount() {
    const email = document.getElementById('switch-email').value;
    const password = document.getElementById('switch-password').value;

    if (email in users && users[email].password === password) {
        currentUser = email;
        setCookie('currentUser', currentUser, 7); // Set cookie for 7 days
        alert('Switched to account: ' + email);
        updateUI();
    } else {
        alert('Invalid email or password!');
    }
}

// Logout function
function logout() {
    currentUser = null;
    deleteCookie('currentUser');
    updateUI();
}

// Update UI based on current user state
function updateUI() {
    if (currentUser) {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('camera-container').style.display = 'block';
        document.getElementById('feed-container').style.display = 'block';
        document.getElementById('switch-account-container').style.display = 'block';
        startCamera();
        loadFeed();
    } else {
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('feed-container').style.display = 'none';
        document.getElementById('switch-account-container').style.display = 'none';
        stopCamera();
    }
}

// Start camera function
function startCamera() {
    const video = document.getElementById('video');

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error('Error accessing the camera', error);
        });
}

// Stop camera function
function stopCamera() {
    const video = document.getElementById('video');
    const stream = video.srcObject;

    if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }
}

// Take photo function
function takePhoto() {
    const canvas = document.getElementById('canvas');
    const video = document.getElementById('video');
    const photo = document.getElementById('photo-img');
    const context = canvas.getContext('2d');

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');
    photo.src = dataURL;
    photo.style.display = 'block';

    const timestamp = new Date().toLocaleTimeString();
    const photoData = {
        src: dataURL,
        caption: `Photo taken at ${timestamp}`
    };

    users[currentUser].photos.push(photoData);
    localStorage.setItem('users', JSON.stringify(users));
    loadFeed();
}

// Load feed function
function loadFeed() {
    const feedContainer = document.getElementById('feed');
    feedContainer.innerHTML = '';

    for (const user in users) {
        users[user].photos.forEach(photo => {
            const feedItem = document.createElement('div');
            feedItem.className = 'feed-item';
            feedItem.innerHTML = `<strong>${user}</strong>: <img src="${photo.src}" alt="Photo"> ${photo.caption}`;
            feedContainer.appendChild(feedItem);
        });
    }
}

// DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
});

