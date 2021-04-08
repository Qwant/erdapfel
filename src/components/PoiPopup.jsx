import React from 'react';
import ReviewScore from 'src/components/ReviewScore';
import OpeningHour from 'src/components/OpeningHour';
import OsmSchedule from 'src/adapters/osm_schedule';
import PoiTitle from 'src/components/PoiTitle';
import Address from 'src/components/ui/Address';
import { useConfig } from 'src/hooks';

const PoiPopup = ({ poi }) => {
  const { enabled: covid19Enabled } = useConfig('covid19');

  const reviews = poi.blocksByType && poi.blocksByType.grades;
  const openingHours = poi.blocksByType && poi.blocksByType.opening_hours;

  let displayedInfo = null;
  if (reviews) {
    displayedInfo = <ReviewScore reviews={reviews} poi={poi} />;
  } else if (openingHours && !covid19Enabled) {
    displayedInfo = <OpeningHour schedule={new OsmSchedule(openingHours)} />;
  } else if (poi.address) {
    displayedInfo = <Address address={poi.address} inline omitCountry />;
  }

  return (
    <div className="poi_popup">
      <PoiTitle poi={poi} />
      <div>{displayedInfo}</div>
    </div>
  );
};

export default PoiPopup;
