import React from 'react';
import SocialNetworksBlock from './blocks/SocialNetworks';
import { Divider } from 'src/components/ui';
import AddressBlock, { PoiAddressBlockProps } from './blocks/Address';
import RecyclingBlock from './blocks/Recycling';
import HourBlock, { PoiHourBlockProps } from './blocks/Hour';
import ContactBlock from './blocks/Contact';
import WebsiteBlock from './blocks/Website';
import { toArray } from 'src/libs/address';
import PhoneBlock, { PoiPhoneBlockProps } from './blocks/Phone';

export type PoiInformationBlockProps = {
  title?: string;
  addressBlock?: PoiAddressBlockProps;
  hourBlock?: PoiHourBlockProps;
  phoneBlock?: PoiPhoneBlockProps;
  websiteBlock?: any;
  contactBlock?: any;
  recyclingBlock?: any;
  socialBlock?: any;
  poi?: any;
};

const PoiInformationBlock: React.FunctionComponent<PoiInformationBlockProps> = ({
  title,
  addressBlock,
  hourBlock,
  phoneBlock,
  websiteBlock,
  contactBlock,
  recyclingBlock,
  socialBlock,
  poi,
}) => {
  // TODO: Move this check into addressBlock directly
  // TODO: Remove `poi` prop to PoiInformationBlock
  const hasAddressBlock =
    poi?.address &&
    poi?.subClassName !== 'latlon' &&
    toArray(poi?.address, { omitCountry: true, omitStreet: undefined }).some(part => part);

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
      {title && <h3 className="u-text--smallTitle">{title}</h3>}
      <div className="poi_panel__fullWidth u-mb-s">
        {hasAddressBlock && addressBlock && <AddressBlock {...addressBlock} />}
        {hourBlock && <HourBlock {...hourBlock} />}
        {phoneBlock && <PhoneBlock {...phoneBlock} />}
        {websiteBlock && <WebsiteBlock block={websiteBlock} poi={poi} />}
        {socialBlock && <SocialNetworksBlock block={socialBlock} />}
        {recyclingBlock && <RecyclingBlock block={recyclingBlock} />}
        {contactBlock && <ContactBlock block={contactBlock} />}
      </div>
    </div>
  );
};

export default PoiInformationBlock;
