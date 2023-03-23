/* global _ */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash.debounce';

import PoiItemList from './PoiItemList';
import PoiItemListPlaceholder from './PoiItemListPlaceholder';
import CategoryPanelError from './CategoryPanelError';
import Telemetry from 'src/libs/telemetry';
import { useConfig, useDevice, usePageTitle } from 'src/hooks';
import IdunnPoi from 'src/adapters/poi/idunn_poi';
import { getVisibleBbox } from 'src/panel/layouts';
import { fire, listen, unListen } from 'src/libs/customEvents';
import { boundsFromFlatArray, parseBboxString, boundsToString } from 'src/libs/bounds';
import classnames from 'classnames';
import { sources } from 'config/constants.yml';
import { BackToQwantButton } from 'src/components/BackToQwantButton';
import { shouldShowBackToQwant } from 'src/libs/url_utils';
import { Panel, PanelNav, SourceFooter, UserFeedbackYesNo } from 'src/components/ui';
import { getListDescription } from 'src/libs/poiList';
import { saveQuery, getHistoryEnabled } from 'src/adapters/search_history';

import { isEcoResponsibleCategory } from 'src/libs/eco-responsible';
import TopPanelMention from '../TopPanelMention';
const DEBOUNCE_WAIT = 100;

function fitMap(bbox) {
  if (bbox) {
    try {
      fire('fit_map', parseBboxString(bbox));
      return;
    } catch (e) {
      console.error(e);
    }
  }

  const mapboxMap = window.map.mb;

  if (mapboxMap.isMoving && mapboxMap.isMoving()) {
    // Do not trigger API search and zoom change
    // when the map is already moving, to avoid flickering.
    // The search will be triggered on moveend.
    return;
  }

  // Apply correct zoom when opening a category
  const currentZoom = mapboxMap.getZoom();

  // Zoom < 5: focus on Paris
  if (currentZoom < 5) {
    mapboxMap.flyTo({ center: [2.35, 48.85], zoom: 12 });
  } else if (currentZoom < 12) {
    // Zoom < 12: zoom up to zoom 12
    mapboxMap.flyTo({ zoom: 12 });
  } else if (currentZoom > 18) {
    // Zoom > 18: dezoom to zoom 18
    mapboxMap.flyTo({ zoom: 18 });
  } else {
    // setting the same view still triggers the moveend event
    mapboxMap.jumpTo({ zoom: currentZoom, center: mapboxMap.getCenter() });
  }
}

