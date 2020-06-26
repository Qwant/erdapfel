/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import NavigatorGeolocalisationPoi, { navigatorGeolocationStatus } from
  'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Suggest from 'src/components/ui/Suggest';
import Error from 'src/adapters/error';
import { fire } from 'src/libs/customEvents';
import { fetchSuggests } from 'src/libs/suggest';
import { DeviceContext } from 'src/libs/device';

class DirectionInput extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    value: PropTypes.string,
    onChangePoint: PropTypes.func.isRequired,
    pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
    inputRef: PropTypes.object.isRequired,
  }

  state = {
    mounted: false,
    readOnly: false,
  }

  componentDidMount() {
    if (this.props.isLoading) {
      this.props.inputRef.current.blur();
    }

    this.setState({
      mounted: true,
    });
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isLoading && this.props.isLoading) {
      this.props.inputRef.current.blur();
    }
  }

  onChange = event => {
    const value = event.target.value;
    this.props.onChangePoint(value, null);
  }

  onKeyPress = async event => {
    if (event.key === 'Enter' && this.props.value !== '') {
      const items = await fetchSuggests(this.props.value);
      if (items && items.length > 0) {
        const firstPoi = items[0];
        this.selectItem(firstPoi);
      }
    }
  }

  selectItem = async selectedPoi => {
    if (selectedPoi instanceof NavigatorGeolocalisationPoi) {
      this.setState({ readOnly: true });

      try {
        await selectedPoi.geolocate();
      } catch (error) {
        if (selectedPoi.status === navigatorGeolocationStatus.FORBIDDEN) {
          fire('open_geolocate_denied_modal');
        } else {
          Error.sendOnce('direction_input', 'selectItem', 'error getting user location', error);
        }
        this.props.inputRef.current.value = '';
      }

      if (selectedPoi.status === navigatorGeolocationStatus.FOUND) {
        const name = selectedPoi.type === 'latlon' ? selectedPoi.address.street : selectedPoi.name;
        this.props.onChangePoint(name, selectedPoi);
      }

      this.setState({ readOnly: false });
    } else {
      const name = selectedPoi.type === 'latlon' ? selectedPoi.address.street : selectedPoi.name;
      this.props.onChangePoint(name, selectedPoi);
    }
  }

  clear = e => {
    e.preventDefault(); // prevent losing focus
    this.props.onChangePoint('', null);
    this.props.inputRef.current.value = '';
    // Trigger an input event to refresh Suggest's state
    this.props.inputRef.current.dispatchEvent(new Event('input'));
  }

  render() {
    const { pointType, inputRef, isLoading } = this.props;
    const { mounted, readOnly } = this.state;

    return <DeviceContext.Consumer>
      {isMobile =>
        <div className="itinerary_field" >
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
            readOnly={readOnly || isLoading}
          />
          {mounted &&
            <Suggest
              inputNode={inputRef.current}
              outputNode={!isMobile
                ? document.getElementById('itinerary_autocomplete_suggestions')
                : null}
              withGeoloc
              onSelect={this.selectItem}
              onClear={this.clear}
            />
          }
          <div className="icon-x itinerary__field__clear" onMouseDown={this.clear} />
          <div className="itinerary_field_return">
            <span className="icon-arrow-left"/>
          </div>
          <div className="itinerary_field_icon">
            <div className={`itinerary_icon itinerary_icon_${pointType}`}/>
          </div>
        </div>
      }
    </DeviceContext.Consumer>;
  }
}

const DirectionInputWithRef =
  React.forwardRef((props, ref) => <DirectionInput {...props} inputRef={ref} />);

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
