import { useContext, useEffect } from 'react';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { DirectionContext } from './directionStore';

const DirectionMap = () => {
  const { state, setPoint } = useContext(DirectionContext);
  const { origin, destination, vehicle, routes, activeRouteId } = state;

  useEffect(() => {
    if (origin) {
      window.execOnMapLoaded(() => {
        fire('set_origin', origin);
        // @TODO: on init
        // if (!destination) {
        //   fire('fit_map', origin);
        // }
      });
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      window.execOnMapLoaded(() => {
        fire('set_destination', destination);
        // if (!destination) {
        //   fire('fit_map', origin);
        // }
      });
    }
  }, [destination]);

  useEffect(() => {
    const dragPointHandler = listen('change_direction_point', setPoint);
    const setPointHandler = listen('set_direction_point', point => {
      if (origin && destination) {
        return;
      }
      // if one point is already filled, fill the other
      setPoint({ type: origin ? 'destination' : 'origin', data: point });
    });

    return () => {
      unListen(dragPointHandler);
      unListen(setPointHandler);
      fire('clean_routes');
      fire('update_map_paddings');
    };
  }, [origin, destination, setPoint]);

  useEffect(() => {
    window.execOnMapLoaded(() => {
      fire('set_routes', {
        routes,
        vehicle,
        activeRouteId,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes /* Omit activeRouteId and vehicle to prevent costly redraws */]);

  useEffect(() => {
    fire('set_main_route', { routeId: activeRouteId, fitView: true });
  }, [activeRouteId]);

  return null;
};

export default DirectionMap;
