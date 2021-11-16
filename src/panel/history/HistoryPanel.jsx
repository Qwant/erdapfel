/* globals _ */
import React, { useState } from 'react';
import Panel from 'src/components/ui/Panel';
import { Heading, Box, Flex, Switch, Text, Button, IconEmpty } from '@qwant/qwant-ponents';
import {
  setHistoryEnabled,
  getHistoryEnabled,
  listHistoryItemsByDate,
  historyLength,
  deleteQuery,
  deleteSearchHistory,
} from 'src/adapters/search_history';
import PlaceIcon from 'src/components/PlaceIcon';

const HistoryPanel = () => {
  const [isChecked, setIsChecked] = useState(getHistoryEnabled());
  const now = new Date();
  const lastMidnight = new Date().setUTCHours(0, 0, 0, 0);
  const lastWeek = new Date().setUTCDate(-7);
  const last2Weeks = new Date().setUTCDate(-14);
  const last3Weeks = new Date().setUTCDate(-21);
  const todayHistoryItems = listHistoryItemsByDate(lastMidnight, now);
  const lastWeekHistoryItems = listHistoryItemsByDate(lastWeek, lastMidnight);
  const last2WeeksHistoryItems = listHistoryItemsByDate(last2Weeks, lastWeek);
  const last3WeeksHistoryItems = listHistoryItemsByDate(last3Weeks, last2Weeks);
  const olderHistoryItems = listHistoryItemsByDate(0, last3Weeks);
  const close = () => {
    window.app.navigateTo('/');
  };

  const onChange = e => {
    setIsChecked(e.target.checked);
    setHistoryEnabled(e.target.checked);
  };

  const visit = item => {
    // PoI
    if (item.type === 'poi') {
      window.app.navigateTo(`/place/${item.item.id}`);
    }
    // Intention
    else if (item.type === 'intention') {
      window.app.navigateTo(
        `/places/?type=${item.item.category.name}&bbox=${item.item.bbox.join(',')}`
      );
    }
  };

  // TEMPORARY: fill history with items (poi, address, city, intention) from different dates (< 24h, < 1 week, < 2 weeks, < 3 weeks, older)
  // prettier-ignore
  const demo = () => {
    localStorage.qmaps_v1_search_history_v1 = `[{"type":"poi","date":${
      new Date().setUTCHours(9,0,0,0)
    },"item":{"id":"admin:osm:relation:170100","name":"Nice (06000-06300)","type":"zone","latLon":{"lat":43.7009358,"lng":7.2683912},"className":"","subClassName":"","bbox":[7.1819535,43.6454189,7.323912,43.7607635],"value":"Nice (06000-06300), Alpes-Maritimes, France","queryContext":{"term":"nice","ranking":1,"lang":"fr","position":{"lat":"43.700","lon":"7.300","zoom":"10.000"}},"address":{"stateDistrict":"Alpes-Maritimes","country":"France"}}},{"type":"poi","date":${
      new Date().setUTCDate(-4)
    },"item":{"id":"admin:osm:relation:120965","name":"Lyon","type":"zone","latLon":{"lat":45.7578137,"lng":4.8320114},"className":"","subClassName":"","bbox":[4.7718134,45.7073666,4.8983774,45.8082628],"value":"Lyon, Métropole de Lyon, Auvergne-Rhône-Alpes, France","queryContext":{"term":"lyon","ranking":1,"lang":"fr","position":{"lat":"43.700","lon":"7.300","zoom":"10.000"}},"address":{"stateDistrict":"Métropole de Lyon","state":"Auvergne-Rhône-Alpes","country":"France"}}},{"type":"poi","date":${
      new Date().setUTCDate(-9)
    },"item":{"id":"admin:osm:relation:7444","name":"Paris (75000-75116)","type":"zone","latLon":{"lat":48.8566969,"lng":2.3514616},"className":"","subClassName":"","bbox":[2.224122,48.8155755,2.4697602,48.902156],"value":"Paris (75000-75116), Île-de-France, France","queryContext":{"term":"paris","ranking":1,"lang":"fr","position":{"lat":"45.800","lon":"4.800","zoom":"10.000"}},"address":{"stateDistrict":"Paris","state":"Île-de-France","country":"France"}}},{"type":"poi","date":${
      new Date().setUTCDate(-14)
    },"item":{"id":"admin:osm:relation:54517","name":"Rennes (35000-35700)","type":"zone","latLon":{"lat":48.1113387,"lng":-1.6800198},"className":"","subClassName":"","bbox":[-1.7525876,48.0769155,-1.6244045,48.1549705],"value":"Rennes (35000-35700), Ille-et-Vilaine, Bretagne, France","queryContext":{"term":"Rennes","ranking":1,"lang":"fr","position":{"lat":"48.900","lon":"2.300","zoom":"11.000"}},"address":{"stateDistrict":"Ille-et-Vilaine","state":"Bretagne","country":"France"}}},{"type":"poi","date":${
      new Date().setUTCDate(-18)
    },"item":{"id":"addr:6.989375;43.700095:300","name":"300 Avenue Amiral de Grasse","type":"house","latLon":{"lat":43.700095,"lng":6.989375},"className":"","subClassName":"","value":"300 Avenue Amiral de Grasse (Le Bar-sur-Loup)","queryContext":{"term":"300 av amira","ranking":1,"lang":"fr","position":{"lat":"48.100","lon":"-1.700","zoom":"12.000"}},"address":{"street":"300 Avenue Amiral de Grasse","city":"Le Bar-sur-Loup","stateDistrict":"Alpes-Maritimes","state":"Provence-Alpes-Côte d'Azur","country":"France"}}},{"type":"poi","date":${
      new Date().setUTCDate(-30)
    },"item":{"id":"osm:way:5013364","name":"Tour Eiffel","type":"poi","latLon":{"lat":48.858260156496016,"lng":2.2944990157640612},"className":"attraction","subClassName":"attraction","value":"Tour Eiffel (Paris)","queryContext":{"term":"tour eiffel","ranking":1,"lang":"fr","position":{"lat":"43.700","lon":"7.000","zoom":"17.000"}},"address":{"street":"5 Avenue Anatole France","suburb":"Quartier du Gros-Caillou","cityDistrict":"Paris 7e Arrondissement","city":"Paris","stateDistrict":"Paris","state":"Île-de-France","country":"France","label":"5 Avenue Anatole France (Paris)"}}},
    {"type":"intention","date":1636550261818,"item":{"filter":{"bbox":[7.1819535,43.6454189,7.323912,43.7607635],"category":"restaurant"},"category":{"name":"restaurant","label":"restaurant","iconName":"restaurant","color":"#d76600","matcher":{"regex":"restos?|restaus?|ma?cs?do(?:nald(?:'s)?)?|burgers+king|quick|subway|flunch|hards+rocks+cafe|kfc|pizza|brioches+doree|fives+guys|mezzos+dis+pasta|pommes+des+pain|prets+as+manger|vapiano|starbucks|bigs+fernand|sushi|memphiss+coffee|buffalos+grill|las+boucherie|hippopotamus|leon|pataterie|pizzeria|brasserie|fasts+food|restaurations+rapide|snack|creperie|kebab|sandwicherie|ils+ristorante|le kiosque a pizzas|buffalo grill|campanile|courtepaille|burger king|la pataterie|pizza hut|au bureau|poivre rouge|la croissanterie|tutti pizza|la boite a pizza|la brioche doree|leon de bruxelles|bagelstein|columbus cafe|memphis coffee|del arte|class'croute|o'tacos|sushi shop|mezzo di pasta|pomme de pain|big fernand|pizza sprint|bistro regent|l'epicurien|tablapizza|speed burger|pat a pain|pizza bonici|firmin|l'atelier gourmand|pizza time|a la bonne heure|francesca|planet sushi|speed rabbit pizza|pegast|pizza pai|best western|crep'eat|baila pizza|waffle factory|casino cafeteria|la pizza de nico|crocodile|fresh burritos|231 east street|bagel corner|coeur de ble|dubble|eat sushi|fuxia|il ristorante|les fils a maman|nooi|pitaya|jour|les burgers de papa|bchef|chez papa|cojean|le fournil de pierre|oceane|terre et mer|bistro romain|el rancho|l'alambic|le patacrepe|pizza city|cote sushi|la maison bleue|le club sandwich cafe|les 3 brasseurs|bellota-bellota|bistrot du boucher|la tagliatella|nostrum|pizza pino|point chaud|tacos avenue|exki|garden ice cafe|green is better|le paradis du fruit|les relais d'alsace|ma campagne|mamie bigoude|pasta pizza|pizza cosy|planetalis|salad&co|tommy's diner|yogurt factory|cafe leffe|dominos pizza|indiana cafe|le comptoir du malt|lina's|mythic burger|nikki sushi|alto cafe|ankka|burger bar by quick|carre bleu|esprit sushi|feel juice|five guys"},"alternativeName":"catégorie","type":"category","id":"category:restaurant"},"bbox":[7.1819535,43.6454189,7.323912,43.7607635],"place":{"type":"Feature","geometry":{"coordinates":[7.2683912,43.7009358],"type":"Point"},"properties":{"geocoding":{"type":"zone","label":"Nice (06000-06300), Alpes-Maritimes, France","name":"Nice","postcode":"06000;06100;06200;06300","city":null,"id":"admin:osm:relation:170100","zone_type":"city","citycode":"6088","level":8,"administrative_regions":[{"id":"admin:osm:relation:7385","insee":"6","level":6,"label":"Alpes-Maritimes, France","name":"Alpes-Maritimes","zip_codes":[],"coord":{"lon":7.2683912,"lat":43.7009358},"bbox":[6.6352025999999995,43.4800526,7.7184776,44.3625081],"zone_type":"state_district","parent_id":"admin:osm:relation:2202162","codes":[{"name":"ISO3166-2","value":"FR-06"},{"name":"ref:INSEE","value":"06"},{"name":"ref:nuts","value":"FRL03"},{"name":"ref:nuts:3","value":"FRL03"},{"name":"wikidata","value":"Q3139"}]},{"id":"admin:osm:relation:2202162","insee":"","level":2,"label":"France","name":"France","zip_codes":[],"coord":{"lon":2.3514616,"lat":48.8566969},"bbox":[-5.4517733,41.261115499999995,9.8282225,51.3055721],"zone_type":"country","parent_id":null,"codes":[{"name":"ISO3166-1","value":"FR"},{"name":"ISO3166-1:alpha2","value":"FR"},{"name":"ISO3166-1:alpha3","value":"FRA"},{"name":"ISO3166-1:numeric","value":"250"},{"name":"wikidata","value":"Q142"}]}],"codes":[{"name":"ref:FR:SIREN","value":"210600888"},{"name":"ref:INSEE","value":"06088"},{"name":"wikidata","value":"Q33959"}],"bbox":[7.1819535,43.6454189,7.323912,43.7607635]}}}}}]`;

    // eslint-disable-next-line no-self-assign
    location = location;
  };

  const showItem = item => {
    return item.type === 'poi' ? (
      // poi / city / address
      <Flex key={item.item.id} className="history-list-item">
        <Box
          onClick={() => {
            visit(item);
          }}
        >
          <PlaceIcon className="autocomplete_suggestion_icon" place={item.item} withBackground />
        </Box>
        <Flex
          takeAvailableSpace
          column
          onClick={() => {
            visit(item);
          }}
        >
          <Box>
            <Text typo="body-1" color="primary">
              {item.item.name}
            </Text>
          </Box>
          <Box>
            <Text typo="body-2" color="secondary">
              {item.item?.address?.label ||
                item.item?.address?.city ||
                item.item?.address?.stateDistrict ||
                item.item?.address?.state ||
                item.item?.address?.country ||
                ''}
            </Text>
          </Box>
        </Flex>
        <Text color="primary">
          <IconEmpty onClick={() => deleteQuery(item)} />
        </Text>
      </Flex>
    ) : (
      // intention
      <Flex key={item.item.category.id} className="history-list-item">
        <Box
          onClick={() => {
            visit(item);
          }}
        >
          <PlaceIcon
            className="autocomplete_suggestion_icon"
            category={item.item.category}
            withBackground
          />
        </Box>
        <Flex
          takeAvailableSpace
          column
          onClick={() => {
            visit(item);
          }}
        >
          <Box>
            <Text typo="body-1" color="primary">
              {item.item.category.name}
            </Text>
          </Box>
          <Box>
            <Text typo="body-2" color="secondary">
              {item.item.place.properties.geocoding.name}
            </Text>
          </Box>
        </Flex>
        <Text color="primary">
          <IconEmpty onClick={() => deleteQuery(item)} />
        </Text>
      </Flex>
    );
  };

  return (
    <Panel
      resizable
      renderHeader={
        <div className="history-header u-text--smallTitle u-center">
          {_('My history', 'history panel')}
        </div>
      }
      minimizedTitle={_('Show history', 'history panel')}
      onClose={close}
      className="history_panel"
    >
      <Flex>
        <Text>
          {isChecked
            ? _(
                'Your history is enabled. It is only visible to you on this device.',
                'history panel'
              )
            : _(
                'Your history is disabled. If you enable it, it will only be visible to you on this device.',
                'history panel'
              )}
          &nbsp;
        </Text>
        <Switch
          name="history_enabled"
          id="history_enabled"
          checked={isChecked}
          onChange={onChange}
        />
      </Flex>
      <Flex className="history_panel_links">
        <a href="#">{_('Learn more')}</a>
        {isChecked && historyLength() > 0 && (
          <a onClick={deleteSearchHistory}>{_('Delete my history')}</a>
        )}
        {isChecked && <Button onClick={demo}>DEMO</Button>}
      </Flex>
      {isChecked && (
        <Box mt="xl">
          {todayHistoryItems.length > 0 && (
            <Box className="history-list">
              <Heading typo="heading-6">{_('Today', 'history panel')}</Heading>
              <Box>{todayHistoryItems.map(showItem)}</Box>
            </Box>
          )}
          {lastWeekHistoryItems.length > 0 && (
            <Box className="history-list">
              <Heading typo="heading-6">{_('Last week', 'history panel')}</Heading>
              <Box>{lastWeekHistoryItems.map(showItem)}</Box>
            </Box>
          )}
          {last2WeeksHistoryItems.length > 0 && (
            <Box className="history-list">
              <Heading typo="heading-6">{_('Last 2 weeks', 'history panel')}</Heading>
              <Box>{last2WeeksHistoryItems.map(showItem)}</Box>
            </Box>
          )}
          {last3WeeksHistoryItems.length > 0 && (
            <Box className="history-list">
              <Heading typo="heading-6">{_('Last 3 weeks', 'history panel')}</Heading>
              <Box>{last3WeeksHistoryItems.map(showItem)}</Box>
            </Box>
          )}
          {olderHistoryItems.length > 0 && (
            <Box className="history-list">
              <Heading typo="heading-6">{_('Older', 'history panel')}</Heading>
              <Box>{olderHistoryItems.map(showItem)}</Box>
            </Box>
          )}
          {historyLength() === 0 && (
            <Text>{_('As soon as you do a search, you can find it here 👇', 'history panel')}</Text>
          )}
        </Box>
      )}
    </Panel>
  );
};

export default HistoryPanel;
