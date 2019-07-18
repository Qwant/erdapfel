import PanelResizerActionsView from '../views/panel_resizer_actions.dot';

const REDUCED_PANEL_CLASS = 'reduced';
const MAXIMIZED_PANEL_CLASS = 'full';

function getClosest(arr, goal) {
  return arr.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
}

export default class PanelResizer {
  constructor(panel) {
    this.panel = panel;
    this.timer = null;
    this.holding = false;
    this.isTransitioning = false;
    this.reduced = false;
    this.maximized = false;

    this.moveCallback = e => this.move(e);
  }

  get RESIZABLE_PANEL_CLASS() {
    return 'resizable_panel';
  }

  get HANDLE_CLASS() {
    return 'resizable_panel_handle';
  }

  get resizableElement() {
    return document.querySelector(`[data-cid="${this.panel.cid}"] .${this.RESIZABLE_PANEL_CLASS}`);
  }

  get handleElement() {
    return document.querySelector(`[data-cid="${this.panel.cid}"] .${this.HANDLE_CLASS}`);
  }

  /**
   * Triggered on mouse down of the panel resizer
   * @param {MouseEvent|TouchEvent} e event
   */
  async holdResizer({event}) {
    event.preventDefault();

    if (this.isTransitioning) {
      return;
    }

    this.reduced = false;
    this.maximized = false;
    this.updatePanelClasses();
    this.move(event, true);

    this.timer = setTimeout(() => {
      if (this.timer) {
        this.holding = true;
        document.addEventListener('touchmove', this.moveCallback);
        document.addEventListener('mousemove', this.moveCallback);
      }
    }, 250);
  }

  /**
   * Triggered on mouse move inside the body element while holding the panel resizer
   * @param {MouseEvent|TouchEvent} e event
   * @param {boolean} force Apply the height outside a panel resize
   */
  move(e, force = false) {
    if ((this.holding || force) && !this.isTransitioning) {
      const clientY = e.changedTouches ? e.touches[0].clientY : e.clientY;
      this.resizableElement.style.height = `${Math.abs(
        window.innerHeight - clientY + this.handleElement.offsetHeight - 10
      )}px`;
    }
  }

  async playTransition() {
    this.isTransitioning = true;
    const panelElement = this.resizableElement;
    panelElement.classList.add('smooth-resize');
    this.updatePanelClasses();
    panelElement.style.height = null;

    return new Promise(resolve => {
      setTimeout(() => {
        this.isTransitioning = false;
        document.removeEventListener('touchmove', this.moveCallback);
        document.removeEventListener('mousemove', this.moveCallback);
        panelElement.classList.remove('smooth-resize');
        resolve();
      }, 250); // css transition delay
    });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} event
   */
  async stopResize({event}) {
    event.preventDefault();
    clearTimeout(this.timer);

    const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

    const SIZES = {
      0: window.innerHeight,
      [window.innerHeight / 2]: window.innerHeight / 2,
      [window.innerHeight]: 50,
    };
    const index = getClosest(Object.keys(SIZES), clientY);
    const adequateHeight = SIZES[index];

    if (adequateHeight === 50) {
      if (this.holding) {
        this.reduced = true;
      }
    } else if (!this.holding && adequateHeight === window.innerHeight / 2) {
      this.reduced = true;
    } else if (adequateHeight === window.innerHeight) {
      if (!this.holding) {
        this.resizableElement.style.height = null;
      }
      this.maximized = true;
    }

    this.holding = false;
    await this.playTransition();
  }

  renderResizerActions() {
    return PanelResizerActionsView.call(this);
  }

  getResizableClasses() {
    let classes = this.RESIZABLE_PANEL_CLASS;
    if (this.maximized) {
      classes += ` ${MAXIMIZED_PANEL_CLASS}`;
    } else if (this.reduced) {
      classes += ` ${REDUCED_PANEL_CLASS}`;
    }
    return classes;
  }

  updatePanelClasses() {
    this.resizableElement.classList.toggle(MAXIMIZED_PANEL_CLASS, this.maximized);
    this.resizableElement.classList.toggle(REDUCED_PANEL_CLASS, this.reduced);
  }

  reset() {
    this.reduced = false;
    this.maximized = false;
  }
}
