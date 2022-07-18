const { exec } = require('child_process');
const path = require('path');

module.exports = function (originalStream, fallbackList, messagePath) {
  const fallbackPaths = fallbackList.reduce((fallbackAcc, fallback) => {
    fallbackAcc.push(path.resolve(path.join(messagePath, `${fallback}.po`)));
    return fallbackAcc;
  }, []);

  return exec(`msgcat - ${fallbackPaths.join(' ')} --use-first`, {
    input: originalStream,
  });
};
