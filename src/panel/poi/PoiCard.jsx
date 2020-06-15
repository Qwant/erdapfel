/* global _ */
import React from 'react';
import PoiItem from 'src/components/PoiItem';
import { Button, Flex } from 'src/components/ui';
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

    return <div className="poi_card" ref={this.cardRef}>
      <Flex justifyContent="space-between">
        <PoiItem poi={poi} withOpeningHours={!hideOpeningHour} withImage={false} />
        <div className="poi_card__action_container">
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
      </Flex>
      <div className="poi_card__close" onClick={closeAction}>
        <i className="icon-x" />
      </div>
    </div>;
  }
}

export default PoiCard;
