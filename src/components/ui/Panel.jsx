import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

function getClosestIndex(arr, goal) {
  return arr.reduce((closestIndex, curr, index) =>
    Math.abs(curr - goal) < Math.abs(arr[closestIndex] - goal) ? index : closestIndex
  );
}

export default class Panel extends React.Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    title: PropTypes.node,
    minimizedTitle: PropTypes.node,
    resizable: PropTypes.bool,
    close: PropTypes.func,
    className: PropTypes.string,
  }

  constructor(props) {
    super(props);
    this.moveCallback = e => this.move(e);
    this.state = {
      isTransitioning: false,
      size: null,
      currentHeight: null,
    };
  }

  componentDidMount() {
    this.updateMobileMapUI();
  }

  componentDidUpdate() {
    this.updateMobileMapUI();
  }

  updateMobileMapUI = () => {
    if (this.props.resizable) {
      window.execOnMapLoaded(() => {
        fire('move_mobile_bottom_ui', this.panelDOMElement.offsetHeight);
      });
    }
  }

  holdResizer = event => {
    event.preventDefault();

    if (this.state.isTransitioning) {
      return;
    }

    this.setState({ size: null });
    this.move(event.nativeEvent, true);

    this.timer = setTimeout(() => {
      if (this.timer) {
        this.holding = true;
        document.addEventListener('touchmove', this.moveCallback);
        document.addEventListener('mousemove', this.moveCallback);
      }
    }, 250);
  }

  /**
  * Triggered on mouse move inside the body element while holding the panel resizer
  * @param {MouseEvent|TouchEvent} e event
  * @param {boolean} force Apply the height outside a panel resize
  */
  move(e, force = false) {
    if ((this.holding || force) && !this.state.isTransitioning) {
      const clientY = e.changedTouches ? e.touches[0].clientY : e.clientY;
      this.setState({
        currentHeight: Math.abs(
          window.innerHeight - clientY + this.handleElement.offsetHeight - 10
        ),
      });
    }
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  stopResize = event => {
    event.preventDefault();
    clearTimeout(this.timer);

    const nativeEvent = event.nativeEvent;
    const clientY = nativeEvent.changedTouches
      ? nativeEvent.changedTouches[0].clientY
      : nativeEvent.clientY;
    const sizes = [0, window.innerHeight / 2, window.innerHeight];
    const positionIndex = getClosestIndex(sizes, clientY);

    let size = null;
    if (positionIndex === 2 && this.holding) {
      size = 'minimized';
    } else if (positionIndex === 1 && !this.holding) {
      size = 'minimized';
    } else if (positionIndex === 0) {
      size = 'maximized';
    }

    this.holding = false;
    this.setState({
      isTransitioning: true,
      size,
      currentHeight: null,
    });

    setTimeout(() => {
      this.setState({ isTransitioning: false });
      document.removeEventListener('touchmove', this.moveCallback);
      document.removeEventListener('mousemove', this.moveCallback);
    }, 250); // css transition delay
  }

  render() {
    const { children, title, minimizedTitle, resizable, close, className } = this.props;
    const { size, isTransitioning, currentHeight } = this.state;

    const resizeHandlers = resizable ? {
      onMouseDown: this.holdResizer,
      onTouchStart: this.holdResizer,
      onMouseUp: this.stopResize,
      onTouchEnd: this.stopResize,
    } : {};

    return <div
      className={classnames('panel', size, className, { 'smooth-resize': isTransitioning })}
      style={{ height: currentHeight && `${currentHeight}px` }}
      ref={panel => this.panelDOMElement = panel}
    >
      {close && <div className="panel-close" onClick={() => close()}><i className="icon-x" /></div>}
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
