let players = [];
let gameTimeSeconds = 0;
let intervalTimeSeconds = 0;
let gameTimeRemaining = 0;
let intervalTimeRemaining = 0;
let intervalClock = null;
let intervalCounter = 0;
let isPaused = false;
let isOvertime = false;
let isAllocating = false;
let isRemovingPlayer = false;
let alarmNoise = new Audio('alarm.mp3');
let alarmRuinNoise = new Audio('alarmRuin.mp3');

const gameTimerDisplay = document.getElementById('game-timer');
const countdownDisplay = document.getElementById('countdown');
const applyButton = document.getElementById('btn-apply-initial');
const pauseResumeButton = document.getElementById('btn-pause-resume');
const resetPointsButton = document.getElementById('btn-reset-points');
const allocatePlayersButton = document.getElementById('btn-allocate-players');
const addPlayerButton = document.getElementById('btn-add-player');
const removePlayerButton = document.getElementById('btn-remove-player')
const targetTimeInput = document.getElementById('target-time');
const targetIntervalInput = document.getElementById('target-interval');
const intervalCounterDisplay = document.getElementById('interval-counter');
const removedPlayersElement = document.getElementById("removed-players");
const activePlayersElement = document.getElementById("active-players");

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
        isOvertime,
        intervalCounter,
        points
    }));
}

function savePlayers() {
    let isAllocated = [];
    document.querySelectorAll('#active-players .player').forEach(player => {
        isAllocated.push(player.dataset.id);
    });
    localStorage.setItem('players', JSON.stringify({ players, isAllocated }));
}

function loadState() {
    const raw = localStorage.getItem('gameState');
    if (!raw) return;

    const state = JSON.parse(raw);
    gameTimeSeconds = state.gameTimeSeconds ?? 0;
    intervalTimeSeconds = state.intervalTimeSeconds ?? 0;
    gameTimeRemaining = state.gameTimeRemaining ?? 0;
    intervalTimeRemaining = state.intervalTimeRemaining ?? 0;
    intervalCounter = state.intervalCounter ?? 0;
    isOvertime = state.isOvertime ?? false;

    // Paused is true by default to force sounds to function on load, since some browsers block audio until user interaction
    isPaused = true;

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

    // Restore pause button label and restart timers if a game was in progress (deprecated: isPaused will now always be true)
    pauseResumeButton.textContent = isPaused ? 'Resume' : 'Pause';
}



function startTimers() {
    if (intervalClock) clearInterval(intervalClock);
    intervalCounterDisplay.textContent = `Intervals passed: ${intervalCounter}`;

    intervalClock = setInterval(() => {
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

            intervalTimeRemaining--;
            if (intervalTimeRemaining < 0) {
                intervalTimeRemaining = intervalTimeSeconds - 1;
                alarmNoise.play();
                intervalCounter++;
                intervalCounterDisplay.textContent = `Intervals passed: ${intervalCounter}`;
            }
            gameTimerDisplay.textContent = formatTime(gameTimeRemaining);
            countdownDisplay.textContent = formatTime(intervalTimeRemaining);
            saveState();
        }
    },1000);
}


function initializeEvents(){
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
        pauseResumeButton.textContent = 'Pause';
        intervalCounter = 0;
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
        if (isAllocating) { // saves upon toggle off
            savePlayers();
            saveState();
        }
        isAllocating = !isAllocating;
        allocatePlayersButton.style.backgroundColor = isAllocating ? 'red' : 'lightgreen'
    })

    addPlayerButton.addEventListener('click', () => {
        const name = prompt('Player name:');
        if (name && !players.includes(name)) {
            players.push(name);
            savePlayers();
            createPlayerElement(name);
        }
    });

    removePlayerButton.addEventListener('click', () => {
        if (isRemovingPlayer) { // saves upon toggle off
            savePlayers();
            saveState();
        }
        isRemovingPlayer = !isRemovingPlayer
        removePlayerButton.style.backgroundColor = isRemovingPlayer? 'red' : 'lightgreen'
    });
}

function initializePlayers() {
    const raw = JSON.parse(localStorage.getItem('players') || '{}');
    players = raw.players || [];
    const isAllocated = raw.isAllocated || [];

    players.forEach(name => {
        createPlayerElement(name, isAllocated.includes(name));
    });
}

function createPlayerElement(name, allocated = false) {
    const playerElement = document.createElement("div");
    const pointsElement = document.createElement("div");

    playerElement.textContent = name;
    playerElement.setAttribute("data-id", name);
    playerElement.classList.add("player");

    pointsElement.classList.add("points");
    pointsElement.textContent = "0";

    playerElement.appendChild(pointsElement);

    if (allocated) {
        activePlayersElement.appendChild(playerElement);
    } else {
        removedPlayersElement.appendChild(playerElement);
    }

    attachPlayerListeners(playerElement);
}

function attachPlayerListeners(player){
    player.addEventListener('click', (e) => {
        e.preventDefault();
        if (isRemovingPlayer) {
            player.remove()
            players = players.filter(p => p !== player.dataset.id);
        } else {
            if (isAllocating && player.parentElement.id === 'removed-players') {
                activePlayersElement.appendChild(player);
            } else if (isAllocating && player.parentElement.id === 'active-players') {
                removedPlayersElement.appendChild(player);
            } else {
                const pointsDisplay = player.querySelector('.points');
                let currentPoints = parseInt(pointsDisplay.textContent) || 0;
                pointsDisplay.textContent = currentPoints + 1;
            }
        }
        // Saves upon button press
    });
    player.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const pointsDisplay = player.querySelector('.points');
        let currentPoints = parseInt(pointsDisplay.textContent) || 0;
        pointsDisplay.textContent = Math.max(0, currentPoints - 1);
        saveState();
    });
}


initializePlayers();
initializeEvents();
loadState();
// Prevents timers from starting while paramaters are uninitialized.
if (gameTimeSeconds > 0 && intervalTimeSeconds > 0) {
    startTimers();
}