const CategoryPanel = ({ poiFilters = {}, bbox }) => {
  const [pois, setPois] = useState([]);
  const [dataSource, setDataSource] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const { isMobile } = useDevice();
  const { maxPlaces } = useConfig('category');
  const searchHistoryEnabled = getHistoryEnabled();
  const isEcoResponsible = isEcoResponsibleCategory(poiFilters.category);

  usePageTitle(getListDescription(poiFilters.category, poiFilters.query));

  const comparableFilters = JSON.stringify(poiFilters);

  useEffect(() => {
    const fetchData = debounce(
      async () => {
        const { category, query, place_name, place_code } = poiFilters;
        const currentBounds = getVisibleBbox(window.map.mb);

        const extendBbox = initialLoading;
        const {
          places,
          source,
          bbox: contentBbox,
          bbox_extended,
        } = await IdunnPoi.poiCategoryLoad(
          boundsToString(currentBounds),
          maxPlaces,
          category,
          query,
          place_name,
          place_code,
          extendBbox
        );

        setPois(places);
        setDataSource(source);
        if (initialLoading === true) {
          if (poiFilters.category) {
            Telemetry.add(Telemetry.POI_CATEGORY_OPEN, {
              category: poiFilters.category,
              source,
            });
          }
        }
        setInitialLoading(false);

        if (bbox_extended && contentBbox) {
          // The returned bbox is sure to contain at least one POI.
          // Extend the current one to include it.
          fire('fit_map', currentBounds.extend(boundsFromFlatArray(contentBbox)), true);
        }

        fire('add_category_markers', places, poiFilters);
        fire('save_location');
      },
      DEBOUNCE_WAIT,
      { leading: true }
    );

    const mapMoveHandler = listen('map_moveend', fetchData);
    return () => {
      unListen(mapMoveHandler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comparableFilters, initialLoading, maxPlaces]);

  useEffect(() => {
    window.execOnMapLoaded(() => {
      fitMap(bbox);
    });
  }, [bbox, comparableFilters]);

  useEffect(() => {
    setInitialLoading(true);
  }, [comparableFilters]);

  const selectPoi = poi => {
    if (poi && searchHistoryEnabled) {
      saveQuery(poi);
    }
    fire('click_category_poi', { poi, poiFilters, pois });
  };

  const highlightPoiMarker = (poi, highlight) => {
    fire('highlight_category_marker', poi, highlight);
  };

  const DataSource = ({ source }) => {
    switch (source) {
      case sources.pagesjaunes:
        return _('Results in partnership with PagesJaunes', 'categories');
      case sources.tripadvisor:
        return _('Results in partnership with TripAdvisor', 'categories');
      case sources.vrac:
        return _('Selected in patnership with ReseauVrac', 'categories');
      case sources.circuitscourts:
        return _('Selected in patnership with INRAE', 'categories');
      case sources.ecotables:
        // TODO: Add mention for opening/closing hour from PagesJaunes
        return null;
      // return (
      //   <>
      //     <Flex fullWidth alignCenter center={isMobile}>
      //       <span>{_('Selected in patnership with Écotables')}</span>
      //       <Image
      //         className="category__panel__sourceImage"
      //         src="./statics/images/logo_ET.png"
      //         width={75}
      //         height={15}
      //       />
      //     </Flex>
      //     <Flex wrap>
      //       <span>
      //         {_('Ecotable source details')}
      //         <a
      //           className="category__panel__sourceLink"
      //           target="_blank"
      //           href={_('Ecotable source see more link')}
      //           rel="noreferrer"
      //         >
      //           {_('Ecotable source see more')}
      //         </a>
      //       </span>
      //     </Flex>
      //   </>
      // );
      default:
        return null;
    }
  };

  let panelContent;

  if (initialLoading) {
    panelContent = <PoiItemListPlaceholder />;
  } else if (!pois || pois.length === 0) {
    panelContent = <CategoryPanelError zoomIn={!pois} />;
  } else {
    panelContent = (
      <>
        <TopPanelMention
          image="./statics/images/source-ecotables.png"
          text={_('Ecotable source details')}
          link={{
            text: _('Ecotable source see more'),
            href: _('Ecotable source see more link'),
          }}
        />
        <PoiItemList
          pois={pois}
          selectPoi={selectPoi}
          highlightMarker={highlightPoiMarker}
          source={dataSource}
          isEcoResponsible={isEcoResponsible}
        />
        <UserFeedbackYesNo
          questionId="poi-list"
          context={document.location.href}
          question={_('Satisfied with the results?')}
        />
        {dataSource !== sources.osm && DataSource({ source: dataSource }) && (
          <SourceFooter>
            <DataSource source={dataSource} />
          </SourceFooter>
        )}
      </>
    );
  }

  const NavHeader = () => {
    if (isMobile || !shouldShowBackToQwant()) {
      return null;
    }

    return (
      <PanelNav>
        <BackToQwantButton />
      </PanelNav>
    );
  };

  return (
    <Panel
      resizable
      renderHeader={<NavHeader isMobile={isMobile} />}
      minimizedTitle={_('Unfold to show the results', 'categories')}
      className={classnames('category__panel', {
        'panel--pj': dataSource === sources.pagesjaunes,
        'panel--ta': dataSource === sources.tripadvisor,
      })}
      floatingItemsLeft={[
        isMobile && shouldShowBackToQwant() && <BackToQwantButton key="back-to-qwant" isMobile />,
      ]}
      fitContent={!pois || pois.length === 0 ? ['default'] : []}
    >
      {panelContent}
    </Panel>
  );
};

CategoryPanel.propTypes = {
  poiFilters: PropTypes.object,
  bbox: PropTypes.string,
};

export default CategoryPanel;
