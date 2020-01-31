/* globals require, __dirname */

const webfont = require('@qwant/map-style-builder/task/webfont/index');
const fs = require('fs-extra');
const path = require('path');

const styleDir = path.join(__dirname, '../node_modules/@qwant/qwant-basic-gl-style');

// Build mapstyle webfont
webfont({
  styleDir,
  webfont: true,
}).then(() => {
  fs.copy(
    path.join(styleDir, 'build/font'),
    path.join(__dirname, '../public/mapstyle/iconfont')
  );
})
  .catch(err => {
    console.error(err);
  });

fs.copySync(
  path.join(__dirname, '../node_modules/qwant-maps-fonts/dist'),
  path.join(__dirname, '../public/mapstyle/font')
);
