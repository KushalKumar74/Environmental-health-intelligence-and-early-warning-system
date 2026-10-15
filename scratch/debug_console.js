const { exec } = require('child_process');
const http = require('http');

console.log('Testing connection to http://localhost:8080/');

http.get('http://localhost:8080/', (res) => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML Length:', data.length);
    console.log('HTML Preview:', data.slice(0, 300));
  });
}).on('error', (err) => {
  console.error('Connection Error:', err.message);
});
