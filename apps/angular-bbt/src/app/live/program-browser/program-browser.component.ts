import {
  Component,
  OnDestroy,
  Renderer2,
  SecurityContext,
  ViewEncapsulation,
  EventEmitter,
  Output
} from '@angular/core';
import {
  merge,
  Observable,
  of,
  timer,
  Unsubscribable,
  combineLatest
} from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  tap
} from 'rxjs/operators';
import { Channel, ChannelEvent, floorTime } from '../live.service';
import { DatePipe } from '@angular/common';
import { NavigableRootComponent } from '../../four-directional-navigation/navigable-root.component';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  ActivateChannel,
  clearPreview,
  findNextPreviewInChannel,
  findPreviousPreviewInChannel,
  RequestChannels,
  setPreview
} from '../../reducers/live/live.actions';
import {
  activeChannel,
  channels as selectChannels,
  safePreviewProgram,
  activeProgram,
  isChannelError
} from '../../reducers/live/live.selectors';
import { ResourceNavigable } from '../live/ResourceNavigable';
import { ActivityStolenEvent } from '../../four-directional-navigation/activity-stolen-event';
import { ResourceEvent } from '../live/live.component';
import { FullscreenEnableAction } from '../../reducers/pseudoFullscreen/action';
import { ResourceNavigableGroup } from '../live/ResourceNavigableGroup';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { CalendarOptions } from '@fullcalendar/core';
import { DomSanitizer } from '@angular/platform-browser';

import { values } from 'lodash';
import { ActiveService } from '../../four-directional-navigation/active.service';

const minute = 60 * 1000;
const hour = 60 * minute;
const threeHours = 3 * hour;
const halfHour = 30 * minute;
const millisecondUntilNextHalfHour = () => halfHour - (Date.now() % halfHour);

