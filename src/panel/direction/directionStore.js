import React, { useReducer, useEffect } from 'react';
import DirectionApi from 'src/adapters/direction_api';

const initialState = {
  origin: null,
  destination: null,
  vehicle: 'driving',
  isLoading: false,
  routes: [],
  error: 0,
  activeRouteId: 0,
};

export const directionReducer = (state, action) => {
  switch (action.type) {
    case 'setOrigin':
      return { ...state, origin: action.data };
    case 'setDestination':
      return { ...state, destination: action.data };
    case 'reversePoints':
      return { ...state, destination: state.origin, origin: state.destination };
    case 'setVehicle':
      return { ...state, vehicle: action.data };
    case 'updating':
      return { ...state, routes: [], isLoading: true, error: 0, activeRouteId: 0 };
    case 'setRoutes':
      return { ...state, routes: action.data, isLoading: false, error: 0 };
    case 'setError':
      return { ...state, routes: [], isLoading: false, error: action.data };
    case 'setActiveRoute':
      return { ...state, activeRouteId: action.data };
    case 'clearRoutes':
      return { ...state, routes: [], isLoading: false, error: 0 };
    case 'reset':
      return initialState;
    default:
      return state;
  }
};

export const DirectionContext = React.createContext(initialState);

let lastQueryId = 0;

export const DirectionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(directionReducer, initialState);
  const { origin, destination, vehicle } = state;

  useEffect(() => {
    const computeRoutes = async () => {
      dispatch({ type: 'updating' });
      const currentQueryId = ++lastQueryId;
      const directionResponse = await DirectionApi.search(origin, destination, vehicle);
      // A more recent query was done in the meantime, ignore this result silently
      if (currentQueryId !== lastQueryId) {
        return;
      }
      if (directionResponse?.error === 0) {
        // Valid, non-empty response
        const routes = directionResponse.data.routes
          .sort((routeA, routeB) => routeA.duration - routeB.duration)
          .map((route, i) => ({ ...route, id: i }));

        dispatch({ type: 'setRoutes', data: routes });
      } else {
        dispatch({ type: 'setError', data: directionResponse.error });
      }
    };

    if (origin && destination) {
      computeRoutes();
    } else {
      dispatch({ type: 'clearRoutes' });
    }
  }, [origin, destination, vehicle]);

  return (
    <DirectionContext.Provider value={{ state, dispatch }}>{children}</DirectionContext.Provider>
  );
};
