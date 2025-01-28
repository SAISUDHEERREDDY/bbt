export class PriorityMap<T> implements Iterable<T> {
  private _length = 0;

  get length() {
    return this._length;
  }

  private storage = new Map<number, T[]>();

  /**
   * The private helper function exists so that eventually a bit of caching can
   * be done internally here to prevent the key from having to be reiterated and
   * sorted (since this is potentially expensive).
   */
  private getSortedPriorities() {
    const priorities = this.storage.keys();
    const sorted = [...priorities].sort((a, b) => {
      const aIsNullish = a === null || typeof a === 'undefined';
      const bIsNullish = b === null || typeof b === 'undefined';

      // Handle nullish cases carefully
      if (aIsNullish && bIsNullish) {
        return 0;
      }

      if (aIsNullish) {
        return 1; // Sort b before a because a is nothing
      }

      if (bIsNullish) {
        return -1;
      }

      return a - b;
    });

    return sorted;
  }

  /**
   * Adds elements to the set
   * @param priority  The priority of the elements being added
   * @param elements  The elements to add
   * @returns         A reference to the PriorityMap
   */
  set(priority: number, ...elements: T[]) {
    this.storage.set(
      priority,
      !this.storage.has(priority)
        ? [...elements]
        : [...this.storage.get(priority), ...elements]
    );

    if (elements.length) {
      this._length += elements.length;
    }

    return this;
  }

  /**
   * Attempts to delete the element from the set at the priority supplied
   * @param priority  The priority to delete the element from
   * @param element   The element to delete
   * @returns         True if the element was found and deleted otherwise false
   */
  delete(priority: number, element: T): boolean {
    const elements = this.storage.get(priority);
    if (elements === undefined) {
      return false;
    }

    const index = elements.indexOf(element);
    if (index === -1) {
      return false;
    } else {
      this.storage.get(priority).splice(index, 1);
      --this._length;
      return true;
    }
  }

  [Symbol.iterator](): Iterator<T> {
    let priorityIndex = null;
    let localizedIndex = null;

    return {
      next: () => {
        const priorities = this.getSortedPriorities();

        // Handle init
        if (priorityIndex === null) {
          if (priorities.length === 0) {
            return { done: true, value: null };
          }

          priorityIndex = 0;

          // Find the first priority with anything in it
          while (this.storage.get(priorities[priorityIndex]).length === 0) {
            ++priorityIndex;

            // Guard against all priorities empty case
            if (priorityIndex >= priorities.length) {
              return { done: true, value: null };
            }
          }

          // Initialize indexes
          localizedIndex = 0;
        }
        // Handle end of an array
        else if (
          this.storage.get(priorities[priorityIndex]).length <=
          localizedIndex + 1
        ) {
          // Go to next priority
          ++priorityIndex;
          // Make Sure we have not overflowed priority
          if (priorities.length <= priorityIndex) {
            return { done: true, value: null };
          }
          // Find the first priority with anything in it
          while (this.storage.get(priorities[priorityIndex]).length === 0) {
            ++priorityIndex;
            if (priorities.length <= priorityIndex) {
              return { done: true, value: null };
            }
          }

          localizedIndex = 0;
        }
        // Handle next index in array
        else {
          ++localizedIndex;
        }

        return {
          value: this.storage.get(priorities[priorityIndex])[localizedIndex],
          done: false
        };
      }
    };
  }

  /**
   * Gets the element at the given index in the list
   * @param index the index to lookup
   * @returns     returns the element at the index
   */
  getIndex(index: number) {
    // TODO: This is a wildly inefficient way of doing this. Make it better.
    return [...this][index];
  }

  /**
   * Searches through the PriorityMap and finds the element that matches the
   * predicate function supplies
   * @param fn  A predicate function to test if this is the element you are looking for
   * @returns   The index of the first element that satisfies the predicate
   */
  findIndex(fn: (value: T, index: number, obj: T[]) => unknown): number {
    return [...this].findIndex(fn);
  }
}
