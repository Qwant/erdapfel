import React, { useCallback } from 'react';
import ViewerComponent from 'src/panel/MapillaryViewer';
import { CloseButton } from 'src/components/ui';
import { Flex } from '@qwant/qwant-ponents';
import { useStore } from 'src/store';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { Viewer } from 'mapillary-js';

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

  function init(opts) {
    const { accessToken, container } = opts;
    const viewerOptions = {
      accessToken,
      component: {
        cover: false,
      },
      container,
    };
    viewer = new Viewer(viewerOptions);
    viewer.moveTo(mapillaryImageId).catch(error => console.warn(error));
    const onPov = async () => {
      const pov = await viewer.getPointOfView();
      fire('change_camera_orientation', pov);
    };
    const onPosition = async () => {
      const position = await viewer.getPosition();
      const pos = [position.lng, position.lat];
      fire('create_mapillary_marker', pos);
    };
    viewer.on('position', onPosition);
    viewer.on('pov', onPov);
  }

  function dispose() {
    if (viewer) {
      viewer.remove();
    }
  }

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
            init={init}
            dispose={dispose}
            style={{ width: '30%', height: '350px' }}
          />
        </div>
      )}
    </div>
  );
};

export default Mapillary;
