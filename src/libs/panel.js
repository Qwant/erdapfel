import ExtendedString from "./string";

const panels = new Map()

/**
 * Panel is a simple display component
 */
function Panel(panel, view, parentId = null) {
    this.panel = panel
    this.view = view
    this.root = false
    this.cid = parentId || panels.size
    if(parentId !== null) {
      this.node = document.getElementById(this.cid)
      this.root = true
    } else {
      this.node = document.createElement('div')
      this.node.setAttribute('data-cid', this.cid)
    }
    panel.render = this.render.bind(this)
    panel.animate = this.animate.bind(this)

    /* Extend panel */
    panel.htmlEncode = ExtendedString.htmlEncode

    panels.set(this.cid, this.node)
}

Panel.prototype.render = function () {
  this.node.innerHTML = this.view.call(this.panel)

  /* double raf assure browser display cost 32 ms */
  if(this.onRender) {
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        this.onRender.call(this)
      })
    })
  }
  if(this.root === false) {
    return this.node.outerHTML
  }
}

/**
 * Cost 32 ms
 */
Panel.prototype.update = async function () {
  let transitionNode = document.querySelector(`[data-cid="${this.cid}"]`)
  return new Promise((resolve) => {
    transitionNode.innerHTML = this.view.call(this.panel)
    requestAnimationFrame(()=>{
      requestAnimationFrame(()=>{
        resolve(this)
      })
    })
  })
}

Panel.prototype.renderPartial = function(partial) {
  return partial.call(this.panel)
}

Panel.prototype.wait = async function (t) {
  return new Promise((resolve) => {
    setTimeout(()=> {
      resolve(this)
    }, t * 1000)
  })
}

Panel.prototype.addClassName = async function(t, selector, className) {
  return operateClassName.call(this, t, selector, className, 'add')
}

Panel.prototype.removeClassName = async function(t, selector, className) {
  return operateClassName.call(this, t, selector, className, 'remove')
}

Panel.prototype.toggleClassName = async function(t, selector, className) {
  return operateClassName.call(this, t, selector, className, 'toggle')
}

/* private */
async function operateClassName(t, selector, className, operation) {
  let transitionNode = document.querySelector(`[data-cid="${this.cid}"]`)
  if(selector) {
    transitionNode = transitionNode.querySelector(selector)
  }
  transitionNode.classList[operation](className)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(this)
    }, t*1000)
  })
}

Panel.prototype.animate = async function(t, selector, style = {}) {
  let transitionNode = document.querySelector(`[data-cid="${this.cid}"]`)
  if(selector) {
    transitionNode = transitionNode.querySelector(selector)
  }
  Object.keys(style).forEach((styleKey) => {
    transitionNode.style[styleKey] = style[styleKey]
  })
  transitionNode.style.transition = t+'s'
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(this)
    }, t*1000)
  })
}

export default Panel
