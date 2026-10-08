(function (root) {
  const intervals = [
    ['Unison', 'P1'], ['Minor second', 'm2'], ['Major second', 'M2'],
    ['Minor third', 'm3'], ['Major third', 'M3'], ['Perfect fourth', 'P4'],
    ['Tritone', 'TT'], ['Perfect fifth', 'P5'], ['Minor sixth', 'm6'],
    ['Major sixth', 'M6'], ['Minor seventh', 'm7'], ['Major seventh', 'M7'], ['Octave', 'P8']
  ].map(([name, short], semitones) => ({ name, short, semitones }));
  const presets = { beginner: [0, 4, 5, 7, 12], intermediate: [0, 2, 3, 4, 5, 7, 9, 12], advanced: intervals.map(i => i.semitones) };
  function frequency(midi) { return 440 * 2 ** ((midi - 69) / 12); }
  function makeQuestion(level, direction, random = Math.random) {
    const pool = presets[level] || presets.beginner;
    const interval = pool[Math.floor(random() * pool.length)];
    const base = 48 + Math.floor(random() * 13);
    return { interval, notes: [base, base + (direction === 'descending' ? -interval : interval)] };
  }
  const api = { intervals, presets, frequency, makeQuestion };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Music = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);

