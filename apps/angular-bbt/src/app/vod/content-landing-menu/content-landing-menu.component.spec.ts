import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ContentLandingMenuComponent } from './content-landing-menu.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ApplicationState } from '../../reducers';
import { TrackTypes, VideoContent } from '../../bbtcommon/content';
import { INavigableGroup } from '../../four-directional-navigation/navigable-group';
import { INavigable } from '../../four-directional-navigation/navigable';
import { ActivityStolenEvent } from '../../four-directional-navigation/activity-stolen-event';
import { Observable } from 'rxjs';

describe('ContentLandingMenuComponent', () => {
  let component: ContentLandingMenuComponent;
  let fixture: ComponentFixture<ContentLandingMenuComponent>;
  let initialState: Partial<ApplicationState>;
  let store: MockStore<ApplicationState>;

  beforeEach(
    waitForAsync(async () => {
      initialState = {
        pseudoFullscreen: {
          enabled: true
        }
      };
    })
  );

  async function spinUpApp(state: ApplicationState) {
    @Component({
      selector: 'bbt-navigable-container',
      template: '<ng-content></ng-content>',
      exportAs: 'navigableGroup'
    })
    class NavStubContainer implements INavigableGroup {
      readonly activeChild: INavigable;
      readonly onActivate: Observable<ActivityStolenEvent>;
      priority: number;
      readonly symbol: symbol;

      activate(): INavigable {
        return undefined;
      }

      canActivate(): boolean {
        return false;
      }

      deactivate(): INavigable {
        return undefined;
      }

      down(): INavigable {
        return undefined;
      }

      emitActivated(event: ActivityStolenEvent): void {}

      left(): INavigable {
        return undefined;
      }

      next(): INavigable {
        return undefined;
      }

      previous(): INavigable {
        return undefined;
      }

      registerNavigable(nav: INavigable): void {}

      right(): INavigable {
        return undefined;
      }

      unregisterNavigable(nav: INavigable): void {}

      up(): INavigable {
        return undefined;
      }
    }

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore<ApplicationState>({
          initialState: state
        })
      ],
      declarations: [ContentLandingMenuComponent, NavStubContainer],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(ContentLandingMenuComponent);
    component = fixture.componentInstance;
  }

  beforeEach(() => {
    // fixture = TestBed.createComponent(ContentLandingMenuComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', async () => {
    await spinUpApp({});
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('with a video', () => {
    let video, listingState, state, englishCaptions, spanishCaptions;

    beforeEach(() => {
      englishCaptions = {
        kind: TrackTypes.Captions,
        label: 'English',
        srclang: 'en',
        src: '/opt/VA/cmscontent/en.vtt'
      };

      spanishCaptions = {
        kind: TrackTypes.Captions,
        label: 'Spanish',
        srclang: 'es',
        src: '/opt/VA/cmscontent/es.vtt'
      };

      // Set content to video
      video = {
        descname: 'Fake Vid',
        thumbpath: '',
        type: 'video',
        duration: '00:33:41',
        timestamp: '2019-10-30T02:37:00-06:00',
        full_path: '/opt/VA/cmscontent/19011_tsp_EEFS.m3u8',
        passkey: false,
        path: 'category[0]/content[0]',
        longdesc: '',
        tracks: [
          {
            kind: TrackTypes.Audio,
            label: 'English',
            srclang: 'en'
          },
          {
            kind: TrackTypes.Audio,
            label: 'English',
            srclang: 'es'
          },
          englishCaptions,
          spanishCaptions
        ]
      } as VideoContent;
      listingState = {
        selectedContent: {
          params: {
            category: '',
            content: 'category[0]/content[0]'
          },
          selected: video,
          users: []
        },
        page: {
          params: {
            category: ''
          },
          contents: {
            'category[0]': {
              name: 'HDTV Valid VTT',
              path: 'category[0]',
              thumb: '/images/missing_thumb.png',
              passkey: false,
              children: [video],
              orderBy: 1
            }
          }
        }
      };
      state = {
        ...initialState,
        VODListing: { ...listingState }
      };
    });

    it('should default captions to the global language if available', async () => {
      await spinUpApp({
        ...state,
        i18n: { global: { code: 'es', label: 'SPANISH' } }
      });
      fixture.detectChanges();
      expect(component.preferredCaptions.value).toEqual(spanishCaptions);
    });

    it('should default to none if there is no global language', async () => {
      await spinUpApp({
        ...state,
        i18n: null
      });
      fixture.detectChanges();
      expect(component.preferredCaptions.value).toBeFalsy();
    });

    it('should default captions to first if global language is not available', async () => {
      state = {
        ...state,
        i18n: { global: { code: 'hu', label: 'Hungarian' } }
      };
      await spinUpApp(state);
      fixture.detectChanges();
      expect(component.preferredCaptions.value).toEqual(englishCaptions);
    });

    it('should default normally if default happens to be first', async () => {
      state = {
        ...state,
        i18n: { global: { code: 'en', label: 'English' } }
      };
      await spinUpApp(state);
      fixture.detectChanges();
      expect(component.preferredCaptions.value).toEqual(englishCaptions);
    });

    it('should not re-emit captions if updates cause the same result', async () => {
      state = {
        ...state,
        i18n: { global: { code: 'es', label: 'SPANISH' } }
      };
      await spinUpApp(state);
      component.preferredCaptions.setValue(spanishCaptions);
      const spy = spyOn(component.preferredCaptions, 'setValue');
      fixture.detectChanges();
      expect(spy).not.toHaveBeenCalled();
    });
  }); // End of video tests
});
