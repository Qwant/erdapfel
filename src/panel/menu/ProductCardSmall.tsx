import { Flex } from '@qwant/qwant-ponents';
import React from 'react';

type ProductCardSmallType = {
  url: string;
  img: string;
  title: string;
  linkText: string;
};

const ProductCardSmall = ({ url, img, title, linkText }: ProductCardSmallType) => {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="card betterweb u-mb-l">
      <Flex alignCenter>
        <div className="u-mr-l">
          <img width="100" height="100" src={img} />
        </div>
        <div>
          <div className="u-color--primary u-mb-s betterweb-description">
            <span
              dangerouslySetInnerHTML={{
                __html: title,
              }}
            />
          </div>
          <div className="card-link">{linkText}</div>
        </div>
      </Flex>
    </a>
  );
};

export default ProductCardSmall;
