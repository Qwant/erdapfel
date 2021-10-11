import React, { useEffect, useState } from 'react';
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
import { IconArrowLeftLine, IconClose } from '@qwant/qwant-ponents';
import classnames from 'classnames';
import { useConfig, useDevice, useI18n } from 'src/hooks';
import { saveQuery } from 'src/adapters/search_history';

const DirectionInput = ({
  isLoading,
  value,
  point,
  otherPoint,
  onChangePoint,
  pointType,
  inputRef,
  withGeoloc = true,
}) => {
  const [readOnly, setReadOnly] = useState(false);
  const { isMobile } = useDevice();
  const searchHistoryConfig = useConfig('searchHistory');
  const { _ } = useI18n();

  useEffect(() => {
    if (isLoading) {
      inputRef.current.blur();
    }
  }, [inputRef, isLoading]);

  const onChange = event => {
    const value = event.target.value;
    onChangePoint(value, null);
  };

  const submitSearch = async () => {
    const items = await fetchSuggests(value);
    if (items && items.length > 0) {
      selectItem(items[0]);
    }
  };

  const selectItem = async selectedPoi => {
    if (selectedPoi instanceof NavigatorGeolocalisationPoi) {
      Telemetry.add(Telemetry.ITINERARY_POINT_GEOLOCATION);

      setReadOnly(true);

      try {
        await selectedPoi.geolocate();
      } catch (error) {
        if (selectedPoi.status === navigatorGeolocationStatus.FORBIDDEN) {
          fire('open_geolocate_denied_modal');
        } else {
          Error.sendOnce('direction_input', 'selectItem', 'error getting user location', error);
        }
        inputRef.current.value = '';
      }

      if (selectedPoi.status === navigatorGeolocationStatus.FOUND) {
        const name = selectedPoi.type === 'latlon' ? selectedPoi.address.street : selectedPoi.name;
        onChangePoint(name, selectedPoi);
      }

      setReadOnly(false);
    } else {
      const name = selectedPoi.type === 'latlon' ? selectedPoi.address.street : selectedPoi.name;
      onChangePoint(name, selectedPoi);
      if (searchHistoryConfig?.enabled) {
        saveQuery(selectedPoi);
      }
    }
  };

  const clear = e => {
    e.preventDefault(); // prevent losing focus
    onChangePoint('', null);
  };

  return (
    <div className="direction-field">
      <div className="direction-input">
        <Suggest
          value={value}
          outputNode={document.getElementById('direction-autocomplete_suggestions')}
          withGeoloc={withGeoloc}
          onSelect={selectItem}
          withHistory={searchHistoryConfig?.enabled}
          hide={otherPoint}
        >
          {({ onKeyDown, onFocus, onBlur, highlightedValue }) => (
            <input
              ref={inputRef}
              id={`direction-input_${pointType}`}
              className={classnames({ valid: !!point })}
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
              onChange={onChange}
              onKeyDown={e => {
                if (e.key === 'Enter' && value !== '') {
                  submitSearch();
                }
                onKeyDown(e);
              }}
              readOnly={readOnly || isLoading}
              onFocus={e => {
                if (point && point.type === 'geoloc' && isMobile) {
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
        <button type="button" className="direction-field-clear" onMouseDown={clear}>
          <IconClose size={20} />
        </button>
      </div>
      <button type="button" className="direction-field-return">
        {/* The only purpose of this button is to unfocus the input */}
        <IconArrowLeftLine size={20} />
      </button>
    </div>
  );
};

DirectionInput.propTypes = {
  isLoading: PropTypes.bool,
  value: PropTypes.string,
  onChangePoint: PropTypes.func.isRequired,
  pointType: PropTypes.oneOf(['origin', 'destination']).isRequired,
  inputRef: PropTypes.object.isRequired,
  withGeoloc: PropTypes.bool,
};

const DirectionInputWithRef = React.forwardRef((props, ref) => (
  <DirectionInput {...props} inputRef={ref} />
));

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
