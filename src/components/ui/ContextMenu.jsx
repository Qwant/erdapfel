import React from 'react';
import PropTypes from 'prop-types';

export default class ContextMenu extends React.Component {
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

  open = e => {
    e.stopPropagation();
    this.setState({ open: true });
    document.addEventListener('click', this.close);
  }

  close = () => {
    this.setState({ open: false });
    document.removeEventListener('click', this.close);
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
