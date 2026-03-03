// ...existing code...
(function () {
  const playerEls = Array.from(document.querySelectorAll('.player'));
  const initialMinutesInput = document.getElementById('initial-minutes');
  const applyBtn = document.getElementById('apply-initial');
  const pauseBtn = document.getElementById('pause-resume');

  // store remaining seconds per player id
  const remaining = {};
  let activeId = null;
  let interval = null;
  let paused = false;

  function formatTime(sec) {
    sec = Math.max(0, Math.floor(sec || 0));
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function updateDisplay(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const disp = el.querySelector('.countdown');
    disp.textContent = formatTime(remaining[id]);
  }

  function setInitialForAll() {
    const mins = Math.max(0, Number(initialMinutesInput.value) || 0);
    const secs = mins * 60;
    document.querySelectorAll('.player').forEach(p => {
      remaining[p.id] = secs;
      updateDisplay(p.id);
    });
  }

  function clearActiveClass() {
    document.querySelectorAll('.player').forEach(p => p.classList.remove('active'));
  }

  function startIntervalFor(id) {
    stopInterval();
    paused = false;
    pauseBtn.textContent = 'Pause';
    interval = setInterval(() => {
      if (paused) return;
      remaining[id] = Math.max(0, (remaining[id] || 0) - 1);
      updateDisplay(id);
      if (remaining[id] <= 0) {
        stopInterval();
      }
    }, 1000);
  }

  function stopInterval() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }

  // when a player is clicked -> make it active and start its timer
  playerEls.forEach(p => {
    p.addEventListener('click', () => {
      const id = p.id;
      // If switching from different active, stop previous interval and start the selected player's timer
      if (activeId !== id) {
        activeId = id;
        clearActiveClass();
        p.classList.add('active');
        // if player has no remaining time or zero, set initial
        if (!remaining[id] || remaining[id] <= 0) {
          const mins = Math.max(0, Number(initialMinutesInput.value) || 0);
          remaining[id] = mins * 60;
          updateDisplay(id);
        }
        startIntervalFor(id);
      } else {
        // clicking the already-active player toggles pause/resume
        paused = !paused;
        pauseBtn.textContent = paused ? 'Resume' : 'Pause';
      }
    });
  });

  pauseBtn.addEventListener('click', () => {
    if (!activeId) return;
    paused = !paused;
    pauseBtn.textContent = paused ? 'Resume' : 'Pause';
  });

  applyBtn.addEventListener('click', () => {
    setInitialForAll();
  });

  // initialize displays
  (function initDisplays() {
    const mins = Math.max(0, Number(initialMinutesInput.value) || 0);
    playerEls.forEach(p => {
      remaining[p.id] = mins * 60;
      updateDisplay(p.id);
    });
  })();
})();

