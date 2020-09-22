/* globals _ */
import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { fire } from 'src/libs/customEvents';
import { DeviceContext } from 'src/libs/device';
import { PanelContext } from 'src/libs/panelContext';

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Pixel threshold to consider vertical swipes
const SWIPE_THRESHOLD_PX = 50;
// Pixel threshold from the bottom or top of the viewport to span to min or max
const MIN_MAX_THRESHOLD_PX = 75;

function getTargetSize(previousSize, startHeight, endHeight, maxSize) {
  let size = previousSize;
  const heightDelta = startHeight - endHeight;
  if (Math.abs(heightDelta) < SWIPE_THRESHOLD_PX) {
    // ignore move
    return size;
  } else if (endHeight < MIN_MAX_THRESHOLD_PX) {
    size = 'minimized';
  } else if (endHeight > maxSize - MIN_MAX_THRESHOLD_PX) {
    size = 'maximized';
  } else if (heightDelta < 0) {
    // swipe towards the top
    size = previousSize === 'default' ? 'maximized' : 'default';
  } else {
    // swipe towards the bottom
    size = previousSize === 'default' ? 'minimized' : 'default';
  }

  return size;
}

class Panel extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]).isRequired,
    minimizedTitle: PropTypes.node,
    resizable: PropTypes.bool,
    size: PropTypes.string,
    setSize: PropTypes.func,
    marginTop: PropTypes.number,
    className: PropTypes.string,
    white: PropTypes.bool,
  }

  static defaultProps = {
    size: 'default',
    marginTop: 50, // default top bar size
  }

  constructor(props) {
    super(props);
    this.panelContentRef = React.createRef();
    this.state = {
      holding: false,
      currentHeight: null,
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
    this.defaultHeight = this.panelDOMElement.offsetHeight;
  }

  componentDidUpdate() {
    this.updateMobileMapUI();
  }

  componentWillUnmount() {
    this.updateMobileMapUI(0);
    this.removeListeners();
  }

  updateMobileMapUI = (height = this.panelDOMElement.offsetHeight) => {
    if (this.props.resizable) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', height);
      });

      if (height > this.defaultHeight) {
        // Transition to maximized
        fire('mobile_geolocation_button_visibility', false);
        fire('mobile_direction_button_visibility', false);
      } else if (this.props.size === 'minimized' || height < 40) {
        // Transition to minimized
        fire('mobile_geolocation_button_visibility', true);
        fire('mobile_direction_button_visibility', true);
      } else {
        // Transition to default
        fire('mobile_geolocation_button_visibility', true);
        fire('mobile_direction_button_visibility', false);
      }
    }
  }

  removeListeners() {
    document.removeEventListener('touchmove', this.move);
    document.removeEventListener('mousemove', this.move);
  }

  startResize = event => {
    this.startHeight = this.panelDOMElement.offsetHeight;
    this.startClientY = getEventClientY(event.nativeEvent);

    this.removeListeners();

    if (event.type === 'touchstart') {
      document.addEventListener('touchmove', this.move);
    } else {
      document.addEventListener('mousemove', this.move);
    }

    this.setState({ currentHeight: this.startHeight });
  }

  /**
  * Triggered on mouse move on the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  */
  move = event => {
    const clientY = getEventClientY(event);
    const currentHeight = this.startHeight + (this.startClientY - clientY);

    if (this.props.size === 'maximized' &&
        this.panelContentRef.current.scrollTop > 0) {
      /* User is scrolling inside the panel content,
         update startClientY to ignore current swipe gesture */
      this.startClientY = clientY;
      return;
    }

    if (this.props.size === 'maximized' &&
        this.panelContentRef.current.scrollTop === 0 &&
        currentHeight >= this.state.currentHeight) {
      // User is starting to scroll content area from bottom to top, do nothing
      return;
    }

    this.setState({ currentHeight, holding: true });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = event => {
    this.removeListeners();
    const clientY = getEventClientY(event);
    const currentHeight = this.startHeight + (this.startClientY - clientY);

    if (this.props.size === 'maximized' &&
        this.panelContentRef.current.scrollTop > 0) {
      // User is scrolling inside the panel content
      return;
    }

    const newSize = getTargetSize(
      this.props.size,
      this.startHeight,
      currentHeight,
      window.innerHeight - this.props.marginTop,
    );

    if (newSize !== this.props.size) {
      this.props.setSize(newSize);
    }
    if (this.state.holding || this.state.currentHeight) {
      this.setState({ holding: false, currentHeight: null });
    }
  }

  handleHeaderClick() {
    const size = this.props.size === 'default' ? 'minimized' : 'default';
    this.props.setSize(size);
    this.setState({ currentHeight: null });
  }

  getEventHandlers() {
    return {
      onMouseDown: this.startResize,
      onTouchStart: this.startResize,
      onMouseUp: this.stopResize,
      onTouchEnd: this.stopResize,
    };
  }

  render() {
    const {
      children, minimizedTitle,
      resizable, className, white, size, renderHeader, onClose } = this.props;
    const { currentHeight, holding } = this.state;

    return (
      <DeviceContext.Consumer>
        {isMobile =>
          <div
            className={classnames('panel', size, className, {
              'panel--white': white,
              'panel--holding': holding,
            })}
            style={{ height: currentHeight && `${currentHeight}px` }}
            ref={panel => this.panelDOMElement = panel}
            onTransitionEnd={() => this.updateMobileMapUI()}
            {...(isMobile && resizable && this.getEventHandlers())}
          >
            {onClose &&
              <button
                className="panel-close"
                title={_('Close')}
                onClick={onClose}
              >
                <i className="icon-x" />
              </button>
            }
            {isMobile && resizable &&
              <div
                className="panel-drawer"
                onClick={() => this.handleHeaderClick()}
              >
                <div className="panel-handle"/>
                {size === 'minimized' && minimizedTitle
                && <span className="minimizedTitle u-text--subtitle">{minimizedTitle}</span>}
              </div>
            }
            {size !== 'minimized' && <div className="panel-header">{renderHeader}</div>}
            <div
              className="panel-content"
              ref={this.panelContentRef}
            >
              <PanelContent size={size} isMobile={isMobile}>
                {children}
              </PanelContent>
            </div>
          </div>
        }
      </DeviceContext.Consumer>
    );
  }
}

// Use React.memo to skip re-renders
// and keep the same inner DOM during the panel manual resizes
const PanelContent = React.memo(({ children, size, isMobile }) =>
  typeof children === 'function'
    ? children({ size, isMobile })
    : children
);
PanelContent.displayName = 'PanelContent';

const PanelWrapper = props => {
  const { size, setSize } = useContext(PanelContext);
  return <Panel {...props} size={size} setSize={setSize} />;
};

export default PanelWrapper;
