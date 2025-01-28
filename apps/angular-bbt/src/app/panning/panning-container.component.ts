import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {
  animate,
  AnimationBuilder,
  AnimationFactory,
  AnimationPlayer,
  style
} from '@angular/animations';
import { PanningItemDirective } from './panning-item.directive';

@Component({
  selector: 'panning-container',
  exportAs: 'panning-container',
  template: `
    <div class="panning-container-wrapper" #wrapper>
      <ul class="carousel-inner" #carouselInner [style.width]="containerWidth">
        <li *ngFor="let item of items" class="carousel-item" #consumedItem>
          <ng-container [ngTemplateOutlet]="item.tpl"></ng-container>
        </li>
      </ul>
    </div>
  `,
  styles: [
    `
      ul.carousel-inner {
        display: flex;
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .panning-container-wrapper {
        overflow: hidden;
        width: 100vw;
      }

      .carousel-item:first-child {
        margin-left: 75px;
      }
    `
  ]
})
export class PanningContainerComponent implements AfterViewInit {
  // Children
  @ContentChildren(PanningItemDirective)
  items: QueryList<PanningItemDirective>;
  @ViewChildren('consumedItem', { read: ElementRef })
  private itemsElements: QueryList<ElementRef>;
  @ViewChild('carouselInner') private carousel: ElementRef;
  @ViewChild('wrapper') private wrapper: ElementRef;
  // Internals

  /**
   * The width of the items in this list. It is assumed that they are all the same size.
   */
  private itemWidth: number = 0;

  get offset() {
    return this.currentSlide * this.itemWidth;
  }

  get firstItemWidth() {
    return this.itemWidth;
  }

  containerWidth = '0px';

  /**
   * The slide that we are currently on
   */
  private currentSlide = 0;

  /**
   * Safe accessor for current index
   */
  get currentIndex() {
    return this.currentSlide;
  }

  // Member methods
  /**
   * Shifts the list by some amount
   */
  public async shift(shifter: number) {
    return this.shiftToIndex(this.currentSlide + shifter);
  }

  /**
   * Shifts the list to a particular index
   */
  public shiftToIndex(index: number, timing = '350ms ease-in-out') {
    // prevent underflow
    // if (index < 0) {
    //   return;
    // }
    // Determine the new candidiate
    const candidate = (index + this.items.length) % this.items.length;

    // Uncomment the below to prevent over or underflow explicitly
    //if (candidate >= this.items.length || candidate < 0) return; // Bail if out of bounds

    // Calculate and update the offset
    this.currentSlide = candidate;

    // Bail if there isn't an element to animate
    if (!this.carousel?.nativeElement) {
      return;
    }

    /**
     * Force wrapper scrolling to far left to help browsers without focus options
     */
    this.wrapper?.nativeElement?.scrollTo({ left: 0 });

    // Create and play the animation
    const factory = this.builder.build([
      animate(timing, style({ transform: `translateX(-{{offset}}px)` }))
    ]);
    const player: AnimationPlayer = factory.create(
      this.carousel?.nativeElement,
      { params: { offset: this.offset } }
    );

    player.play();
  }

  /**
   * Does a larger scroll (or page) for the number of items displayed on the screen, minimum one
   */
  public async page(pagesToShift) {
    const pageSize =
      this.wrapper?.nativeElement?.getBoundingClientRect()?.width;
    const shiftSize = Math.max(1, Math.floor(pageSize / this.itemWidth));
    const purposed = this.currentIndex + pagesToShift * shiftSize;

    // Handle page underflow
    if (purposed < 0) {
      // Page to zero if you would underflow and aren't currently at zero
      if (this.currentIndex !== 0) {
        return this.shiftToIndex(0);
      }
    }

    // Handle page overflow
    if (purposed >= this.items?.length) {
      // Page would overflow, but you aren't on the last element go to it
      if (this.currentIndex !== this.items?.length - 1) {
        return this.shiftToIndex(this.items?.length - 1);
      }

      // If overflowing wrap to the beginning
      return this.shiftToIndex(0);
    }

    return this.shiftToIndex(purposed);
  }

  constructor(
    private builder: AnimationBuilder,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  // Lifecycle hooks
  ngAfterViewInit() {
    
    const width8k = 7680;
    // For some reason only here I need to add setTimeout, in my local env it's working without
    this.itemWidth =
      this.itemsElements?.first?.nativeElement?.getBoundingClientRect?.()
        ?.width ?? 0;
    // Sets container width width generous allowance
    this.containerWidth =
      this.itemWidth * (this.items?.length ?? 0) + width8k * 3 + 'px';
    this.changeDetectorRef.detectChanges(); // Force a change detection so that container width gets applied
  }
}
