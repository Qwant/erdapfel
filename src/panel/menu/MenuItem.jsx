/* globals _ */
import React from 'react';

const MenuItem = ({ menuItem: { uri, sectionName, links, icon } }) => <div>
  <h2 className="menu__panel__section_title">
    <i className={`menu__panel__section__icon icon-${icon}`} />
    {uri ?
      <a href={uri} className="menu__panel__section_title__link"
        rel="noopener noreferrer" target="_blank"
      >
        {_(sectionName)}
      </a>
      : _(sectionName)
    }
  </h2>
  {links && links.length > 0 && <div className="menu__panel__section">
    {links.map(link => <a
      key={link.uri}
      className="menu__panel__link"
      href={link.uri} rel="noopener noreferrer" target="_blank"
    >
      {_(link.name)}
    </a>)}
  </div>}
</div>;

export default MenuItem;
