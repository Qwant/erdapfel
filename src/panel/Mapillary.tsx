import React, { useCallback } from 'react';
import ViewerComponent from 'src/panel/MapillaryViewer';
import { CloseButton } from 'src/components/ui';
import { Flex } from '@qwant/qwant-ponents';
import { useStore } from 'src/store';
import { fire, listen } from 'src/libs/customEvents';

const Mapillary = () => {
  const apiUrl = 'https://graph.mapillary.com/';
  const accessToken = 'MLY|4100327730013843|5bb78b81720791946a9a7b956c57b7cf';
  const { isMapillaryViewerOpen, setMapillaryViewerOpen, mapillaryImageId, setMapillaryImageId } =
    useStore();

  const closeMapillary = useCallback(() => {
    setMapillaryViewerOpen(false);
  }, [setMapillaryViewerOpen]);

  const setMapillaryViewer = poi => {
    fetch(`${apiUrl} ${poi['properties']['id']}?access_token=${accessToken}`)
      .then(response => response.json())
      .then(response => {
        fire('create_mapillary_marker', response['geometry']['coordinates']);
      });
    setMapillaryImageId(poi['properties']['id']);
    setMapillaryViewerOpen(true);
  };

  // todo unlisten this at component unmount
  listen('set_mapillary_viewer', setMapillaryViewer);

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
          <ViewerComponent
            accessToken="MLY|8504091992994072|0e834b87a0c522b09b7c5fefa868c054"
            imageId={mapillaryImageId}
            style={{ width: '30%', height: '350px' }}
          />
        </div>
      )}
    </div>
  );
};

export default Mapillary;
