import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Tooltip extends React.Component {
  _isMounted = false;

  static propTypes = {
    triggerElement: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    contentClassName: PropTypes.string,
  }

  state = {
    open: false,
  }

  componentDidMount() {
    this._isMounted = true;
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  open = e => {
    e.stopPropagation();
    if (!this._portalElement) {
      this._portalElement = document.body.appendChild(document.createElement('div'));
    }
    this.setState({
      open: true,
      triggerPosition: { left: e.clientX, top: e.clientY },
    });
    document.addEventListener('click', this.close);
  }

  close = () => {
    document.removeEventListener('click', this.close);
    if (this._isMounted) {
      this.setState({ open: false }, () => {
        if (this._portalElement) {
          document.body.removeChild(this._portalElement);
          this._portalElement = null;
        }
      });
    }
  }

  render() {
    return <div className={classnames('tooltip', this.props.className)}>
      <div className="tooltip-trigger" onClick={this.open}>
        {this.props.triggerElement}
      </div>
      {this.state.open && ReactDOM.createPortal(
        <div
          className={classnames('tooltip-content', this.props.contentClassName)}
          style={this.state.triggerPosition}
        >
          {this.props.children}
        </div>,
        this._portalElement
      )}
    </div>;
  }
}
