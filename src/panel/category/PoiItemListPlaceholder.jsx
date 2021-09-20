import React from 'react';
import { ItemList, Item } from 'src/components/ui/ItemList';
import { Stack, Ghost } from '@qwant/qwant-ponents';

const PoiItemPlaceholder = () => (
  <div className="poiItem">
    <Stack gap="xxs" fullWidth>
      <Ghost height={21} width="66%" className="u-mb-xxs" />
      <Ghost height={16} width="33%" />
      <Ghost height={16} width="100%" />
      <Ghost height={16} width="75%" />
    </Stack>
    <div className="poiItem-right">
      <div className="poiTitleImage u-placeholder" />
    </div>
  </div>
);

const PoiItemListPlaceholder = ({ nbItems = 6 }) => (
  <ItemList className="category__panel__items category__panel__items--placeholder">
    {Array.from({ length: nbItems }).map((_item, index) => (
      <Item key={index}>
        <PoiItemPlaceholder />
      </Item>
    ))}
  </ItemList>
);

export default PoiItemListPlaceholder;
