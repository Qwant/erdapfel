/* globals require, process */
/* eslint no-console: 0 */

const fs = require('fs');
const child_process = require('child_process');
const path = require('path');

const sync = function(cmd, args, cwd) {
  return child_process.spawnSync(cmd, args, {
    cwd,
    stdio: [process.stdin, process.stdout, process.stderr],
  });
};

const fontsPackagePath = path.join('node_modules', 'klokantech-noto-sans');
const fontsVersion = JSON.parse(
  fs.readFileSync(path.join(fontsPackagePath, 'package.json')),
)['_id'];
const generatedVersionFile = path.join(fontsPackagePath, '_output', '.generated');

const generateFonts = function() {
  sync('node', ['generate.js'], fontsPackagePath);
  if (fontsVersion) {
    fs.writeFileSync(generatedVersionFile, JSON.stringify({ version: fontsVersion }));
    console.log('Map fonts generated. Version: ', fontsVersion);
  }
};

const needsGeneration = function() {
  if (!fontsVersion) {
    console.log('Could not find map fonts version');
  }
  if (fontsVersion && fs.existsSync(generatedVersionFile)) {
    const generatedVersion = JSON.parse(fs.readFileSync(generatedVersionFile)).version;
    if (generatedVersion === fontsVersion) {
      console.log('Map fonts are up to date. Version:', fontsVersion);
      return false;
    } else {
      console.log('Map fonts are not up to date. Found:', generatedVersion);
      console.log('Map fonts version to generate: ', fontsVersion);
    }
  }
  return true;
};

if (needsGeneration()) {
  generateFonts();
}
