import { ComponentPortal } from '@angular/cdk/portal';
import { Subscribable, Unsubscribable } from 'rxjs';
import { OverlayRef } from '@angular/cdk/overlay';
import { ComponentRef } from '@angular/core';

export class OverlayManager<T> {
  private subscriptions = new Set<Unsubscribable>();

  public readonly componentRef: ComponentRef<T>;

  get instance() {
    return this.componentRef.instance;
  }

  constructor(
    public readonly ref: OverlayRef,
    public readonly portal: ComponentPortal<T>
  ) {
    this.componentRef = ref.attach(portal);
  }

  /**
   * Adds a subscription to be tracked and destroyed with the overlay
   * @param sub The subscribable or unsubscribable to track
   */
  trackSub(sub: Subscribable<any> | Unsubscribable) {
    if (typeof (sub as Subscribable<any>).subscribe === 'function') {
      this.subscriptions.add((sub as Subscribable<any>).subscribe());
    } else if (typeof (sub as Unsubscribable).unsubscribe === 'function') {
      this.subscriptions.add(sub as Unsubscribable);
    }
  }

  /**
   * Hooks a Subscribers output to an input
   */
  nextToInput<S extends keyof T>(input: keyof T, s: Subscribable<T[S]>) {
    this.subscriptions.add(s.subscribe(x => (this.instance[input] = x)));
  }

  onOutput(output: keyof T, fn: (any) => void): Unsubscribable {
    if (!(this.instance[output] as any).subscribe) {
      throw new Error(
        `Tried to subscribe to ${output} but it was not subscribable`
      );
    }

    const target: Subscribable<any> = this.instance[output] as any;

    const unsubscribable = target.subscribe(fn);
    this.subscriptions.add(unsubscribable);

    return unsubscribable;
  }

  /**
   * Cleans up everything overlay related
   */
  destroy() {
    // Clear subscriptions
    this.subscriptions.forEach(u => u.unsubscribe());
    this.subscriptions.clear();

    // Clean up overlay
    this.ref.detach();
    this.ref.dispose();
  }
}
