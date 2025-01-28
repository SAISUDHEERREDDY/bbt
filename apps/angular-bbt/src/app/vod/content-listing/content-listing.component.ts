import { ChangeDetectorRef, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ApplicationState } from '../../reducers';
import {
  delay,
  distinctUntilChanged,
  map,
  switchMap,
  take,
  tap,
  withLatestFrom
} from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Unsubscribable, of } from 'rxjs';
import {
  categories,
  categoriesState
} from '../../reducers/VODListing/selectors/listing';
import { BaseFolder, Folder, Presentation, Video } from '../../content-model';
import { selectContent } from '../../reducers/VODListing/action';
import { ActiveService } from '../../four-directional-navigation/active.service';
import { SafeKeyService } from '../../bbtcommon/safe-key.service';
import { UserInputEvent } from '../../bbtcommon/UserInputEvent';
import { Category } from '../../content-model/category';
import {
  trigger,
  transition,
  query,
  stagger,
  animateChild,
  style,
  animate
} from '@angular/animations';
import { event } from 'jquery';
import { CategorySliderComponent } from '../category-slider/category-slider.component';
@Component({
  selector: 'bbt-content-listing',
  templateUrl: './content-listing.component.html',
  styleUrls: ['./content-listing.component.scss'],
  animations: [
    trigger('categories', [
      transition('void => *', [
        query('@category', stagger(200, animateChild()))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('200ms', style({ opacity: 0, transform: 'translateX(10px)' }))
      ])
    ]),
    trigger('category', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate('200ms', style({ opacity: 1, transform: 'translateX(0px)' }))
      ])
    ])
  ]
})
export class ContentListingComponent {
  @ViewChild(CategorySliderComponent, { static: false }) categorySliderComponent!: CategorySliderComponent;
  @ViewChildren(CategorySliderComponent) sliders!: QueryList<CategorySliderComponent>;
  currentRowIndex: number = 0;  // Track which row is currently focused
  rowCount: number = 0;
  focusSet: boolean = false;
  previousCategoriesLength = 0;
  resultCategories: any [];
  categories$ = this.store.pipe(
    select(categories),
    withLatestFrom(this.activatedRoute.fragment),
    tap(([menus, fragment]) => {
      if (!menus || !fragment) {
        console.log("Menus or fragment is missing");
      }
    }),
    map(([menus, fragment]) => {
      const initialValues = this.parseFragment(fragment);
      let foundFragment = false;
      console.log("menus :-", menus);
      const results = menus?.map((menu, menuIndex) => ({
        ...menu,
        shouldScroll: initialValues.menuId === menu.id,
        menuItems: menu?.menuItems?.map((item, itemIndex) => {
          const shouldScroll = this.isinitialMenuItem(
            fragment,
            (item as any).id || (item as any).itemId,
            menu.id,
            menuIndex === 0,
            itemIndex === 0
          );
          foundFragment = foundFragment || shouldScroll;
  
          // Focus the item you should scroll to for the benefit of the jumbotron
          if (shouldScroll) {
            this.selectAndSetFocused(item);
          }
  
          return {
            ...item,
            shouldScroll
          };
        })
      }));
  
      // Handle the case where no fragment was found
      if (!foundFragment && results) {
        const first = results?.[0]?.menuItems?.[0];
        if (first) first.shouldScroll = true;
      }
  
      // Set the row count
      this.rowCount = results?.length ?? 0;
      this.resultCategories = results;
      console.log("this.resultCategories", this.resultCategories)
      return results;
    })
  );
  
  
  categoryState$ = this.store.pipe(
    select(categoriesState),
    distinctUntilChanged(),  // This will compare by reference, which is fine if immutable state
    tap(status => {
      if (status !== 'loading') {
        this.active.resume();  // Resume only if not in loading state
      }
    }),
    switchMap(status => 
      status === 'loading'
        ? of(status).pipe(delay(500))  // Delay loading state slightly
        : of(status)  // Pass through non-loading states
    )
  );

  constructor(
    private store: Store<ApplicationState>,
    private router: Router,
    public activatedRoute: ActivatedRoute,
    private active: ActiveService,
    private safeKey: SafeKeyService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.active.pause(); // Pause active service while loading
  }
  ngAfterViewInit() {
    if (!this.focusSet) {
      this.setInitialFocus();
    } // Set focus to the first row when the component initializes
  }
  ngDoCheck() {
    // Check if the categories array has changed
    if (this.resultCategories && this.resultCategories.length !== this.previousCategoriesLength) {
      this.previousCategoriesLength = this.resultCategories.length;
      this.currentRowIndex = 0;
      this.focusSet = false;
    }
  }
  ngAfterViewChecked() {
    // Only set the focus once, after the view (including child components) has been fully rendered
    if (!this.focusSet && this.resultCategories?.length > 0) {
      window.addEventListener('load', () => {       
        this.setInitialFocus();
        this.focusSet = true; // Prevent subsequent calls
      });
    }
  }

  
  subs: Set<Unsubscribable> = new Set();

  focused: Partial<Video & BaseFolder & Presentation> & {
    customIcon?: string;
    count?: number;
    id?: number;
    itemId?: number;
  } = null;

  private parseFragment(fragment: string) {
    if (!fragment) {
      return {
        menuId: null,
        contentType: null,
        id: null
      };
    }

    const [_, menuId, contentType, id] = fragment.split('-');

    return {
      menuId: Number.parseInt(menuId, 10),
      contentType,
      id: Number.parseInt(id, 10)
    };
  }

