/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import NavigatorGeolocalisationPoi, {
  navigatorGeolocationStatus,
} from 'src/adapters/poi/specials/navigator_geolocalisation_poi';
import Suggest from 'src/components/ui/Suggest';
import Error from 'src/adapters/error';
import { fire } from 'src/libs/customEvents';
import { fetchSuggests } from 'src/libs/suggest';
import Telemetry from 'src/libs/telemetry';
import { handleFocus } from 'src/libs/input';
import { isMobileDevice } from 'src/libs/device';
import { IconArrowLeft, IconClose } from 'src/components/ui/icons';
import classnames from 'classnames';

class DirectionInput extends React.Component {
  static propTypes = {
    isLoading: PropTypes.bool,
    value: PropTypes.string,
    onChangePoint: PropTypes.func.isRequired,
    pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
    inputRef: PropTypes.object.isRequired,
    withGeoloc: PropTypes.bool,
  };

  static defaultProps = {
    withGeoloc: true,
  };

  state = {
    readOnly: false,
  };

  componentDidMount() {
    if (this.props.isLoading) {
      this.props.inputRef.current.blur();
    }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isLoading && this.props.isLoading) {
      this.props.inputRef.current.blur();
    }
  }

  onChange = event => {
    const value = event.target.value;
    this.props.onChangePoint(value, null);
  };

  submitSearch = async () => {
    const items = await fetchSuggests(this.props.value);
    if (items && items.length > 0) {
      this.selectItem(items[0]);
    }
  };

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
  };

  clear = e => {
    e.preventDefault(); // prevent losing focus
    this.props.onChangePoint('', null);
  };

  render() {
    const { pointType, inputRef, isLoading, withGeoloc, value, point, onChangePoint } = this.props;
    const { readOnly } = this.state;

    return (
      <div className="direction-field">
        <div className="direction-input">
          <Suggest
            value={value}
            outputNode={document.getElementById('direction-autocomplete_suggestions')}
            withGeoloc={withGeoloc}
            onSelect={this.selectItem}
          >
            {({ onKeyDown, onFocus, onBlur, highlightedValue }) => (
              <input
                ref={inputRef}
                id={`direction-input_${pointType}`}
                className={classnames({ valid: point !== null })}
                type="search"
                required
                autoComplete="off"
                spellCheck="false"
                placeholder={
                  pointType === 'origin'
                    ? _('Enter a starting point', 'direction')
                    : _('Enter an end point', 'direction')
                }
                value={highlightedValue || value}
                onChange={this.onChange}
                onKeyDown={e => {
                  if (e.key === 'Enter' && this.props.value !== '') {
                    this.submitSearch();
                  }
                  onKeyDown(e);
                }}
                readOnly={readOnly || isLoading}
                onFocus={e => {
                  if (point && point.type === 'geoloc' && isMobileDevice()) {
                    // Clear Input to avoid fetching unwanted suggestions
                    onChangePoint('');
                  } else {
                    handleFocus(e);
                  }
                  onFocus();
                }}
                onBlur={onBlur}
              />
            )}
          </Suggest>
          <div className="direction-icon-block">
            <div className={`direction-icon direction-icon-${pointType}`} />
          </div>
          <button type="button" className="direction-field-clear" onMouseDown={this.clear}>
            <IconClose width={20} fill="currentColor" />
          </button>
        </div>
        <button type="button" className="direction-field-return">
          {/* The only purpose of this button is to unfocus the input */}
          <IconArrowLeft width={20} fill="currentColor" />
        </button>
      </div>
    );
  }
}

const DirectionInputWithRef = React.forwardRef((props, ref) => (
  <DirectionInput {...props} inputRef={ref} />
));

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
