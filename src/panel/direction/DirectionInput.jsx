/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import NavigatorGeolocalisationPoi, { navigatorGeolocationStatus } from
  'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Suggest from 'src/components/ui/Suggest';
import Error from 'src/adapters/error';
import { fire } from 'src/libs/customEvents';
import { fetchSuggests } from 'src/libs/suggest';
import Telemetry from 'src/libs/telemetry';
import { handleFocus } from 'src/libs/input';

class DirectionInput extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    value: PropTypes.string,
    onChangePoint: PropTypes.func.isRequired,
    pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
    inputRef: PropTypes.object.isRequired,
    withGeoloc: PropTypes.bool,
  }

  static defaultProps = {
    withGeoloc: true,
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
      Telemetry.add(Telemetry.ITINERARY_POINT_GEOLOCATION);

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
    this.removePoint();
  }

  removePoint = () => {
    this.props.onChangePoint('', null);
    this.props.inputRef.current.value = '';
    // Trigger an input event to refresh Suggest's state
    this.props.inputRef.current.dispatchEvent(new Event('input'));
  }

  onScrollSuggest = scrollPosition => {
    const topBarElement = this.props.inputRef?.current?.parentNode;
    if (!topBarElement) {
      return;
    }
    if (scrollPosition > 0) {
      topBarElement.classList.add('shadow');
    } else {
      topBarElement.classList.remove('shadow');
    }
  }

  render() {
    const { pointType, inputRef, isLoading, withGeoloc, value } = this.props;
    const { mounted, readOnly } = this.state;

    return (
      <div className="direction-field" >
        <div className="direction-input">
          <input
            ref={inputRef}
            id={`direction-input_${pointType}`}
            type="search"
            required
            autoComplete="off"
            spellCheck="false"
            placeholder={pointType === 'origin'
              ? _('Enter a starting point', 'direction')
              : _('Enter an end point', 'direction')}
            value={value}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            readOnly={readOnly || isLoading}
            onFocus={handleFocus}
          />
          <div className="direction-icon-block">
            <div className={`direction-icon direction-icon-${pointType}`}/>
          </div>
          <div className="icon-x direction-field-clear" onMouseDown={this.clear} />
        </div>
        <button type="button" className="direction-field-return">
          {/* The only purpose of this button is to unfocus the input */}
          <span className="icon-arrow-left"/>
        </button>
        {mounted &&
            <Suggest
              inputNode={inputRef.current}
              outputNode={document.getElementById('direction-autocomplete_suggestions')}
              withGeoloc={withGeoloc}
              onSelect={this.selectItem}
              onClear={this.removePoint}
              onScroll={this.onScrollSuggest}
            />
        }
      </div>
    );
  }
}

const DirectionInputWithRef =
  React.forwardRef((props, ref) => <DirectionInput {...props} inputRef={ref} />);

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
