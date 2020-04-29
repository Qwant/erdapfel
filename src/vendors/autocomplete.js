class Autocomplete {
  constructor({ selector, renderItems, source, minChars = 3, delay = 150 }) {
    this.selector = selector;
    this.renderItems = renderItems
    this.source = source;
    this.minChars = minChars;
    this.delay = delay;

    this.previousValue = '';
    this.timer;
    this.sourcePending;

    this.input = document.querySelector(this.selector);
    this.input.addEventListener('input', this.inputHandler.bind(this));

    if (!this.minChars) {
      this.input.addEventListener('focus', this.focusHandler.bind(this));
    }
  }

  suggest(data) {
    this.cancelObsolete();
    const value= this.input.value;
    if (data && value.length >= this.minChars) {
      this.renderItems(data, value);
    }
  }

  async inputHandler() {
    const value = this.input.value;

    if (value === this.previousValue) {
      return
    }

    if (value.length < this.minChars) {
      return this.previousValue = value
    }


    this.cancelObsolete();
    this.previousValue = value;
    this.timer = setTimeout(() => {
      // @HACK: a bug in Firefox for Android (https://bugzilla.mozilla.org/show_bug.cgi?id=1610083)
      // triggers a redundant 'input' event on the field just before it's blurred,
      // resulting in the suggest list re-appearing after a suggestion has been made.
      // So we check if the element having the focus is the field before doing anything.
      if (document.activeElement && document.activeElement !== this.input) {
        return;
      }

      this.sourcePending = this.source(value);
      this.sourcePending
        .then((source) => {
          this.sourcePending = null;
          if (source !== null && document.activeElement === this.input) {
            this.suggest(source);
          }
        })
        .catch((e) => {
          this.sourcePending = null;
          console.warn(e); /* should be handled by a telemetry logger */
        });

    }, this.delay);
  }

  focusHandler(e) {
    this.previousValue = '\n';
    this.inputHandler(e);
  }

  cancelObsolete() {
    clearTimeout(this.timer);
    if (this.sourcePending) {
      this.sourcePending.abort();
      this.sourcePending = null;
    }
  }

  // public destroy method
  destroy() {
    this.input.removeEventListener('focus', this.focusHandler);
    this.input.removeEventListener('input', this.inputHandler);
    this.input = null;
  }

  async prefetch(value) {
    this.input.value = value;
    const source = await this.source(value);
    return source;
  }

  preRender(items = []) {
    this.renderItems(items);
  }

  clear() {
    this.input.value = '';
    this.previousValue = '';
  }

  setValue(value) {
    this.input.value = value;
    this.previousValue = '';
  }
}

export default Autocomplete;
