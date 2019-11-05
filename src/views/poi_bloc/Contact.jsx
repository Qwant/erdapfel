import React from 'react';

const ContactBlock = ({
  block,
  asString,
}) => {
  if (asString) {
    return '';
  }

  return <div className="poi_panel__info__section poi_panel__info__section--contact">
    <p className="poi_panel__info__section__description">
      <div className="icon-mail poi_panel__block__symbol"></div>
      <div className="poi_panel__block__content">
        <a className="poi_panel__info__contact" href={ block.url }>
          { block.url.replace('mailto:', '') }
        </a>
      </div>
    </p>
  </div>;
};

export default ContactBlock;
