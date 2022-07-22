import React from 'react';

const DefaultLegLine = ({ mode, info }) => {
  if (mode === 'WALK') {
    return <div className="itinerary_roadmap_line itinerary_roadmap_line--walk" />;
  }
  return (
    <div
      className="itinerary_roadmap_line itinerary_roadmap_line--transportLine"
      style={{ backgroundColor: info.lineColor ? `#${info.lineColor}` : 'black' }}
    />
  );
};

export default DefaultLegLine;
