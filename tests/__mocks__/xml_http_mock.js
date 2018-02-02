const xhrMockClass = () => ({
  open            : jest.fn()
  , send            : function () {
    this.response = '{}'
    this.onload()
  }
  , setRequestHeader: jest.fn(),

})

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass)