/* global _ */
import React from 'react';
import PoiHeader from './PoiHeader';
import PoiTitleImage from './PoiTitleImage';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import Button from 'src/components/ui/Button';
import { fire } from 'src/libs/customEvents';

class PoiCard extends React.Component {
  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
  }

  componentDidMount() {
    window.execOnMapLoaded(() => {
      fire(
        'move_mobile_bottom_ui',
        this.cardRef.current.offsetHeight + 10
      );
    });
  }

  render() {
    const { poi, closeAction, showDetails, openDirection, covid19Enabled } = this.props;

    const hideOpeningHour = covid19Enabled
      && poi.blocks && poi.blocks.find(b => b.type === 'covid19');

    const openingHours = poi.blocksByType && poi.blocksByType.opening_hours;

    return <div className="poi_card" ref={this.cardRef}>
      <div className="poi_card__description_container">
        <PoiTitleImage poi={poi} iconOnly={true} />
        <div>
          <PoiHeader poi={poi} />
          {!hideOpeningHour && <OpeningHour schedule={new OsmSchedule(openingHours)} />}
        </div>
      </div>
      <div className="poi_card__action_container">
        <div className="poi_card__close" onClick={closeAction}>
          <i className="icon-x" />
        </div>
        { !!openDirection &&
          <Button
            className="poi_card__action__direction"
            variant="primary"
            onClick={openDirection}
          >
            { _('Directions', 'poi panel') }
          </Button>
        }
        <Button
          className="poi_card__action__see-more"
          onClick={showDetails}
        >
          { _('See more', 'poi panel') }
        </Button>
      </div>
    </div>;
  }
}

export default PoiCard;
