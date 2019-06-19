import Panel from '../libs/panel';
import DeployedListView from '../views/deployable_list.dot';

export default class DeployedList {
  constructor(list) {
    this.panel = new Panel(this, DeployedListView);
    this.list = list;
    this.timer = null;

    this.clickResizer = this.clickResizer.bind(this);
    this.holdResizer = this.holdResizer.bind(this);
    this.move = this.move.bind(this);
    this.stopResize = this.stopResize.bind(this);

    window.deployedListClick = this.clickResizer;
    window.deployedListHold = this.holdResizer;
    window.deployedListMove = this.move;
    window.deployedListStop = this.stopResize;
  }

  clickResizer(e) {
    console.log('click', e, this);
  }

  holdResizer() {
    this.timer = setTimeout(() => {
      if (this.timer) {
        console.log('holding');
      }
    }, 250);
  }

  move() {
    console.log('moving');
  }

  stopResize() {
    clearTimeout(this.timer);
    console.log('mouse up');
  }
}