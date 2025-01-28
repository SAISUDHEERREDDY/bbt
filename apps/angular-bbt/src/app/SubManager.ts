import { Subscribable, SubscriptionLike, Unsubscribable } from 'rxjs';

export class SubManager {
  private subscriptions = new Map<Symbol, Unsubscribable>();

  /**
   * Add a Subscribable or Unsubscribable to track
   * @param sub
   */
  add(sub: Subscribable<any> | Unsubscribable): Symbol {
    if (typeof (sub as Subscribable<any>).subscribe === 'function') {
      const key = Symbol();
      this.subscriptions.set(key, (sub as Subscribable<any>).subscribe());
      return key;
    } else if (typeof (sub as Unsubscribable).unsubscribe === 'function') {
      const key = Symbol();
      this.subscriptions.set(key, sub as Unsubscribable);
      return key;
    }
  }

  /**
   * Adds many subscriptions to be tracked
   * @param subs
   */
  addMany(
    ...subs: Array<
      | Subscribable<any>
      | Unsubscribable
      | Iterable<Subscribable<any> | Unsubscribable>
    >
  ): Symbol[] {
    const symbols = [];
    for (const sub of subs) {
      if (sub[Symbol.iterator] === 'function') {
        // recurse on iterables
        symbols.push(...this.addMany(sub));
      } else {
        // Handle individual
        symbols.push(this.add(sub as Subscribable<any> | Unsubscribable));
      }
    }
    return symbols;
  }

  // Common use cases
  /**
   * Subscribes and binds a function to the next event
   */
  onNext<T>(s: Subscribable<T>, fn: (T) => void): Symbol {
    return this.add(s.subscribe(fn));
  }

  /**
   * Binds the output of x to a target of a property
   * @param target
   * @param property
   * @param s
   */
  bindNext<T, S extends keyof T>(
    s: Subscribable<T[S]>,
    target: T,
    property: keyof T
  ): Symbol {
    return this.onNext(s, x => (target[property] = x));
  }

  /**
   * Unsubscribes from the subscription keyed to the Symbol
   * @param key
   */
  unsubscribe(key: Symbol) {
    if (!this.subscriptions.has(key)) {
      throw new Error('Tried to remove subscription, but it was not tracked');
    }

    const sub = this.subscriptions.get(key);
    // If it is not already unsubscribed, unsubscribe
    if (!(sub as SubscriptionLike).closed) {
      sub.unsubscribe();
    }

    this.subscriptions.delete(key);
  }

  /**
   * Unsubscribes from all tracked subscriptions
   */
  destroy() {
    // Unsubscribe from all subscriptions
    for (const key of this.subscriptions.keys()) {
      this.unsubscribe(key);
    }
  }
}