@Component({
  selector: 'bbt-program-browser',
  templateUrl: './program-browser.component.html',
  styleUrls: ['program-browser.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProgramBrowserComponent implements OnDestroy {
  private spread = 3; // Show three hours at a time.
  private subs = new Set<Unsubscribable>();
  private listeners = new Set<() => void>();

  // Data-members
  public navGroup = new ResourceNavigableGroup(this.root);
  /**
   * Tracks if program browser is active.
   */
  isActive = true;

  // Traditional Data Members

  // Observable bindings
  /**
   * The range that the scheduler should be looking at. Created as a behavior
   * subject because it seems likely that we will have to worry about updating
   * the time going forward, though it is not in the 1.05 designs.
   *
   * All the other observables flow through this one.
   */
  readonly range$ = merge(
    of(-1), // trigger range right away
    // then re-calculate on the half-hour
    timer(millisecondUntilNextHalfHour(), halfHour)
  ).pipe(
    map(() => new Date(floorTime(new Date().valueOf(), halfHour))),
    distinctUntilChanged(
      (oldTime, newTime) => oldTime.valueOf() === newTime.valueOf()
    ),
    // Determines the range based on the current time
    map(minTime => ({
      minTime,
      maxTime: new Date(minTime.valueOf() + threeHours)
    })),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  readonly isChannelError$ = this.store.pipe(select(isChannelError));

  minTime$ = this.range$.pipe(
    // Flatten the minTime to the nearest half hour (so we don't hide any
    // programs that have already started and are still running).
    map(range => new Date(floorTime(range.minTime.valueOf()))),
    // Convert to the format the calendar expects
    map(minTime => ({
      hours: minTime.getHours(),
      minutes: minTime.getMinutes()
    })),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  maxTime$ = this.minTime$.pipe(
    // Convert to the format the calendar expects and add 3 hours
    map(min => ({
      ...min,
      hours: min.hours + this.spread
    }))
  );

  /**
   * This exists because there is a bug that causes fullcalendar to
   * break when midnight comes. Using this forces a render of
   * fullcalendar which prevents their bug. Remove it when they fix it.
   */
  isLoaded = false;

  private channels$ = this.range$.pipe(
    tap(() => {
      this.cleanupMemory();
    }),

    // ngrx data acquisition
    tap(range => {
      this.store.dispatch(new RequestChannels({}));
      this.isLoaded = false;
    }),
    switchMap(() =>
      this.store.pipe(
        select(selectChannels),
        filter(x => x !== null)
      )
    ),
    map(cs => values(cs)),
    tap(() => (this.isLoaded = true)),
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );

  public resources$ = this.channels$.pipe(
    map(cs =>
      cs
        ? cs.map(channel => ({
            id: channel?.number,
            title: channel?.name,
            extendedProps: {
              channel
            }
          }))
        : []
    )
  );

  public events$ = this.channels$.pipe(
    map(cs => {
      const events = [];
      for (const channel of cs) {
        events.push(
          ...channel?.event?.map(event => ({
            id: event.name,
            title: event.name,
            resourceId: channel?.number,
            start: event.startTime,
            end: event.endTime,
            extendedProps: {
              event,
              channel
            }
          }))
        );
      }
      return events;
    })
  );

  public fullCalendarOptions$: Observable<CalendarOptions> = combineLatest([
    this.resources$.pipe(map(x => x ?? [])), // make sure you get an array if oyu have nothing
    this.events$,
    this.minTime$,
    this.maxTime$,
    this.range$
  ]).pipe(
    // Debounce emissions since often several will happen at once
    debounceTime(50),
    map(([resources, events, minTime, maxTime, range]) => {
      this.cleanupMemory(); // Destroy any existing parts

      // Bail out if in a ssr context
      if (!document) {
        return null;
      }

      // If time range is not set no configuration will work
      if (!minTime || !maxTime) {
        return null;
      }

      const resourceMap = new Map<string, ResourceNavigable>();
      const options: CalendarOptions = {
        // boilerplate
        height: this.calculateHeight(resources),
        stickyHeaderDates: 'auto',
        schedulerLicenseKey: '0935147237-fcs-1611792000',
        plugins: [resourceTimelinePlugin],
        initialView: 'resourceTimelineDay',
        // initialDate needs to be reset or when the day rolls over it gets confused
        initialDate: new Date(Date.now()),

        resources,
        events:
          events.map(x => ({
            ...x,
            startStr: x.start,
            endStr: x.end
          })) ?? [],

        // General Options

        // Slot options
        slotMinTime: minTime,
        slotMaxTime: maxTime,
        slotLabelInterval: halfHour,
        slotDuration: halfHour * 6,
        resourceLaneDidMount: async x => {
          const laneChannel = x?.resource.extendedProps.channel;
          this.subs.add(
            this.store.pipe(select(activeChannel)).subscribe(channel => {
              this.classToggler(
                'playing-lane',
                x?.el,
                laneChannel?.number === channel?.number
              );
            })
          );
        },

        // Resource options
        resourceAreaHeaderContent: this.datePipe.transform(range.minTime),
        resourceAreaWidth: '15%',
        resourceLabelContent: x => {
          const { channel, host, navigable } = this.renderResource(x as any);

          resourceMap.set(channel?.number, navigable);

          return { domNodes: [host] };
        },
        resourceLabelDidMount: async x => {
          const nav = resourceMap.get(x.resource.id);
          // Initalize activity
          const activeId = await this.store
            .pipe(
              select(activeChannel),
              map(active => (active ? active.number : null)),
              first()
            )
            .toPromise();

          if (activeId === x.resource.id) {
            nav.activate();
          }

          // Watch for future channel changes
          this.subs.add(
            this.store.pipe(select(activeChannel)).subscribe(active => {
              if (active?.number === x?.resource?.extendedProps?.number) {
                x.el.classList.add('playing');
              } else {
                x.el.classList.remove('playing');
              }
            })
          );
        },
        resourceLabelWillUnmount: x => {
          // Remove id from the resourceMap
          resourceMap.delete(x.resource.id);
        },

        // Event Options
        eventContent: x => ({
          domNodes: [this.createDateLabel(x?.event?.extendedProps?.event)]
        }),
        eventMouseEnter: x =>
          this.store.dispatch(
            setPreview({
              channel: x?.event?.extendedProps?.channel,
              program: x?.event?.extendedProps?.event
            })
          ),
        eventMouseLeave: x => this.store.dispatch(clearPreview()),
        eventDidMount: eventMountArg => {
          // Previewing check
          this.subs.add(
            this.store.pipe(select(safePreviewProgram)).subscribe(program => {
              const event = eventMountArg?.event?.extendedProps?.event;

              // if this not the active program
              if (program?.time_id !== event?.time_id) {
                eventMountArg.el.classList.remove('previewing-program');
                return; // do nothing
              }
              eventMountArg.el.classList.add('previewing-program');
            })
          );

          // Currently playing
          this.subs.add(
            this.store.pipe(select(activeProgram)).subscribe(program => {
              const event = eventMountArg?.event?.extendedProps?.event;

              // if this not the active program
              if (program?.time_id !== event?.time_id) {
                eventMountArg.el.classList.remove('playing-program');
                return; // do nothing
              }

              eventMountArg.el.classList.add('playing-program');
            })
          );
        }
      };

      return options;
    })
  );

  constructor(
    private datePipe: DatePipe,
    private renderer: Renderer2,
    private root: NavigableRootComponent,
    private store: Store<ApplicationState>,
    private sanitizer: DomSanitizer,
    private active: ActiveService
  ) {
    this.root.registerNavigable(this.navGroup);
    this.navGroup.onActivateCallback = () => {
      this.isActive = true;
    };
    this.navGroup.onDeactivateCallback = () => {
      this.isActive = false;
    };
  }

  private classToggler(className, el, state) {
    if (state) {
      el.classList.add(className);
    } else {
      el.classList.remove(className);
    }
  }

  /**
   * Helper function to safely calculate height property of full calendar config
   * @param resources Resource to calculate channel height with
   * @returns
   */
  private calculateHeight(resources: Array<never>) {
    // If there are enough resource just cap with viewport units
    if (resources?.length > 3) {
      return '48vh';
    }

    // Calculate height manually (since fullcalendar doesn't provide a max height)
    // This could be simplified to one line but has been put into multiple variables
    // to aid in self documenting the code. Values in pixels.
    const headerHeightPx = 50;
    const bordersPx = 4;
    const channelHeightPx = 117;
    const resourceCount = resources?.length ?? 0;

    const totalChannelHeightPx = resourceCount * channelHeightPx;
    return `${headerHeightPx + totalChannelHeightPx + bordersPx}px`;
  }

  private cleanupMemory() {
    // Cleanup created nav activation subscriptions
    for (const sub of this.subs) {
      sub.unsubscribe();
      this.subs.delete(sub);
    }

    // Dump defunct navChildren in group
    this.navGroup.dumpChildren();

    // Destroy listeners for onClick and keydown for derived children
    this.listeners.forEach(l => {
      l();
      this.listeners.delete(l);
    });
  }

  // Render callbacks
  /**
   * Handler for the fullcalendar renderResource event
   * @param $event
   */
  private renderResource($event: ResourceEvent) {
    const channel: Channel = $event?.resource?.extendedProps?.channel;

    // Create hook
    const host = this.renderer.createElement('span');
    this.renderer.addClass(host, 'custom-channel-container');

    // Add label
    const label = this.renderer.createElement('span');
    this.renderer.addClass(host, 'custom-channel-label');
    label.innerText = channel?.name;
    host.appendChild(label);

    // Add focusing and enter capabilities
    host.tabIndex = -1;

    /**
     * Helper function to avoid spamming duplicate ActiveChannel events
     */
    const activateChannelIfNotActive = async () => {
      // Get the current channel from state
      const currentChannel = await this.store
        .pipe(select(activeChannel), first())
        .toPromise();

      // If the channels different dispatch the event
      if (channel && channel?.number !== currentChannel?.number) {
        this.store.dispatch(new ActivateChannel({ channel }));
      }
    };

    /*
     * General purpose closure to handle DOM events that should activate a
     * channel
     * @param event
     */
    const activateChannel = event => {
      if (event && event.key && event.key !== 'Enter') return;

      activateChannelIfNotActive();

      // if passKey then prompt for the passKey
      if (channel) {
        // get active event
        this.store.dispatch(new FullscreenEnableAction());
      }
    };

    this.listeners.add(this.renderer.listen(host, 'keydown', activateChannel));

    this.listeners.add(this.renderer.listen(host, 'click', activateChannel));

    this.listeners.add(
      this.renderer.listen(host, 'focus', (e: FocusEvent) => {
        (e?.target as HTMLElement)?.scrollIntoView();
        return;
      })
    );

    const resourceNavigableActivationCallback = () => {
      activateChannelIfNotActive();
    };
    const navigable = new ResourceNavigable(
      host,
      this.navGroup,
      channel?.number,
      resourceNavigableActivationCallback
    );
    this.navGroup.registerNavigable(navigable);

    // Listen for left/right navigation on navigable
    this.subs.add(
      navigable.left$.subscribe(() =>
        this.store.dispatch(findPreviousPreviewInChannel())
      )
    );
    this.subs.add(
      navigable.right$.subscribe(() =>
        this.store.dispatch(findNextPreviewInChannel())
      )
    );

    /**
     * Check if the channel is currently playing
     * @param number
     */
    const checkIfIsActiveChannel = number => {
      if (this.active.disabled) {
        return;
      }

      if (number && $event.resource.id === number) {
        host.focus({ preventScroll: true });
        this.renderer.addClass(host, 'playing');
        navigable.emitActivated(new ActivityStolenEvent(navigable));
      } else {
        this.renderer.removeClass(host, 'playing');
      }
    };

    this.subs.add(
      this.store
        .pipe(
          select(activeChannel),
          map(active => (active ? active.number : null)),
          distinctUntilChanged()
        )
        .subscribe(checkIfIsActiveChannel)
    );

    return { host, navigable, channel, checkIfIsActiveChannel };
  }

  /**
   * Creates a new dom element to track the label
   * @param event
   */
  createDateLabel(event: ChannelEvent) {
    const format = 'hh:mm a';

    // Create top level div
    const host = this.renderer.createElement('div');
    this.renderer.addClass(host, 'program-browser-event-content');

    // Add title
    const title = this.renderer.createElement(`div`);
    this.renderer.addClass(title, 'full-calender-event-title');
    title.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, event.name);
    this.renderer.appendChild(host, title);

    // Add time
    const time = this.renderer.createElement(`div`);
    this.renderer.addClass(time, 'full-calender-event-date-snippet');
    const start = this.datePipe.transform(event.startTime, format);
    const end = this.datePipe.transform(event.endTime, format);
    time.innerHTML = this.sanitizer.sanitize(
      SecurityContext.HTML,
      `${start} - ${end}`
    );
    this.renderer.appendChild(host, time);

    return host;
  }

  forceReload() {
    this.store.dispatch(new RequestChannels({}));
  }

  // Lifecycle hooks
  ngOnDestroy(): void {
    this.cleanupMemory();

    this.root.unregisterNavigable(this.navGroup);
    this.navGroup.destroy();
  }
}
