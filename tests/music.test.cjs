const test = require('node:test');
const assert = require('node:assert/strict');
const { frequency, makeQuestion, presets, intervals } = require('../music.js');
test('equal temperament has correct tuning and octaves', () => {
  assert.equal(frequency(69), 440); assert.equal(frequency(81), 880); assert.equal(frequency(57), 220);
});
test('questions use the chosen pool and correct pitch distance in each direction', () => {
  for (const level of Object.keys(presets)) for (const direction of ['ascending', 'descending', 'harmonic']) {
    for (let n = 0; n < 100; n++) {
      const q = makeQuestion(level, direction);
      assert.ok(presets[level].includes(q.interval));
      assert.equal(q.notes[1] - q.notes[0], direction === 'descending' && q.interval !== 0 ? -q.interval : q.interval);
      assert.ok(q.notes.every(note => note >= 36 && note <= 72));
    }
  }
});
test('all interval labels cover one chromatic octave', () => {
  assert.equal(intervals.length, 13); assert.equal(intervals[7].name, 'Perfect fifth'); assert.equal(intervals[12].name, 'Octave');
});


