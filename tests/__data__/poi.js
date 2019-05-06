module.exports = {
    "id": "osm:way:63178753",
    "meta": {
        "source": "osm"
    },
    "name": "Musée d'Orsay",
    "local_name": "Musée d'Orsay",
    "class_name": "museum",
    "subclass_name": "museum",
    "type" : "poi",
    "geometry": {
        "coordinates": [2.3265827716099623, 48.859917803575875],
        "type": "Point"
    },
    "address": {
        "label": "1 Rue de la Légion d'Honneur (Paris)"
    },
    "blocks": [{
        "type": "opening_hours",
        "status": "closed",
        "next_transition_datetime": "2018-08-28T09:30:00+02:00",
        "seconds_before_next_transition": 58874,
        "is_24_7": false,
        "raw": "Tu-Su 09:30-18:00; Th 09:30-21:45",
        "days": [{
            "dayofweek": 1,
            "local_date": "2018-08-27",
            "status": "closed",
            "opening_hours": []
        }, {
            "dayofweek": 2,
            "local_date": "2018-08-28",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "18:00"
            }]
        }, {
            "dayofweek": 3,
            "local_date": "2018-08-29",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "18:00"
            }]
        }, {
            "dayofweek": 4,
            "local_date": "2018-08-30",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "21:45"
            }]
        }, {
            "dayofweek": 5,
            "local_date": "2018-08-31",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "18:00"
            }]
        }, {
            "dayofweek": 6,
            "local_date": "2018-09-01",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "18:00"
            }]
        }, {
            "dayofweek": 7,
            "local_date": "2018-09-02",
            "status": "open",
            "opening_hours": [{
                "beginning": "09:30",
                "end": "18:00"
            }]
        }]
    }, {
        "type": "phone",
        "url": "tel:+33140494814",
        "international_format": "+33140494814",
        "local_format": "+33140494814"
    }, {
        "type": "information",
        "blocks": [{
            "type": "wikipedia",
            "url": "https://fr.wikipedia.org/wiki/Musée_d'Orsay",
            "title": "Musée d'Orsay",
            "description": "Le musée d’Orsay est un musée national inauguré en 1986, situé dans le 7e arrondissement de Paris le long de la rive gauche de la Seine. Il est installé dans l’ancienne gare d'Orsay, construite par Victor Laloux de 1898 à 1900 et réaménagée en musée sur décision du Président de la République Valéry Giscard d'Estaing. Ses collections présentent l’art occidental de 1848 à 1914, dans toute sa diversité : peinture, sculpture, arts décoratifs, art graphique, photographie, architecture, etc. Il est l’un des plus grands musées d’Europe."
        }, {
            "type": "services_and_information",
            "blocks": [{
                "type": "accessibility",
                "wheelchair": "yes",
                "toilets_wheelchair": "unknown"
            }]
        }]
    }, {
        "type": "website",
        "url": "http://www.musee-orsay.fr"
    }, {
      "type": "contact",
      "url": "mailto:admin@orsay.fr"
    }]
}
