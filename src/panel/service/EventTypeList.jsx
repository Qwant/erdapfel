/* global _ */
import React from 'react';
import CategoryService from 'src/adapters/category_service';
import Action from 'src/components/ui/MainActionButton';

const EventTypeList = () =>
  <div className="service_panel__events">
    <h3 className="u-text--smallTitle u-center">{_('Good plans', 'service panel')}</h3>
    {
      CategoryService.getEvents().map(item =>
        <Action
          key={item.name}
          onClick={() => { window.app.navigateTo(`/events/?type=${item.name}`); }}
          variant="event"
          label={item.label}
          icon={item.iconName}
          iconStyle={{ backgroundColor: item.backgroundColor }}
        />
      )
    }
  </div>;

export default EventTypeList;
