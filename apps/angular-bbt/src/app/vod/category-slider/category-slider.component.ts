import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  ViewChildren,
  ElementRef,
  QueryList,
  ViewChild,
  ChangeDetectorRef
} from '@angular/core';
import { Video, BaseFolder, Presentation, Folder } from '../../content-model';
import { MenuItemCollection } from '../../content-model/menu-item-collection';
import { PanningContainerComponent } from '../../panning/panning-container.component';
import { Subscription, Unsubscribable, of } from 'rxjs';
import { I18nService } from '../../i18n/i18n.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'apps/angular-bbt/src/environments/environment';
import { ConfigService } from '../../services/config.service';
import { Category } from '../../content-model/category';
 
@Component({
  selector: 'bbt-category-slider',
  templateUrl: './category-slider.component.html',
  styleUrls: ['./category-slider.component.scss']
})
export class CategorySliderComponent implements OnInit{
  @ViewChildren('linkElement') linkElements!: QueryList<ElementRef>;
  @Input() rowIndex: number;
  @Input() currentRowIndex: number;
  @Input() isFocused: boolean = false;  // Check if this row is focused
  @Input() category: MenuItemCollection & { shouldScroll?: boolean };
  @Output() contentFocused = new EventEmitter<Video | Presentation | Folder>();
   categories: any[];
  @Output() contentActivated = new EventEmitter<
    Video | Presentation | Folder
  >();
  itemsPerPage = 4;
  currentPageIndex = 0;
  currentColumnIndex: number = 0;
  currentCategoryId: number = 0;
  locale$ = this.i18nService.currentLocale$;
  //panner: PanningContainerComponent;
  pathMap = new Map<number, string>();
  breadcrumbPath:any;
  jsonFilePath:string="";
  constructor(private i18nService: I18nService, private cdr: ChangeDetectorRef,private http: HttpClient,private configService: ConfigService) {
    document.body.style.overflow = 'hidden';
    this.jsonFilePath = this.configService.getConfigValue('JsonFilePath');
  }
  ngOnInit(): void {
    this.http.get<any[]>(this.jsonFilePath).subscribe(data => {
      // Find all categories without `menuItems`
                      const specialMenuItems = data['categories'].filter(
                        category => !category.menuItems
                      ).map(category => ({
                        ...category
                      }));
                  // Create the "Special Categories" object
                  if (specialMenuItems.length > 0) {
                    const specialCategorie: Category = {
                      id: 100, // A unique ID for the special category
                     
                      name: "Video On Demand",
                    // categories: [], // Ensure valid `categories` property
                      menuItems: specialMenuItems as unknown as Array<Video | Presentation | Folder>, // Cast to the expected type
                    // breadcrumbs: [], // Ensure valid `breadcrumbs` property
                    };
                    console.log("specialCategorie", specialCategorie)
                    // Add the special category to the main categories
                    data['categories'].push(specialCategorie);
     
     
                        // Remove original categories without menuItems
                        data['categories'] = data['categories'].filter(
                          category => category.menuItems && category.menuItems.length > 0
                        );
                      }
      this.categories = data['categories'];
      console.log("data", this.categories ); // Check the loaded categories
      this.breadcrumbPath = this.getCategoryPath(this.category.id, this.categories);
     
     
      console.log("currentPath", this.breadcrumbPath);
    });
   
  }
 
  ngAfterViewInit() {
    // Set initial focus on the first a tag
    console.log("this.category", this.category);
 
    if (this.isFocused) {
      this.focusFirstItem();
    }
  }
  focusFirstItem(): void {  
    // const focusState = localStorage.getItem('focusState');
    // if (focusState) {
    //   const { currentColumnIndex } = JSON.parse(focusState);
    //   this.currentColumnIndex = currentColumnIndex;
    // } else {
      this.currentColumnIndex = 0;
   // }
     // Ensure it's the first column
    this.focusOnElement(this.currentColumnIndex); // Focus the first element
    this.updateCurrentCategoryId(); // Update any category logic if needed
    this.saveCurrentFocusState();
  }
 
