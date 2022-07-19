const childProcess = require('child_process');
const path = require('path');

module.exports = function (originalStream, fallbackList, messagePath) {
  const fallbackPaths = fallbackList.reduce((fallbackAcc, fallback) => {
    fallbackAcc.push(path.resolve(path.join(messagePath, `${fallback}.po`)));
    return fallbackAcc;
  }, []);

  // eslint-disable-next-line no-useless-catch
  try {
    return childProcess.execSync(`msgcat - ${fallbackPaths.join(' ')} --use-first`, {
      input: originalStream,
    });
  } catch (e) {
    throw e;
  }
};
