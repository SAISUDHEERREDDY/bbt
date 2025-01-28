// The selectors for this feature are sufficiently varied and complex that
// they have been broken into multiple files.
// Selectors for a whole listing of content go here.
import { ApplicationState } from '../../index';
import { createSelector } from '@ngrx/store';

/**
 * Top level selector to select the listing from the state
 * @param state
 */
export const contentListing = function (state: ApplicationState) {
  return state?.VODListing;
};

/**
 * Selects the current page of content
 */
export const contentPage = createSelector(contentListing, s => s?.page);

/**
 * Selects the human readable names given a path
 */
export const selectNameInPath = createSelector(contentPage, (page, props) => {
  if (!props.path) {
    return null;
  }

  const selection = page?.contents[props.path];
  return selection ? selection : null;
});

/**
 * Selects the categories for the current page
 */
export const categories = createSelector(contentListing, x => x?.categories);

/**
 * Category status
 */
export const categoriesState = createSelector(
  contentListing,
  x => x.categoriesState
);
