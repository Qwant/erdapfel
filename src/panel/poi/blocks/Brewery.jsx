/* global _ */
import React from 'react';

const BreweryBlock = ({
  block,
  asString,
}) => {
  const beers = block.beers;
  if (asString) {
    return `${_('Beers')} : ${beers.map(beer => beer.name).join(' - ')}`;
  }

  return <div>
    <h6 className="u-text--caption">{ _('Beers', 'poi') }</h6>
    <ul>
      {beers.map((beer, index) =>
        <li className="poi_panel__info__item poi_panel__info__item--beer" key={index}>
          {beer.name}
        </li>)}
    </ul>
  </div>;
};

export default BreweryBlock;
