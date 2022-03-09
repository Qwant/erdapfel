const fs = require('fs-extra');
const crypto = require('crypto');
const compilationHash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
const compilationHashFileContent = `module.exports = '${compilationHash}'`;
const compilationHashPath = './public/compilationHash.js';

fs.writeFile(compilationHashPath, compilationHashFileContent, err => {
  if (err) {
    throw err;
  } else {
    // eslint-disable-next-line no-console
    console.log(`> Compilation hash file created: ${compilationHash}`);
  }
});
