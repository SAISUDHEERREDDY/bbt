import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable, of } from 'rxjs';
import { Content } from '../bbtcommon/content';
import { VODMenu } from './VODMenu';
import { map, switchMap } from 'rxjs/operators';
import { Folder, Presentation, RawFolder, Video } from '.';
import { MenuItemCollection } from './menu-item-collection';
import { CategoryCollection } from './category-collection';
import { environment } from '../../environments/environment';
import { Category } from './category';
import { ConfigService } from '../services/config.service';

export interface PasskeyContentResponse {
  authenticated: 'true' | 'false';
  response: 'success' | 'error';
  errorText: string;
}

@Injectable({
  providedIn: 'root'
})
export class OnDemandContentService {
  jsonFilePath: string = "";
  //playerManifestXmlPath: string = "";

  constructor(private http: HttpClient, private configService: ConfigService) {

  }
  private initializeConfig(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.configService.loadConfig()) {
        this.configService.loadConfig().then(() => {
          this.jsonFilePath = this.configService.getConfigValue('JsonFilePath') || '';
          // this.playerManifestXmlPath = this.configService.getConfigValue('PlayerManifestXmlPath') || '';
          
          resolve();
        }).catch((error) => {
          console.error('Failed to load configuration:', error);
          reject(error);
        });
      } else {
        this.jsonFilePath = this.configService.getConfigValue('JsonFilePath') || '';
        //this.playerManifestXmlPath = this.configService.getConfigValue('PlayerManifestXmlPath') || '';
        resolve();
      }
    });
  }

  /**
   * An object that handles the simple cases for the type mapping
   */
  private readonly typeMap = {
    Presentation: 'content',
    Folder: 'folder'
  };

  /**
   *
   * @param item The potential folder to fix the type of
   * @returns The item with fixes types
   */
  private fixFolderType(
    item: Folder | Video | RawFolder | Presentation
  ): Folder | Presentation | Video {
    return {
      ...item,
      type: item?.type?.startsWith?.('Folder') ? 'Folder' : item?.type
    } as any;
  }
  private findById(categories: Array<{ menuItems: any[] }>, id: number): any {
    if (!Array.isArray(categories)) return null;

    for (const category of categories) {
      if (category["itemId"] === id) {
        return category; // Match found
      }
      const menuItems = category?.menuItems

      if (!Array.isArray(menuItems)) continue;

      for (const menuItem of menuItems) {
        // Match itemId 432 directly
        if (menuItem?.itemId === id) {
          return menuItem; // Return item with its nested items
        }

        // Recursively search in any nested items
        const nestedItems = menuItem.menuItems || menuItem.items;
        if (Array.isArray(nestedItems)) {
          const nestedItem = this.findById(nestedItems, id);
          if (nestedItem) return nestedItem;
        }
      }
    }
    return null;
  }
  private capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * Returns a listing of categories at a single level.
   * @param id  The optional category to query the contents of
   * @returns A list of categories at the requested level
   */
  getMenu(
    id: number = null,
    type: 'folder' | 'category' = 'folder'
  ): Observable<CategoryCollection> {
    this.initializeConfig();
    let obs: Observable<CategoryCollection>;
  
    if (!this.jsonFilePath) {
      console.error("JSON file path is not defined.");
      return of(null); // Return an empty observable or handle the error gracefully
    }
  
    if (!id) {
      // Fetch the top-level menu
      obs = this.http.get<VODMenu>(this.jsonFilePath).pipe(
        map((data) => {
          if (!data || !data.categories) {
            throw new Error("Invalid data structure received from API.");
          }
  
          // Find all categories without `menuItems`
          const specialMenuItems = data.categories
            .filter((category) => !category.menuItems)
            .map((category) => ({ ...category }));
  
          // Create the "Special Categories" object
          if (specialMenuItems.length > 0) {
            const specialCategorie: Category = {
              id: 100, // A unique ID for the special category
              name: "Video On Demand",
              displayOrder: 0,
              menuItems: specialMenuItems as unknown as Array<Video | Presentation | Folder>,
            };
            console.log("specialCategorie", specialCategorie);
  
            // Add the special category to the main categories
            data.categories.push(specialCategorie);
  
            // Remove original categories without menuItems
            data.categories = data.categories.filter(
              (category) => category.menuItems && category.menuItems.length > 0
            );
          }
  
          // Sort categories by displayOrder
          data.categories.sort(
            (a, b) => (a.displayOrder ?? 1000) - (b.displayOrder ?? 1000)
          );
  
          console.log("Sorted categories:", data.categories);
  
          return data;
        })
      );
    } else if (type === 'category' || type === 'folder') {
      // Handle specific category or folder requests
      obs = this.http
        .get<MenuItemCollection>(this.jsonFilePath, {
          params: { type }
        })
        .pipe(
          map(data => {
            let menuItems;
            let FindManucategory = data.categories?.find(category => 
              Array.isArray(category.menuItems) && 
              category.menuItems.find(item => item.id === id)
            );
  
            if (!FindManucategory) {
              FindManucategory = findMenuItemsById(data.categories, id);
              menuItems = Array.isArray(FindManucategory) ? FindManucategory : [FindManucategory];
            } else {
              menuItems = FindManucategory?.menuItems?.filter(item => item.id === id);
            }
  
            const breadcrumbs = data.breadcrumbs?.length
              ? data.breadcrumbs
              : data.categories.map(item => ({
                id: item.id,
                name: item.name,
              }));
  
            return {
              id: data.id,
              requestedType: type === 'folder' ? 'Folder' : 'Category',
              name: data.name,
              breadcrumbs,
              categories: menuItems
            };
          })
        );
      console.log("obs", obs);
    }
  
    function findMenuItemsById(array, id) {
      for (const item of array) {
        if (item.id === id) {
          return item;
        }
  
        if (item.menuItems && item.menuItems.length > 0) {
          const found = findMenuItemsById(item.menuItems, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }
  
    return obs.pipe(
      map(collection => ({
        ...collection,
        categories: collection?.categories?.map?.(category => ({
          ...category,
          menuItems: category.menuItems?.map?.(menuItem =>
            this.fixFolderType(menuItem)
          )
        }))
      }))
    );
  }

  passkeyContent(
    key: number,
    id: number,
    type: 'local' | 'content' | 'folder',
    categoryId: number,
    folderId: number = null
  ): Observable<PasskeyContentResponse> {
    const headers = new HttpHeaders().append(
      'content-type',
      'application/json'
    );

    const params: {
      key: number;
      id: number;
      type: 'local' | 'content' | 'folder';
      category_id?: number;
      folder_id?: number;
    } = {
      key,
      id,
      type
    };

    if (categoryId) {
      params.category_id = categoryId;
    }

    if (folderId) {
      params.folder_id = folderId;
    }

    return this.http.post<PasskeyContentResponse>(
      'video_player/passkey_content',
      params,
      {
        headers
      }
    );
  }

  search(name: string): Observable<Content[]> {
    const params = new HttpParams()
      .append('search_name', name)
      .append('format', 'json');

    return this.http.get<Content[]>('video_player/site_search', { params });
  }

  /**
   * Get an individual pieces of content
   * @param id    The id (or itemId) of the content to get
   * @param type  The type of content to get
   * @returns     The content
   */
  // get(
  //   id: number,
  //   type: 'folder' | 'content' | 'local'
  // ): Observable<Folder | Video | Presentation> {
  //   return this.http
  //     .get<Folder | Video | Presentation>(`video_player/vod/${id}`, {
  //       params: { type }
  //     })
  //     .pipe(map(x => this.fixFolderType(x)));
  // }
  get(
    id: number,
    type: 'folder' | 'content' | 'local'
  ): Observable<Folder | Video | Presentation> {
    // Ensure config is loaded first
    return from(this.initializeConfig()).pipe( // Convert Promise to Observable
      switchMap(() => {
        if (!this.jsonFilePath) {
          console.error("Configuration paths are not defined.");
          return of(null);
        }
  
        // Fetch data from the JSON file
        return this.http
          .get<{ categories: Array<{ menuItems: any[] }> }>(this.jsonFilePath)
          .pipe(
            map((data) => {
              // Find all categories without `menuItems`
              const specialMenuItems = data.categories.filter(
                category => !category.menuItems
              ).map(category => ({
                ...category
              }));
  
              // Create the "Special Categories" object
              if (specialMenuItems.length > 0) {
                const specialCategorie: Category = {
                  id: 100, // A unique ID for the special category
                  name: "Special Categories",
                  displayOrder: 0,
                  menuItems: specialMenuItems as unknown as Array<Video | Presentation | Folder>, // Cast to the expected type
                };
                console.log("specialCategorie", specialCategorie);
  
                // Add the special category to the main categories
                data.categories.push(specialCategorie);
  
                // Remove original categories without menuItems
                data.categories = data.categories.filter(
                  category => category.menuItems && category.menuItems.length > 0
                );
              }
  
              const item = this.findById(data.categories, id);
              if (!item) {
                console.warn("Item not found");
                return null;
              }
  
              console.log("Item found:", item);
  
              return this.fixFolderType(item);
            })
          );
      })
    );
  }

  /**
   * Determines if the content is local or not
   * @param content
   * @returns a string with the searchable type
   */
  isContentLocal(content: { pifId?: number; type?: string }) {
    // Deal with the simple 1-to-1 mappings
    if (this.typeMap[content?.type]) {
      return this.typeMap[content?.type];
    }
    return content?.type === 'Video'
      // && typeof content?.pifId !== 'number'
      ? 'content'
      : 'content';
  }
}