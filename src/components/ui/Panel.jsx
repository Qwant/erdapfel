import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

function getClosestIndex(arr, goal) {
  return arr.reduce((closestIndex, curr, index) =>
    Math.abs(curr - goal) < Math.abs(arr[closestIndex] - goal) ? index : closestIndex
  );
}

const getEventClientY = event => event.changedTouches
  ? event.changedTouches[0].clientY
  : event.clientY;

// Delay below which a mouseDown/mouseUp interaction
// will be considered a as single click instead of a draggin action
const CLICK_RESIZE_TIMEOUT_MS = 250;

export default class Panel extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.node,
    minimizedTitle: PropTypes.node,
    resizable: PropTypes.bool,
    initialSize: PropTypes.oneOf(['default', 'minimized', 'maximized']),
    marginTop: PropTypes.number,
    close: PropTypes.func,
    className: PropTypes.string,
    white: PropTypes.bool,
  }

  static defaultProps = {
    marginTop: 0,
    initialSize: 'default',
  }

  constructor(props) {
    super(props);
    this.moveCallback = e => this.move(e);
    this.state = {
      holding: false,
      size: props.initialSize,
      currentHeight: null,
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
  }

  componentDidUpdate() {
    this.updateMobileMapUI();
  }

  componentWillUnmount() {
    this.updateMobileMapUI(0);
    document.removeEventListener('mousemove', this.moveCallback);
    document.removeEventListener('touchmove', this.moveCallback);
  }

  updateMobileMapUI = (height = this.panelDOMElement.offsetHeight) => {
    if (this.props.resizable) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', height);
      });
    }
  }

  holdResizer = event => {
    event.preventDefault();

    this.startHeight = this.panelDOMElement.offsetHeight;
    this.startClientY = getEventClientY(event.nativeEvent);
    this.interactionStarted = event.timeStamp;

    document.addEventListener('mousemove', this.moveCallback);
    document.addEventListener('touchmove', this.moveCallback);

    this.setState(previousState => ({
      currentHeight: this.startHeight,
      size: 'default',
      previousSize: previousState.size,
      holding: true,
    }));
  }

  /**
  * Triggered on mouse move on the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  */
  move = event => {
    event.preventDefault();

    const clientY = getEventClientY(event);
    const currentHeight = this.startHeight + (this.startClientY - clientY);
    this.setState({ currentHeight });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = event => {
    event.preventDefault();

    document.removeEventListener('mousemove', this.moveCallback);
    document.removeEventListener('touchmove', this.moveCallback);

    const { previousSize, currentHeight } = this.state;

    let size = 'default';
    if (event.timeStamp - this.interactionStarted < CLICK_RESIZE_TIMEOUT_MS) {
      // the resize handler was only clicked, provide 'smart' resize
      size = previousSize === 'default' ? 'minimized' : 'default';
    } else {
      // the resize handler was really dragged-n-dropped
      const maxSize = window.innerHeight - this.props.marginTop;
      const sizes = [0, maxSize / 2, maxSize];
      const positionIndex = getClosestIndex(sizes, currentHeight);
      if (positionIndex === 0) {
        size = 'minimized';
      } else if (positionIndex === 2) {
        size = 'maximized';
      }
    }

    this.setState({
      holding: false,
      size,
      currentHeight: null,
    });
  }

  render() {
    const { children, title, minimizedTitle, resizable, close, className, white } = this.props;
    const { size, currentHeight, holding } = this.state;

    const resizeHandlers = resizable ? {
      onMouseDown: this.holdResizer,
      onTouchStart: this.holdResizer,
      onMouseUp: this.stopResize,
      onTouchEnd: this.stopResize,
    } : {};

    return <div
      className={classnames('panel', size, className, {
        'panel--white': white,
        'panel--holding': holding,
      })}
      style={{ height: currentHeight && `${currentHeight}px` }}
      ref={panel => this.panelDOMElement = panel}
      onTransitionEnd={() => this.updateMobileMapUI()}
    >
      {close && <div className="panel-close" onClick={() => { close(); }}>
        <i className="icon-x" />
      </div>}
      <div
        className={classnames('panel-header', { 'panel-resizeHandle': resizable })}
        {...resizeHandlers}
        ref={element => this.handleElement = element}
      >
        {resizable && size === 'minimized' && minimizedTitle ? minimizedTitle : title}
      </div>
      <div className="panel-content">
        {children}
      </div>
    </div>;
  }
}
