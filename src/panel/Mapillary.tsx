import React, { useCallback } from 'react';
import ViewerComponent from 'src/panel/MapillaryViewer';
import { CloseButton } from 'src/components/ui';
import { Flex } from '@qwant/qwant-ponents';
import { useStore } from 'src/store';
import { listen, unListen } from 'src/libs/customEvents';

let viewer;
const Mapillary = () => {
  const { isMapillaryViewerOpen, setMapillaryViewerOpen, mapillaryImageId, setMapillaryImageId } =
    useStore();

  const closeMapillary = useCallback(() => {
    setMapillaryViewerOpen(false);
  }, [setMapillaryViewerOpen]);

  const setMapillaryViewer = async poi => {
    setMapillaryImageId(poi['properties']['id']);
    if (!isMapillaryViewerOpen) {
      setMapillaryViewerOpen(true);
    } else {
      viewer.moveTo(mapillaryImageId).catch(error => console.warn(error));
    }
    unListen(mapillaryListener);
  };

  const mapillaryListener = listen('set_mapillary_viewer', setMapillaryViewer);

  return (
    <div>
      {isMapillaryViewerOpen && (
        <div className="photoviewer">
          <Flex alignCenter className="menu-top" between>
            <CloseButton
              circle={false}
              onClick={closeMapillary}
              className="menu-top-close-button"
            />
          </Flex>
          <ViewerComponent imageId={mapillaryImageId} style={{ width: '30%', height: '350px' }} />
        </div>
      )}
    </div>
  );
};

export default Mapillary;
