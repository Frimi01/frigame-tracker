let gameTimeSeconds = 0;
let intervalTimeSeconds = 0;
let gameTimeRemaining = 0;
let intervalTimeRemaining = 0;
let gameTimerInterval = null;
let intervalTimerInterval = null;
let isPaused = false;
let isOvertime = false;
let isAllocating = false;
let alarmNoise = new Audio('alarm.mp3');
let alarmRuinNoise = new Audio('alarmRuin.mp3');

const gameTimerDisplay = document.getElementById('game-timer');
const countdownDisplay = document.getElementById('countdown');
const applyButton = document.getElementById('btn-apply-initial');
const pauseResumeButton = document.getElementById('btn-pause-resume');
const resetPointsButton = document.getElementById('btn-reset-points');
const allocatePlayersButton = document.getElementById('btn-allocate-players');
const targetTimeInput = document.getElementById('target-time');
const targetIntervalInput = document.getElementById('target-interval');

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function saveState() {
    const points = {};
    document.querySelectorAll('.player').forEach(player => {
        const id = player.dataset.id;
        const pts = parseInt(player.querySelector('.points').textContent) || 0;
        if (id) points[id] = pts;
    });

    localStorage.setItem('gameState', JSON.stringify({
        gameTimeSeconds,
        intervalTimeSeconds,
        gameTimeRemaining,
        intervalTimeRemaining,
        isPaused,
        isOvertime,
        points
    }));
}

function loadState() {
    const raw = localStorage.getItem('gameState');
    if (!raw) return;

    const state = JSON.parse(raw);
    gameTimeSeconds = state.gameTimeSeconds ?? 0;
    intervalTimeSeconds = state.intervalTimeSeconds ?? 0;
    gameTimeRemaining = state.gameTimeRemaining ?? 0;
    intervalTimeRemaining = state.intervalTimeRemaining ?? 0;
    isPaused = state.isPaused ?? false;
    isOvertime = state.isOvertime ?? false;

    // Restore points
    document.querySelectorAll('.player').forEach(player => {
        const id = player.dataset.id;
        if (id && state.points?.[id] !== undefined) {
            player.querySelector('.points').textContent = state.points[id];
        }
    });

    // Restore displays
    gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
    countdownDisplay.textContent = formatTime(intervalTimeRemaining);
    if (isOvertime) gameTimerDisplay.style.color = 'red';

    // Restore pause button label and restart timers if a game was in progress
    pauseResumeButton.textContent = isPaused ? 'Resume' : 'Pause';
    startTimers();
}


function startTimers() {
    if (gameTimerInterval) clearInterval(gameTimerInterval);
    if (intervalTimerInterval) clearInterval(intervalTimerInterval);

    pauseResumeButton.textContent = 'Pause';

    gameTimerInterval = setInterval(() => {
        if (!isPaused) {
            if (isOvertime) {
                gameTimeRemaining++;
            } else {
                gameTimeRemaining--;
                if (gameTimeRemaining <= 0) {
                    gameTimerDisplay.style.color = 'red';
                    isOvertime = true;
                    alarmRuinNoise.play();
                }
            }
            gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
            saveState();
        }
    }, 1000);

    intervalTimerInterval = setInterval(() => {
        if (!isPaused) {
            intervalTimeRemaining--;
            if (intervalTimeRemaining < 0) {
                intervalTimeRemaining = intervalTimeSeconds - 1;
                alarmNoise.play();
            }
            countdownDisplay.textContent = formatTime(intervalTimeRemaining);
            saveState();
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

    isPaused = false;
    isOvertime = false;
    gameTimerDisplay.style.color = 'white';
    saveState();
    startTimers();
});

pauseResumeButton.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseResumeButton.textContent = isPaused ? 'Resume' : 'Pause';
    saveState();
});

resetPointsButton.addEventListener('click', () => {
    document.querySelectorAll('.player').forEach(player => {
        player.querySelector('.points').textContent = 0;
    });
    saveState();
});

allocatePlayersButton.addEventListener('click', () => {
    isAllocating = !isAllocating;
    allocatePlayersButton.style.backgroundColor = isAllocating ? 'red' : 'lightgreen'
})
document.querySelectorAll('.player').forEach(player => {
    player.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.button === 1 || e.buttons === 4) {
            console.log('middle mouse');
        } else {
            const pointsDisplay = player.querySelector('.points');
            let currentPoints = parseInt(pointsDisplay.textContent) || 0;
            pointsDisplay.textContent = currentPoints + 1;
            saveState();
        }
    });
    player.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const pointsDisplay = player.querySelector('.points');
        let currentPoints = parseInt(pointsDisplay.textContent) || 0;
        pointsDisplay.textContent = Math.max(0, currentPoints - 1);
        saveState();
    });
});

loadState();