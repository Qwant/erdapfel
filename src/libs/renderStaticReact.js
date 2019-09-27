import ReactDOMServer from 'react-dom/server';

export default reactElement => ReactDOMServer.renderToStaticMarkup(reactElement);
