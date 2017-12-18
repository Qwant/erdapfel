const panels = new Map()

/**
 * Panel is a simple display component
 */
function Panel(panel, view, parentId) {
  this.panel = panel
  this.view = view

  this.node = document.getElementById(parentId)
  panels.set(panel.id, this.node)
}

Panel.prototype.render = function () {
  return new Promise((resolve) => {
    this.node.innerHTML = this.view.call(this.panel)
    requestAnimationFrame(()=>{
      resolve(this)
    })
  })
}

Panel.prototype.animate = function (t, selector, style = {}) {
  let transitionNode = this.node
  if(selector) {
    transitionNode = this.node.querySelector(selector)
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