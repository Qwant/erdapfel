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
    actions.set(action.id, action)
    return ` onclick="call4Action(${action.id})" `
  }

  window.call4Action = function (id) {
    const action = actions.get(id)
    action.method.call(action.ctx, action.args)
  }
})()
