const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('git log -n 15 --oneline', { encoding: 'utf8' });
  fs.writeFileSync('git_log.txt', output);
  console.log('Success: Git log written to git_log.txt');
} catch (e) {
  console.error('Error running git:', e.message);
}