  /**
   * Determines if in the current state the fragment is active
   * @param fragment          The url fragment
   * @param id                The content id
   * @param menuId            The category or folder id
   * @param isFirstMenu       True if this is the first menu false otherwise
   * @param isFirstMenuItem   True if this is the first item in the menu
   * @returns                 True if it matches fragment false otherwise
   */
  private isinitialMenuItem(
    fragment: string,
    id: number,
    menuId: number,
    isFirstMenu: boolean,
    isFirstMenuItem: boolean
  ) {
    if (!fragment) {
      return isFirstMenu && isFirstMenuItem;
    }

    const initValue = this.parseFragment(fragment);

    return id === initValue?.id && menuId === initValue?.menuId;
  }

  selectAndSetFocused(item: Video | BaseFolder | Presentation) {
    this.focused = item as any;

    if (
      (item as Video)?.type === 'Video' ||
      (item as Presentation)?.type === 'Presentation'
    ) {
      this.store.dispatch(
        selectContent({ content: item as Video | Presentation })
      );
    }

    this.changeDetectorRef.detectChanges();
  }

  activateSlider(item: Video | BaseFolder | Presentation, el) {
    this.selectAndSetFocused(item);
    this.triggerParentScroll(el);
  }

  /**
   * Back up one crumb
   * @param crumbs
   * @returns navigation promise
   */
  private backUpOneLevel(crumbs) {
    // no nothing if there are no breadcrumbs to read
    if (!crumbs || crumbs?.length === 0) {
      return;
    }
    const current = this.activatedRoute.snapshot.params;

    // Make fragment to add to backup route
    const fragment = current
      ? `#menu-${current?.menuId}-folder-${current?.category}`
      : '';

    // Note! This check might look like a mistake because it ignores the first crumb
    // This is intentional! The first crumb is a top level category and should
    // return you to root
    const parent = crumbs?.length > 1 ? crumbs[crumbs.length - 1] : null;

    if (!parent?.id) {
      // because we might have navigated down one and viewed something
      //, we need to check for a single parent to go back
      //to the top. if we don't do this, single down won't
      //come back to top correctly -- JG

      if (crumbs?.length === 1) {
        const singleParent = crumbs[0];
        const singleParentFragment = `#menu-${singleParent.id}-folder-${current?.category}`;
        return this.router.navigateByUrl(
          `vod/root/menu/none/selection`
        );
      }

      return this.router.navigateByUrl(
        `vod/root/menu/none/selection${fragment}`
      );
    }

    const topMenu = crumbs?.length > 1 ? crumbs[crumbs.length - 2] : null;

    return this.router.navigateByUrl(
      `vod/${parent?.id}/menu/${topMenu.id}/selection${fragment}`
    );
  }

  triggerParentScroll(el) {
    const parent = el.parentElement;
    const base = el.offsetTop - parent.offsetTop;
    el.parentElement.scrollTo({
      behavior: 'smooth',
      top: base
    });
  }
 
  // Event key handlers
  @HostListener('window:keydown', ['$event'])
  keydown($event: KeyboardEvent) {
    // Go up one level
    
    const key = this.safeKey.tryKey($event);
    console.log("key", key)
    if (key === UserInputEvent.Back || key === 'Escape' || key === 'Backspace') {
      // use take to make access synchronous
      // this.store.pipe(take(1)).subscribe(snapshot => {
      //   const crumbs = snapshot?.VODListing?.categories?.[0];
      //   this.backUpOneLevel(crumbs);
      // });
    } else if  (key === 'ArrowRight' ) {
      this.sliders.toArray()[this.currentRowIndex].focusNext();  // Move focus to the next column in the current row
      //this.focusNext();
    } else if (key === 'ArrowLeft' ) {
      this.sliders.toArray()[this.currentRowIndex].focusPrevious();  // Move focus to the previous column in the current row
      //this.focusPrevious();
    }else if(key === 'ArrowDown'){
      this.focusNextRow()
    }else if(key === 'ArrowUp'){
      this.focusPreviousRow();
    }else if(key === 'Enter'){
      //this.sliders.toArray()[this.currentRowIndex].onEnterNavigate();
    }
  }
  // Set focus to the first slider (row)
  setInitialFocus() {
    const firstSlider = this.sliders.first;
    this.focusSet = true;
    if (firstSlider) {
      firstSlider.currentRowIndex = this.currentRowIndex;
      firstSlider.focusFirstItem();
    }
  }
  
  // Move focus to the next row
  focusNextRow() {
    if (this.currentRowIndex < this.rowCount - 1) {
      this.currentRowIndex++;
      this.scrollToRow(this.currentRowIndex);
      
      // Access the next slider
      const nextSlider = this.sliders.toArray()[this.currentRowIndex];
      if (nextSlider) {
        nextSlider.focusFirstItem(); // Focus on the first item in the new row
      }
    }
  }
   // Move focus to the previous row
   focusPreviousRow() {
    if (this.currentRowIndex > 0) {
      this.currentRowIndex--;
      this.scrollToRow(this.currentRowIndex);
      
      // Access the previous slider
      const prevSlider = this.sliders.toArray()[this.currentRowIndex];
      if (prevSlider) {
        prevSlider.focusFirstItem(); // Focus on the first item in the previous row
      }
    }
  }

  scrollToRow(index: number): void {
    const targetRowId = `category-row-${index}`; // Construct the target row's ID
    const targetElement = document.getElementById(targetRowId); // Get the element by its ID
  
    if (targetElement) {
      // Scroll to the target element smoothly
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error('Target element not found');
    }
  }

}