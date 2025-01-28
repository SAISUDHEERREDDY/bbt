const fs = require('fs');
const revision = require('child_process')
  .execSync('git rev-parse HEAD')
  .toString()
  .trim();

const destination = './dist/apps/angular-bbt';
// Check and create dist directory
try {
  fs.accessSync(destination, fs.W_OK);
} catch (e) {
  console.log(
    'dist directory does not exists or is not accessible, ' +
      'attempting create it. Full error: ' +
      e
  );
  fs.mkdirSync(destination);
}

// write out file
const versionInfo = JSON.stringify({
  version: process.env.BRANCH_VERSION || '???',
  buildRunTime: new Date().toISOString(),
  commitHash: revision
});
fs.writeFileSync(`${destination}/version.json`, versionInfo);
