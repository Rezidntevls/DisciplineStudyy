const video= document.getElementById('video');
const startBtn = document.getElementById('start-btn');
const focusTimeEl = document.getElementById('focus-time');
const statusEl = document.getElementById('status');

let focusSeconds = 0;
let intervalId = null;

async function startCamera() {
    try {
        const stream  = await navigator.mediaDevices.getUserMedia({ video: true});
        video.srcObject = stream;
        statusEl.textContent = "Camera started, please wait.."
    } catch (error) {
        console.error(error);
        alert("Please allow camera acces to use this web.");
    }
}

function formatTime(seconds) {
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((seconds % 60) / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return '${hrs}:${mins}:${secs}';
}

async function loadmodels() {
    statusEl.textContent = "Loading face...";
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights');
    statusEl.textContent = "Loaded, ready to detect";
}

async function startDetection() {
    video.addEventListener('play', async () => {
        const detect = async () => {
            const detection = await faceapi.detectSingleFace(
                video,
                new faceapi.tinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
            );

            if (detection) {
                statusEl.textContent = "Face detected, time running"
                if (!intervalId) {
                    intervalId = setInterval(() => {
                        focusSeconds++;
                        focusTimeEl.textContent = formatTime(focusSeconds);
                    }, 1000);
                }
            } else {
                statusEl.textContent = "Face not detected, timer puased";
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
            }
            requestAnimationFrame(detect);

        };
        detect ();
    });
}

startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    await startCamera();
    await loadmodels();
    await startDetection();
});