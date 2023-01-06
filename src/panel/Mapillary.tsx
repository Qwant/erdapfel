import React, { useCallback } from 'react';
import ViewerComponent from 'src/panel/MapillaryViewer';
import { CloseButton } from 'src/components/ui';
import { Flex } from '@qwant/qwant-ponents';
import { useStore } from 'src/store';
import { listen } from 'src/libs/customEvents';

const Mapillary: React.FunctionComponent = () => {
  const { isMapillaryViewerOpen, setMapillaryViewerOpen } = useStore();

  const closeMapillary = useCallback(() => {
    setMapillaryViewerOpen(false);
  }, [setMapillaryViewerOpen]);

  const setMapillaryViewer = poi => {
    poi;
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
            imageId="498763468214164"
            style={{ width: '30%', height: '350px' }}
          />
        </div>
      )}
    </div>
  );
};

export default Mapillary;
