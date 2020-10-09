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
import { isMobileDevice } from 'src/libs/device';
import classNames from 'classnames';

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
    geoloc: false,
  }

  componentDidMount() {
    if (this.props.isLoading) {
      this.props.inputRef.current.blur();
    }

    this.setState({
      mounted: true,
    });

    // if (!this.props.isLoading && this.props.value === '' && this.props.pointType === 'origin') {
    //   console.log('geoloc!', this.props);
    //   this.selectItem(new NavigatorGeolocalisationPoi());
    // }
  }

  async componentDidUpdate(prevProps) {
    if (!prevProps.isLoading && this.props.isLoading) {
      this.props.inputRef.current.blur();
    }

    if (this.props.pointType === 'origin') {
      console.log('update', this.props);
    }

    if (this.props.rawValue !== prevProps.rawValue) {
      if (this.props.rawValue instanceof NavigatorGeolocalisationPoi) {
        this.setState({ geoloc: true });
      } else {
        this.setState({ geoloc: false });
      }
    }

    if (prevProps.isDirty && !this.props.isDirty &&
       this.props.value === '' &&
       this.props.pointType === 'origin' &&
       !this.state.geoloc &&
       isMobileDevice()
    ) {
      if (!window.navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          return;
        }
      }

      // TODO/ check geoloc auth and mobile only
      this.selectItem(new NavigatorGeolocalisationPoi());
      this.setState({ geoloc: true });
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
    this.props.onChangePoint('', null);
    this.props.inputRef.current.value = '';
    // Trigger an input event to refresh Suggest's state
    this.props.inputRef.current.dispatchEvent(new Event('input'));
  }

  render() {
    const { pointType, inputRef, isLoading } = this.props;
    const { mounted, readOnly, geoloc } = this.state;

    return (
      <div className="direction-field" >
        <div className={classNames('direction-input', { geoloc })}>
          {geoloc &&
          <label
            className="u-text--subtitle"
            htmlFor={`direction-input_${pointType}`}
          >
            Votre position
          </label>
          }
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
            value={this.props.value}
            onChange={this.onChange}
            onKeyPress={this.onKeyPress}
            readOnly={readOnly || isLoading}
          />
          <div className="direction-icon-block">
            <div className={`direction-icon direction-icon-${pointType}`}/>
          </div>
          <div className="icon-x direction-field-clear" onMouseDown={this.clear} />
        </div>
        <div className="direction-field-return">
          <span className="icon-arrow-left"/>
        </div>
        {mounted &&
            <Suggest
              inputNode={inputRef.current}
              outputNode={document.getElementById('direction-autocomplete_suggestions')}
              withGeoloc
              onSelect={this.selectItem}
              onClear={this.clear}
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
