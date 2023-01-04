import { parseText } from '../../src/libs/miniMarkdown';

describe('mini markdown', () => {
  test('simpleLinks', () => {
    const cases = [
      { input: 'Hello, World!', output: [{ type: 'Raw', text: 'Hello, World!' }] },
      {
        input: 'Are you [lost](https://perdu.com/)?',
        output: [
          { type: 'Raw', text: 'Are you ' },
          { type: 'Link', text: 'lost', url: 'https://perdu.com/' },
          { type: 'Raw', text: '?' },
        ],
      },
      {
        input:
          'Are you [lost](https://perdu.com/)[s](https://perdus.com/)? Try using [Qwant](https://www.qwant.com/)!!!',
        output: [
          { type: 'Raw', text: 'Are you ' },
          { type: 'Link', text: 'lost', url: 'https://perdu.com/' },
          { type: 'Link', text: 's', url: 'https://perdus.com/' },
          { type: 'Raw', text: '? Try using ' },
          { type: 'Link', text: 'Qwant', url: 'https://www.qwant.com/' },
          { type: 'Raw', text: '!!!' },
        ],
      },
    ];

    cases.forEach(({ input, output }) => expect(parseText(input)).toEqual(output));
  });
});
