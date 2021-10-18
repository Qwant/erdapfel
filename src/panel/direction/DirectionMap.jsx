import { useContext, useEffect } from 'react';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { DirectionContext } from './directionStore';

const DirectionMap = () => {
  const { state, dispatch } = useContext(DirectionContext);
  const { origin, destination, vehicle, routes, activeRouteId } = state;

  useEffect(() => {
    const dragPointHandler = listen('change_direction_point', (which, point) => {
      dispatch({ type: which === 'origin' ? 'setOrigin' : 'setDestination', data: point });
    });

    const setPointHandler = listen('set_direction_point', point => {
      if (origin && destination) {
        return;
      }
      dispatch({ type: origin ? 'setDestination' : 'setOrigin', data: point });
    });

    return () => {
      unListen(dragPointHandler);
      unListen(setPointHandler);
      fire('clean_routes');
      fire('update_map_paddings');
    };
  }, [origin, destination, dispatch]);

  useEffect(() => {
    // @TODO: on map ready
    fire('set_routes', {
      routes,
      vehicle,
      activeRouteId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routes /* Omit activeRouteId and vehicle to prevent costly redraws */]);

  useEffect(() => {
    fire('set_main_route', { routeId: activeRouteId, fitView: true });
  }, [activeRouteId]);

  return null;
};

export default DirectionMap;
