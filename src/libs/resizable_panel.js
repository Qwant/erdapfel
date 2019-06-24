const sizes = {
  0: window.innerHeight - 75,
  [window.innerHeight / 2]: window.innerHeight / 2,
  [window.innerHeight]: 40,
};

export default class ResizablePanel {
  constructor() {
    this.timer = null;
    this.panel = null;
    this.panelSelector = '';
    this.holding = false;
    this.isTransitioning = false;

    this.checkPanel = this.checkPanel.bind(this);
    this.holdResizer = this.holdResizer.bind(this);
    this.move = this.move.bind(this);
    this.stopResize = this.stopResize.bind(this);

    window.deployedListHold = this.holdResizer;
    window.deployedListStop = this.stopResize;
  }

  checkPanel() {
    if (!this.panel) {
      const element = document.querySelector('.resizable_panel');
      if (element) {
        this.panel = element;
        return true;
      }
      return false;
    }
    return true;
  }

  getClosest(arr, goal) {
    return arr.reduce((prev, curr) =>
      (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev)
    );
  }

  holdResizer() {
    if (this.isTransitioning) {
      return;
    }
    this.timer = setTimeout(() => {
      if (this.timer && this.checkPanel()) {
        this.holding = true;
        document.addEventListener('mousemove', this.move);
      }
    }, 250);
  }

  move(e) {
    if (this.holding && this.checkPanel() && !this.isTransitioning) {
      this.panel.style.height = `${Math.abs(window.innerHeight - e.clientY + 10)}px`;
    }
  }

  async stopResize(e) {
    if (this.holding) {
      this.isTransitioning = true;

      this.panel.classList.add('smooth-resize');
      const adequateHeight = this.getClosest(Object.keys(sizes), e.clientY);
      this.panel.style.height = `${sizes[adequateHeight]}px`;

      await new Promise(resolve => {
        setTimeout(() => {
          this.isTransitioning = false;
          document.removeEventListener('mousemove', this.move);
          this.panel.classList.remove('smooth-resize');
          resolve();
        }, 500); // css transition delay
      });

    } else {
      console.log('click')
    }
    clearTimeout(this.timer);
    this.holding = false;

    this.panel = null;
  }
}