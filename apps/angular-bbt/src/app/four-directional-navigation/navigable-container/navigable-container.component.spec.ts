import { TestBed, waitForAsync } from '@angular/core/testing';
import {
  DelegationStrategy,
  NavigableContainerComponent
} from './navigable-container.component';
import {
  makeMockNavigable,
  navigableGroupTests
} from '../navigable-group.spec';
import { ActiveService } from '../active.service';
import { LinearShifter } from '../navigable-group';
import { OrthogonalShifter } from '../OrthogonalShifter';

type Shifter = keyof LinearShifter;
type Directions = keyof OrthogonalShifter;
type Strategy = 'verticalStrategy' | 'horizontalStrategy';

const orthogonalToLinear = (direction: Directions) => {
  switch (direction) {
    case 'up':
    case 'left':
      return 'previous';
    case 'down':
    case 'right':
      return 'next';
  }
};

const mockParent = () =>
  jasmine.createSpyObj('parent', [
    'unregisterNavigable',
    'registerNavigable',

    'next',
    'previous',

    'up',
    'down',
    'left',
    'right'
  ]);

const humanReadableStrategy = (strategy: Strategy) =>
  strategy === 'verticalStrategy' ? 'vertical strategy' : 'horizontal strategy';

describe('NavigableContainerComponent', () => {
  let fixture, component, mockActiveService;

  beforeEach(
    waitForAsync(() => {
      mockActiveService = jasmine.createSpyObj('ActiveService', [
        'push',
        'pushAndSteal',
        'pop',
        'activatePrevious',

        'next',
        'previous',

        'registerNavigable',
        'unregisterNavigable',

        'up',
        'down',
        'left',
        'right',

        'activate',
        'deactivate',
        'emitActivated'
      ]);

      TestBed.configureTestingModule({
        declarations: [NavigableContainerComponent],
        providers: [{ provide: ActiveService, useValue: mockActiveService }]
      }).compileComponents();

      fixture = TestBed.createComponent(NavigableContainerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    })
  );

  it('should initialize component', () => {
    expect(component).toBeTruthy();
  });

  describe('INavigable Group interface', () => {
    navigableGroupTests(() => component);
  });

  it('should have nothing active initially', () => {
    expect(component.activeChild).toBeFalsy();
  });

  let children, first, second, third;
  const withChildren = test => {
    describe('with children', () => {
      beforeEach(() => {
        [first, second, third] = children = [
          makeMockNavigable(),
          makeMockNavigable(),
          makeMockNavigable()
        ];

        children.forEach(child => component.registerNavigable(child));
      });
      test();
    });
  };

  describe('#activate', () => {
    withChildren(() => {
      it('should activate the first element if none are enabled', () => {
        expect(component.activate()).toBe(first);
        expect(component.activeChild).toBe(first);
      });

      it('should return the active child if there is one', () => {
        expect(component.activate()).toBe(first);
        component.next();
        expect(component.activate()).toBe(second);
      });
    });

    it('should return null if it has no children', () => {
      expect(component.activate()).toBeNull();
    });
  });

  describe('#deactivate', () => {
    it('should return null if there is no active child', () => {
      expect(component.deactivate()).toBeNull();
    });

    withChildren(() => {
      it('should set active to null', () => {
        component.activate();
        expect(component.activeChild).toBeTruthy();
        component.deactivate();
        expect(component.activeChild).toBeFalsy();
      });

      it('should return the previously active element on deactivation', () => {
        component.activate();
        expect(component.deactivate()).toBe(first);
      });
    });
  });

  // directional functions
  const describeDirection = (
    direction: Directions,
    shifter: Shifter,
    directionStrategy: Strategy,
    defaultStrategy: DelegationStrategy
  ) => {
    describe(`#${direction}`, () => {
      withChildren(() => {
        const expectDefer =
          (
            strategy: DelegationStrategy,
            deferredFunction: Shifter | Directions
          ) =>
          () => {
            component.activate();
            expect(component.activeChild).toBeDefined();
            const mock = mockParent();
            component.parent = mock;
            component[directionStrategy] = strategy;

            expect(mock[deferredFunction]).not.toHaveBeenCalled();
            component[direction]();
            expect(mock[deferredFunction]).toHaveBeenCalled();
          };

        const expectSelf = () => {
          component.activate();
          expect(component.activeChild).toBeDefined();
          spyOn(component, shifter);
          component[directionStrategy] = 'self';

          expect(component[shifter]).not.toHaveBeenCalled();
          component[direction]();
          expect(component[shifter]).toHaveBeenCalled();
        };

        const linear = orthogonalToLinear(direction);

        it(
          `should default to ${defaultStrategy}`,
          defaultStrategy === 'parent'
            ? expectDefer('parent', linear)
            : expectSelf
        );

        it(
          `should defer to parent's ${linear} when ${humanReadableStrategy(
            directionStrategy
          )} is parent`,
          expectDefer('parent', linear)
        );

        it(
          `should defer to parent's ${direction} when ${humanReadableStrategy(
            directionStrategy
          )} is delegate`,
          expectDefer('delegate', direction)
        );

        it(
          `should shift internally when ${humanReadableStrategy(
            directionStrategy
          )} is self`,
          expectSelf
        );

        it(`should just activate if ${humanReadableStrategy(
          directionStrategy
        )} is none`, () => {
          component[directionStrategy] = 'none';
          spyOn(component, 'activate');
          component[direction]();
          expect(component.activate).toHaveBeenCalled();
        });
      });
    });
  };

  describeDirection('up', 'previous', 'verticalStrategy', 'parent');
  describeDirection('down', 'next', 'verticalStrategy', 'parent');
  describeDirection('left', 'previous', 'horizontalStrategy', 'self');
  describeDirection('right', 'next', 'horizontalStrategy', 'self');
});
