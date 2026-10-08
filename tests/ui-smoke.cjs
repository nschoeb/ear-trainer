const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
app.setPath('userData', path.join(app.getPath('temp'), 'ear-trainer-smoke'));
app.whenReady().then(async () => {
  const win = new BrowserWindow({ show: false, width: 1180, height: 900, webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } });
  const errors = [];
  win.webContents.on('console-message', (_event, details) => { if (details.level === 'error') errors.push(details.message); });
  try {
    await win.loadFile(path.join(__dirname, '..', 'index.html'));
    const result = await win.webContents.executeJavaScript(`(async () => {
      function check(condition, message) { if (!condition) throw Error(message); }
      stats = { correct: 0, total: 0, streak: 0 };
      preferences.level = 'beginner'; preferences.direction = 'ascending'; nextQuestion();
      check(document.querySelectorAll('.answer').length === 5, 'beginner answers');
      answer(question.interval); check(stats.total === 0, 'cannot answer before hearing');
      await play(); await new Promise(r => setTimeout(r, 1800));
      check(heard && !playing, 'audio completes');
      answer(question.interval); check(stats.correct === 1 && stats.total === 1, 'correct scoring');
      answer(question.interval); check(stats.total === 1, 'single scoring per question');
      await play(); check(document.querySelector('.answer.correct'), 'replay preserves answer');
      await new Promise(r => setTimeout(r, 1800));
      nextQuestion(); await play(); await new Promise(r => setTimeout(r, 1800));
      answer((question.interval + 1) % 13); check(stats.total === 2 && stats.correct === 1 && stats.streak === 0, 'wrong scoring');
      document.getElementById('level').value = 'advanced';
      document.getElementById('level').dispatchEvent(new Event('input'));
      check(document.querySelectorAll('.answer').length === 13, 'advanced answers');
      check(!heard && !answered, 'settings restart question');
      check(JSON.parse(localStorage.getItem('ear-trainer')).stats.total === 2, 'progress stored');
      return 'Audio scheduling, scoring, replay, difficulty, and storage passed.';
    })()`);
    console.log(result);
    await win.loadFile(path.join(__dirname, '..', 'index.html'));
    const persisted = await win.webContents.executeJavaScript("stats.total === 2 && preferences.level === 'advanced'");
    if (!persisted) throw Error('Progress did not survive reload');
    console.log('Persistence after reload passed.');
    await win.webContents.executeJavaScript("preferences.level = 'beginner'; document.getElementById('level').value = 'beginner'; nextQuestion();");
    const screenshot = await win.webContents.capturePage();
    fs.writeFileSync(path.join(__dirname, '..', 'preview.png'), screenshot.toPNG());
    if (errors.length) throw Error(errors.join('\n'));
    app.exit(0);
  } catch (error) { console.error(error); app.exit(1); }
});
