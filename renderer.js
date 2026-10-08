const $ = id => document.getElementById(id);
const { intervals, presets, frequency, makeQuestion } = Music;
let stats = { correct: 0, total: 0, streak: 0 };
let preferences = { level: 'beginner', direction: 'ascending', tone: 'triangle', volume: 35 };
try {
  const saved = JSON.parse(localStorage.getItem('ear-trainer') || 'null');
  if (saved) {
    if (saved.stats && ['correct', 'total', 'streak'].every(k => Number.isInteger(saved.stats[k]) && saved.stats[k] >= 0) && saved.stats.correct <= saved.stats.total && saved.stats.streak <= saved.stats.correct) stats = saved.stats;
    if (saved.preferences) {
      const p = saved.preferences;
      if (presets[p.level]) preferences.level = p.level;
      if (['ascending', 'descending', 'harmonic'].includes(p.direction)) preferences.direction = p.direction;
      if (['sine', 'triangle'].includes(p.tone)) preferences.tone = p.tone;
      if (Number.isFinite(p.volume)) preferences.volume = Math.max(0, Math.min(100, p.volume));
    }
  }
} catch {}
let question, answered = false, heard = false, playing = false, audio;
let activeNodes = [], playbackTimer;
function save() {
  try { localStorage.setItem('ear-trainer', JSON.stringify({ stats, preferences })); }
  catch { $('feedback').textContent += ' Progress could not be saved on this device.'; }
}
function updateStats() {
  $('accuracy').textContent = stats.total ? Math.round(stats.correct / stats.total * 100) + '%' : '—';
  $('streak').textContent = stats.streak;
  $('total').textContent = stats.correct + ' correct out of ' + stats.total + ' answered';
  $('question-count').textContent = stats.total ? stats.total + ' answered' : 'No answers yet';
}
function renderAnswers() {
  $('answers').replaceChildren();
  for (const semitones of presets[preferences.level]) {
    const item = intervals[semitones];
    const button = document.createElement('button');
    button.className = 'answer'; button.dataset.interval = semitones;
    const short = document.createElement('strong'); short.textContent = item.short;
    button.append(short, document.createTextNode(item.name));
    button.disabled = !heard || answered || playing;
    button.addEventListener('click', () => answer(semitones));
    $('answers').append(button);
  }
}
function stopAudio() {
  clearTimeout(playbackTimer);
  for (const node of activeNodes) { try { node.stop(); } catch {} }
  activeNodes = []; playing = false; $('play').disabled = false;
}
function nextQuestion() {
  stopAudio();
  question = makeQuestion(preferences.level, preferences.direction);
  answered = false; heard = false;
  $('next').hidden = true; $('play').textContent = '▶  Play interval';
  $('prompt').textContent = 'Ready when you are.';
  $('hint').textContent = 'Play two notes, then choose the interval you hear.';
  $('feedback').textContent = 'Press Space to play. Press Enter for the next interval after answering.';
  renderAnswers();
}
async function play() {
  if (playing) return;
  playing = true; $('play').disabled = true; if (!answered) renderAnswers();
  try {
    audio ||= new AudioContext();
    await audio.resume();
    const now = audio.currentTime + 0.06;
    const harmonic = preferences.direction === 'harmonic';
    question.notes.forEach((midi, index) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      const start = now + (harmonic ? 0 : index * 0.85), duration = 0.72;
      oscillator.type = preferences.tone; oscillator.frequency.value = frequency(midi);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(preferences.volume / 100 * 0.22, start + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(start); oscillator.stop(start + duration + 0.05);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      activeNodes.push(oscillator);
    });
    $('prompt').textContent = answered ? intervals[question.interval].name : 'Listen to the distance.';
    $('hint').textContent = harmonic ? 'Two notes played together.' : 'Two notes played one after another.';
    playbackTimer = setTimeout(() => {
      playing = false; heard = true; activeNodes = [];
      $('play').disabled = false; $('play').textContent = '↻  Play again';
      if (!answered) renderAnswers();
    }, harmonic ? 850 : 1700);
  } catch (error) {
    stopAudio(); renderAnswers();
    $('feedback').textContent = 'Audio could not start. Try playing again. ' + error.message;
  }
}
function answer(value) {
  if (!heard || answered || playing) return;
  answered = true;
  const correct = value === question.interval;
  stats.total++; stats.correct += correct ? 1 : 0; stats.streak = correct ? stats.streak + 1 : 0;
  for (const button of $('answers').children) {
    button.disabled = true;
    if (Number(button.dataset.interval) === question.interval) button.classList.add('correct');
    else if (Number(button.dataset.interval) === value) button.classList.add('wrong');
  }
  $('prompt').textContent = correct ? 'You got it.' : 'Keep listening.';
  $('feedback').textContent = (correct ? 'Correct! ' : 'The answer was ') + intervals[question.interval].name + ' (' + question.interval + ' semitones). Replay to hear it again, or try the next interval.';
  $('next').hidden = false; updateStats(); save(); $('next').focus();
}
for (const id of ['level', 'direction', 'tone', 'volume']) {
  $(id).value = preferences[id];
  $(id).addEventListener('input', () => {
    preferences[id] = id === 'volume' ? Number($(id).value) : $(id).value;
    $('volume-label').textContent = preferences.volume + '%';
    if (id === 'level' || id === 'direction') nextQuestion();
    save();
  });
}
$('volume-label').textContent = preferences.volume + '%';
$('play').addEventListener('click', play);
$('next').addEventListener('click', nextQuestion);
$('reset').addEventListener('click', () => {
  if (!window.confirm('Reset all saved practice stats?')) return;
  stats = { correct: 0, total: 0, streak: 0 }; updateStats(); save(); nextQuestion();
});
document.addEventListener('keydown', event => {
  if (['SELECT', 'INPUT', 'BUTTON', 'A'].includes(event.target.tagName)) return;
  if (event.code === 'Space') { event.preventDefault(); play(); }
  if (event.code === 'Enter' && answered) nextQuestion();
});
updateStats(); nextQuestion();



