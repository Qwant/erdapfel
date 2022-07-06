import openapiTS from 'openapi-typescript';
import fs from 'fs';
import 'dotenv/config';
const idunnTypesFilename = './@types/idunn.ts';

(async () => {
  if (typeof process.env.IDUNN_OPEN_API_URL === 'undefined') {
    console.error('⚠️  -  Missing IDUNN_OPEN_API_URL in your .env file');
    return;
  }
  const output = await openapiTS(process.env.IDUNN_OPEN_API_URL);
  fs.writeFile(idunnTypesFilename, output, err => {
    if (err) {
      throw err;
    } else {
      // eslint-disable-next-line no-console
      console.info(`🚀 Idunn Typescript types successfully created !`);
    }
  });
})();
