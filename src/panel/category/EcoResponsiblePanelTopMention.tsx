import React from 'react';
import { useI18n } from 'src/hooks';
import { isEcoResponsibleCategory } from 'src/libs/eco-responsible';
import TopPanelMention from '../TopPanelMention';

type EcoResponsiblePanelTopMentinProps = {
  category: string;
  isPoiDetails?: boolean;
  linkHref?: string;
};

export const EcoResponsiblePanelTopMention = ({
  category,
  linkHref,
  isPoiDetails,
}: EcoResponsiblePanelTopMentinProps) => {
  const { _ } = useI18n();
  const isEcoResponsible = isEcoResponsibleCategory(category);

  const TOP_PANEL_MENTIONS = {
    ['ecotables']: {
      image: './statics/images/source-ecotables.png',
      text: _('Ecotable source details'),
      textPoiDetails: _('Ecotable source poi details'),
      link: {
        text: _('Ecotable source see more'),
        textPoiDetails: _('Ecotable source poi see more'),
        href: _('Ecotable source see more link'),
      },
    },
    ['organic_store']: {
      image: './statics/images/source-organic_store.png',
      text: _('Organic store source details'),
      textPoiDetails: _('Organic store source poi details'),
      link: {
        text: _('Organic store source see more'),
        textPoiDetails: _('Organic store source see more'),
        href: _('Organic store source see more link'),
      },
    },
    ['second_hand']: {
      image: './statics/images/source-second_hand.png',
      text: _('Second hand source details'),
      textPoiDetails: _('Second hand source details'),
      link: {
        text: _('Second hand source see more'),
        textPoiDetails: _('Second hand source see more'),
        href: _('Second hand source see more link'),
      },
    },
    ['zero_waste']: {
      image: './statics/images/source-zero_waste.png',
      text: _('Zero waste source details'),
      textPoiDetails: _('Zero waste source details'),
      link: {
        text: _('Zero waste source see more'),
        textPoiDetails: _('Zero waste source see more'),
        href: _('Zero waste source see more link'),
      },
    },
  };

  if (!isEcoResponsible) {
    return null;
  }

  return (
    <TopPanelMention
      image={TOP_PANEL_MENTIONS[category].image}
      text={
        isPoiDetails
          ? TOP_PANEL_MENTIONS[category].textPoiDetails
          : TOP_PANEL_MENTIONS[category].text
      }
      link={{
        text: isPoiDetails
          ? TOP_PANEL_MENTIONS[category].link.textPoiDetails
          : TOP_PANEL_MENTIONS[category].link.text,
        href: linkHref ?? TOP_PANEL_MENTIONS[category].link.href,
      }}
    />
  );
};
