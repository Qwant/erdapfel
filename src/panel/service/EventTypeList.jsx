/* global _ */
import React, { Fragment } from 'react';
import CategoryService from 'src/adapters/category_service';

const EventTypeList = () => {
  return <Fragment>
    <hr/>
    <div className="service_panel__events">
      <h3>{_('Good plans', 'service panel')}</h3>
      {
        CategoryService.getEvents().map(item =>
          <button className="service_panel__event" type="button" key={item.name}
            onClick={() => { window.app.navigateTo(`/events/?type=${item.name}`); }}>
            <div className="service_panel__event__icon"
              style={{ background: item.backgroundColor }}>
              <span className={`icon icon-${item.iconName}`}/>
            </div>
            <div className="service_panel__category__title">{item.label}</div>
          </button>
        )
      }
    </div>
  </Fragment>;
};

export default EventTypeList;
