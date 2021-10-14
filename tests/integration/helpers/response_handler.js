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
    const alreadySetResponse = this.preparedResponses.findIndex(
      preparedResponse => preparedResponse.query.toString() === query.toString()
    );
    if (alreadySetResponse !== -1) {
      this.preparedResponses.splice(alreadySetResponse, 1);
    }
    this.preparedResponses.push({ response, query, options });
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
        interceptedRequest.headers['Access-Control-Allow-Headers'] = '*';
        let status = 200;
        if (preparedResponse.options) {
          if (preparedResponse.options.status) {
            status = preparedResponse.options.status;
          }
          if (preparedResponse.options.delay) {
            await new Promise(function (resolve) {
              setTimeout(resolve, preparedResponse.options.delay);
            });
          }
        }
        // await delay(200);
        await interceptedRequest.respond({
          status,
          body: JSON.stringify(preparedResponse.response),
          headers: interceptedRequest.headers,
        });
        return;
      }
      interceptedRequest.continue();
    });
  }
}
