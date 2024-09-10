
document.addEventListener('DOMContentLoaded', main);
const clientId = 'bf54e8ec17c246e7a7c4f9c50b0c3c9d';
const redirectUri = 'http://localhost:3000/';
let player;

function main() {
    console.log("WHAT ARE YOU DOING THIS?")
    document.cookie = "skip=yes";
    const albumCoverDiv = document.getElementById('album-cover');
    placeholderImage = 'https://th.bing.com/th/id/OIP.cGNrZQMZZByzXDowH--mAAHaEK?w=309&h=180&c=7&r=0&o=5&pid=1.7'
    albumCoverDiv.innerHTML = `<img src="${placeholderImage}" alt="Album Cover" class="album-image" />`;
    initializeEventListeners();
    
  
    const intervalId = setInterval(() => {
        try {
            testAction(); 
        } catch (error) {
            console.error("An error occurred:", error);
            clearInterval(intervalId);
        }
    }, 3000); 

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

    const rButton = document.getElementById('reset');
    if (rButton) {
        rButton.addEventListener('click', reset);
    } else {
        console.error('Test button not found');
    }
    const pButton = document.getElementById('pause');
    if (pButton) {
        pButton.addEventListener('click', pause);
    } else {
        console.error('Test button not found');
    }
    const sButton = document.getElementById('skipskit');
    if (sButton) {
        sButton.addEventListener('click', skipskit);
    } else {
        console.error('Test button not found');
    }
} 

async function  loginAction () {
    await loginHelper()
    console.log("ARE WE BACK")
 


}

