// Timer App
class TimerApp {
  constructor() {
    this.timerDisplay = document.getElementById('timer-display');
    this.startBtn = document.getElementById('start-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.resetBtn = document.getElementById('reset-btn');
    this.lapBtn = document.getElementById('lap-btn');
    this.hoursInput = document.getElementById('hours-input');
    this.minutesInput = document.getElementById('minutes-input');
    this.secondsInput = document.getElementById('seconds-input');
    this.lapsList = document.getElementById('laps-list');
    this.lapsContainer = document.getElementById('laps-container');
    this.modeBtns = document.querySelectorAll('.mode-btn');
    this.colorOptions = document.querySelectorAll('.color-option');
    this.bgColorInput = document.getElementById('bg-color');
    this.textColorInput = document.getElementById('text-color');
    this.accentColorInput = document.getElementById('accent-color');

    this.timer = null;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.mode = 'countdown';
    this.countdownTime = 0;
    this.laps = [];

    this.init();
  }

  init() {
    this.loadPreferences();
    this.setupEventListeners();
    this.updateDisplay();
    this.applyColorPreferences();
  }

  setupEventListeners() {
    // Control buttons
    this.startBtn.addEventListener('click', () => this.startTimer());
    this.pauseBtn.addEventListener('click', () => this.pauseTimer());
    this.resetBtn.addEventListener('click', () => this.resetTimer());
    this.lapBtn.addEventListener('click', () => this.recordLap());

    // Mode selection
    this.modeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.mode = btn.dataset.mode;
        this.resetTimer();

        // Show/hide lap button and container based on mode
        if (this.mode === 'stopwatch') {
          this.lapBtn.disabled = false;
          this.lapsContainer.style.display = 'block';
        } else {
          this.lapBtn.disabled = true;
          this.lapsContainer.style.display = 'none';
        }
      });
    });

    // Time inputs
    [this.hoursInput, this.minutesInput, this.secondsInput].forEach(input => {
      input.addEventListener('change', () => {
        if (this.mode === 'countdown') {
          this.updateCountdownTime();
        }
      });
    });

    // Color customization
    this.colorOptions.forEach(option => {
      option.addEventListener('click', () => {
        this.colorOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        this.applyPresetColors(option);
        this.savePreferences();
      });
    });

    [this.bgColorInput, this.textColorInput, this.accentColorInput].forEach(input => {
      input.addEventListener('input', () => {
        this.colorOptions.forEach(opt => opt.classList.remove('active'));
        this.applyCustomColors();
        this.savePreferences();
      });
    });
  }

  startTimer() {
    if (this.isRunning) return;

    if (this.mode === 'countdown' && this.countdownTime <= 0) {
      this.updateCountdownTime();
      if (this.countdownTime <= 0) return;
    }

    this.isRunning = true;
    this.startBtn.disabled = true;
    this.pauseBtn.disabled = false;
    this.resetBtn.disabled = true;

    if (this.mode === 'countdown') {
      this.startTime = Date.now();
      this.timer = setInterval(() => this.updateCountdown(), 1000);
    } else {
      if (this.elapsedTime === 0) {
        this.startTime = Date.now();
      } else {
        this.startTime = Date.now() - this.elapsedTime;
      }
      this.timer = setInterval(() => this.updateStopwatch(), 10);
    }
  }

  pauseTimer() {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.startBtn.disabled = false;
    this.pauseBtn.disabled = true;
    this.resetBtn.disabled = false;

    clearInterval(this.timer);
    this.timer = null;

    if (this.mode === 'stopwatch') {
      this.elapsedTime = Date.now() - this.startTime;
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.elapsedTime = 0;
    this.laps = [];
    this.lapsList.innerHTML = '';
    this.updateDisplay();

    if (this.mode === 'countdown') {
      this.updateCountdownTime();
    }
  }

  updateCountdown() {
    const now = Date.now();
    const elapsed = Math.floor((now - this.startTime) / 1000);
    this.countdownTime = Math.max(0, this.countdownTime - elapsed);
    this.startTime = now;

    if (this.countdownTime <= 0) {
      this.resetTimer();
      this.notifyTimerComplete();
    }

    this.updateDisplay();
  }

  updateStopwatch() {
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay();
  }

  recordLap() {
    if (!this.isRunning || this.mode !== 'stopwatch') return;

    const lapTime = this.formatTime(this.elapsedTime);
    this.laps.unshift(lapTime);

    // Keep only the last 10 laps
    if (this.laps.length > 10) {
      this.laps.pop();
    }

    this.renderLaps();
  }

  renderLaps() {
    this.lapsList.innerHTML = '';
    this.laps.forEach((lap, index) => {
      const lapItem = document.createElement('div');
      lapItem.className = 'lap-item';
      lapItem.innerHTML = `
        <span>Lap ${this.laps.length - index}</span>
        <span>${lap}</span>
      `;
      this.lapsList.appendChild(lapItem);
    });
  }

  updateCountdownTime() {
    const hours = parseInt(this.hoursInput.value) || 0;
    const minutes = parseInt(this.minutesInput.value) || 0;
    const seconds = parseInt(this.secondsInput.value) || 0;

    this.countdownTime = (hours * 3600) + (minutes * 60) + seconds;
    this.updateDisplay();
  }

  updateDisplay() {
    if (this.mode === 'countdown') {
      this.timerDisplay.textContent = this.formatTime(this.countdownTime * 1000);
    } else {
      this.timerDisplay.textContent = this.formatTime(this.elapsedTime);
    }
  }

  formatTime(ms) {
    if (ms < 0) ms = 0;

    let totalSeconds = Math.floor(ms / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let centiseconds = Math.floor((ms % 1000) / 10);

    if (this.mode === 'countdown') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
    }
  }

  applyPresetColors(option) {
    const bgColor = option.dataset.bg;
    const textColor = option.dataset.text;
    const accentColor = option.dataset.accent;

    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);

    this.bgColorInput.value = bgColor;
    this.textColorInput.value = textColor;
    this.accentColorInput.value = accentColor;
  }

  applyCustomColors() {
    const bgColor = this.bgColorInput.value;
    const textColor = this.textColorInput.value;
    const accentColor = this.accentColorInput.value;

    document.documentElement.style.setProperty('--bg-color', bgColor);
    document.documentElement.style.setProperty('--text-color', textColor);
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }

  applyColorPreferences() {
    const preferences = this.loadPreferences();
    if (preferences) {
      document.documentElement.style.setProperty('--bg-color', preferences.bgColor);
      document.documentElement.style.setProperty('--text-color', preferences.textColor);
      document.documentElement.style.setProperty('--accent-color', preferences.accentColor);

      this.bgColorInput.value = preferences.bgColor;
      this.textColorInput.value = preferences.textColor;
      this.accentColorInput.value = preferences.accentColor;

      // Find and activate the matching preset
      this.colorOptions.forEach(option => {
        if (option.dataset.bg === preferences.bgColor &&
            option.dataset.text === preferences.textColor &&
            option.dataset.accent === preferences.accentColor) {
          option.classList.add('active');
        }
      });
    }
  }

  savePreferences() {
    const preferences = {
      bgColor: this.bgColorInput.value,
      textColor: this.textColorInput.value,
      accentColor: this.accentColorInput.value
    };
    localStorage.setItem('timerPreferences', JSON.stringify(preferences));
  }

  loadPreferences() {
    const preferences = localStorage.getItem('timerPreferences');
    return preferences ? JSON.parse(preferences) : null;
  }

  notifyTimerComplete() {
    // Simple notification - could be enhanced with sound
    alert('Timer Complete!');
    // Visual feedback
    this.timerDisplay.classList.add('pulse');
    setTimeout(() => {
      this.timerDisplay.classList.remove('pulse');
    }, 1000);
  }
}

// Add pulse animation for timer complete notification
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  .pulse {
    animation: pulse 0.5s ease-in-out 2;
  }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TimerApp();
});