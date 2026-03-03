let gameTimeSeconds = 0;
let intervalTimeSeconds = 0;
let gameTimeRemaining = 0;
let intervalTimeRemaining = 0;
let gameTimerInterval = null;
let intervalTimerInterval = null;
let isPaused = false;
let isOvertime = false;
let alarmNoise = new Audio('alarm.mp3');
let alarmRuinNoise = new Audio('alarmRuin.mp3');

const gameTimerDisplay = document.getElementById('game-timer');
const countdownDisplay = document.getElementById('countdown');
const applyButton = document.getElementById('apply-initial');
const pauseResumeButton = document.getElementById('pause-resume');
const resetPointsButton = document.getElementById('btn-reset-points');
const targetTimeInput = document.getElementById('target-time');
const targetIntervalInput = document.getElementById('target-interval');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimers() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    if (intervalTimerInterval) clearInterval(intervalTimerInterval);

    isPaused = false;
    isOvertime = false;
    pauseResumeButton.textContent = 'Pause';
    gameTimerDisplay.style.color = 'white';

    gameTimerInterval = setInterval(() => {
        if (!isPaused) {
            if (isOvertime) {
                gameTimeRemaining++;
                gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
            } else {
                gameTimeRemaining--;
                gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
                if (gameTimeRemaining <= 0) {
                    gameTimerDisplay.style.color = 'red';
                    isOvertime = true;
                    alarmRuinNoise.play();
                }
            }
        }
    }, 1000);

    intervalTimerInterval = setInterval(() => {
        if (!isPaused) {
            intervalTimeRemaining--;
            if (intervalTimeRemaining < 0) {
                intervalTimeRemaining = intervalTimeSeconds -1;
                alarmNoise.play();
            }
            countdownDisplay.textContent = formatTime(intervalTimeRemaining);
        }
    }, 1000);
}

applyButton.addEventListener('click', () => {
    gameTimeSeconds = parseFloat(targetTimeInput.value) * 60 || 0;
    intervalTimeSeconds = parseFloat(targetIntervalInput.value) * 60 || 0;
    gameTimeRemaining = gameTimeSeconds;
    intervalTimeRemaining = intervalTimeSeconds;

    gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
    countdownDisplay.textContent = formatTime(intervalTimeRemaining);

    startTimers();
});

pauseResumeButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseResumeButton.textContent = isPaused ? 'Resume' : 'Pause';
resetPointsButton.addEventListener('click', () => {
    document.querySelectorAll('.player').forEach(player => {
        player.querySelector('.points').textContent = 0;
    });
});

document.querySelectorAll('.player').forEach(player => {
    player.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.button === 1 || e.buttons === 4) {
            console.log('middle mouse');
        } else {
            const pointsDisplay = player.querySelector('.points');
            let currentPoints = parseInt(pointsDisplay.textContent) || 0;
            pointsDisplay.textContent = currentPoints + 1;
        }
    });
    player.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const pointsDisplay = player.querySelector('.points');
        let currentPoints = parseInt(pointsDisplay.textContent) || 0;
        pointsDisplay.textContent = Math.max(0, currentPoints - 1);
    });
});
