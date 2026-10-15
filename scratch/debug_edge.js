const { exec, spawn } = require('child_process');
const fs = require('fs');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
];

let edgePath = edgePaths.find(p => fs.existsSync(p));

if (!edgePath) {
  console.log('Edge executable not found in default paths.');
  process.exit(1);
}

console.log('Found Edge at:', edgePath);

const cmd = `"${edgePath}" --headless --dump-dom --enable-logging --v=1 http://localhost:8080/`;

exec(cmd, { timeout: 10000 }, (err, stdout, stderr) => {
  console.log('--- STDOUT (Dump DOM) ---');
  console.log(stdout.slice(0, 1000));
  console.log('--- STDERR ---');
  console.log(stderr.slice(0, 1000));
});
