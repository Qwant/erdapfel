import { hasDisplayableDelivery } from '../../src/panel/poi/blocks/helpers';

describe('POI helpers', () => {
  describe('hasDisplayableDelivery', () => {
    const cases = [
      {
        desc: 'a null block',
        block: null,
        expected: false,
      },
      { desc: 'no delivery mode', block: { type: 'delivery' }, expected: false },
      {
        desc: 'no enabled delivery mode',
        block: { type: 'delivery', delivery: 'no', takeaway: 'no', click_and_collect: 'unknown' },
        expected: false,
      },
      {
        desc: 'at least one enabled delivery mode',
        block: { type: 'delivery', delivery: 'no', takeaway: 'yes', click_and_collect: 'unknown' },
        expected: true,
      },
    ];

    cases.forEach(({ block, desc, expected }) => {
      it('works with ' + desc, () => {
        expect(hasDisplayableDelivery(block)).toEqual(expected);
      });
    });
  });
});
