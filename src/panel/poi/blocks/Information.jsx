import React from 'react';
import SocialNetworksBlock from './SocialNetworks';
import { Divider } from 'src/components/ui';
import AddressBlock from './Address';
import PhoneBlock from './Phone';
import RecyclingBlock from './Recycling';
import HourBlock from './Hour';
import ContactBlock from './Contact';
import WebsiteBlock from './Website';
import { findBlock } from 'src/libs/pois';
import { useI18n } from 'src/hooks';
import { toArray } from 'src/libs/address';

const InformationBlock = ({ poi }) => {
  const { _ } = useI18n();

  const blocks = poi.blocks;
  const hourBlock = findBlock(blocks, 'opening_hours');
  const phoneBlock = findBlock(blocks, 'phone');
  const websiteBlock = findBlock(blocks, 'website');
  const contactBlock = findBlock(blocks, 'contact');
  const recyclingBlock = findBlock(blocks, 'recycling');
  const socialBlock = findBlock(blocks, 'social');

  const hasAddressBlock =
    poi.address &&
    poi.subClassName !== 'latlon' &&
    toArray(poi.address, { omitCountry: true }).some(part => part);

  if (
    [
      hasAddressBlock,
      websiteBlock,
      phoneBlock,
      hourBlock,
      recyclingBlock,
      contactBlock,
      socialBlock,
    ].every(b => !b)
  ) {
    return null;
  }

  return (
    <div>
      <Divider paddingTop={0} />
      <h3 className="u-text--smallTitle">{_('Information')}</h3>
      <div className="poi_panel__fullWidth u-mb-s">
        {hasAddressBlock && <AddressBlock address={poi.address} />}
        {hourBlock && <HourBlock block={hourBlock} />}
        {phoneBlock && <PhoneBlock block={phoneBlock} poi={poi} />}
        {websiteBlock && <WebsiteBlock block={websiteBlock} poi={poi} />}
        {socialBlock && <SocialNetworksBlock block={socialBlock} />}
        {recyclingBlock && <RecyclingBlock block={recyclingBlock} />}
        {contactBlock && <ContactBlock block={contactBlock} />}
      </div>
    </div>
  );
};

export default InformationBlock;
