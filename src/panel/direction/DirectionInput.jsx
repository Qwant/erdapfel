/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import NavigatorGeolocalisationPoi, { navigatorGeolocationStatus } from
  'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Suggest from 'src/adapters/suggest';
import Error from 'src/adapters/error';

class DirectionInput extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    onChangePoint: PropTypes.func.isRequired,
    pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
    inputRef: PropTypes.object.isRequired,
  }

  componentDidMount() {
    this.suggest = new Suggest({
      tagSelector: `#itinerary_input_${this.props.pointType}`,
      onSelect: this.selectItem,
      prefixes: [ NavigatorGeolocalisationPoi.getInstance() ],
      menuClass: 'direction_suggestions',
    });
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
        this.props.onChangePoint(selectedPoi.getInputValue(), selectedPoi);
      }
      this.suggest.setIdle(false);
    } else {
      this.props.onChangePoint(selectedPoi.getInputValue(), selectedPoi);
    }
  }

  focus = () => {
    setTimeout(() => { this.props.inputRef.current.focus(); }, 0);
  }

  clear = () => {
    this.props.onChangePoint('', null);
    this.focus();
  }

  render() {
    const { pointType, inputRef } = this.props;

    return <div className="itinerary_field" >
      <input
        ref={inputRef}
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
      <div className="itinerary_field_return">
        <span className="icon-arrow-left"/>
      </div>
      <div className="itinerary_field_icon">
        <div className={`itinerary_icon itinerary_icon_${pointType}`}/>
      </div>
    </div>;
  }
}

const DirectionInputWithRef =
  React.forwardRef((props, ref) => <DirectionInput {...props} inputRef={ref} />);

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
