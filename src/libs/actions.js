class Action {
  constructor(id, action, eventName) {
    this.action = action
    this.id = id
    this.eventName = eventName
  }

  toString() {
    return ` on${this.eventName}="call4Action(event, ${this.id})" `
  }

  exec() {
    if (this.telemetry) {
      this.telemetry.add()
    }
    this.action.method.call(this.action.ctx, this.action.args)
  }
}

/**
 * bind html native listener to panel action
 */

(() => {
  const actions = new Map()
  const supportedActions = ['mouseover', 'click', 'mouseout', 'mousedown', 'touchestart']
  /**
   *
   * @param method call back function
   * @param ctx "this"
   * @returns {string}
   */

  supportedActions.forEach((actionName) => {
    window[actionName] = function (method, ctx, options = {}) {
      const actionPayload = {
        id: actions.size,
        method: method,
        ctx: ctx,
        args: options
      }
      let action = new Action(actionPayload.id, actionPayload, actionName)
      actions.set(action.id, action)
      return action
    }
  })

  window.call4Action = function (event, id) {
    event.stopPropagation()
    const action = actions.get(id)
    action.exec()
  }
})()
