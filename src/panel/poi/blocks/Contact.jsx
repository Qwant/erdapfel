import React from 'react';

const ContactBlock = ({
  block,
}) => {
  return <div className="poi_panel__info__section poi_panel__info__section--contact">
    <div className="poi_panel__info__section__description">
      <div className="icon-mail poi_panel__block__symbol"></div>
      <div className="poi_panel__block__content">
        <a className="poi_panel__info__contact" href={ block.url }>
          { block.url.replace('mailto:', '') }
        </a>
      </div>
    </div>
  </div>;
};

export default ContactBlock;
