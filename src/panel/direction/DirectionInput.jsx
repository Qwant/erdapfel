/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import NavigatorGeolocalisationPoi, { navigatorGeolocationStatus } from
  'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Suggest from 'src/adapters/suggest';

export default class DirectionInput extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChangePoint: PropTypes.func.isRequired,
    pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
    claimFocus: PropTypes.bool,
  }

  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  componentDidMount() {
    this.suggest = new Suggest({
      tagSelector: `#itinerary_input_${this.props.pointType}`,
      onSelect: this.selectItem,
      prefixes: [ NavigatorGeolocalisationPoi.getInstance() ],
      menuClass: 'direction_suggestions',
    });
    if (this.props.claimFocus) {
      this.focus();
    }
  }

  componentDidUpdate() {
    if (this.props.claimFocus) {
      this.focus();
    }
  }

  componentWillUnmount() {
    if (this.suggest) {
      this.suggest.destroy();
    }
  }

  onChange = event => {
    const input = event.target.value;
    this.props.onChangePoint(input, null);
  }

  onKeyPress = event => {
    if (event.key === 'Enter' && this.props.value !== '') {
      this.suggest.onSubmit();
    }
  }

  selectItem = async selectedPoi => {
    if (selectedPoi instanceof NavigatorGeolocalisationPoi) {
      this.suggest.setIdle(true);
      try {
        await selectedPoi.geolocate();
      } catch (error) {
        if (selectedPoi.status === navigatorGeolocationStatus.FORBIDDEN) {
          fire('open_geolocate_denied_modal');
        } else {
          Error.sendOnce('direction_input', 'selectItem', 'error getting user location', error);
        }
        this.suggest.clear();
      }
      if (selectedPoi.status === navigatorGeolocationStatus.FOUND) {
        this.props.onChangePoint(this.props.value, selectedPoi);
      }
      this.suggest.setIdle(false);
    } else {
      this.props.onChangePoint(this.props.value, selectedPoi);
    }
  }

  focus = () => {
    setTimeout(() => { this.inputRef.current.focus(); }, 0);
  }

  clear = () => {
    this.props.onChangePoint('', null);
    this.focus();
  }

  render() {
    const { pointType } = this.props;

    return <div className="itinerary_field" >
      <div className={`itinerary_icon itinerary_icon_${pointType}`} />
      <input
        ref={this.inputRef}
        id={`itinerary_input_${pointType}`}
        className="itinerary_input"
        type="search"
        required
        autoComplete="off"
        spellCheck="false"
        placeholder={pointType === 'origin'
          ? _('Start point', 'direction')
          : _('End point', 'direction')}
        value={this.props.value}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
      />
      <div className="icon-x itinerary__field__clear" onMouseDown={this.clear} />
    </div>;
  }
}
