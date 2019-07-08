const sizes = {
  0: window.innerHeight,
  [window.innerHeight / 2]: window.innerHeight / 2,
  [window.innerHeight]: 50,
};

const REDUCED = 'reduced';
const FULL = 'full';
const resizerClassName = 'deployable__list_resizer';
export const resizableClassName = 'resizable_panel';

function getClosest(arr, goal) {
  return arr.reduce((prev, curr) =>
    Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev
  );
}

export default class ResizablePanel {
  constructor() {
    this.timer = null;
    this.panel = null;
    this.holding = false;
    this.isTransitioning = false;

    this.checkPanel = this.checkPanel.bind(this);
    this.holdResizer = this.holdResizer.bind(this);
    this.move = this.move.bind(this);
    this.stopResize = this.stopResize.bind(this);
    this.playTransition = this.playTransition.bind(this);

    window.deployedListHold = this.holdResizer;
    window.deployedListStop = this.stopResize;
  }

  /**
   * Looks for a resizable element
   */
  checkPanel() {
    if (!this.panel) {
      const element = document.querySelector(`.${resizableClassName}`);
      if (element) {
        this.panel = element;
        return true;
      }
      return false;
    }
    return true;
  }

  /**
   * Triggered on mouse down of the panel resizer
   * @param {MouseEvent|TouchEvent} e event
   */
  holdResizer(e) {
    e.preventDefault();

    if (!this.checkPanel() || this.isTransitioning) {
      return;
    }

    this.move(e, true);
    this.panel.classList.remove(REDUCED, FULL);
    fire('panel_view_state');

    this.timer = setTimeout(() => {
      if (this.timer && this.checkPanel()) {
        this.holding = true;
        document.addEventListener('touchmove', this.move);
        document.addEventListener('mousemove', this.move);
      }
    }, 250);
  }

  /**
   * Triggered on mouse move inside the body element while holding the panel resizer
   * @param {MouseEvent|TouchEvent} e event
   * @param {boolean} force Apply the height outside a panel resize
   */
  move(e, force = false) {
    e.preventDefault();

    const resizer = document.querySelector(`.${resizerClassName}`);

    if (!resizer) {
      return;
    }

    if ((this.holding || force) && this.checkPanel() && !this.isTransitioning) {
      const clientY = e.changedTouches ? e.touches[0].clientY : e.clientY;
      this.panel.style.height = `${Math.abs(
        window.innerHeight - clientY + resizer.offsetHeight
      )}px`;
    }
  }

  /**
   * Applies the height to the panel with a transition
   * @param {number} size the panel's height
   * @param {boolean} [onMouseMove=false] After a body mousemove (true) or after a click (false)
   */
  playTransition(size, onMouseMove = false) {
    if (!this.checkPanel()) {
      return;
    }

    this.isTransitioning = true;
    this.panel.classList.add('smooth-resize');
    this.panel.style.height = `${size}px`;

    return new Promise(resolve => {
      setTimeout(() => {
        this.isTransitioning = false;
        if (onMouseMove) {
          document.removeEventListener('touchmove', this.move);
          document.removeEventListener('mousemove', this.move);
        }
        this.panel.classList.remove('smooth-resize');
        resolve();
      }, 500); // css transition delay
    });
  }

  /**
   * Triggered on mouse up of the panel resizer
   * @param {MouseEvent|TouchEvent} e event
   */
  async stopResize(e) {
    e.preventDefault();

    clearTimeout(this.timer);

    if (!this.checkPanel()) {
      return;
    }

    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const index = getClosest(Object.keys(sizes), clientY);
    const adequateHeight = sizes[index];
    let height = adequateHeight;

    if (adequateHeight === 50) {

      if (this.holding) {
        this.panel.classList.add(REDUCED);
        fire('panel_view_state', { reduced: true });
      } else {
        height = window.innerHeight / 2;
      }

    } else if (!this.holding && adequateHeight === window.innerHeight / 2) {

      this.panel.classList.add(REDUCED);
      fire('panel_view_state', { reduced: true });
      height = 50;

    } else if (adequateHeight === window.innerHeight) {

      if (!this.holding) {
        this.panel.style.height = null;
      }
      this.panel.classList.add(FULL);
      fire('panel_view_state', { maximized: true });
    }

    this.holding = false;
    await this.playTransition(height, true);

    this.panel = null;
  }
}
