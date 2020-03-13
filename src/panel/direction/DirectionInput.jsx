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
    // if (this.suggest) {
    //   this.suggest.destroy();
    // }
  }

  onChange = value => {
    if (value !== this.props.value) {
      this.props.onChangePoint(value, null);
    }
  }

  selectItem = async selectedPoi => {
    // console.log('selectedPoi', selectedPoi);
    if (selectedPoi instanceof NavigatorGeolocalisationPoi) {
      // this.suggest.setIdle(true);
      try {
        await selectedPoi.geolocate();
      } catch (error) {
        if (selectedPoi.status === navigatorGeolocationStatus.FORBIDDEN) {
          fire('open_geolocate_denied_modal');
        } else {
          Error.sendOnce('direction_input', 'selectItem', 'error getting user location', error);
        }
        // this.suggest.clear();
      }
      if (selectedPoi.status === navigatorGeolocationStatus.FOUND) {
        this.props.onChangePoint(selectedPoi.getInputValue(), selectedPoi);
      }
      // this.suggest.setIdle(false);
    } else {
      this.props.onChangePoint(selectedPoi.getInputValue(), selectedPoi);
      console.log('############', this.props.value, selectedPoi.getInputValue());
    }
  }

  focus = () => {
    setTimeout(() => { this.props.inputRef.current.focus(); }, 0);
  }

  clear = () => {
    console.log('clear!!!!!');
    this.props.onChangePoint('', null);
    this.focus();
  }

  render() {
    const { pointType, inputRef } = this.props;

    return <div className="itinerary_field" >
      <div className={`itinerary_icon itinerary_icon_${pointType}`} />
      <Suggest
        className="direction_suggestions"
        inputValue={this.props.value}
        onChange={value => {this.onChange(value); }}
        onSelect={this.selectItem}
        prefixes={[NavigatorGeolocalisationPoi.getInstance()]}
        input={props =>
          <>
            <input
              ref={inputRef}
              className="itinerary_input"
              type="search"
              required
              autoComplete="off"
              spellCheck="false"
              placeholder={pointType === 'origin'
                ? _('Start point', 'direction')
                : _('End point', 'direction')}
              {...props}
              id={`itinerary_input_${pointType}`}
            />
            <div className="icon-x itinerary__field__clear" onMouseDown={this.clear} />
            <div className="itinerary_field_return">
              <span className="icon-arrow-left"/>
            </div>
            <div className="itinerary_field_icon">
              <div className={`itinerary_icon itinerary_icon_${pointType}`}/>
            </div>
          </>
        }
      />
    </div>;
  }
}

const DirectionInputWithRef =
  React.forwardRef((props, ref) => <DirectionInput {...props} inputRef={ref} />);

DirectionInputWithRef.displayName = 'DirectionInput';

export default DirectionInputWithRef;
