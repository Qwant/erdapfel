import React from 'react';
import { toArray } from 'src/libs/address';
import { PoiAddressBlockProps } from 'src/panel/poi/blocks/Information/blocks/Address';

export type AddressProps = {
  address: PoiAddressBlockProps['address'];
  inline?: boolean;
  omitStreet?: boolean;
  omitCountry?: boolean;
};

const Address: React.FunctionComponent<AddressProps> = ({
  address,
  inline,
  omitStreet,
  omitCountry,
}) => {
  if (!address) return null;
  const parts: string[] = toArray(address, { omitStreet, omitCountry });
  if (inline) return <span>{parts?.join(', ') ?? ''}</span>;

  return (
    <div>
      {parts.map((item, index) => (
        <div key={index}>{item}</div>
      ))}
    </div>
  );
};

export default Address;
