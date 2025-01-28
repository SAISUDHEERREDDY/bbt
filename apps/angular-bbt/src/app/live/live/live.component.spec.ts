import { ComponentFixture, fakeAsync, TestBed } from '@angular/core/testing';
import { LiveComponent } from './live.component';
import { Component, Input, Output, Pipe, PipeTransform } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { NavigableRootComponent } from '../../four-directional-navigation/navigable-root.component';
import { DatePipe } from '@angular/common';
import { By } from '@angular/platform-browser';
import { ApplicationState } from '../../reducers';
import { ChannelEvent } from '../live.service';

describe('LiveComponent', () => {
  let component: LiveComponent;
  let fixture: ComponentFixture<LiveComponent>;
  let spies;
  let fakeStore: BehaviorSubject<Partial<ApplicationState>>;
  let fakeAppState: Partial<ApplicationState>;

  async function setupComponent() {
    fakeAppState = {
      pseudoFullscreen: {
        enabled: false
      },
      VODListing: null,
      parkingInfo: null,
      live: {
        activeChannel: null,
        activeProgram: null,
        currentChannels: null,
        selectedChannel: null,
        selectedProgram: null
      }
    };

    // MOCK DECLARATIONS
    // tslint:disable-next-line:component-selector
    @Component({
      selector: 'bbt-jumbotron',
      template: '<ng-content></ng-content>'
    })
    class JumbotronStubComponent {
      @Input() showFade;
      @Input() previewOnly;
    }

    @Component({ selector: 'bbt-plyr', template: '<video></video>' })
    class PlayerStubComponent {
      @Input() source;
      @Input() controls;
      @Input() initialOffset;
    }

    @Component({ selector: 'bbt-hls-plyr', template: '<video></video>' })
    class HLSPlayerStubComponent {
      @Input() m3u8Url;
      @Input() controls;
      @Input() initialOffset;
    }

    @Component({ selector: 'bbt-live-description', template: '<div></div>' })
    class MockLiveDescriptionComponent {
      @Input() program;
      @Input() channel;
    }

    @Component({
      selector: 'bbt-program-browser',
      template: ''
    })
    class MockProgramBrowserComponent {}

    @Component({
      selector: 'bbt-idle-player',
      template: ''
    })
    class MockIdlePlayerComponent {}

    // tslint:disable-next-line:component-selector
    @Component({ selector: 'full-calendar', template: '' })
    class FullcalendarStubComponent {
      @Input() defaultView;
      @Input() plugins;
      @Input() resources;
      @Input() events;
      @Input() minTime;
      @Input() maxTime;
      @Input() height;
      @Input() resourceLabelText;
      @Input() slotLabelInterval;
      @Input() resourceOrder;

      @Output() eventRender;
      @Output() resourceRender;
      @Output() datesRender;
    }

    @Pipe({ name: 'jqueryi18n' })
    class StubI18nPipe implements PipeTransform {
      transform(value: any, args?: any): any {
        return value;
      }
    }

    // END MOCKS
    fakeStore = new BehaviorSubject(fakeAppState);

    spies = {
      store: {
        pipe: fakeStore.pipe.bind(fakeStore),
        dispatch: jasmine.createSpy('store#dispatch')
      },
      navRoot: jasmine.createSpyObj([
        'registerNavigable',
        'unregisterNavigable'
      ]),
      datePipe: jasmine.createSpyObj({
        transform: 'translated'
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        { provide: Store, useValue: spies.store },
        { provide: NavigableRootComponent, useValue: spies.navRoot },
        { provide: DatePipe, useValue: new DatePipe('en-us') }
      ],
      declarations: [
        // Mocks
        JumbotronStubComponent,
        PlayerStubComponent,
        HLSPlayerStubComponent,
        FullcalendarStubComponent,
        StubI18nPipe,
        MockLiveDescriptionComponent,
        MockProgramBrowserComponent,
        MockIdlePlayerComponent,
        // End Mocks

        LiveComponent // Test subject
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(LiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  afterEach(() => {
    fakeStore.complete();
  });

  describe('basic', () => {
    beforeEach(setupComponent);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should set an offset for a file video if its time has already started', fakeAsync(() => {
      const millisecondInAMinute = 60 * 1000;
      const startOffsetInMilliseconds = 10 * millisecondInAMinute; // 10 minutes;
      const endOffsetInMilliseconds = 20 * millisecondInAMinute; // 10 minutes;
      const now = Date.now();

      // The only way I have found to active an event is by activating a channel
      // using the following function
      const activeProgram: ChannelEvent = {
        name: 'Some File Event',
        description: '',
        startTime: new Date(now - startOffsetInMilliseconds),
        endTime: new Date(now + endOffsetInMilliseconds),
        duration: 30,
        channel: null,
        type: 'file',
        file: '/file/path/to/no/where'
      };

      fakeStore.next({
        ...fakeAppState,
        live: {
          ...fakeAppState.live,
          activeChannel: {
            name: '',
            number: '1',
            url: '',
            event: [activeProgram]
          },
          activeProgram: activeProgram
        }
      });

      fixture.detectChanges();

      const expectedOffset = startOffsetInMilliseconds / 1000;
      // Check that it passed through to plyr
      const player = fixture.debugElement.query(By.css('bbt-hls-plyr'));

      expect(player.componentInstance.initialOffset)
        // Should be in seconds
        .toBe(expectedOffset);
    }));
  });
});
