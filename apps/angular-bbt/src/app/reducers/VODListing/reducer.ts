import { VODListingState } from './state';
import {
  LoginUserAction,
  LogoutUserAction,
  receiveCategories,
  ReceiveVODPageAction,
  requestCategories,
  requestVODContent,
  selectContent,
  setCaptionLanguage,
  setPreferredAudio,
  setPreferredCaption,
  setPresentationIndex,
  shiftPresentationIndex,
  updateAudioTrack,
  updateAudioTracks,
  VODListingAction
} from './action';
import { createReducer, on } from '@ngrx/store';
import { VODListingTrigger } from './actions/VODListingTrigger.enum';
import { Presentation, Video } from '../../content-model';

const simpleReducer = createReducer(
  {} as VODListingState,
  on(setPresentationIndex, (state, { index }) => ({
    ...state,
    selectedContent: {
      ...state.selectedContent,
      presentationIndex: index
    }
  })),
  on(shiftPresentationIndex, (state, action) => {
    const items = (state?.selectedContent?.selected as Presentation)?.items;

    if (items.length <= 0) {
      return { ...state }; // Do nothing if there are no files
    }

    // Default current index to zero if there is no state
    const safeIndex = state?.selectedContent?.presentationIndex ?? 0;

    // Handle special shifts
    let purposedIndex: any;
    if (action.shift === 'first') {
      purposedIndex = 0;
    } else if (action.shift === 'last') {
      purposedIndex = items.length - 1;
    } else {
      purposedIndex = action.shift + safeIndex;
    }

    // Adjust index if it is out of bounds
    let adjustedIndex: number;
    if (purposedIndex < 0) {
      adjustedIndex = 0;
    } else if (purposedIndex >= items.length) {
      adjustedIndex = items.length - 1;
    } else {
      adjustedIndex = purposedIndex;
    }

    // Don't update state if the index is the same
    if (state?.selectedContent?.presentationIndex === adjustedIndex) {
      return { ...state };
    }

    return {
      ...state,

      selectedContent: {
        ...state.selectedContent,
        presentationIndex: adjustedIndex,

        // null out things from potential previous
        fileAudioTracks: undefined
      }
    };
  }),

  // Audio Tracks

  // Note:  It might be tempting to default audioTrack here. Do not.
  //        Let the selector do this.
  on(updateAudioTracks, (state, { tracks }) => ({
    ...state,
    selectedContent: {
      ...state.selectedContent,
      fileAudioTracks: tracks
    }
  })),

  on(updateAudioTrack, state => ({
    ...state,
    selectedContent: {
      ...state.selectedContent
    }
  })),

  on(setPreferredAudio, (state, action) => {
    return {
      ...state,
      selectedContent: {
        ...state.selectedContent,
        preferredAudio: {
          ...action
        }
      }
    };
  }),

  on(setPreferredCaption, (state, action) => {
    const { kind, label, srclang, src } = action;

    return {
      ...state,
      selectedContent: {
        ...state.selectedContent,
        preferredCaption: { kind, label, srclang, src }
      }
    };
  }),

  on(setCaptionLanguage, (state, action) => {
    return {
      ...state,
      selectedContent: {
        ...state.selectedContent,
        captionLanguageCode: action.code
      }
    };
  }),

  on(receiveCategories, (state, action) => {
    return {
      ...state,
      categories: action.categories,
      categoriesState: 'loaded'
    };
  }),

  on(requestVODContent, (state, action) => {
    return {
      ...state,
      selectedContent: {
        params: {
          contentType: action.contentType,
          itemId: action.itemId
        },
        selected: null,

        // null out content specific fields
        presentationIndex: null,
        fileAudioTracks: null
      }
    };
  }),

  on(selectContent, (state, action) => {
    const content: Presentation & Video = action.content as unknown as any;
    return {
      ...state,
      selectedContent: {
        ...state?.selectedContent,
        params: {
          contentType:(content as any)?.type === 'Video'
          ? 'local': 'content',
            // ((content as any).type === 'Video' && typeof content.pifId) !==
            // 'number'
            //   ? 'local'
            //   : 'content',
          itemId: content.itemId
        },
        selected: content,
        // Initialize presenation index to zero if there is no content
        presentationIndex: content?.items?.length > 0 ? 0 : null
      }
    };
  }),

  on(requestCategories, (state, action) => {
    return {
      ...state,
      categories: undefined,
      categoriesState: 'loading'
    };
  })
);

export function vodListingReducer(
  state: VODListingState,
  action: VODListingAction
): VODListingState {
  if (!action) {
    return { ...state }; // Guard against bad actions
  }

  switch (action.type) {
    // User login reducers
    // Important note: While it might not feel like these belong here, login is
    // keyed to the content itself. When the content changes the users logged in
    // are dumped. As such they are stored with the VOD concerns.
    case VODListingTrigger.LoginUser:
      return {
        ...state,
        selectedContent: {
          ...state.selectedContent,
          users: [
            ...state.selectedContent.users,
            (action as LoginUserAction).payload.id
          ]
        }
      };
    case VODListingTrigger.LogoutUser:
      const logoutActions = action as LogoutUserAction;
      const users = [...state.selectedContent.users];
      const userIndex = users.indexOf(logoutActions.payload.id);

      if (userIndex !== -1) {
        users.splice(userIndex, 1);
      }
      return {
        ...state,
        selectedContent: {
          ...state.selectedContent,
          users
        }
      };
    case VODListingTrigger.LogoutAll:
      return {
        ...state,
        selectedContent: {
          ...state.selectedContent,
          users: []
        }
      };

    // Page Reducers
    case VODListingTrigger.RequestPage:
      return {
        ...state,
        page: null
      };
    case VODListingTrigger.ReceivedPage:
      return {
        ...state,
        page: (action as ReceiveVODPageAction).payload
      };

    case VODListingTrigger.RequestContent:
    default:
      return simpleReducer(state, action);
  }
}
