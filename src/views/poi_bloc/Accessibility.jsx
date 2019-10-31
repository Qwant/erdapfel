/* global _ */
import React from 'react';

const AccessibilityBlock = ({ block: accessibilityList, _poi, options: accessibilities }) =>
  <div>
    <h6 className="poi_panel__sub__sub_block__title">{ _('Accessibility', 'poi') }</h6>
    <ul className="poi_panel__info__accessibilities">
      {
        accessibilities.map(el =>
          <li key={el.key}>{ _(el.labels[accessibilityList[el.key]]) }</li>)
      }
    </ul>
  </div>;

export default AccessibilityBlock;
