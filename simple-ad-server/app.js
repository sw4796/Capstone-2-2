const fs = require('fs');
const express = require('express');
const cors = require('cors');

// 현재 시간(서버 시작시점)
const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const yyyy = now.getFullYear();
const mm = pad(now.getMonth() + 1);
const dd = pad(now.getDate());
const hh = pad(now.getHours());
const mi = pad(now.getMinutes());

// 예: visit_20240608_1521.log
const visitLogFile = `visit_${yyyy}${mm}${dd}_${hh}${mi}.log`;
const progressLogFile = `ad_progress_${yyyy}${mm}${dd}_${hh}${mi}.log`;
const finishedLogFile = `ad_finished_${yyyy}${mm}${dd}_${hh}${mi}.log`;

const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/visit', (req, res) => {
  fs.appendFile(visitLogFile, `${Date.now()}\n`, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.post('/api/ad-progress', (req, res) => {
  const { currentTime, duration } = req.body;
  const data = `${Date.now()},${currentTime},${duration}\n`;
  fs.appendFile(progressLogFile, data, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

app.post('/api/ad-finished', (req, res) => {
  fs.appendFile(finishedLogFile, `${Date.now()}\n`, (err) => {
    if (err) return res.sendStatus(500);
    res.sendStatus(200);
  });
});

// 기존 집계는 최신 로그파일로만, 또는 여러 파일을 합산해서 따로 처리 가능
app.get('/api/stats', (req, res) => {
  const countLines = (file) =>
    fs.existsSync(file) ? fs.readFileSync(file, 'utf8').trim().split('\n').filter(Boolean).length : 0;

  const visits = countLines(visitLogFile);
  const adFinished = countLines(finishedLogFile);
  const adProgress = countLines(progressLogFile);

  res.json({
    visits,
    adFinished,
    adProgressEvents: adProgress,
    logVersion: `${yyyy}${mm}${dd}_${hh}${mi}`
  });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중`);
  console.log('현재 로그파일 버전:', `${yyyy}${mm}${dd}_${hh}${mi}`);
});
