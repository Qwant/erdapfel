const xhrMockClass = () => ({
  open: jest.fn(),
  send() {
    this.response = '{}';
    this.onload();
  },
  setRequestHeader: jest.fn(),

});

window.XMLHttpRequest = jest.fn().mockImplementation(xhrMockClass);