async function loginHelper() {
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
songMap = {  'USRC11901149' : [167000], // situations
    'USUMG0000365' : [371000],  // black man
    'USAR10200837' : [240000],   // cot damn
    'USUYG1337329' : [195000], // over the limit
    'USWB12204049' : [130000], // blackest in the room
    'USBB40580818' : [260000], // respect
    'USUYG1483972' : [240000], // mamas prime time
    'ZZOPM1800719' : [0, 22000], // trippy
    'USLF29800320' : [285000], // aquemini
    'USRC11901148' : [192000], // fake name
    'USRC19501751' : [0,52000], // glaciers of ice
    'USSM19604190' : [0, 60000], // black jesus
    'USNPD0900955' : [0, 57000], // Canal Street raekwon
    'USQX91500710' : [344000], // 2Seater
    'USRC19305620' : [0,20000], // protect ya neck
    'USRC19300136' : [0,26000], // Tearz
    'USRC19300134' : [0, 80000], // Method Man

}
async function  testAction () {
    console.log("Test action");

    const accessToken = localStorage.access_token;


    const response = await fetch("https://api.spotify.com/v1/me/player", {
        method: 'GET',
        headers: {
             
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    
    const data = await response.json();
    //console.log("Data  ", data)
    //console.log(data['item'])
    updateSong(data)
    code = data['item']['external_ids']['isrc']
    console.log("CODE   ", code)
    
    if (document.cookie.includes('yes')){
        console.log("YOU SHOULD  Think about skipping")
                if (Object.keys(songMap).includes(code)) {
                    // console.log(`The song  `,data['item']['name'], ' is in the map' );
                    // console.log("TOTAL TIME :   " , data['item']['duration_ms'] )
                    // console.log(songMap[code][0])
                    // console.log("curr :  ", data['progress_ms'])
                    timeToSkip = songMap[code][0] - data['progress_ms']
                //    console.log(songMap[code][1])
                    if (songMap[code][1] === undefined) {
                        console.log("TIME TO SKIP TO END :   " , timeToSkip)
                        if (timeToSkip < 0 ) {
                            testAction2()
                        }
                    }
                    else{
                        console.log("TIME TO SKIP TO END :   " , timeToSkip)
                        if (timeToSkip < 0  && timeToSkip > -5000) {
                            const response3 = await fetch("https://api.spotify.com/v1/me/player/seek?position_ms=" + songMap[code][1], {
                                method: 'PUT',
                                headers: {
                                    
                                    'Authorization': 'Bearer ' + accessToken,
                                },
                            });
                        }
                    }
            
                }
            } else { console.log("No skipping right now")}
    let songBarinner = document.getElementById('songBarinner')
    let current =data['progress_ms'] / 1000
    let total  = data['item']['duration_ms'] /1000

    let currentTime = document.getElementById('currentTime')
    let minutes = Math.floor(current / 60);
    let seconds = Math.floor(current - minutes * 60);
    if (seconds < 10){
        currentTime.innerText = minutes.toString() + ':0' + seconds.toString();

    } else {
        currentTime.innerText = minutes.toString() + ':' + seconds.toString();
    }
    


    let totalTime = document.getElementById('totalTime') 
    minutes = Math.floor(total / 60);
    seconds = Math.floor(total - minutes * 60);
    totalTime.innerText = minutes.toString() + ':' + seconds.toString();

    if (seconds < 10){
        totalTime.innerText = minutes.toString() + ':0' + seconds.toString();

    } else {
        totalTime.innerText = minutes.toString() + ':' + seconds.toString();
    }


    songBarinner.style.width =  100*current/total + '%';
}

window.addEventListener('load', handleAuthResponse);


window.onSpotifyWebPlaybackSDKReady = () => {
    console.log("Spotify Web Playback SDK is ready.");
};

async function updateSong(data) {
    item = data['item']
    console.log("CURRENT SONG:  " , item)
    Songname = item['name']
    currentSong = document.getElementById('currentSong')
    console.log(currentSong)
    console.log(Songname)
    currentSong.innerText = Songname

    console.log("DATA  ", data['item']['artists'][0]['name'])

    currentArtist = document.getElementById('currentArtist')

    currentArtist.innerText = data['item']['artists'][0]['name']


    const albumImages = data.item.album.images;
    if (albumImages && albumImages.length > 0) {
        const albumCoverUrl = albumImages[0].url;
        console.log(albumCoverUrl);

        const albumCoverDiv = document.getElementById('album-cover');
        albumCoverDiv.innerHTML = `<img src="${albumCoverUrl}" alt="Album Cover" class="album-image" />`;

        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.src = albumCoverUrl;
        
        pix = findpix(img)
        body = document.body
        console.log(body.style.background)
        console.log("PIX  ", pix)
        if (pix[0] != 0 && pix[1] != 0 && pix[2] != 0) {
            body.style.background = 'linear-gradient(to top, black, rgb(' + pix[0] + ', '+ pix[1] + ', '+ pix[2] + '))'

        }
        
    }


}
async function handleAuthResponse() {
    console.log("Handling auth response");

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
        await getToken(code);

        const token = localStorage.access_token;
        console.log("TOKEN :  ", token)
        player = new Spotify.Player({
            name: 'Web Playback SDK Quick Start Player',
            getOAuthToken: cb => { cb(token); }
        });
          



        player.connect().then(success => {
            if (success) {
              console.log('The Web Playback SDK successfully connected to Spotify!');
            } else {
                console.log("somthing broke :(((")
            }
          })


    }
}


async function  testAction2 () {
    console.log("Test2 Actions")
    console.log(localStorage.access_token)
    accessToken = localStorage.access_token
    albumIDforTesting = '6YUCc2RiXcEKS9ibuZxjt0'

    const response = await fetch("https://api.spotify.com/v1/me/player/next", {
        method: 'POST',
        headers: {
            
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    
    const response2 = await fetch("https://api.spotify.com/v1/me/player", {
        method: 'GET',
        headers: {
             
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    
    const data = await response2.json();
    updateSong(data)
}

const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], "");
  }
  const sha256 = async (plain) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }
  const base64encode = (input) => {
    return btoa(String.fromCharCode(...new Uint8Array(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  const getToken = async (code) => {
    console.log("REALLY ??")
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

async function reset() {
    console.log("resetting")
    getRefreshToken()   
}
const getRefreshToken = async () => {

    // refresh token that has been previously stored
    const refreshToken = localStorage.getItem('refresh_token');
    const url = "https://accounts.spotify.com/api/token";
 
     const payload = {
       method: 'POST',
       headers: {
         'Content-Type': 'application/x-www-form-urlencoded'
       },
       body: new URLSearchParams({
         grant_type: 'refresh_token',
         refresh_token: refreshToken,
         client_id: clientId
       }),
     }
     const body = await fetch(url, payload);
     const response = await body.json();
 
     localStorage.setItem('access_token', response.accessToken);
     if (response.refreshToken) {
       localStorage.setItem('refresh_token', response.refreshToken);
     }
   }

async function pause() {
    const accessToken = localStorage.access_token;
    console.log("pausing")
    const response2 = await fetch("https://api.spotify.com/v1/me/player", {
        method: 'GET',
        headers: {
             
            'Authorization': 'Bearer ' + accessToken,
        },
    });
    
    const data = await response2.json();
    console.log("is playing?  " , data['is_playing'])
    if (data['is_playing'] == false) {
        console.log(" resume")
        const pauseB = document.getElementById('pause');

        const response2 = await fetch("https://api.spotify.com/v1/me/player/play", {
            method: 'PUT',
            headers: {
                 
                'Authorization': 'Bearer ' + accessToken,
            },
        });



        pauseB.innerText = 'Pause'
    } else {
        console.log(" pausing")
        const pauseB = document.getElementById('pause');

        const response2 = await fetch("https://api.spotify.com/v1/me/player/pause", {
            method: 'PUT',
            headers: {
                 
                'Authorization': 'Bearer ' + accessToken,
            },
        });
        pauseB.innerText = 'Resume'

    }
}

async function skipskit() {
    cookie = document.cookie;
    console.log("toggling skip   ", cookie);
    const skitbutton = document.getElementById('skipskit');
    console.log(skitbutton)
    if (cookie.includes('yes')) {
        // turn off
        document.cookie = "skip=no";
        // 
        skitbutton.innerText = 'Skit Skipping: Off'
    } else {
        //turn on
        document.cookie = "skip=yes";
        skitbutton.innerText = 'Skit Skipping: On'
    }

}





function findpix(img) {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const pixelData = ctx.getImageData(50, 50, 1, 1).data;
    return pixelData
};