import { INavigableGroup, NavigableGroup } from './navigable-group';
import { INavigable } from './navigable';
import { Subject } from 'rxjs';
import { ActivityStolenEvent } from './activity-stolen-event';

const spyOnAbstractGroupFields = group => {
  ['activate', 'deactivate', 'down', 'left', 'right', 'up'].forEach(
    (field: never) => spyOn(group, field)
  );
  return group;
};

const activateChild = child => {
  child.emitActivated.and.callThrough();
  child.emitActivated(new ActivityStolenEvent(child));
};

export const makeMockNavigable = (priority: number = null) => {
  const emitter = new Subject();
  const mockNavigable = jasmine.createSpyObj('mock navigable', [
    'left',
    'down',
    'up',
    'right',
    'activate',
    'deactivate',
    'canActivate'
  ]);
  mockNavigable.symbol = Symbol();
  mockNavigable.priority = priority;
  mockNavigable.onActivate = emitter;
  mockNavigable.canActivate.and.returnValue(true);
  mockNavigable.activate.and.returnValue(mockNavigable);
  mockNavigable.deactivate.and.returnValue(mockNavigable);
  mockNavigable.emitActivated = (event: ActivityStolenEvent) =>
    emitter.next(event);

  spyOn(mockNavigable, 'emitActivated');

  return mockNavigable as INavigable;
};

export function navigableGroupTests(groupMaker: () => INavigableGroup) {
  // Initialize navigable group
  let navigableGroup: INavigableGroup;
  beforeEach(() => {
    // Spy on potentially unimplemented members
    navigableGroup = spyOnAbstractGroupFields(groupMaker());
  });

  it('should initialize', () => {
    expect(navigableGroup).toBeTruthy();
  });

  it('should initialize no child', () => {
    expect(navigableGroup.activeChild).toBeNull();
  });

  it('should not be activable without children', () => {
    expect(navigableGroup.canActivate()).toBeFalsy();
  });

  describe('with children', () => {
    let children, first, second, third;
    beforeEach(() => {
      [first, second, third] = children = [
        makeMockNavigable(),
        makeMockNavigable(),
        makeMockNavigable()
      ];

      children.forEach(child => navigableGroup.registerNavigable(child));
    });

    it('should be activable', () => {
      expect(navigableGroup.canActivate()).toBeTruthy();
    });

    it("should not be activable if none of it's children are", () => {
      children.forEach(e => e.canActivate.and.returnValue(false));
      expect(navigableGroup.canActivate()).toBeFalsy();
    });

    it('should allow any child to steal focus', () => {
      children.forEach(child => {
        activateChild(child);
        expect(navigableGroup.activeChild).toBe(child);
      });
    });

    it('should emit itself when a child steals focus', done => {
      const child = first;
      navigableGroup.onActivate.subscribe({
        next: e => {
          expect(e.original).toBe(child);
          expect(e.directChild).toBe(navigableGroup);
          done();
        }
      });
      activateChild(child);
    });

    it('should deactivate the active child when focus is stolen', () => {
      const initiallyActive = first;
      activateChild(initiallyActive);

      // Nothing should have called deactivate yet
      expect(initiallyActive.deactivate).not.toHaveBeenCalled();

      activateChild(second);

      expect(initiallyActive.deactivate).toHaveBeenCalled();
    });

    describe('when the first element is active', () => {
      let initiallyActive;
      beforeEach(() => {
        initiallyActive = first;
        activateChild(initiallyActive);
      });

      it(
        'should not deactivate active child if it steals focus' +
          ' a second time',
        () => {
          initiallyActive.emitActivated(
            new ActivityStolenEvent(initiallyActive)
          );
          expect(initiallyActive.deactivate).not.toHaveBeenCalled();
        }
      );

      describe('#next', () => {
        it('should activate the next child when next is called', () => {
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(second);
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(third);
        });

        it('should wrap on overflow by default', () => {
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(second);
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(third);
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(first);
        });

        it('should skip children that can not be activated', () => {
          second.canActivate.and.returnValue(false);
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(third);
        });

        it('should skip children that can not be activated even when overflowing', () => {
          third.canActivate.and.returnValue(false);
          navigableGroup.next();
          navigableGroup.next();
          expect(navigableGroup.activeChild).toBe(first);
        });
      });

      describe('#previous', () => {
        it('should wrap on underflow by default', () => {
          navigableGroup.previous();
          expect(navigableGroup.activeChild).toBe(third);
        });

        it('should go to the previous ', () => {
          navigableGroup.previous();
          expect(navigableGroup.activeChild).toBe(third);
        });

        it('should skip children that can not be activated', () => {
          navigableGroup.next();
          second.canActivate.and.returnValue(false);
          navigableGroup.next();
          navigableGroup.previous();
          expect(navigableGroup.activeChild).toBe(first);
        });

        it('should skip children that can not be activated even when underflowing', () => {
          third.canActivate.and.returnValue(false);
          navigableGroup.previous();
          expect(navigableGroup.activeChild).toBe(second);
        });
      });
    });
  });
}

