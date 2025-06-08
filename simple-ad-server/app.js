const fs = require('fs');
const express = require('express');
const cors = require('cors');
const path = require('path');

// 현재 시간(서버 시작시점)
const now = new Date();
const pad = n => n.toString().padStart(2, '0');
const yyyy = now.getFullYear();
const mm = pad(now.getMonth() + 1);
const dd = pad(now.getDate());
const hh = pad(now.getHours());
const mi = pad(now.getMinutes());

// 예: visit_20240608_1521.log
const logVersion = `${yyyy}${mm}${dd}_${hh}${mi}`;
const visitLogFile = `visit_${logVersion}.log`;
const progressLogFile = `ad_progress_${logVersion}.log`;
const finishedLogFile = `ad_finished_${logVersion}.log`;

const app = express();
app.use(express.json());
app.use(cors());

// 로그 기록
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

// 현재 로그 통계
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
    logVersion
  });
});

// 로그파일 리스트 반환 (모든 버전)
app.get('/api/logs/list', (req, res) => {
  // 디렉토리에서 log 파일명만 추출
  const files = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.log'));
  res.json(files);
});

// 특정 로그파일 읽기 (버전별)
app.get('/api/logs/:type/:version', (req, res) => {
  const { type, version } = req.params;
  let filename = '';
  if (type === 'visit') filename = `visit_${version}.log`;
  else if (type === 'ad_progress') filename = `ad_progress_${version}.log`;
  else if (type === 'ad_finished') filename = `ad_finished_${version}.log`;
  else return res.status(400).send('Invalid log type');

  if (!fs.existsSync(filename)) return res.status(404).send('No log');
  res.type('text/plain').send(fs.readFileSync(filename, 'utf8'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중`);
  console.log('현재 로그파일 버전:', logVersion);
});
