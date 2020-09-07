/* global _ */
import React from 'react';
import PropTypes from 'prop-types';
import HourBlock from './blocks/Hour';
import ContactBlock from './blocks/Contact';
import ImagesBlock from './blocks/Images';
import WebsiteBlock from './blocks/Website';
import InformationBlock from './blocks/Information';
import CovidBlock from './blocks/Covid19';
import PhoneBlock from './blocks/Phone';
import RecyclingBlock from './blocks/Recycling';
import WikiBlock from './blocks/Wiki';
import Block from 'src/panel/poi/blocks/Block';
import Divider from 'src/components/ui/Divider';
import Address from 'src/components/ui/Address';

export default class PoiBlockContainer extends React.Component {
  static propTypes = {
    poi: PropTypes.object,
    covid19Enabled: PropTypes.bool,
  }

  render() {
    if (!this.props.poi) {
      return null;
    }
    const blocks = this.props.poi.blocks || [];
    const hourBlock = blocks.find(b => b.type === 'opening_hours');
    const informationBlock = blocks.find(b => b.type === 'information');
    const phoneBlock = blocks.find(b => b.type === 'phone');
    const websiteBlock = blocks.find(b => b.type === 'website');
    const contactBlock = blocks.find(b => b.type === 'contact');
    const imagesBlock = blocks.find(b => b.type === 'images');
    const recyclingBlock = blocks.find(b => b.type === 'recycling');
    const covidBlock = blocks.find(b => b.type === 'covid19');
    const displayCovidInfo = this.props.covid19Enabled && blocks.find(b => b.type === 'covid19');
    const wikipedia = informationBlock
      ? informationBlock.blocks.find(b => b.type === 'wikipedia')
      : null;

    return <div className="poi_panel__info">
      {wikipedia && <WikiBlock block={wikipedia} />}
      {displayCovidInfo &&
        <CovidBlock block={covidBlock} countryCode={this.props.poi.address.country_code} />}
      <Divider />
      {
        (
          (this.props.poi.address && this.props.poi.subClassName !== 'latlon')
          || websiteBlock
          || informationBlock
          || phoneBlock
          || hourBlock
          || recyclingBlock
          || contactBlock
        ) && <h3 className="u-text--smallTitle">{_('Information')}</h3>
      }
      {this.props.poi.address && this.props.poi.subClassName !== 'latlon' &&
        <Block className="block-address" icon="map-pin" title={_('address')}>
          <Address inline address={this.props.poi.address} omitCountry />
        </Block>
      }
      {hourBlock && <HourBlock block={hourBlock} covid19enabled={!!displayCovidInfo} />}
      {phoneBlock && <PhoneBlock block={phoneBlock} />}
      {websiteBlock && <WebsiteBlock block={websiteBlock} poi={this.props.poi} />}
      {informationBlock && <InformationBlock block={informationBlock} />}
      {recyclingBlock && <RecyclingBlock block={recyclingBlock} />}
      {contactBlock && <ContactBlock block={contactBlock} />}
      {imagesBlock &&
        <>
          <Divider />
          <ImagesBlock block={imagesBlock} />
        </>
      }
    </div>;
  }
}
