/**
 * for poc
 * @param feature
 * @returns {string}
 * @constructor
 */

function Popup(feature) {
  return `
    <div class="scene__popup--idle">
      <h3>${_('popup title')}</h3>
        ${feature.value}
    </div>
  `
}

export default Popup