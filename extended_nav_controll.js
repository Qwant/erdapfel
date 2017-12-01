class ExtendedControl {

    constructor() {


        this._container = document.createElement('div')



        this._zoomInButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in', 'Zoom In', () => this._map.zoomIn());
        this._zoomOutButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-out', 'Zoom Out', () => this._map.zoomOut());



        this._compass = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-compass', 'Reset North', () => {this._resetNorthAndTilt()})

        this._compassArrow = document.createElement('span')
        this._compassArrow.setAttribute('class', 'mapboxgl-ctrl-compass-arrow')



        this._compass.appendChild(this._compassArrow)

    }

    onAdd(map) {
        this._map = map;
        this._container = document.createElement('div');
        this._container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
        this._container.textContent = '';
        this._container.appendChild(this._compass)
        this._container.appendChild(this._zoomInButton)
        this._container.appendChild(this._zoomOutButton)
        const aaa = this._pitchAndRotateCompassArrow.bind(this)

        aaa()

        this._map.on('rotate', aaa);
        this._map.on('pitch', aaa);

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

    _resetNorthAndTilt() {
        this._map.easeTo({pitch:16,bearing:0})
    }



    _pitchAndRotateCompassArrow() {
        const pitchAndRotate = `scale(1, ${(1-this._map.getPitch()/110)}) rotate(${this._map.transform.angle * (180 / Math.PI)}deg)`;
        this._compassArrow.style.transform = pitchAndRotate;
    }


}


/*

class NavigationControl {


    constructor() {
        util.bindAll([
            '_rotateCompassArrow'
        ], this);

        this._container = DOM.create('div', 'mapboxgl-ctrl mapboxgl-ctrl-group');
        this._container.addEventListener('contextmenu', (e) => e.preventDefault());

        this._zoomInButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-in', 'Zoom In', () => this._map.zoomIn());
        this._zoomOutButton = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-zoom-out', 'Zoom Out', () => this._map.zoomOut());
        this._compass = this._createButton('mapboxgl-ctrl-icon mapboxgl-ctrl-compass', 'Reset North', () => this._map.resetNorth());
        this._compassArrow = DOM.create('span', 'mapboxgl-ctrl-compass-arrow', this._compass);
    }

    _rotateCompassArrow() {
        const rotate = `rotate(${this._map.transform.angle * (180 / Math.PI)}deg)`;
        this._compassArrow.style.transform = rotate;
    }

    onAdd(map     ) {
        this._map = map;
        this._map.on('rotate', this._rotateCompassArrow);
        this._rotateCompassArrow();
        this._handler = new DragRotateHandler(map, {button: 'left', element: this._compass, pitchWithRotate: false});
        this._handler.enable();
        return this._container;
    }

    onRemove() {
        DOM.remove(this._container);
        this._map.off('rotate', this._rotateCompassArrow);
        delete this._map;

        this._handler.disable();
        delete this._handler;
    }

    _createButton(className        , ariaLabel        , fn             ) {
        const a = DOM.create('button', className, this._container);
        a.type = 'button';
        a.setAttribute('aria-label', ariaLabel);
        a.addEventListener('click', fn);
        return a;
    }
}

module.exports = NavigationControl;
*/