/**
 * ============================================================================
 * CYBER SNAKE // PROTOCOL 2099 - GAME ENGINE
 * Complete, Advanced Futuristic Arcade Experience
 * Pure Vanilla JavaScript & Web Audio API
 * ============================================================================
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. AUDIO SYNTHESIZER (WEB AUDIO API - ZERO EXTERNAL ASSET DEPENDENCIES)
     ========================================================================== */

  class CyberAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.sfxGain = null;
      this.bgmGain = null;

      this.soundEnabled = true;
      this.musicEnabled = true;
      this.sfxVolume = 0.75;
      this.bgmVolume = 0.60;

      this.bgmPlaying = false;
      this.bgmTimer = null;
      this.bgmStep = 0;
      this.bgmTempo = 132; // BPM
      this.unlocked = false;
    }

    init() {
      if (this.ctx) return;
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 1.0;
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.value = this.soundEnabled ? this.sfxVolume : 0;
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.value = this.musicEnabled ? this.bgmVolume : 0;
        this.bgmGain.connect(this.masterGain);

        this.unlocked = true;
      } catch (e) {
        console.warn('Web Audio not supported or blocked:', e);
      }
    }

    resume() {
      if (!this.ctx) this.init();
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    setSoundEnabled(enabled) {
      this.soundEnabled = enabled;
      if (this.sfxGain) {
        this.sfxGain.gain.value = enabled ? this.sfxVolume : 0;
      }
    }

    setMusicEnabled(enabled) {
      this.musicEnabled = enabled;
      if (this.bgmGain) {
        this.bgmGain.gain.value = enabled ? this.bgmVolume : 0;
      }
      if (enabled && !this.bgmPlaying) {
        this.startBgm();
      } else if (!enabled && this.bgmPlaying) {
        this.stopBgm();
      }
    }

    setSfxVolume(vol) {
      this.sfxVolume = vol;
      if (this.sfxGain && this.soundEnabled) {
        this.sfxGain.gain.value = vol;
      }
    }

    setBgmVolume(vol) {
      this.bgmVolume = vol;
      if (this.bgmGain && this.musicEnabled) {
        this.bgmGain.gain.value = vol;
      }
    }

    playClick() {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.04);
    }

    playBite(combo = 1) {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = Math.min(300 + (combo * 40), 950);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.8, now + 0.09);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.09);
    }

    playPowerup(type) {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;

      // Arpeggiated cyber chime
      const freqs = type === 'shield' ? [440, 554, 659, 880] :
                    type === 'ghost' ? [300, 450, 600, 900] :
                    type === 'magnet' ? [523, 659, 784, 1046] :
                    [400, 600, 800, 1200];

      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.04;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    }

    playShieldAbsorb() {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.25);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.25);
    }

    playGameOver() {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;

      // Deep glitch drop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.5);
    }

    playSectorClear() {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    }

    playAchievement() {
      if (!this.soundEnabled || !this.ctx) return;
      this.resume();
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];

      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.3, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    }

    /* Cyber Synthwave Procedural BGM Sequencer */
    startBgm() {
      if (!this.musicEnabled || this.bgmPlaying || !this.ctx) return;
      this.resume();
      this.bgmPlaying = true;
      this.bgmStep = 0;

      // 16-step bass & arpeggio notes in D minor Cyberpunk scale
      const bassNotes = [73.42, 73.42, 87.31, 73.42, 98.00, 73.42, 87.31, 110.00];
      const leadNotes = [293.66, 349.23, 440.00, 523.25, 440.00, 392.00, 349.23, 293.66];

      const stepDuration = (60 / this.bgmTempo) / 4; // 16th note

      const tick = () => {
        if (!this.bgmPlaying) return;
        const now = this.ctx.currentTime;

        // Bass synth on every 8th note
        if (this.bgmStep % 2 === 0) {
          const bassFreq = bassNotes[(this.bgmStep / 2) % bassNotes.length];
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bassFreq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(320, now);
          filter.frequency.exponentialRampToValueAtTime(120, now + 0.18);

          bassGain.gain.setValueAtTime(0.35, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

          bassOsc.connect(filter);
          filter.connect(bassGain);
          bassGain.connect(this.bgmGain);

          bassOsc.start(now);
          bassOsc.stop(now + 0.18);
        }

        // Arp lead on every 16th note
        const leadFreq = leadNotes[this.bgmStep % leadNotes.length];
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();

        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, now);

        leadGain.gain.setValueAtTime(0.08, now);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);

        leadOsc.start(now);
        leadOsc.stop(now + 0.1);

        // Cyber Kick / Beat on step 0, 4, 8, 12
        if (this.bgmStep % 4 === 0) {
          const kickOsc = this.ctx.createOscillator();
          const kickGain = this.ctx.createGain();

          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(140, now);
          kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

          kickGain.gain.setValueAtTime(0.4, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

          kickOsc.connect(kickGain);
          kickGain.connect(this.bgmGain);

          kickOsc.start(now);
          kickOsc.stop(now + 0.12);
        }

        this.bgmStep = (this.bgmStep + 1) % 16;
        this.bgmTimer = setTimeout(tick, stepDuration * 1000);
      };

      tick();
    }

    stopBgm() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  /* ==========================================================================
     2. GAME DATA, STATE, ACHIEVEMENTS & SECTORS
     ========================================================================== */

  const GRID_SIZE = 24; // 24x24 grid

  const DIRECTIONS = {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  };

  const DIFFICULTY_SETTINGS = {
    easy: { baseSpeed: 155, minSpeed: 95, speedStep: 1.2, name: 'CASUAL' },
    normal: { baseSpeed: 115, minSpeed: 68, speedStep: 1.6, name: 'STANDARD' },
    hard: { baseSpeed: 85, minSpeed: 48, speedStep: 2.0, name: 'CYBER' },
    insane: { baseSpeed: 60, minSpeed: 35, speedStep: 2.4, name: 'OVERCLOCK' }
  };

  const ACHIEVEMENTS_DATA = [
    { id: 'FIRST_BYTE', icon: '⚡', title: 'First Byte', desc: 'Acquire your first energy data core.' },
    { id: 'CENTIPEDE', icon: '🐍', title: 'Centipede', desc: 'Grow your snake matrix to 20 segments.' },
    { id: 'GIGA_SNAKE', icon: '🧬', title: 'Giga Snake', desc: 'Expand snake length to 45 segments.' },
    { id: 'SPEED_DEMON', icon: '🚀', title: 'Speed Demon', desc: 'Maintain turbo boost for 5 continuous seconds.' },
    { id: 'GHOST_WALKER', icon: '👻', title: 'Ghost Protocol', desc: 'Pass through yourself or a wall in Ghost mode.' },
    { id: 'AEGIS_GUARD', icon: '🛡️', title: 'Aegis Defender', desc: 'Absorb a fatal collision using the Energy Shield.' },
    { id: 'DATA_HOARDER', icon: '💾', title: 'Data Hoarder', desc: 'Reach a score of 1,000 points in one run.' },
    { id: 'NEURAL_MASTER', icon: '🧠', title: 'Neural Master', desc: 'Achieve a score of 5,000 points.' },
    { id: 'CYBER_GOD', icon: '👑', title: 'Cyber Overlord', desc: 'Attain 10,000 points in any mode.' },
    { id: 'SECTOR_01', icon: '🌐', title: 'Subnet Infiltrator', desc: 'Clear Sector 01 in Campaign mode.' },
    { id: 'MAINFRAME_ROOT', icon: '💻', title: 'Mainframe Root', desc: 'Clear all 6 Campaign Sectors.' },
    { id: 'OVERCLOCK_HERO', icon: '🔥', title: 'Overclock Survivor', desc: 'Score 1,500+ on Overclock difficulty.' }
  ];

  const CAMPAIGN_SECTORS = [
    {
      sector: 1,
      name: 'SECTOR 01: SUBNET GATEWAY',
      targetFood: 12,
      obstacles: []
    },
    {
      sector: 2,
      name: 'SECTOR 02: FIREWALL GRID',
      targetFood: 15,
      obstacles: [
        { x: 6, y: 6, w: 2, h: 2 },
        { x: 16, y: 6, w: 2, h: 2 },
        { x: 6, y: 16, w: 2, h: 2 },
        { x: 16, y: 16, w: 2, h: 2 }
      ]
    },
    {
      sector: 3,
      name: 'SECTOR 03: DATA HIGHWAY',
      targetFood: 18,
      obstacles: [
        { x: 5, y: 11, w: 14, h: 2 }
      ]
    },
    {
      sector: 4,
      name: 'SECTOR 04: NEURAL CROSS',
      targetFood: 22,
      obstacles: [
        { x: 11, y: 4, w: 2, h: 16 },
        { x: 4, y: 11, w: 16, h: 2 }
      ]
    },
    {
      sector: 5,
      name: 'SECTOR 05: QUANTUM VAULT',
      targetFood: 25,
      obstacles: [
        { x: 5, y: 5, w: 4, h: 2 },
        { x: 15, y: 5, w: 4, h: 2 },
        { x: 5, y: 17, w: 4, h: 2 },
        { x: 15, y: 17, w: 4, h: 2 },
        { x: 10, y: 9, w: 4, h: 6 }
      ]
    },
    {
      sector: 6,
      name: 'SECTOR 06: CORE MAINFRAME',
      targetFood: 30,
      obstacles: [
        { x: 4, y: 4, w: 16, h: 1 },
        { x: 4, y: 19, w: 16, h: 1 },
        { x: 4, y: 5, w: 1, h: 14 },
        { x: 19, y: 5, w: 1, h: 14 },
        { x: 10, y: 10, w: 4, h: 4 }
      ]
    }
  ];

  /* ==========================================================================
     3. MAIN GAME CONTROLLER CLASS
     ========================================================================== */

  class CyberSnakeGame {
    constructor() {
      // Audio Engine
      this.audio = new CyberAudioEngine();

      // Canvas & Rendering
      this.canvas = document.getElementById('gameCanvas');
      this.ctx = this.canvas.getContext('2d');
      this.dpr = window.devicePixelRatio || 1;
      this.cellSize = 25; // Computed on resize

      // Game States: 'MENU', 'PLAYING', 'PAUSED', 'GAMEOVER', 'SECTOR_CLEAR'
      this.state = 'MENU';
      this.gameMode = 'classic'; // 'classic', 'obstacles', 'campaign', 'timeAttack'
      this.difficulty = 'normal';

      // Snake Entity
      this.snake = [];
      this.direction = DIRECTIONS.RIGHT;
      this.directionQueue = [];
      this.lastTickDirection = DIRECTIONS.RIGHT;
      this.growPending = 0;

      // Foods & Power-ups
      this.standardFood = null;
      this.specialFood = null; // bonus, ghost, magnet, shield, multiplier, cleanser
      this.specialFoodTimer = 0;
      this.nextSpecialSpawnScore = 30;

      // Active Buffs / Power-ups
      this.activeBuffs = {
        ghost: 0,
        magnet: 0,
        shield: false,
        multiplier: 0
      };

      // Obstacles
      this.obstacles = [];

      // Campaign Progression
      this.currentSectorIdx = 0;
      this.sectorFoodCollected = 0;

      // Time Attack
      this.timeAttackSeconds = 60;
      this.timeAttackTimerId = null;

      // Scores & Metrics
      this.score = 0;
      this.foodEatenCount = 0;
      this.powerupsCollected = 0;
      this.startTime = 0;
      this.elapsedTime = 0;
      this.peakLength = 3;
      this.comboCount = 0;
      this.comboTimer = null;
      this.isBoosting = false;
      this.boostDuration = 0;

      // High Scores & Achievements (LocalStorage)
      this.highScores = this.loadHighScores();
      this.unlockedAchievements = this.loadAchievements();

      // Settings
      this.settings = this.loadSettings();

      // Particles & Screen FX
      this.particles = [];
      this.screenShake = 0;

      // Timing & Game Loop
      this.lastFrameTime = performance.now();
      this.accumulatedTickTime = 0;
      this.fps = 60;
      this.fpsTimer = performance.now();
      this.frameCount = 0;

      // DOM Elements Cache
      this.dom = this.cacheDomElements();

      // Setup Listeners & Initial State
      this.initCanvasSize();
      this.initEvents();
      this.applySettings();
      this.renderAchievementsModal();
      this.updateHudHiScore();

      // Start render loop
      requestAnimationFrame(this.loop.bind(this));
    }

    /* Cache all DOM elements */
    cacheDomElements() {
      return {
        // Overlays
        startScreen: document.getElementById('startScreen'),
        pauseScreen: document.getElementById('pauseScreen'),
        gameOverScreen: document.getElementById('gameOverScreen'),
        sectorClearScreen: document.getElementById('sectorClearScreen'),
        howToPlayScreen: document.getElementById('howToPlayScreen'),
        achievementsScreen: document.getElementById('achievementsScreen'),
        settingsScreen: document.getElementById('settingsScreen'),

        // HUD Elements
        gameHud: document.getElementById('gameHud'),
        hudScore: document.getElementById('hudScore'),
        hudMultiplier: document.getElementById('hudMultiplier'),
        hudHiScore: document.getElementById('hudHiScore'),
        hudLength: document.getElementById('hudLength'),
        sectorDisplay: document.getElementById('sectorDisplay'),
        timeAttackClock: document.getElementById('timeAttackClock'),
        activePowerupsBar: document.getElementById('activePowerupsBar'),

        // Game Over Elements
        deathReasonText: document.getElementById('deathReasonText'),
        goFinalScore: document.getElementById('goFinalScore'),
        goBestScore: document.getElementById('goBestScore'),
        goNewRecordTag: document.getElementById('goNewRecordTag'),
        goFoodEaten: document.getElementById('goFoodEaten'),
        goPeakLength: document.getElementById('goPeakLength'),
        goSurvivalTime: document.getElementById('goSurvivalTime'),
        goPowerupsCount: document.getElementById('goPowerupsCount'),

        // Sector Clear Elements
        sectorScoreReward: document.getElementById('sectorScoreReward'),
        nextSectorName: document.getElementById('nextSectorName'),
        sectorClearSubText: document.getElementById('sectorClearSubText'),

        // Header Buttons
        quickSoundBtn: document.getElementById('quickSoundBtn'),
        quickMusicBtn: document.getElementById('quickMusicBtn'),
        quickPauseBtn: document.getElementById('quickPauseBtn'),

        // Action Buttons
        btnPlayGame: document.getElementById('btnPlayGame'),
        btnRestartGame: document.getElementById('btnRestartGame'),
        btnResume: document.getElementById('btnResume'),
        btnRestartFromPause: document.getElementById('btnRestartFromPause'),
        btnSettingsFromPause: document.getElementById('btnSettingsFromPause'),
        btnQuitToMenu: document.getElementById('btnQuitToMenu'),
        btnBackToMenuFromGameOver: document.getElementById('btnBackToMenuFromGameOver'),
        btnShareScore: document.getElementById('btnShareScore'),
        btnNextSector: document.getElementById('btnNextSector'),
        btnSectorMenu: document.getElementById('btnSectorMenu'),
        btnOpenHowToPlay: document.getElementById('btnOpenHowToPlay'),
        btnOpenAchievements: document.getElementById('btnOpenAchievements'),
        btnOpenSettings: document.getElementById('btnOpenSettings'),
        btnResetData: document.getElementById('btnResetData'),

        // Settings Elements
        settingSoundMute: document.getElementById('settingSoundMute'),
        settingSoundVol: document.getElementById('settingSoundVol'),
        settingMusicMute: document.getElementById('settingMusicMute'),
        settingMusicVol: document.getElementById('settingMusicVol'),
        settingWalls: document.getElementById('settingWalls'),
        settingScanlines: document.getElementById('settingScanlines'),
        settingParticles: document.getElementById('settingParticles'),
        settingDpad: document.getElementById('settingDpad'),

        // Mobile Controls
        touchControlsContainer: document.getElementById('touchControlsContainer'),
        touchBoostBtn: document.getElementById('touchBoostBtn'),
        touchPauseBtn: document.getElementById('touchPauseBtn'),

        // Global Overlays & Status
        cyberScanlines: document.getElementById('cyberScanlines'),
        toastContainer: document.getElementById('toastContainer'),
        achievementsList: document.getElementById('achievementsList'),
        achievementsCount: document.getElementById('achievementsCount'),
        fpsCounter: document.getElementById('fpsCounter'),
        statusIndicator: document.getElementById('statusIndicator')
      };
    }

    /* Initialize Canvas Resolution with HiDPI */
    initCanvasSize() {
      const wrapper = document.getElementById('canvasWrapper');
      const rect = wrapper.getBoundingClientRect();
      const cssSize = Math.floor(Math.min(rect.width, rect.height));

      this.canvas.width = cssSize * this.dpr;
      this.canvas.height = cssSize * this.dpr;

      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      this.cellSize = cssSize / GRID_SIZE;
    }

    /* Setup All Event Listeners */
    initEvents() {
      // Window Resize
      window.addEventListener('resize', () => {
        this.initCanvasSize();
      });

      // Keyboard Controls
      window.addEventListener('keydown', (e) => this.handleKeyDown(e));
      window.addEventListener('keyup', (e) => this.handleKeyUp(e));

      // Mobile Touch Swipes on Canvas
      this.initTouchSwipes();

      // Mobile Virtual D-Pad Buttons
      document.querySelectorAll('.dpad-btn').forEach(btn => {
        const dir = btn.getAttribute('data-dir');
        const handlePress = (e) => {
          e.preventDefault();
          this.setDirection(dir);
        };
        btn.addEventListener('touchstart', handlePress, { passive: false });
        btn.addEventListener('mousedown', handlePress);
      });

      // Mobile Turbo Boost Button
      const startBoost = (e) => {
        e.preventDefault();
        this.isBoosting = true;
        this.dom.touchBoostBtn.classList.add('active');
      };
      const endBoost = (e) => {
        e.preventDefault();
        this.isBoosting = false;
        this.dom.touchBoostBtn.classList.remove('active');
      };
      this.dom.touchBoostBtn.addEventListener('touchstart', startBoost, { passive: false });
      this.dom.touchBoostBtn.addEventListener('touchend', endBoost, { passive: false });
      this.dom.touchBoostBtn.addEventListener('mousedown', startBoost);
      this.dom.touchBoostBtn.addEventListener('mouseup', endBoost);
      this.dom.touchBoostBtn.addEventListener('mouseleave', endBoost);

      // Mobile Pause Button
      this.dom.touchPauseBtn.addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      // Header Controls
      this.dom.quickSoundBtn.addEventListener('click', () => {
        this.toggleSound();
      });
      this.dom.quickMusicBtn.addEventListener('click', () => {
        this.toggleMusic();
      });
      this.dom.quickPauseBtn.addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      // Mode Selector Chips
      document.querySelectorAll('.mode-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.audio.playClick();
          document.querySelectorAll('.mode-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.gameMode = chip.getAttribute('data-mode');
          this.updateHudHiScore();
        });
      });

      // Difficulty Selector Chips
      document.querySelectorAll('.diff-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          this.audio.playClick();
          document.querySelectorAll('.diff-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
          this.difficulty = chip.getAttribute('data-diff');
          this.updateHudHiScore();
        });
      });

      // Primary Action Buttons
      this.dom.btnPlayGame.addEventListener('click', () => {
        this.audio.playClick();
        this.startNewGame();
      });

      this.dom.btnRestartGame.addEventListener('click', () => {
        this.audio.playClick();
        this.startNewGame();
      });

      this.dom.btnResume.addEventListener('click', () => {
        this.audio.playClick();
        this.togglePause();
      });

      this.dom.btnRestartFromPause.addEventListener('click', () => {
        this.audio.playClick();
        this.hideAllOverlays();
        this.startNewGame();
      });

      this.dom.btnQuitToMenu.addEventListener('click', () => {
        this.audio.playClick();
        this.quitToMenu();
      });

      this.dom.btnBackToMenuFromGameOver.addEventListener('click', () => {
        this.audio.playClick();
        this.quitToMenu();
      });

      this.dom.btnSettingsFromPause.addEventListener('click', () => {
        this.audio.playClick();
        this.openModal('settingsScreen');
      });

      this.dom.btnOpenHowToPlay.addEventListener('click', () => {
        this.audio.playClick();
        this.openModal('howToPlayScreen');
      });

      this.dom.btnOpenAchievements.addEventListener('click', () => {
        this.audio.playClick();
        this.renderAchievementsModal();
        this.openModal('achievementsScreen');
      });

      this.dom.btnOpenSettings.addEventListener('click', () => {
        this.audio.playClick();
        this.openModal('settingsScreen');
      });

      // Close modal buttons
      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          this.audio.playClick();
          const targetId = btn.getAttribute('data-close');
          this.closeModal(targetId);
        });
      });

      // Campaign Sector Cleared Buttons
      this.dom.btnNextSector.addEventListener('click', () => {
        this.audio.playClick();
        this.advanceToNextSector();
      });

      this.dom.btnSectorMenu.addEventListener('click', () => {
        this.audio.playClick();
        this.quitToMenu();
      });

      // Share / Copy Score transmission
      this.dom.btnShareScore.addEventListener('click', () => {
        this.copyScoreTransmission();
      });

      // Settings Inputs
      this.dom.settingSoundMute.addEventListener('change', (e) => {
        this.settings.soundEnabled = e.target.checked;
        this.audio.setSoundEnabled(e.target.checked);
        this.saveSettings();
        this.updateHeaderAudioIcons();
      });

      this.dom.settingSoundVol.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        this.settings.sfxVolume = val;
        this.audio.setSfxVolume(val);
        this.saveSettings();
      });

      this.dom.settingMusicMute.addEventListener('change', (e) => {
        this.settings.musicEnabled = e.target.checked;
        this.audio.setMusicEnabled(e.target.checked);
        this.saveSettings();
        this.updateHeaderAudioIcons();
      });

      this.dom.settingMusicVol.addEventListener('input', (e) => {
        const val = parseInt(e.target.value) / 100;
        this.settings.bgmVolume = val;
        this.audio.setBgmVolume(val);
        this.saveSettings();
      });

      this.dom.settingWalls.addEventListener('change', (e) => {
        this.settings.wallMode = e.target.value;
        this.saveSettings();
      });

      this.dom.settingScanlines.addEventListener('change', (e) => {
        this.settings.scanlines = e.target.checked;
        this.dom.cyberScanlines.classList.toggle('disabled', !e.target.checked);
        this.saveSettings();
      });

      this.dom.settingParticles.addEventListener('change', (e) => {
        this.settings.particles = e.target.value;
        this.saveSettings();
      });

      this.dom.settingDpad.addEventListener('change', (e) => {
        this.settings.dpadMode = e.target.value;
        this.saveSettings();
        this.updateDpadVisibility();
      });

      // Reset High Scores
      this.dom.btnResetData.addEventListener('click', () => {
        if (confirm('DANGER: Purge all local high scores and unlocked achievements?')) {
          localStorage.removeItem('cybersnake_highscores');
          localStorage.removeItem('cybersnake_achievements');
          this.highScores = {};
          this.unlockedAchievements = [];
          this.renderAchievementsModal();
          this.updateHudHiScore();
          this.showToast('PROTOCOL RESET', 'All system memory records cleared.');
        }
      });
    }

    /* Touch Swiping on Canvas */
    initTouchSwipes() {
      let touchStartX = 0;
      let touchStartY = 0;
      const minDistance = 24;

      this.canvas.addEventListener('touchstart', (e) => {
        if (this.state !== 'PLAYING') return;
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
      }, { passive: true });

      this.canvas.addEventListener('touchmove', (e) => {
        if (this.state !== 'PLAYING') return;
        e.preventDefault(); // Prevent page scroll during game
      }, { passive: false });

      this.canvas.addEventListener('touchend', (e) => {
        if (this.state !== 'PLAYING') return;
        const touch = e.changedTouches[0];
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
          if (Math.abs(diffX) >= minDistance) {
            this.setDirection(diffX > 0 ? 'RIGHT' : 'LEFT');
          }
        } else {
          if (Math.abs(diffY) >= minDistance) {
            this.setDirection(diffY > 0 ? 'DOWN' : 'UP');
          }
        }
      }, { passive: true });
    }

    /* Key Listeners */
    handleKeyDown(e) {
      // First key unlocks Web Audio context
      this.audio.resume();

      if (e.repeat) return;

      const key = e.key.toLowerCase();

      // Pause toggle
      if (key === 'p' || key === 'escape') {
        if (this.state === 'PLAYING' || this.state === 'PAUSED') {
          e.preventDefault();
          this.togglePause();
          return;
        }
      }

      // Quick audio toggles
      if (key === 'm') {
        this.toggleSound();
        return;
      }
      if (key === 'n') {
        this.toggleMusic();
        return;
      }

      // Boosting with Space or Shift
      if (key === ' ' || key === 'shift') {
        if (this.state === 'PLAYING') {
          e.preventDefault();
          this.isBoosting = true;
          this.dom.touchBoostBtn.classList.add('active');
          return;
        }
      }

      // Movement Directions
      if (this.state === 'PLAYING') {
        if (key === 'arrowup' || key === 'w') {
          e.preventDefault();
          this.setDirection('UP');
        } else if (key === 'arrowdown' || key === 's') {
          e.preventDefault();
          this.setDirection('DOWN');
        } else if (key === 'arrowleft' || key === 'a') {
          e.preventDefault();
          this.setDirection('LEFT');
        } else if (key === 'arrowright' || key === 'd') {
          e.preventDefault();
          this.setDirection('RIGHT');
        }
      }
    }

    handleKeyUp(e) {
      const key = e.key.toLowerCase();
      if (key === ' ' || key === 'shift') {
        this.isBoosting = false;
        this.dom.touchBoostBtn.classList.remove('active');
      }
    }

    /* Direction Management with Safe Queue */
    setDirection(dirName) {
      const targetDir = DIRECTIONS[dirName];
      if (!targetDir) return;

      // Base direction against the last queued or currently active tick direction
      const currentRef = this.directionQueue.length > 0
        ? this.directionQueue[this.directionQueue.length - 1]
        : this.lastTickDirection;

      // Prevent 180-degree instant reverse suicide
      if (targetDir.x === -currentRef.x && targetDir.y === -currentRef.y) {
        return;
      }

      // Limit queue to 2 turns to ensure crisp responsiveness
      if (this.directionQueue.length < 2) {
        this.directionQueue.push(targetDir);
      }
    }

    /* Audio Toggle Shortcuts */
    toggleSound() {
      this.settings.soundEnabled = !this.settings.soundEnabled;
      this.audio.setSoundEnabled(this.settings.soundEnabled);
      this.dom.settingSoundMute.checked = this.settings.soundEnabled;
      this.updateHeaderAudioIcons();
      this.saveSettings();
      this.showToast('AUDIO SYSTEM', `Sound FX ${this.settings.soundEnabled ? 'ONLINE' : 'MUTED'}`);
    }

    toggleMusic() {
      this.settings.musicEnabled = !this.settings.musicEnabled;
      this.audio.setMusicEnabled(this.settings.musicEnabled);
      this.dom.settingMusicMute.checked = this.settings.musicEnabled;
      this.updateHeaderAudioIcons();
      this.saveSettings();
      this.showToast('SYNTHWAVE BGM', `Music ${this.settings.musicEnabled ? 'ONLINE' : 'MUTED'}`);
    }

    updateHeaderAudioIcons() {
      this.dom.quickSoundBtn.classList.toggle('muted', !this.settings.soundEnabled);
      this.dom.quickMusicBtn.classList.toggle('muted', !this.settings.musicEnabled);
    }

    /* Start / Initialize New Run */
    startNewGame() {
      this.hideAllOverlays();
      this.audio.resume();

      if (document.body && typeof document.body.focus === 'function') {
        document.body.focus();
      }

      // Reset State
      this.state = 'PLAYING';
      this.score = 0;
      this.foodEatenCount = 0;
      this.powerupsCollected = 0;
      this.peakLength = 3;
      this.comboCount = 0;
      this.isBoosting = false;
      this.boostDuration = 0;
      this.growPending = 0;
      this.startTime = performance.now();
      this.particles = [];
      this.screenShake = 0;

      // Reset Buffs
      this.activeBuffs = {
        ghost: 0,
        magnet: 0,
        shield: false,
        multiplier: 0
      };

      // Reset Directions
      this.direction = DIRECTIONS.RIGHT;
      this.lastTickDirection = DIRECTIONS.RIGHT;
      this.directionQueue = [];

      // Spawn Initial Snake in center
      const startX = 6;
      const startY = Math.floor(GRID_SIZE / 2);
      this.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
      ];

      // Setup Obstacles based on Mode
      this.setupModeObstacles();

      // Setup Campaign or Time Attack specifics
      if (this.gameMode === 'campaign') {
        this.currentSectorIdx = 0;
        this.sectorFoodCollected = 0;
        this.loadCampaignSector(0);
      } else if (this.gameMode === 'timeAttack') {
        this.timeAttackSeconds = 60;
        this.startTimeAttackTimer();
      }

      // Spawn Food
      this.spawnStandardFood();
      this.specialFood = null;
      this.specialFoodTimer = 0;
      this.nextSpecialSpawnScore = 20;

      // Update HUD
      this.dom.gameHud.classList.remove('hidden');
      this.dom.quickPauseBtn.classList.remove('hidden');
      this.updateHud();
      this.updateHudHiScore();
      this.updateDpadVisibility();
      this.dom.statusIndicator.textContent = 'ONLINE';
      this.dom.statusIndicator.className = 'neon-green';

      if (this.settings.musicEnabled) {
        this.audio.startBgm();
      }
    }

    /* Setup obstacles based on active game mode */
    setupModeObstacles() {
      this.obstacles = [];
      if (this.gameMode === 'obstacles') {
        // Generate futuristic cyber obstacles
        this.obstacles = [
          { x: 5, y: 5, w: 2, h: 2 },
          { x: 17, y: 5, w: 2, h: 2 },
          { x: 5, y: 17, w: 2, h: 2 },
          { x: 17, y: 17, w: 2, h: 2 },
          { x: 11, y: 11, w: 2, h: 2 }
        ];
      }
    }

    /* Load specific Campaign Sector */
    loadCampaignSector(idx) {
      this.currentSectorIdx = idx;
      this.sectorFoodCollected = 0;
      const sector = CAMPAIGN_SECTORS[idx];
      this.obstacles = sector.obstacles || [];
      this.dom.sectorDisplay.textContent = `SECTOR 0${sector.sector}`;
      this.dom.sectorDisplay.classList.remove('hidden');
      this.dom.timeAttackClock.classList.add('hidden');
      this.showToast('SECTOR INFILTRATION', `${sector.name} // OBJ: ${sector.targetFood} CORES`);
    }

    /* Advance to Next Sector in Campaign */
    advanceToNextSector() {
      this.hideAllOverlays();
      this.state = 'PLAYING';
      this.audio.playSectorClear();

      const nextIdx = this.currentSectorIdx + 1;
      if (nextIdx < CAMPAIGN_SECTORS.length) {
        this.loadCampaignSector(nextIdx);
        // Reset snake position
        const startX = 6;
        const startY = Math.floor(GRID_SIZE / 2);
        this.snake = [
          { x: startX, y: startY },
          { x: startX - 1, y: startY },
          { x: startX - 2, y: startY }
        ];
        this.direction = DIRECTIONS.RIGHT;
        this.lastTickDirection = DIRECTIONS.RIGHT;
        this.directionQueue = [];
        this.spawnStandardFood();
      } else {
        // Complete campaign victory!
        this.unlockAchievement('MAINFRAME_ROOT');
        this.triggerGameOver('MAINFRAME OVERRIDDEN - SYSTEM CLEARED!');
      }
    }

    /* Time Attack Timer Management */
    startTimeAttackTimer() {
      if (this.timeAttackTimerId) clearInterval(this.timeAttackTimerId);
      this.dom.sectorDisplay.classList.add('hidden');
      this.dom.timeAttackClock.classList.remove('hidden');
      this.updateTimeAttackClock();

      this.timeAttackTimerId = setInterval(() => {
        if (this.state === 'PLAYING') {
          this.timeAttackSeconds--;
          this.updateTimeAttackClock();
          if (this.timeAttackSeconds <= 0) {
            clearInterval(this.timeAttackTimerId);
            this.timeAttackTimerId = null;
            this.triggerGameOver('OVERCLOCK DEPLETED - TIME EXPIRED');
          }
        }
      }, 1000);
    }

    updateTimeAttackClock() {
      this.dom.timeAttackClock.textContent = `TIME: ${this.timeAttackSeconds}s`;
      if (this.timeAttackSeconds <= 10) {
        this.dom.timeAttackClock.style.color = 'var(--neon-danger)';
      } else {
        this.dom.timeAttackClock.style.color = 'var(--neon-yellow)';
      }
    }

    /* Pause / Resume */
    togglePause() {
      if (this.state === 'PLAYING') {
        this.state = 'PAUSED';
        this.dom.pauseScreen.classList.add('active');
        this.dom.statusIndicator.textContent = 'PAUSED';
        this.dom.statusIndicator.className = 'neon-yellow';
        this.audio.stopBgm();
      } else if (this.state === 'PAUSED') {
        this.state = 'PLAYING';
        this.dom.pauseScreen.classList.remove('active');
        this.dom.statusIndicator.textContent = 'ONLINE';
        this.dom.statusIndicator.className = 'neon-green';
        if (this.settings.musicEnabled) {
          this.audio.startBgm();
        }
      }
    }

    /* Quit to Menu */
    quitToMenu() {
      this.state = 'MENU';
      this.hideAllOverlays();
      this.dom.startScreen.classList.add('active');
      this.dom.gameHud.classList.add('hidden');
      this.dom.quickPauseBtn.classList.add('hidden');
      this.dom.statusIndicator.textContent = 'READY';
      this.dom.statusIndicator.className = 'neon-cyan';
      this.audio.stopBgm();
      if (this.timeAttackTimerId) {
        clearInterval(this.timeAttackTimerId);
        this.timeAttackTimerId = null;
      }
    }

    /* Modal Navigation */
    openModal(modalId) {
      document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
      document.getElementById(modalId).classList.remove('active');
    }

    hideAllOverlays() {
      document.querySelectorAll('.overlay-screen').forEach(el => el.classList.remove('active'));
    }

    /* ==========================================================================
       4. GAME LOOP & SIMULATION LOGIC
       ========================================================================== */

    loop(timestamp) {
      const delta = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Update FPS Counter
      this.frameCount++;
      if (timestamp - this.fpsTimer >= 1000) {
        this.fps = this.frameCount;
        this.dom.fpsCounter.textContent = this.fps;
        this.frameCount = 0;
        this.fpsTimer = timestamp;
      }

      if (this.state === 'PLAYING') {
        // Calculate tick interval based on difficulty & food progress
        const diffConfig = DIFFICULTY_SETTINGS[this.difficulty];
        let currentInterval = Math.max(
          diffConfig.minSpeed,
          diffConfig.baseSpeed - (this.foodEatenCount * diffConfig.speedStep)
        );

        // Halve tick duration if user is holding Boost
        if (this.isBoosting) {
          currentInterval *= 0.55;
          this.boostDuration += delta / 1000;
          if (this.boostDuration >= 5.0) {
            this.unlockAchievement('SPEED_DEMON');
          }
        } else {
          this.boostDuration = 0;
        }

        // Fixed-step tick accumulator for perfectly uniform movement
        this.accumulatedTickTime += delta;
        while (this.accumulatedTickTime >= currentInterval) {
          this.tick();
          this.accumulatedTickTime -= currentInterval;
        }

        // Update real-time buff durations and special food expiration
        this.updateBuffsAndTimers(delta / 1000);
      }

      // Update particle physics & screen effects
      this.updateParticles(delta / 1000);
      if (this.screenShake > 0) {
        this.screenShake = Math.max(0, this.screenShake - delta * 0.02);
      }

      // Render Stage
      this.render();

      requestAnimationFrame(this.loop.bind(this));
    }

    /* Simulation Tick (Grid Movement, Collisions, Eating) */
    tick() {
      // Dequeue next valid direction
      if (this.directionQueue.length > 0) {
        this.direction = this.directionQueue.shift();
      }
      this.lastTickDirection = this.direction;

      // Head calculation
      const head = this.snake[0];
      let newX = head.x + this.direction.x;
      let newY = head.y + this.direction.y;

      const isGhost = this.activeBuffs.ghost > 0;
      const isWrapMode = this.settings.wallMode === 'wrap' && this.gameMode === 'classic';

      // 1. Boundary & Wall Checks
      if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
        if (isWrapMode || isGhost) {
          // Wrap around safely
          newX = (newX + GRID_SIZE) % GRID_SIZE;
          newY = (newY + GRID_SIZE) % GRID_SIZE;
          if (isGhost) this.unlockAchievement('GHOST_WALKER');
        } else {
          // Fatal wall collision
          if (this.activeBuffs.shield) {
            this.absorbShieldCollision();
            return;
          } else {
            this.triggerGameOver('PERIMETER BREACH - FATAL WALL IMPACT');
            return;
          }
        }
      }

      // 2. Obstacle Checks
      if (!isGhost && this.isCellObstacle(newX, newY)) {
        if (this.activeBuffs.shield) {
          this.absorbShieldCollision();
          return;
        } else {
          this.triggerGameOver('OBSTACLE IMPACT - QUANTUM BARRIER CRASH');
          return;
        }
      }

      // 3. Self Collision Check
      if (!isGhost) {
        for (let i = 0; i < this.snake.length - 1; i++) {
          if (this.snake[i].x === newX && this.snake[i].y === newY) {
            if (this.activeBuffs.shield) {
              this.absorbShieldCollision();
              return;
            } else {
              this.triggerGameOver('NEURAL FEEDBACK - SELF-INTERSECTION');
              return;
            }
          }
        }
      } else {
        // Passing through self in ghost mode
        for (let i = 0; i < this.snake.length - 1; i++) {
          if (this.snake[i].x === newX && this.snake[i].y === newY) {
            this.unlockAchievement('GHOST_WALKER');
          }
        }
      }

      // Step Snake Head forward
      const newHead = { x: newX, y: newY };
      this.snake.unshift(newHead);

      // Track Peak Length & Achievements
      if (this.snake.length > this.peakLength) {
        this.peakLength = this.snake.length;
        if (this.peakLength >= 20) this.unlockAchievement('CENTIPEDE');
        if (this.peakLength >= 45) this.unlockAchievement('GIGA_SNAKE');
      }

      // 4. Food & Magnet Logic
      if (this.activeBuffs.magnet > 0) {
        this.applyMagnetAttraction();
      }

      let ateFood = false;

      // Check Standard Food
      if (this.standardFood && newX === this.standardFood.x && newY === this.standardFood.y) {
        this.handleEatStandardFood();
        ateFood = true;
      }

      // Check Special Food
      if (this.specialFood && newX === this.specialFood.x && newY === this.specialFood.y) {
        this.handleEatSpecialFood();
        ateFood = true;
      }

      // Growth vs Tail Trimming
      if (ateFood || this.growPending > 0) {
        if (this.growPending > 0) this.growPending--;
      } else {
        this.snake.pop(); // Remove tail
      }

      // Add movement trail sparks if boosting
      if (this.isBoosting && this.settings.particles !== 'low') {
        this.createParticles(
          (head.x + 0.5) * this.cellSize,
          (head.y + 0.5) * this.cellSize,
          '#00f0ff',
          3
        );
      }

      this.updateHud();
    }

    /* Absorb Collision with Active Energy Shield */
    absorbShieldCollision() {
      this.activeBuffs.shield = false;
      this.audio.playShieldAbsorb();
      this.screenShake = 12;
      const head = this.snake[0];
      this.createParticles(
        (head.x + 0.5) * this.cellSize,
        (head.y + 0.5) * this.cellSize,
        '#ffe600',
        25
      );
      this.unlockAchievement('AEGIS_GUARD');
      this.showToast('SHIELD SHATTERED', 'Energy barrier absorbed fatal collision!');
      this.updateActiveBuffsDisplay();
    }

    /* Eat Standard Food Core */
    handleEatStandardFood() {
      this.foodEatenCount++;
      this.comboCount++;
      this.unlockAchievement('FIRST_BYTE');

      // Score calculation
      const mult = (this.activeBuffs.multiplier > 0 ? 2 : 1) * (this.isBoosting ? 1.5 : 1);
      const points = Math.round(10 * mult);
      this.score += points;

      // Audio & Particle FX
      this.audio.playBite(this.comboCount);
      const head = this.snake[0];
      this.createParticles(
        (head.x + 0.5) * this.cellSize,
        (head.y + 0.5) * this.cellSize,
        '#00ff88',
        16
      );

      // Check score milestones
      this.checkScoreAchievements();

      // Time Attack bonus
      if (this.gameMode === 'timeAttack') {
        this.timeAttackSeconds += 3;
        this.updateTimeAttackClock();
      }

      // Campaign sector progress
      if (this.gameMode === 'campaign') {
        this.sectorFoodCollected++;
        const target = CAMPAIGN_SECTORS[this.currentSectorIdx].targetFood;
        if (this.sectorFoodCollected >= target) {
          this.triggerSectorClear();
          return;
        }
      }

      // Spawn next standard food
      this.spawnStandardFood();

      // Check if we should spawn special bonus food
      if (!this.specialFood && this.score >= this.nextSpecialSpawnScore) {
        this.spawnSpecialFood();
        this.nextSpecialSpawnScore = this.score + Math.floor(Math.random() * 40) + 35;
      }
    }

    /* Eat Special Power-Up Food */
    handleEatSpecialFood() {
      const item = this.specialFood;
      this.powerupsCollected++;
      this.audio.playPowerup(item.type);

      const mult = (this.activeBuffs.multiplier > 0 ? 2 : 1) * (this.isBoosting ? 1.5 : 1);
      const points = Math.round(item.points * mult);
      this.score += points;

      const head = this.snake[0];
      this.createParticles(
        (head.x + 0.5) * this.cellSize,
        (head.y + 0.5) * this.cellSize,
        item.color,
        24
      );

      // Apply buff effects
      switch (item.type) {
        case 'bonus':
          this.showToast('QUANTUM CORE', `+${points} Energy points accrued!`);
          break;
        case 'ghost':
          this.activeBuffs.ghost = 8.0; // 8 seconds
          this.showToast('GHOST PROTOCOL', 'Quantum phasing active! Pass through walls & self.');
          break;
        case 'magnet':
          this.activeBuffs.magnet = 10.0; // 10 seconds
          this.showToast('MAGNETIC SINGULARITY', 'Energy cores attracted to snake head.');
          break;
        case 'shield':
          this.activeBuffs.shield = true;
          this.showToast('AEGIS SHIELD', 'Kinetic energy barrier deployed.');
          break;
        case 'multiplier':
          this.activeBuffs.multiplier = 12.0; // 12 seconds
          this.showToast('2X OVERDRIVE', 'Double score multiplier online!');
          break;
        case 'cleanser':
          // Trims 2 tail segments without losing points
          if (this.snake.length > 3) this.snake.pop();
          if (this.snake.length > 3) this.snake.pop();
          this.showToast('SYSTEM PURGE', 'Core cleansed! 2 tail segments trimmed.');
          break;
      }

      this.specialFood = null;
      this.specialFoodTimer = 0;
      this.updateActiveBuffsDisplay();
      this.checkScoreAchievements();

      if (this.gameMode === 'timeAttack') {
        this.timeAttackSeconds += 5;
        this.updateTimeAttackClock();
      }
    }

    /* Magnet Pull Attraction */
    applyMagnetAttraction() {
      const head = this.snake[0];
      const items = [this.standardFood, this.specialFood].filter(Boolean);

      items.forEach(food => {
        const dx = head.x - food.x;
        const dy = head.y - food.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // If within 6 cells, gently pull closer
        if (dist > 0 && dist <= 6 && Math.random() < 0.3) {
          if (Math.abs(dx) > Math.abs(dy)) {
            const stepX = dx > 0 ? 1 : -1;
            if (!this.isCellOccupied(food.x + stepX, food.y)) {
              food.x += stepX;
            }
          } else {
            const stepY = dy > 0 ? 1 : -1;
            if (!this.isCellOccupied(food.x, food.y + stepY)) {
              food.y += stepY;
            }
          }
        }
      });
    }

    /* Update Active Buffs and Timers */
    updateBuffsAndTimers(dt) {
      let buffsChanged = false;

      if (this.activeBuffs.ghost > 0) {
        this.activeBuffs.ghost = Math.max(0, this.activeBuffs.ghost - dt);
        buffsChanged = true;
      }
      if (this.activeBuffs.magnet > 0) {
        this.activeBuffs.magnet = Math.max(0, this.activeBuffs.magnet - dt);
        buffsChanged = true;
      }
      if (this.activeBuffs.multiplier > 0) {
        this.activeBuffs.multiplier = Math.max(0, this.activeBuffs.multiplier - dt);
        buffsChanged = true;
      }

      // Update special food expiration timer
      if (this.specialFood) {
        this.specialFoodTimer -= dt;
        if (this.specialFoodTimer <= 0) {
          this.specialFood = null;
        }
      }

      if (buffsChanged) {
        this.updateActiveBuffsDisplay();
      }
    }

    /* Spawn Standard Food (Ensures not on snake or obstacles) */
    spawnStandardFood() {
      const cell = this.getRandomFreeCell();
      if (cell) {
        this.standardFood = {
          x: cell.x,
          y: cell.y,
          color: '#00ff88',
          pulse: 0
        };
      }
    }

    /* Spawn Special Power-up Food */
    spawnSpecialFood() {
      const cell = this.getRandomFreeCell();
      if (!cell) return;

      const types = [
        { type: 'bonus', points: 75, color: '#ffe600', label: 'QUANTUM CORE', icon: '💎' },
        { type: 'ghost', points: 30, color: '#b026ff', label: 'GHOST PHASE', icon: '👻' },
        { type: 'magnet', points: 30, color: '#00f0ff', label: 'MAGNET', icon: '🧲' },
        { type: 'shield', points: 40, color: '#ffaa00', label: 'ENERGY SHIELD', icon: '🛡️' },
        { type: 'multiplier', points: 50, color: '#ff007f', label: '2X MULTIPLIER', icon: '⚡' },
        { type: 'cleanser', points: 25, color: '#00e5ff', label: 'PURGE CLEANSER', icon: '💊' }
      ];

      // Pick randomly
      const selected = types[Math.floor(Math.random() * types.length)];
      const maxLife = 10.0; // 10s expiration

      this.specialFood = {
        x: cell.x,
        y: cell.y,
        type: selected.type,
        points: selected.points,
        color: selected.color,
        label: selected.label,
        icon: selected.icon,
        maxLife: maxLife
      };
      this.specialFoodTimer = maxLife;
    }

    /* Get free cell on grid */
    getRandomFreeCell() {
      const occupied = new Set();
      this.snake.forEach(seg => occupied.add(`${seg.x},${seg.y}`));
      this.obstacles.forEach(obs => {
        for (let ox = 0; ox < obs.w; ox++) {
          for (let oy = 0; oy < obs.h; oy++) {
            occupied.add(`${obs.x + ox},${obs.y + oy}`);
          }
        }
      });
      if (this.standardFood) occupied.add(`${this.standardFood.x},${this.standardFood.y}`);
      if (this.specialFood) occupied.add(`${this.specialFood.x},${this.specialFood.y}`);

      const freeCells = [];
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        for (let y = 1; y < GRID_SIZE - 1; y++) {
          if (!occupied.has(`${x},${y}`)) {
            freeCells.push({ x, y });
          }
        }
      }

      if (freeCells.length === 0) return null;
      return freeCells[Math.floor(Math.random() * freeCells.length)];
    }

    isCellOccupied(x, y) {
      if (this.snake.some(s => s.x === x && s.y === y)) return true;
      if (this.isCellObstacle(x, y)) return true;
      return false;
    }

    isCellObstacle(x, y) {
      return this.obstacles.some(obs => {
        return x >= obs.x && x < obs.x + obs.w && y >= obs.y && y < obs.y + obs.h;
      });
    }

    /* Score Check Achievements */
    checkScoreAchievements() {
      if (this.score >= 1000) this.unlockAchievement('DATA_HOARDER');
      if (this.score >= 5000) this.unlockAchievement('NEURAL_MASTER');
      if (this.score >= 10000) this.unlockAchievement('CYBER_GOD');
      if (this.difficulty === 'insane' && this.score >= 1500) {
        this.unlockAchievement('OVERCLOCK_HERO');
      }
    }

    /* Sector Cleared Handler (Campaign Mode) */
    triggerSectorClear() {
      this.state = 'SECTOR_CLEAR';
      this.audio.playSectorClear();
      this.screenShake = 8;

      if (this.currentSectorIdx === 0) {
        this.unlockAchievement('SECTOR_01');
      }

      const reward = 500 * (this.currentSectorIdx + 1);
      this.score += reward;

      const nextSector = CAMPAIGN_SECTORS[this.currentSectorIdx + 1];
      this.dom.sectorScoreReward.textContent = `+${reward} PTS`;
      this.dom.nextSectorName.textContent = nextSector ? nextSector.name : 'ALL SECTORS CLEARED!';
      this.dom.sectorClearSubText.textContent = `SECTOR 0${this.currentSectorIdx + 1} FIREWALL OVERRIDDEN`;

      this.dom.sectorClearScreen.classList.add('active');
    }

    /* Game Over */
    triggerGameOver(reason) {
      this.state = 'GAMEOVER';
      this.audio.playGameOver();
      this.audio.stopBgm();
      this.screenShake = 16;

      // Calculate survival duration
      const durationSec = Math.floor((performance.now() - this.startTime) / 1000);
      const mins = String(Math.floor(durationSec / 60)).padStart(2, '0');
      const secs = String(durationSec % 60).padStart(2, '0');

      // Update High Scores
      const modeKey = `${this.gameMode}_${this.difficulty}`;
      const prevHi = this.highScores[modeKey] || 0;
      const isNewRecord = this.score > prevHi;
      if (isNewRecord) {
        this.highScores[modeKey] = this.score;
        this.saveHighScores();
      }

      // Populate Game Over Screen
      this.dom.deathReasonText.textContent = reason;
      this.dom.goFinalScore.textContent = this.score;
      this.dom.goBestScore.textContent = Math.max(this.score, prevHi);
      this.dom.goNewRecordTag.classList.toggle('hidden', !isNewRecord);
      this.dom.goFoodEaten.textContent = this.foodEatenCount;
      this.dom.goPeakLength.textContent = this.peakLength;
      this.dom.goSurvivalTime.textContent = `${mins}:${secs}`;
      this.dom.goPowerupsCount.textContent = this.powerupsCollected;

      this.dom.gameOverScreen.classList.add('active');
      this.dom.statusIndicator.textContent = 'OFFLINE';
      this.dom.statusIndicator.className = 'neon-magenta';
      this.dom.quickPauseBtn.classList.add('hidden');
    }

    /* Copy Transmission (Share Score) */
    copyScoreTransmission() {
      const modeTitle = this.gameMode.toUpperCase();
      const diffTitle = this.difficulty.toUpperCase();
      const text = `🕹️ CYBER//SNAKE 2099 Transmission 🕹️\n` +
                   `Architect: Yassin Mitkis\n` +
                   `Score: ${this.score} PTS\n` +
                   `Mode: ${modeTitle} | Difficulty: ${diffTitle}\n` +
                   `Cores Eaten: ${this.foodEatenCount} | Peak Matrix: ${this.peakLength}\n` +
                   `Status: SYSTEM_COMPROMISED\n` +
                   `Can you bypass this cyber score?`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('DATA TRANSMITTED', 'Score protocol copied to clipboard!');
        }).catch(() => {
          this.showToast('DATA READY', 'Transmission ready.');
        });
      } else {
        this.showToast('DATA TRANSMITTED', 'Score logged!');
      }
    }

    /* ==========================================================================
       5. RENDERING ENGINE (CANVAS)
       ========================================================================== */

    render() {
      const w = this.canvas.width / this.dpr;
      const h = this.canvas.height / this.dpr;

      // Handle Screen Shake
      this.ctx.save();
      if (this.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * this.screenShake;
        const shakeY = (Math.random() - 0.5) * this.screenShake;
        this.ctx.translate(shakeX, shakeY);
      }

      // Clear Canvas with deep void background
      this.ctx.fillStyle = '#020409';
      this.ctx.fillRect(0, 0, w, h);

      // 1. Draw Cyber Matrix Grid
      this.renderGrid(w, h);

      // 2. Draw Obstacles
      this.renderObstacles();

      // 3. Draw Foods (Standard & Special)
      this.renderFoods();

      // 4. Draw Snake
      this.renderSnake();

      // 5. Draw Particle FX
      this.renderParticles();

      this.ctx.restore();
    }

    /* Draw Futuristic Arena Grid */
    renderGrid(w, h) {
      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      this.ctx.lineWidth = 1;

      for (let x = 0; x <= w; x += this.cellSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(x, 0);
        this.ctx.lineTo(x, h);
        this.ctx.stroke();
      }
      for (let y = 0; y <= h; y += this.cellSize) {
        this.ctx.beginPath();
        this.ctx.moveTo(0, y);
        this.ctx.lineTo(w, y);
        this.ctx.stroke();
      }

      // Border glowing frame
      this.ctx.strokeStyle = this.settings.wallMode === 'wrap' && this.gameMode === 'classic'
        ? 'rgba(0, 255, 136, 0.35)' // Portal wrap border
        : 'rgba(0, 240, 255, 0.5)'; // Lethal energy border
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(1, 1, w - 2, h - 2);
    }

    /* Draw Obstacles with Hazard Striping */
    renderObstacles() {
      if (this.obstacles.length === 0) return;

      this.obstacles.forEach(obs => {
        const ox = obs.x * this.cellSize;
        const oy = obs.y * this.cellSize;
        const ow = obs.w * this.cellSize;
        const oh = obs.h * this.cellSize;

        // Glowing Barrier Box
        this.ctx.fillStyle = 'rgba(255, 0, 127, 0.25)';
        this.ctx.fillRect(ox, oy, ow, oh);

        this.ctx.strokeStyle = '#ff007f';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#ff007f';
        this.ctx.shadowBlur = 10;
        this.ctx.strokeRect(ox + 1, oy + 1, ow - 2, oh - 2);

        // Warning Diagonal Lines
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(ox, oy);
        this.ctx.lineTo(ox + ow, oy + oh);
        this.ctx.moveTo(ox + ow, oy);
        this.ctx.lineTo(ox, oy + oh);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
      });
    }

    /* Draw Foods */
    renderFoods() {
      const now = performance.now();

      // 1. Draw Standard Food (Energy Orb)
      if (this.standardFood) {
        const fx = (this.standardFood.x + 0.5) * this.cellSize;
        const fy = (this.standardFood.y + 0.5) * this.cellSize;
        const pulse = Math.sin(now * 0.008) * 2;
        const radius = (this.cellSize * 0.36) + pulse;

        this.ctx.save();
        this.ctx.fillStyle = '#00ff88';
        this.ctx.shadowColor = '#00ff88';
        this.ctx.shadowBlur = 12;

        this.ctx.beginPath();
        this.ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner glowing white core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, radius * 0.45, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      }

      // 2. Draw Special Bonus Food
      if (this.specialFood) {
        const item = this.specialFood;
        const sx = (item.x + 0.5) * this.cellSize;
        const sy = (item.y + 0.5) * this.cellSize;
        const pulse = Math.cos(now * 0.01) * 2;
        const radius = (this.cellSize * 0.42) + pulse;

        this.ctx.save();
        this.ctx.shadowColor = item.color;
        this.ctx.shadowBlur = 16;
        this.ctx.fillStyle = item.color;

        // Draw geometric diamond or circle
        this.ctx.beginPath();
        this.ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Expiration Countdown Ring
        if (item.maxLife) {
          const ratio = Math.max(0, this.specialFoodTimer / item.maxLife);
          this.ctx.strokeStyle = '#ffffff';
          this.ctx.lineWidth = 2;
          this.ctx.beginPath();
          this.ctx.arc(sx, sy, radius + 4, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * ratio));
          this.ctx.stroke();
        }

        // Inner Icon / Core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = `bold ${Math.floor(this.cellSize * 0.55)}px var(--font-display)`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(item.icon, sx, sy);

        this.ctx.restore();
      }
    }

    /* Draw Snake with futuristic cyber segments & direction head */
    renderSnake() {
      if (this.snake.length === 0) return;

      const isGhost = this.activeBuffs.ghost > 0;
      const isShielded = this.activeBuffs.shield;
      const is2X = this.activeBuffs.multiplier > 0;

      this.ctx.save();

      // Ghost mode transparency & holographic flicker
      if (isGhost) {
        this.ctx.globalAlpha = 0.55 + Math.sin(performance.now() * 0.02) * 0.25;
      }

      // Draw Body Segments (from tail to head)
      for (let i = this.snake.length - 1; i > 0; i--) {
        const seg = this.snake[i];
        const cx = (seg.x + 0.5) * this.cellSize;
        const cy = (seg.y + 0.5) * this.cellSize;

        // Taper tail slightly
        const taperRatio = 0.75 + (0.25 * (1 - (i / this.snake.length)));
        const radius = (this.cellSize * 0.42) * taperRatio;

        // Choose segment hue
        const color = isGhost ? '#b026ff' :
                      is2X ? '#ff007f' :
                      isShielded ? '#ffaa00' :
                      '#00f0ff';

        this.ctx.fillStyle = color;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;

        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner cyber core
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
      }

      // Draw Snake Head
      const head = this.snake[0];
      const hx = (head.x + 0.5) * this.cellSize;
      const hy = (head.y + 0.5) * this.cellSize;
      const headRadius = this.cellSize * 0.48;

      const headColor = isGhost ? '#d946ef' :
                        is2X ? '#ff007f' :
                        isShielded ? '#ffaa00' :
                        '#00ff88';

      this.ctx.fillStyle = headColor;
      this.ctx.shadowColor = headColor;
      this.ctx.shadowBlur = 18;

      this.ctx.beginPath();
      this.ctx.arc(hx, hy, headRadius, 0, Math.PI * 2);
      this.ctx.fill();

      // Shield Hexagon Aura
      if (isShielded) {
        this.ctx.strokeStyle = '#ffe600';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = '#ffe600';
        this.ctx.shadowBlur = 14;

        this.ctx.beginPath();
        for (let a = 0; a < 6; a++) {
          const angle = (a * Math.PI / 3) + (performance.now() * 0.003);
          const px = hx + Math.cos(angle) * (headRadius + 6);
          const py = hy + Math.sin(angle) * (headRadius + 6);
          if (a === 0) this.ctx.moveTo(px, py);
          else this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.stroke();
      }

      // Visor / Cyber Eyes directed along current movement
      const eyeDist = headRadius * 0.45;
      const eyeSize = headRadius * 0.22;
      const lookOffset = headRadius * 0.35;

      const lx = hx + (this.direction.x * lookOffset);
      const ly = hy + (this.direction.y * lookOffset);

      // Eye offset perpendicular to direction
      const perpX = -this.direction.y;
      const perpY = this.direction.x;

      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = '#ffffff';
      this.ctx.shadowBlur = 6;

      // Left & Right eye visor
      this.ctx.beginPath();
      this.ctx.arc(lx + (perpX * eyeDist), ly + (perpY * eyeDist), eyeSize, 0, Math.PI * 2);
      this.ctx.arc(lx - (perpX * eyeDist), ly - (perpY * eyeDist), eyeSize, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }

    /* Particle System */
    createParticles(x, y, color, count = 12) {
      if (this.settings.particles === 'low') return;
      const actualCount = this.settings.particles === 'medium' ? Math.floor(count * 0.6) : count;

      for (let i = 0; i < actualCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 80 + 30;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          color: color,
          size: Math.random() * 3 + 1.5,
          alpha: 1.0,
          life: Math.random() * 0.4 + 0.3
        });
      }
    }

    updateParticles(dt) {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.alpha -= dt / p.life;

        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    renderParticles() {
      if (this.particles.length === 0) return;

      this.ctx.save();
      this.particles.forEach(p => {
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
      });
      this.ctx.restore();
    }

    /* ==========================================================================
       6. HUD & UI MANAGEMENT
       ========================================================================== */

    updateHud() {
      this.dom.hudScore.textContent = this.score;
      this.dom.hudLength.textContent = this.snake.length;

      const mult = (this.activeBuffs.multiplier > 0 ? 2 : 1) * (this.isBoosting ? 1.5 : 1);
      this.dom.hudMultiplier.textContent = `x${mult.toFixed(1)}`;
      if (mult > 1) {
        this.dom.hudMultiplier.classList.add('neon-magenta');
      } else {
        this.dom.hudMultiplier.classList.remove('neon-magenta');
      }
    }

    updateHudHiScore() {
      const modeKey = `${this.gameMode}_${this.difficulty}`;
      const best = this.highScores[modeKey] || 0;
      this.dom.hudHiScore.textContent = best;
    }

    updateActiveBuffsDisplay() {
      this.dom.activePowerupsBar.innerHTML = '';

      const buffs = [
        { active: this.activeBuffs.ghost > 0, time: this.activeBuffs.ghost, max: 8, label: 'GHOST', color: '#b026ff', icon: '👻' },
        { active: this.activeBuffs.magnet > 0, time: this.activeBuffs.magnet, max: 10, label: 'MAGNET', color: '#00f0ff', icon: '🧲' },
        { active: this.activeBuffs.shield, time: 1, max: 1, label: 'SHIELD', color: '#ffaa00', icon: '🛡️' },
        { active: this.activeBuffs.multiplier > 0, time: this.activeBuffs.multiplier, max: 12, label: '2X SCORE', color: '#ff007f', icon: '⚡' }
      ];

      buffs.forEach(buff => {
        if (!buff.active) return;
        const pill = document.createElement('div');
        pill.className = 'powerup-pill';
        pill.style.color = buff.color;

        const ratio = buff.time / buff.max;
        pill.innerHTML = `
          <span>${buff.icon} ${buff.label}</span>
          ${buff.max > 1 ? `
            <div class="powerup-timer-bar">
              <div class="powerup-timer-fill" style="width: ${ratio * 100}%"></div>
            </div>
          ` : ''}
        `;
        this.dom.activePowerupsBar.appendChild(pill);
      });
    }

    updateDpadVisibility() {
      const mode = this.settings.dpadMode;
      const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

      if (mode === 'always') {
        this.dom.touchControlsContainer.classList.add('active');
      } else if (mode === 'hidden') {
        this.dom.touchControlsContainer.classList.remove('active');
      } else {
        // Auto
        if (isTouchDevice || window.innerWidth <= 640) {
          this.dom.touchControlsContainer.classList.add('active');
        } else {
          this.dom.touchControlsContainer.classList.remove('active');
        }
      }
    }

    /* Toast Notifications System */
    showToast(title, msg, isAchievement = false) {
      const toast = document.createElement('div');
      toast.className = `cyber-toast ${isAchievement ? 'achievement' : ''}`;
      toast.innerHTML = `
        <span class="toast-icon">${isAchievement ? '🏆' : '◈'}</span>
        <div class="toast-text">
          <span class="toast-title">${title}</span>
          <span class="toast-msg">${msg}</span>
        </div>
      `;
      this.dom.toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.transition = 'all 0.3s ease-out';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    /* ==========================================================================
       7. ACHIEVEMENTS SYSTEM & PERSISTENCE
       ========================================================================== */

    unlockAchievement(id) {
      if (this.unlockedAchievements.includes(id)) return;

      const ach = ACHIEVEMENTS_DATA.find(a => a.id === id);
      if (!ach) return;

      this.unlockedAchievements.push(id);
      this.saveAchievements();
      this.audio.playAchievement();
      this.showToast(`ACHIEVEMENT: ${ach.title}`, ach.desc, true);
      this.renderAchievementsModal();
    }

    renderAchievementsModal() {
      this.dom.achievementsCount.textContent = `${this.unlockedAchievements.length} / ${ACHIEVEMENTS_DATA.length}`;
      this.dom.achievementsList.innerHTML = '';

      ACHIEVEMENTS_DATA.forEach(ach => {
        const isUnlocked = this.unlockedAchievements.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isUnlocked ? 'unlocked' : ''}`;
        card.innerHTML = `
          <div class="ach-icon">${ach.icon}</div>
          <div class="ach-details">
            <span class="ach-title">${ach.title}</span>
            <span class="ach-desc">${ach.desc}</span>
          </div>
        `;
        this.dom.achievementsList.appendChild(card);
      });
    }

    loadAchievements() {
      try {
        const stored = localStorage.getItem('cybersnake_achievements');
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        return [];
      }
    }

    saveAchievements() {
      try {
        localStorage.setItem('cybersnake_achievements', JSON.stringify(this.unlockedAchievements));
      } catch (e) {}
    }

    loadHighScores() {
      try {
        const stored = localStorage.getItem('cybersnake_highscores');
        return stored ? JSON.parse(stored) : {};
      } catch (e) {
        return {};
      }
    }

    saveHighScores() {
      try {
        localStorage.setItem('cybersnake_highscores', JSON.stringify(this.highScores));
      } catch (e) {}
    }

    loadSettings() {
      const defaults = {
        soundEnabled: true,
        musicEnabled: true,
        sfxVolume: 0.75,
        bgmVolume: 0.60,
        wallMode: 'solid',
        scanlines: true,
        particles: 'high',
        dpadMode: 'auto'
      };
      try {
        const stored = localStorage.getItem('cybersnake_settings');
        return stored ? Object.assign(defaults, JSON.parse(stored)) : defaults;
      } catch (e) {
        return defaults;
      }
    }

    saveSettings() {
      try {
        localStorage.setItem('cybersnake_settings', JSON.stringify(this.settings));
      } catch (e) {}
    }

    applySettings() {
      this.audio.soundEnabled = this.settings.soundEnabled;
      this.audio.musicEnabled = this.settings.musicEnabled;
      this.audio.sfxVolume = this.settings.sfxVolume;
      this.audio.bgmVolume = this.settings.bgmVolume;

      this.dom.settingSoundMute.checked = this.settings.soundEnabled;
      this.dom.settingSoundVol.value = this.settings.sfxVolume * 100;
      this.dom.settingMusicMute.checked = this.settings.musicEnabled;
      this.dom.settingMusicVol.value = this.settings.bgmVolume * 100;
      this.dom.settingWalls.value = this.settings.wallMode;
      this.dom.settingScanlines.checked = this.settings.scanlines;
      this.dom.cyberScanlines.classList.toggle('disabled', !this.settings.scanlines);
      this.dom.settingParticles.value = this.settings.particles;
      this.dom.settingDpad.value = this.settings.dpadMode;

      this.updateHeaderAudioIcons();
      this.updateDpadVisibility();
    }
  }

  /* Bootstrap game on DOMContentLoaded */
  window.addEventListener('DOMContentLoaded', () => {
    window.gameInstance = new CyberSnakeGame();
  });
})();
