import Telemetry from "./telemetry";

class Click{
  constructor(id, action) {
    this.action = action
    this.id = id
  }
  toString() {
    return ` onclick="call4Action(event, ${this.id})" `
  }

  exec() {
    if(this.telemetry) {
      this.telemetry.add()
    }
    this.action.method.call(this.action.ctx, this.action.args)
  }

  addTelemetry(message) {
    this.telemetry = new Telemetry(message)
    return this
  }
}


/**
 * bind html native listener to panel action
 */

(function actions() {
  const actions = new Map()
  /**
   *
   * @param method call back function
   * @param ctx "this"
   * @returns {string}
   */
  window.click = function (method, ctx, options = {}) {
    const action = {
      id : actions.size,
      method : method,
      ctx : ctx,
      args : options
    }
    let clickAction = new Click(action.id, action)
    actions.set(action.id, clickAction)
    return clickAction
  }

  window.call4Action = function (event, id) {
    event.stopPropagation()
    const action = actions.get(id)
    action.exec()
  }
})()
