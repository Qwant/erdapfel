/* global _ */
import React from 'react';
import PoiHeader from './PoiHeader';
import PoiTitleImage from './PoiTitleImage';
import OpeningHour from 'src/components/OpeningHour';

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
    const { poi, closeAction, showDetails, openDirection } = this.props;

    return <div className="poi_card" ref={this.cardRef}>
      <div className="poi_card__description_container">
        <PoiTitleImage poi={poi} iconOnly={true} />
        <div>
          <PoiHeader poi={poi} />
          <OpeningHour poi={poi} />
        </div>
      </div>
      <div className="poi_card__action_container">
        <div className="poi_card__close" onClick={closeAction}>
          <i className="icon-x" />
        </div>
        { !!openDirection &&
          <button
            className="poi_card__action poi_card__action__direction"
            onClick={openDirection}
          >
            <span className="icon-corner-up-right" />{' '}
            { _('DIRECTIONS', 'poi panel') }
          </button>
        }
        <button className="poi_card__action" onClick={showDetails}>
          <span className="icon-chevrons-right" />{' '}
          { _('SEE MORE', 'poi panel') }
        </button>
      </div>
    </div>;
  }
}

export default PoiCard;
