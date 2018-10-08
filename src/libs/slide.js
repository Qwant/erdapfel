export default class Slide {
  constructor(panel, touchHandleSelector, panelHandleSelector, options = {}) {
    this.options = options
    this.panel = panel
    this.speed = 0
    this.pos = 0
    this.touchHandleSelector = touchHandleSelector
    this.panelHandleSelector = panelHandleSelector

    this.bounds = options.bounds || {top : 0, bottom : 0}
    this.multiplier = options.multiplier || 1
  }

  initListeners() {
    this.touchHandle = document.querySelector(this.touchHandleSelector)
    this.panelHandle = document.querySelector(this.panelHandleSelector)
    this.move = false
    this.touchHandle.ontouchstart= (e) => {
      this.slideStart(e)
      this.move = true
    }

    document.ontouchend = (e) => {
      this.slideEnd(e)
      this.move = false
    }

    document.ontouchmove = (e) => {
      this.slideMove(e)
    }
  }

  slideStart(e) {
    this.initPos = e.touches[0].pageY
  }

  slideEnd() {
    if(this.speed < -10) {
      this.pos = 0
      this.panelHandle.style.transform = `translate3d(0,${-this.pos}px,0)`
    } else if(this.speed > 10) {
      this.pos = -(this.panelHandle.getBoundingClientRect().height - this.bounds.bottom)
      this.panelHandle.style.transform = `translate3d(0,${-this.pos}px,0)`
    }
  }

  slideMove(e) {
    if(this.move) {
      this.speed =  e.touches[0].pageY - this.initPos
      this.initPos =  e.touches[0].pageY
      this.pos -= this.speed
      if(this.pos > 0) {
        this.pos = 0
      }
      if(this.pos < -(this.panelHandle.getBoundingClientRect().height - this.bounds.bottom)) {
        this.pos = -(this.panelHandle.getBoundingClientRect().height - this.bounds.bottom)
      }
      this.panelHandle.style.transform = `translate3d(0,${-this.pos}px, 0)`
    }
  }
}