const notImplemented = () => {
  throw Error('Not Implemented: testing function only');
};

describe('RawNavigableGroup', () => {
  let navigableGroup;

  /**
   * This class exists only to test the exposed and implemented parts of the
   *  abstract NavigableGroup class
   */
  class RawNavigableGroup extends NavigableGroup {
    constructor() {
      super();
    }

    readonly activeChild: INavigable;
    readonly symbol = Symbol();

    public activate = notImplemented;
    public deactivate = notImplemented;
    public down = notImplemented;
    public left = notImplemented;
    public right = notImplemented;
    public up = notImplemented;
  }

  describe('INavigable Group interface', () => {
    navigableGroupTests(() => {
      navigableGroup = new RawNavigableGroup();
      return navigableGroup;
    });
  });

  describe('flow strategy', () => {
    let children, first, second, third;
    beforeEach(() => {
      navigableGroup = new RawNavigableGroup();
      [first, second, third] = children = [
        makeMockNavigable(),
        makeMockNavigable(),
        makeMockNavigable()
      ];
      children.forEach(x => navigableGroup.registerNavigable(x));
      activateChild(first);
    });

    describe('overflow', () => {
      const overflow = () => {
        navigableGroup.next();
        navigableGroup.next();
        navigableGroup.next();
      };

      it('should wrap by default', () => {
        overflow();
        expect(navigableGroup.activeChild).toBe(first);
      });

      it('should wrap by when set to wrap', () => {
        navigableGroup.overflowStrategy = 'wrap';
        overflow();
        expect(navigableGroup.activeChild).toBe(first);
      });

      it('should wrap by when set to wrap', () => {
        navigableGroup.overflowStrategy = 'none';
        overflow();
        expect(navigableGroup.activeChild).toBe(third);
      });
    });

    describe('underflow', () => {
      it('should wrap by default', () => {
        navigableGroup.previous();
        expect(navigableGroup.activeChild).toBe(third);
      });

      it('should wrap by when set to wrap', () => {
        navigableGroup.underflowStrategy = 'wrap';
        navigableGroup.previous();
        expect(navigableGroup.activeChild).toBe(third);
      });

      it('should wrap by when set to wrap', () => {
        navigableGroup.underflowStrategy = 'none';
        navigableGroup.previous();
        expect(navigableGroup.activeChild).toBe(first);
      });
    });
  });

  describe('#unregisterNavigable', () => {
    let first, second, third, children;
    it('should remove all references to an unregistered navigable', () => {
      navigableGroup = new RawNavigableGroup();
      [first, second, third] = children = [
        makeMockNavigable(),
        makeMockNavigable(),
        makeMockNavigable()
      ];
      children.forEach(x => navigableGroup.registerNavigable(x));
      activateChild(first);

      expect(navigableGroup.length).toEqual(3);
      navigableGroup.unregisterNavigable(second);
      expect(navigableGroup.length).toEqual(2);
    });
  });
});
