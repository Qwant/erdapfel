export default class TopBar {
  constructor() {
    this.searchInput = document.querySelector('#search');
    this.topBarHandle = document.querySelector('.top_bar');

    this.searchInput.onfocus = () => {
      this.topBarHandle.classList.add('top_bar--search_focus');
    };

    this.searchInput.onblur = () => {
      this.topBarHandle.classList.remove('top_bar--search_focus');
    };

    let minifierButton = document.querySelector('.top_bar .minifier');
    if (minifierButton) {
      minifierButton.onclick = () => {
        window.app.toggleMinify();
      };
    }
  }
}
