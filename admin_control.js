class AdminControl {

    constructor() {

        this._container = document.createElement('div')

        this._lte = this._createButton('mapboxgl-ctrl-icon', 'lte', () => this._switchTo('qwant_style_lite.json'))
        this._lte.innerText = 'lte'

        this._bsc = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-icon--active', 'bsc', () => this._switchTo('qwant_style.json'))
        this._bsc.innerText = 'bsc'

    }

    onAdd(map) {
        this._map = map;
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.textContent = '';

        this._container.appendChild(this._lte)
        this._container.appendChild(this._bsc)

        return this._container
    }

    onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    }

    _createButton(className        , ariaLabel        , fn             ) {
        const a = document.createElement('button');
        a.setAttribute('class', className)
        a.setAttribute('aria-label', ariaLabel);
        a.addEventListener('click', fn);
        this._container.appendChild(a)
        return a;
    }

    _switchTo(to) {
        if(to === 'qwant_style.json') {
            this._bsc.classList.add('mapboxgl-ctrl-icon--active')
            this._lte.classList.remove('mapboxgl-ctrl-icon--active')
        } else {
            this._lte.classList.add('mapboxgl-ctrl-icon--active')
            this._bsc.classList.remove('mapboxgl-ctrl-icon--active')
        }
        this._map.setStyle(to);
    }
}