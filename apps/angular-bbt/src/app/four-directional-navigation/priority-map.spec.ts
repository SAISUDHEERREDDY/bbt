import { PriorityMap } from './priority-map';

describe('PriorityMap', () => {
  it('should be able to iterate when there is nothing', () => {
    const a = new PriorityMap<number>();
    expect([...a].length).toEqual(0);
  });

  describe(' #add', () => {
    it('should add a element to a priority', () => {
      const a = new PriorityMap<number>();
      a.set(2, 1);
      expect([...a]).toEqual([1]);
    });

    it('should add given multiple priorities', () => {
      const a = new PriorityMap<number>();
      a.set(2, 1);
      a.set(1, 2);

      expect([...a]).toEqual([2, 1]);
    });

    it('should prioritize nulls last', () => {
      const a = new PriorityMap<number>();
      a.set(2, 1);
      a.set(1, 2);
      a.set(null, 3);

      expect([...a]).toEqual([2, 1, 3]);
    });

    it(
      'should prioritize element of the same ' + 'priority in insertion order',
      () => {
        const a = new PriorityMap<number>();
        a.set(2, 1);
        a.set(1, 2);
        a.set(1, 4);
        a.set(2, 3);

        expect([...a]).toEqual([2, 4, 1, 3]);
      }
    );
  });

  describe('#delete', () => {
    it('should allow removal of an added element given priority', () => {
      const a = new PriorityMap<number>();
      a.set(2, 1, 3).set(1, 2, 4);

      expect([...a]).toEqual([2, 4, 1, 3]);

      expect(a.delete(1, 2)).toBeTruthy();

      expect([...a]).toEqual([4, 1, 3]);

      expect(a.delete(2, 3)).toBeTruthy();

      expect([...a]).toEqual([4, 1]);

      expect(a.delete(2, 1)).toBeTruthy();

      expect([...a]).toEqual([4]);

      expect(a.delete(1, 4)).toBeTruthy();
      expect([...a].length).toEqual(0);
    });

    it("should return false if the priority doesn't exist", () => {
      const a = new PriorityMap<number>();

      expect(a.delete(1, 1)).toBeFalsy();
    });

    it('should return false if the priority exists but the element does not', () => {
      const a = new PriorityMap<number>();
      a.set(1, 2);

      expect(a.delete(1, 1)).toBeFalsy();
    });

    it('should skip priorities with no elements', () => {
      const a = new PriorityMap<number>()
        .set(1, 2, 4)
        .set(2, 1, 3)
        .set(3, 5, 6);

      // Empty out 2
      a.delete(2, 1);
      a.delete(2, 3);

      expect([...a]).toEqual([2, 4, 5, 6]);
    });
  });

  describe('#getIndex', () => {
    it('should be able to return elements by prioritized index', () => {
      const a = new PriorityMap<number>()
        .set(1, 4, 3)
        .set(2, 6, 10)
        .set(3, 100, 1);

      [4, 3, 6, 10, 100, 1].forEach((val, i) => {
        expect(a.getIndex(i)).toBe(val);
      });
    });
  });

  describe('#length', () => {
    it('should still have a length if there is nothing', () => {
      const a = new PriorityMap<number>();
      expect(a.length).toBe(0);
    });

    it('should update the length when a new element is added', () => {
      const a = new PriorityMap<number>();
      expect(a.length).toBe(0);

      a.set(1, 4);
      expect(a.length).toBe(1);

      a.set(2, 2, 3);
      expect(a.length).toBe(3);
    });

    it('should update the length when a new element is deleted', () => {
      const a = new PriorityMap<number>().set(1, 4).set(2, 2, 3);

      expect(a.length).toBe(3);

      a.delete(2, 3);
      a.delete(1, 4);

      expect(a.length).toBe(1);

      a.delete(2, 2);
      expect(a.length).toBe(0);
    });
  });
});
