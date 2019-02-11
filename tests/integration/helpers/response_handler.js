export default class ResponseHandler {

  constructor(page) {
    this.preparedResponses = []
    this.page = page
  }

  static async init(page) {
    const responseHandler = new ResponseHandler(page)
    await responseHandler.prepareResponse()
    return responseHandler
  }

  addPreparedResponse(response, query) {
    let alreadySetResponse = this.preparedResponses.find((preparedResponse) => preparedResponse.query === query)
    if(!alreadySetResponse) {
      this.preparedResponses.push({response, query})
    }
  }

  async prepareResponse() {
    await this.page.setRequestInterception(true)
    this.page.on('request', async (interceptedRequest) => {
      let isResponseHandled = false
      this.preparedResponses.forEach((preparedResponse) => {
        if(isResponseHandled === false) {
          if(interceptedRequest.url().match(preparedResponse.query)) {
            interceptedRequest.headers['Access-Control-Allow-Origin'] = '*'
            interceptedRequest.respond({body : JSON.stringify(preparedResponse.response), headers  : interceptedRequest.headers})
            isResponseHandled = true
          }
        }
      })
      if(isResponseHandled === false) {
        interceptedRequest.continue()
      }
    })
  }
}
