import { PoiHourBlockProps } from './';

export const poiHourBlockMock: PoiHourBlockProps = {
  schedule: {
    isTwentyFourSeven: false,
    days: [
      {
        dayofweek: 1,
        local_date: '2022-06-20',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 2,
        local_date: '2022-06-21',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 3,
        local_date: '2022-06-22',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 4,
        local_date: '2022-06-23',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 5,
        local_date: '2022-06-24',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 6,
        local_date: '2022-06-25',
        status: 'open',
        opening_hours: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayofweek: 7,
        local_date: '2022-06-26',
        status: 'open',
        opening_hours: [
          {
            beginning: '09:00',
            end: '12:30',
          },
        ],
      },
    ],
    displayHours: [
      {
        dayName: 'lundi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'mardi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'mercredi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'jeudi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'vendredi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'samedi',
        opening: [
          {
            beginning: '08:30',
            end: '20:00',
          },
        ],
      },
      {
        dayName: 'dimanche',
        opening: [
          {
            beginning: '09:00',
            end: '12:30',
          },
        ],
      },
    ],
    nextTransition: '20:00',
    status: 'open',
  },
  texts: {
    opening_hours: "Horaires d'ouverture",
    open: 'Ouvert',
    closed: 'Fermé',
    open_24_7: 'Ouvert 24h/24 et 7j/7',
    reopening: 'réouverture à {nextTransitionTime}',
    until: "jusqu'à {nextTransitionTime}",
  },
};
