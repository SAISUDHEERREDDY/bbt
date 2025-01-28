import { INavigable } from './navigable';

/**
 * Implement this interface to indicate that you can shift in the orthogonal
 * directions
 */
export interface OrthogonalShifter {
  /**
   * Should dictate what happens when the up action is taken
   */
  up(): INavigable;
  /**
   * Should dictate what happens when the down action is taken
   */
  down(): INavigable;

  /**
   * Should dictate what happens when the left action is taken
   */
  left(): INavigable;

  /**
   * Should dictate what happens when the right action is taken
   */
  right(): INavigable;
}
