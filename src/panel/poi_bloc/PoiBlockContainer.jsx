import React from 'react';
import PropTypes from 'prop-types';
import HourBlock from '../../views/poi_bloc/Hour';
import ContactBlock from '../../views/poi_bloc/Contact';
import ImagesBlock from '../../views/poi_bloc/Images';
import WebsiteBlock from '../../views/poi_bloc/Website';
import InformationBlock from '../../views/poi_bloc/Information';

export default class PoiBlockContainer extends React.Component {
  static propTypes = {
    poi: PropTypes.object,
  }

  toString(blocks) {
    return this.render(blocks, true);
  }

  render() {
    if (!this.props.poi || !this.props.poi.blocks) {
      return null;
    }
    const blocks = this.props.poi.blocks;
    const hourBlock = blocks.find(b => b.type === 'opening_hours');
    const informationBlock = blocks.find(b => b.type === 'information');
    const websiteBlock = blocks.find(b => b.type === 'website');
    const contactBlock = blocks.find(b => b.type === 'contact');
    const imagesBlock = blocks.find(b => b.type === 'images');

    return <div className="poi_panel__info">
      {hourBlock && <HourBlock block={hourBlock} />}
      {informationBlock && <InformationBlock block={informationBlock} />}
      {websiteBlock && <WebsiteBlock block={websiteBlock} poi={this.props.poi} />}
      {contactBlock && <ContactBlock block={contactBlock} />}
      {imagesBlock && <ImagesBlock block={imagesBlock} poi={this.props.poi} />}
    </div>;
  }
}
