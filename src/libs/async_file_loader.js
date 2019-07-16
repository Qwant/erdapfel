/* global FileLoader */

async function AsyncFileLoader(uri, options = {}) {
  return new Promise(resolve => {
    const fileLoader = new FileLoader(uri);
    fileLoader.onLoad = () => {
      resolve();
    };
    if (options.onProgress) {
      fileLoader.onProgress = this.onProgress;
    }
  });
}

export default AsyncFileLoader;
