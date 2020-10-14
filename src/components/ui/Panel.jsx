import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { fire } from 'src/libs/customEvents';
import { DeviceContext } from 'src/libs/device';
import { PanelContext } from 'src/libs/panelContext';
import { CloseButton } from 'src/components/ui';

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Pixel threshold to consider vertical swipes
const SWIPE_THRESHOLD_PX = 50;
// Pixel threshold from the bottom or top of the viewport to span to min or max
const MIN_MAX_THRESHOLD_PX = 75;
const DEFAULT_SIZE = 250;
const DEFAULT_MINIMIZED_SIZE = 50;
const FIT_CONTENT_PADDING = 20;

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
    fitContent: PropTypes.arrayOf(PropTypes.oneOf(['default', 'minimized'])),
    size: PropTypes.string,
    setSize: PropTypes.func,
    marginTop: PropTypes.number,
    className: PropTypes.string,
  }

  static defaultProps = {
    size: 'default',
    marginTop: 64, // default top bar size,
  }

  constructor(props) {
    super(props);
    const { marginTop } = this.props;

    this.startClientY = 0; // Y coordinate where finger started to touch panel
    this.startClientYOffset = 0; // offset between finger and top of panel
    this.startHeight = 0; // panel height when finger touches panel area
    this.stopHeight = 0; // panel height when finger releases
    this.panelContentRef = React.createRef();
    this.state = {
      holding: false,
      height: window.innerHeight - marginTop,
      translateY: window.innerHeight - marginTop - DEFAULT_SIZE,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleViewportResize);
    this.updateMobileMapUI();
  }

  componentDidUpdate(prevProps, prevState) {
    const { fitContent, size } = this.props;
    const { holding } = this.state;
    this.updateMobileMapUI();

    if (fitContent && !holding && size !== 'maximized' ||
        this.state.height !== prevState.height ||
        this.props.size !== prevProps.size) {
      // Resize panel according to content height
      const translateY = this.getTranslateY(size);
      if (translateY !== this.state.translateY) {
        this.setState({ translateY });
      }
    }
  }

  componentWillUnmount() {
    this.updateMobileMapUI({ closing: true });
    this.removeListeners();
    window.removeEventListener('resize', this.handleViewportResize);
  }

  handleViewportResize = () => {
    this.setState({ height: window.innerHeight - this.props.marginTop });
  }

  updateMobileMapUI = ({ closing } = {}) => {
    if (this.props.resizable) {
      const heightFromBottom = closing ? 0 : this.state.height - this.state.translateY;

      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', heightFromBottom);
      });

      if (heightFromBottom > DEFAULT_SIZE) {
        // Transition to maximized
        fire('mobile_geolocation_button_visibility', false);
        fire('mobile_direction_button_visibility', false);
      } else if (this.props.size === 'minimized' || heightFromBottom < DEFAULT_MINIMIZED_SIZE) {
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
    const rect = this.panelDOMElement.getBoundingClientRect();
    this.startClientY = getEventClientY(event.nativeEvent);
    this.startClientYOffset = this.startClientY - rect.top;
    this.startHeight = window.innerHeight - rect.top;

    if (event.type === 'touchstart') {
      // Workaround for https://bugs.chromium.org/p/chromium/issues/detail?id=1123304
      document.addEventListener('touchmove', this.move, { passive: false });
    } else {
      document.addEventListener('mousemove', this.move);
    }

    this.setState({ holding: true });
  }

  /**
  * Triggered on mouse move on the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  */
  move = event => {
    const clientY = getEventClientY(event);
    const visibleHeight = Math.ceil(window.innerHeight - clientY + this.startClientYOffset);
    const { scrollTop } = this.panelContentRef.current;

    if (this.state.translateY === 0 &&
        this.props.size === 'maximized' &&
        scrollTop === 0 &&
        visibleHeight >= this.startHeight) {
      /* User is starting to scroll content area from bottom to top
       * Do not prevent default */
      return;
    }

    if (this.state.translateY === 0 &&
        this.props.size === 'maximized' && scrollTop > 0) {
      /* User is already scrolling inside the panel content.
       * Update startClientY to ignore current swipe gesture */
      const rect = this.panelDOMElement.getBoundingClientRect();
      this.startClientY = clientY;
      this.stopHeight = window.innerHeight - rect.top;
      this.startClientYOffset = clientY - rect.top;
      return;
    }

    event.preventDefault();

    const translateY = visibleHeight >= this.state.height
      ? 0 // Prevent panel to be moved above the top bar
      : this.state.height - visibleHeight;

    this.setState({ translateY });
  }

  getTranslateY(size) {
    const { fitContent } = this.props;
    const { height } = this.state;
    const panelHeight = this.panelContentRef.current.offsetHeight;
    const values = {
      'default': height -
        (fitContent.indexOf('default') >= 0 &&
        (panelHeight + FIT_CONTENT_PADDING <= DEFAULT_SIZE)
          ? panelHeight + FIT_CONTENT_PADDING
          : DEFAULT_SIZE),
      'minimized': height - (fitContent.indexOf('minimized') >= 0
        ? panelHeight + FIT_CONTENT_PADDING
        : DEFAULT_MINIMIZED_SIZE),
      'maximized': 0,
    };

    return values[size];
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = _ => {
    this.removeListeners();
    const rect = this.panelDOMElement.getBoundingClientRect();
    this.stopHeight = window.innerHeight - rect.top;

    const newSize = getTargetSize(
      this.props.size,
      this.startHeight,
      this.stopHeight,
      window.innerHeight - this.props.marginTop,
    );

    if (newSize !== this.props.size) {
      this.props.setSize(newSize);
    }

    this.setState({
      holding: false,
      translateY: this.getTranslateY(newSize),
    });
  }

  handleHeaderClick() {
    const size = this.props.size === 'default' ? 'minimized' : 'default';
    const translateY = this.getTranslateY(size);
    this.props.setSize(size);
    this.setState({ translateY });
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
      resizable, className, size, renderHeader, onClose } = this.props;
    const { translateY, holding } = this.state;

    return (
      <DeviceContext.Consumer>
        {isMobile =>
          <div
            className={classnames('panel', size, className, {
              'panel--holding': holding,
            })}
            style={isMobile ?
              {
                height: this.state.height,
                transform: `translate3d(0px, ${translateY}px, 0px)`,
              }
              : {}
            }
            ref={panel => this.panelDOMElement = panel}
            onTransitionEnd={() => this.updateMobileMapUI()}
            {...(isMobile && resizable && this.getEventHandlers())}
          >
            {onClose && <CloseButton onClick={onClose} className="panel-close" />}
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
