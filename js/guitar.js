// Guitar App JavaScript

// Chord definitions - [string][fret] (0 = open, -1 = muted/not played)
const chordDefinitions = {
  'C': {
    positions: [[5, 0], [4, 1], [3, 0], [2, 2], [1, 3], [0, -1]],
    name: 'C Major'
  },
  'D': {
    positions: [[5, 2], [4, 3], [3, 2], [2, 0], [1, -1], [0, -1]],
    name: 'D Major'
  },
  'E': {
    positions: [[5, 0], [4, 2], [3, 2], [2, 1], [1, 0], [0, 0]],
    name: 'E Major'
  },
  'F': {
    positions: [[5, 1], [4, 3], [3, 3], [2, 2], [1, 1], [0, 1]],
    name: 'F Major'
  },
  'G': {
    positions: [[5, 3], [4, 2], [3, 0], [2, 0], [1, 0], [0, 3]],
    name: 'G Major'
  },
  'A': {
    positions: [[5, 0], [4, 0], [3, 2], [2, 2], [1, 2], [0, -1]],
    name: 'A Major'
  },
  'B': {
    positions: [[5, 2], [4, 4], [3, 4], [2, 4], [1, -1], [0, -1]],
    name: 'B Major'
  },
  'Am': {
    positions: [[5, 0], [4, 1], [3, 2], [2, 2], [1, 0], [0, -1]],
    name: 'A Minor'
  },
  'Em': {
    positions: [[5, 0], [4, 2], [3, 2], [2, 0], [1, 0], [0, 0]],
    name: 'E Minor'
  },
  'Dm': {
    positions: [[5, 1], [4, 3], [3, 2], [2, 0], [1, -1], [0, -1]],
    name: 'D Minor'
  }
};

// Audio context for generating guitar sounds
let audioContext;
let currentChord = null;

// Initialize audio context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Generate guitar string sound using Web Audio API
function playStringSound(stringNumber, fret = 0) {
  initAudio();
  
  // Base frequencies for each string (E A D G B e)
  const baseFrequencies = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];
  
  // Calculate frequency based on fret (each fret is a semitone)
  const frequency = baseFrequencies[stringNumber] * Math.pow(2, fret / 12);
  
  // Create oscillator for the string sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  // Connect nodes
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  // Set oscillator type and frequency
  oscillator.type = 'triangle'; // Triangle wave sounds more like a plucked string
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  
  // Envelope for natural guitar pluck sound
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
  
  // Start and stop
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 1.5);
  
  // Visual feedback
  const stringElement = document.querySelector(`.guitar-string[data-string="${stringNumber}"]`);
  if (stringElement) {
    stringElement.classList.add('plucked');
    setTimeout(() => {
      stringElement.classList.remove('plucked');
    }, 500);
  }
}

// Clear all active chord markers
function clearChordMarkers() {
  document.querySelectorAll('.fret-marker').forEach(marker => {
    marker.classList.remove('active', 'muted');
  });
}

// Display chord on fretboard
function displayChord(chordName) {
  clearChordMarkers();
  
  const chord = chordDefinitions[chordName];
  if (!chord) return;
  
  currentChord = chordName;
  
  chord.positions.forEach(([string, fret]) => {
    if (fret === -1) {
      // Mark string as muted (don't play)
      const marker = document.querySelector(`.fret-marker[data-string="${string}"][data-fret="0"]`);
      if (marker) {
        marker.classList.add('muted');
      }
    } else {
      // Mark finger position
      const marker = document.querySelector(`.fret-marker[data-string="${string}"][data-fret="${fret}"]`);
      if (marker) {
        marker.classList.add('active');
      }
    }
  });
  
  // Update chord info
  document.getElementById('selected-chord-name').textContent = `${chord.name} chord`;
}

// Play entire chord
function playChord(chordName) {
  const chord = chordDefinitions[chordName];
  if (!chord) return;
  
  // Play each string with a slight delay (strum effect)
  chord.positions.forEach(([string, fret], index) => {
    if (fret !== -1) {
      setTimeout(() => {
        playStringSound(string, fret);
      }, index * 50); // 50ms delay between each string
    }
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
  // Chord button click handlers
  document.querySelectorAll('.chord-btn').forEach(button => {
    button.addEventListener('click', function() {
      const chordName = this.dataset.chord;
      
      // Update active button
      document.querySelectorAll('.chord-btn').forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      // Display and play chord
      displayChord(chordName);
      playChord(chordName);
    });
  });
  
  // String click handlers (play individual strings)
  document.querySelectorAll('.guitar-string').forEach(string => {
    string.addEventListener('click', function() {
      const stringNumber = parseInt(this.dataset.string);
      
      // If a chord is selected, play the string at the appropriate fret
      if (currentChord) {
        const chord = chordDefinitions[currentChord];
        const position = chord.positions.find(pos => pos[0] === stringNumber);
        if (position && position[1] !== -1) {
          playStringSound(stringNumber, position[1]);
        } else if (!position || position[1] !== -1) {
          playStringSound(stringNumber, 0);
        }
      } else {
        // Play open string
        playStringSound(stringNumber, 0);
      }
    });
  });
  
  // Fret marker click handlers (for manual playing)
  document.querySelectorAll('.fret-marker').forEach(marker => {
    marker.addEventListener('click', function(e) {
      e.stopPropagation();
      const stringNumber = parseInt(this.dataset.string);
      const fret = parseInt(this.dataset.fret);
      playStringSound(stringNumber, fret);
    });
  });
  
  // Initialize audio context on first user interaction
  document.body.addEventListener('click', initAudio, { once: true });
  document.body.addEventListener('touchstart', initAudio, { once: true });
});