  focusNext(): void {
    if (this.currentColumnIndex < this.category.menuItems.length - 1) {
      this.currentColumnIndex++;
      this.saveCurrentFocusState();
      const currentPage = Math.floor(this.currentColumnIndex / this.itemsPerPage);
 
    if (currentPage !== this.currentPageIndex) {
      this.currentPageIndex = currentPage;
      // Trigger panning to the current page
      console.log("this.panner focusNext()")
     // this.panner?.page(currentPage);
    }
    } else {
      return;
      this.currentColumnIndex = 0; // Wrap around to first item if at the end
    }
    this.focusOnElement(this.currentColumnIndex);
    this.updateCurrentCategoryId();
  }
 
  focusPrevious(): void {
    if (this.currentColumnIndex > 0) {
      this.currentColumnIndex--;
      this.saveCurrentFocusState();
      const currentPage = Math.floor(this.currentColumnIndex / this.itemsPerPage);
 
      if (currentPage !== this.currentPageIndex) {
        this.currentPageIndex = currentPage;
        // Trigger panning to the current page
        console.log("this.panner focusPrevious()")
        //this.panner?.page(currentPage);
      }
    } else {
      return
      this.currentColumnIndex = this.category.menuItems.length - 1; // Wrap to last item if at the start
    }
    this.focusOnElement(this.currentColumnIndex);
    this.updateCurrentCategoryId();
  }
 
 
  // Scroll to the current item
  scrollToCurrentItem(): void {
    const container = document.querySelector('.horizontal-slider-container');
    const targetItem = container?.children[this.currentColumnIndex];
    if (targetItem && container) {
      // Scroll to the target item horizontally
      targetItem.scrollIntoView({ behavior: 'smooth', inline: 'nearest' });
    }
  }
  focusOnElement(index: number) {
    this.cdr.detectChanges();
    const elementsArray = this.linkElements.toArray();
 
    if (elementsArray[index]) {
      elementsArray[index].nativeElement.focus();
    } else {
      console.log("No element found at index", index);
    }
  }
  updateCurrentCategoryId(): void {
    const currentMenuItem = this.category.menuItems[this.currentColumnIndex];
    // Check if id or itemId is present and set the currentCategoryId accordingly
    if (currentMenuItem) {
      // console.log("currentMenuItem", currentMenuItem);
     
      this.currentCategoryId = currentMenuItem["id"] || currentMenuItem["itemId"];
      // console.log(this.currentCategoryId, "currentCategoryId");      
      this.selectAndSetFocused(currentMenuItem);
    } else {
      this.currentCategoryId = null; // Handle case when no valid item is found
    }
  }
  saveCurrentFocusState() {
    console.log("Current Row Index ::", this.currentRowIndex , "Current Column Index ::", this.currentColumnIndex)
    const focusState = {
        currentRowIndex: this.currentRowIndex,
        currentColumnIndex: this.currentColumnIndex
    };
    //localStorage.setItem('focusState', JSON.stringify(focusState));
}
  selectAndSetFocused(item: Video | BaseFolder | Presentation) {
   
    this.contentFocused.emit(item as Video | Presentation | Folder);
  }
 
  selectFocusAndPan(
    item: Video | BaseFolder | Presentation,
    panner: PanningContainerComponent,
    index: number
  ) {
    console.log("selectFocusAndPan()")
    this.selectAndSetFocused(item);
    panner.shiftToIndex(index);
    this.contentActivated.emit(item as Video | Presentation);
  }
  getCategoryPath(categoryId: number, categories: any[]): { id: number, name: string }[] {
    const findPath = (categoryId: number, categories: any[], path: { id: number, name: string }[] = []): { id: number, name: string }[] => {
      for (const category of categories) {
        const currentPath = [...path];
        currentPath.push({ id: category.id, name: category.name });
  
        // Match the category by id
        if (category.id === categoryId) {
          return currentPath;
        }
  
        // Traverse nested menuItems if they exist
        if (category.menuItems && category.menuItems.length) {
          const foundPath = findPath(categoryId, category.menuItems, currentPath);
          if (foundPath.length) {
            return foundPath;
          }
        }
      }
      return [];
    };
  
    // Filter out the root-level categories to ensure starting from the correct level
    const rootCategory = categories.find(category => category.id === categoryId);
    if (rootCategory) {
      return [{ id: rootCategory.id, name: rootCategory.name }];
    }
  
    // Start searching recursively
    return findPath(categoryId, categories);
  }
 
}