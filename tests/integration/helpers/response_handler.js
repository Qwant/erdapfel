export default class ResponseHandler {

  constructor(page) {
    this.preparedResponses = [];
    this.page = page;
  }

  static async init(page) {
    const responseHandler = new ResponseHandler(page);
    await responseHandler.prepareResponse();
    return responseHandler;
  }

  addPreparedResponse(response, query, options) {
    const alreadySetResponse = this.preparedResponses.find(
      preparedResponse => preparedResponse.query.toString() === query.toString()
    );
    if (!alreadySetResponse) {
      this.preparedResponses.push({response, query, options});
    }
  }

  reset() {
    this.preparedResponses = [];
  }

  async prepareResponse() {
    await this.page.setRequestInterception(true);
    this.page.on('request', async interceptedRequest => {
      const preparedResponse = this.preparedResponses.find(preparedResponse => {
        return interceptedRequest.url().match(preparedResponse.query);
      });

      if (preparedResponse) {
        interceptedRequest.headers['Access-Control-Allow-Origin'] = '*';
        let status = 200;
        if (preparedResponse.options) {
          if (preparedResponse.options.status) {
            status = preparedResponse.options.status;
          }
        }
        await interceptedRequest.respond({
          status: status,
          body: JSON.stringify(preparedResponse.response),
          headers: interceptedRequest.headers}
        );
        return;
      }
      interceptedRequest.continue();
    });
  }
}
