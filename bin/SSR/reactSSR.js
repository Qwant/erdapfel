/* globals module */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import TopBar from '../../src/components/TopBar.jsx';

module.exports = function(html, { i18n, config }) {
  const topBar = ReactDOMServer.renderToString(
    <TopBar i18n={i18n} config={config} />
  );

  return html.replace(
    '<div class="top_bar"></div>',
    `<div class="top_bar">${topBar}</div>`
  );
};
