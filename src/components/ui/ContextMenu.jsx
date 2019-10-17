import React from 'react';
import PropTypes from 'prop-types';

export default class ContextMenu extends React.Component {
  _isMounted = false;

  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
    })).isRequired,
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
    this.setState({ open: true });
    document.addEventListener('click', this.close);
  }

  close = () => {
    document.removeEventListener('click', this.close);
    if (this._isMounted) {
      this.setState({ open: false });
    }
  }

  render() {
    return <div className="contextMenu">
      <div className="contextMenu-button" onClick={this.open} >
        <i className="icon-more-horizontal" />
      </div>
      {this.state.open && <div className="contextMenu-menu">
        {this.props.items.map((item, index) =>
          <div key={index} className="contextMenu-menuItem" onClick={e => {
            e.stopPropagation();
            this.close();
            item.action();
          }}>
            <i className={`icon-${item.icon}`} />
            {item.label}
          </div>
        )}
      </div>}
    </div>;
  }
}
