# Client-side Routing

Erdapfel is a pure <abbr title="Single-Page App">SPA</abbr>, which is structured into several main features (ex : home, poi list, single poi, directions, etc.), each corresponding to a specific UI ('panel').

It uses a **client-side routing mechanism** to organize the navigation between these panels and ensure the consistency between the application state and the browser location management. It is crucial so that, like in a classic (page-by-page) web application:
 * the application state at any moment corresponds to a unique URL, meaning the user can bookmark or reload the app and find it back in the same state ;
 * the application reacts correctly to the user navigating in the history with built-in browser Back/Forward actions.

## Principles

All client-side routers work on the same principles, and it's the case for Erdapfel:
 * they organize the different application states into a hierarchy of HTTP *routes* with path and arguments (usually defined as URL regexps) ;
 * they use the [History API](https://developer.mozilla.org/en-US/docs/Web/API/History_API) to manipulate the browser `history` object in two ways:
    1. Link navigations internal to the app are not made as HTTP requests to the server but intercepted and resolved as [`pushState`](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState) or [`replaceState`](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) actions, to create real history entries for the browser.
    2. The [`popstate`](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate) event is listened to, to detect direct history manipulations through Back/Forward.
 * when one of these two events occur (or when the app loads), the new active history entry (an URL + an optional state object) is checked through the routes to determine which action to perform on the app (usually changing what to render).

## Technical parts

The current Erdapfel router was first introduced in https://github.com/Qwant/erdapfel/pull/322 as a custom and very basic implementation to solve the most immediate URL management problems the app had. It hasn't evolved much since. Even during the migration to React it was mostly untouched, being used normally from React components or the Vanilla JS code.

It's made of the following parts:

 * [app_router.js](/src/libs/app_router.js) defines `Router`, a class with two methods:
    1. `addRoute`, to declare routes as regexp/callback pairs (there is also a name which is only for self documentation during declaration)
    2. `routeUrl`, to check a url against the declared routes and trigger the corresponding callback if a route matches 
 * [app_panel.js](/src/panel/app_panel.js), the client app entry point
    1. instantiates a `Router` object
    2. listens to `popstate` events to call `routeUrl` on the `Router` instance when it happens
    2. defines mostly `navigateTo` to call `routeUrl` explicitely on the `Router` instance (It's attached to the `window.app` global object to be available easily for all the app, but it would be better to scope it in its module)
    3. passes the router instance as a prop to the `RootComponent`, which in turn passes it to `PanelManager`  
 * [PanelManager.js](/src/panel/app_panel.js) is where the app routes are declared and where for each one we change some React state so what is rendered in the app changes.
 * When a component wants to navigate to another part of the app, it needs to call `window.app.navigateTo` with the URL corresponding to the target state.


## Limiations

The current router implementation wasn't made to last, but it did. It works fine most of the time but still has some limitations:

- the bits in `app_panel.js` are a bit clumsy and should be packaged more properly, first not relying on globals. Also, relative URL and query string management relies on a bit of other functions. 

  Maybe React hooks could help making all that cleaner.
- it's really not React-ish, being more imperative than declarative.
- related, real links (`<a>`) are not currently managed. `window.app.navigateTo` is mostly called as result of button clicks, where in a lot of places a link with an explicit `href` attribute would be the right thing to use.

  As a result, the code is more complex than needed, accessibility sucks, you can't open in a new tab or see the destination url in the status bar. In theory it's not so hard to manage by intercepting clicks on `a` elements on the whole document, but it's another moving part…

- it's not made to be used on server-side, which could be a limit if we want to do some <abbr title="Server-side rendering">SSR</abbr>.

## Future plans

A future-proof alternative would be to switch to [React Router](https://reactrouter.com/web):
 - instead of a custom and fragile implementation, it's a robust solution, almost a de-facto standard, used by many project (notably Qwant Search)
 - it would greatly simplify the top parts of the app, and allow to focus on the attributes in each concerned components
 - real links are natively managed through `<Link>` components.
 - fully made for SSR

An unfinished migration POC is available in https://github.com/Qwant/erdapfel/pull/1175, which shows most needed steps.

The hard thing is that the migration is hard or impossible to do progressively, it must be a one-step task, so it's no easy stuff.
