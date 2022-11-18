import React from 'react';
import SocialNetworksBlock, { PoiSocialNetworksBlockProps } from './blocks/SocialNetworks';
import Divider from 'src/components/ui/Divider';
import AddressBlock, { PoiAddressBlockProps } from './blocks/Address';
import HourBlock, { PoiHourBlockProps } from './blocks/Hour';
import ContactBlock, { PoiContactBlockProps } from './blocks/Contact';
import WebsiteBlock, { PoiWebsiteBlockProps } from './blocks/Website';
import PhoneBlock, { PoiPhoneBlockProps } from './blocks/Phone';

export type PoiInformationBlockProps = {
  title?: string;
  addressBlock?: PoiAddressBlockProps;
  hourBlock?: PoiHourBlockProps;
  phoneBlock?: PoiPhoneBlockProps;
  websiteBlock?: PoiWebsiteBlockProps;
  contactBlock?: PoiContactBlockProps;
  socialBlock?: PoiSocialNetworksBlockProps;
};

const PoiInformationBlock: React.FunctionComponent<PoiInformationBlockProps> = ({
  title,
  addressBlock,
  hourBlock,
  phoneBlock,
  websiteBlock,
  contactBlock,
  socialBlock,
}) => {
  if (
    [addressBlock, websiteBlock, phoneBlock, hourBlock, contactBlock, socialBlock].every(b => !b)
  ) {
    return null;
  }

  return (
    <div>
      <Divider paddingTop={0} />
      {title && <h3 className="u-text--smallTitle">{title}</h3>}
      <div className="poi_panel__fullWidth u-mb-s">
        {addressBlock && <AddressBlock {...addressBlock} />}
        {hourBlock && <HourBlock {...hourBlock} />}
        {phoneBlock && <PhoneBlock {...phoneBlock} />}
        {websiteBlock && <WebsiteBlock {...websiteBlock} />}
        {socialBlock && <SocialNetworksBlock {...socialBlock} />}
        {contactBlock && <ContactBlock {...contactBlock} />}
      </div>
    </div>
  );
};

export default PoiInformationBlock;
