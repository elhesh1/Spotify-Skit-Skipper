document.addEventListener('DOMContentLoaded', main);
const clientId = 'bf54e8ec17c246e7a7c4f9c50b0c3c9d';
const redirectUri = 'http://localhost:3000/';

function main() {
    initializeEventListeners();
}

function initializeEventListeners() {
    const loginButton = document.getElementById('login');
    if (loginButton) {
        loginButton.addEventListener('click', loginAction);
    } else {
        console.error('Login button not found');
    }

    const testButton = document.getElementById('test');
    if (testButton) {
        testButton.addEventListener('click', testAction);
    } else {
        console.error('Test button not found');
    }

    const testButton2 = document.getElementById('test2');
    if (testButton2) {
        testButton2.addEventListener('click', testAction2);
    } else {
        console.error('Test2 button not found');
    }
}

async function loginAction() {      // work on getting album back...
    console.log("Logging in");
    const codeVerifier = generateRandomString(64);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);

    const scope = 'user-read-private user-read-email user-read-playback-state user-modify-playback-state';
    const authUrl = new URL("https://accounts.spotify.com/authorize");

    localStorage.setItem('code_verifier', codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope: scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

const getToken = async (code) => {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const codeVerifier = localStorage.getItem('code_verifier');

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        }),
    };

    const response = await fetch(tokenUrl, payload);
    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token); // Store the refresh token
        localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000); // Store token expiry time
    } else {
        console.error('Failed to get token', data);
    }
    return data;
}

const refreshToken = async () => {
    const tokenUrl = 'https://accounts.spotify.com/api/token';
    const refreshToken = localStorage.getItem('refresh_token');

    const payload = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    };

    const response = await fetch(tokenUrl, payload);
    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_expiry', Date.now() + data.expires_in * 1000); // Update token expiry time
    } else {
        console.error('Failed to refresh token', data);
    }
    return data;
}

const getAccessToken = async () => {
    const expiry = localStorage.getItem('token_expiry');
    if (expiry && Date.now() > expiry) {
        console.log('Access token expired. Refreshing token...');
        await refreshToken();
    }
    return localStorage.getItem('access_token');
}

function generateRandomString(length) {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let text = '';
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return crypto.subtle.digest('SHA-256', data);
}

function base64encode(input) {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

async function testAction() {
    console.log("Testing");
    const storedToken = await getAccessToken();
    if (storedToken) {
        try {
            const profile = await getUserProfile(storedToken);
            console.log("Profile:", profile);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    } else {
        console.error('No access token found');
    }
}

const getUserProfile = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${data.error.message}`);
    }
    return data;
}

async function testAction2() {
    console.log("Testing player");
    const storedToken = await getAccessToken();
    if (storedToken) {
        try {
            const data = await getCurrentPlayer(storedToken);
            console.log("Player data:", data);
        } catch (error) {
            console.error('Error fetching player data:', error);
        }
    } else {
        console.error('No access token found');
    }
}

const getCurrentPlayer = async (accessToken) => {
    const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        },
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`${data.error.message}`);
    }
    return data;
}

// window.onSpotifyWebPlaybackSDKReady = () => {
//     getAccessToken().then(storedToken => {
//         if (storedToken) {
//             const player = new Spotify.Player({
//                 name: 'Web Playback SDK Quick Start Player',
//                 getOAuthToken: cb => { cb(storedToken); },
//                 volume: 0.5
//             });

//             player.addListener('initialization_error', ({ message }) => console.error('Initialization Error:', message));
//             player.addListener('authentication_error', ({ message }) => console.error('Authentication Error:', message));
//             player.addListener('account_error', ({ message }) => console.error('Account Error:', message));
//             player.addListener('playback_error', ({ message }) => console.error('Playback Error:', message));

//             player.addListener('ready', ({ device_id }) => {
//                 console.log('Ready with Device ID:', device_id);
//             });

//             player.addListener('not_ready', ({ device_id }) => {
//                 console.log('Device has gone offline:', device_id);
//             });

//             player.connect();
//         } else {
//             console.error('No access token found');
//         }
//     });
// }
