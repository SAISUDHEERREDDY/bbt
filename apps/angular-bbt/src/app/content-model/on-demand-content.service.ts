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
  playerManifestXmlPath: string = "";

  constructor(private http: HttpClient, private configService: ConfigService) {

  }
  private initializeConfig(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.configService.loadConfig()) {
        this.configService.loadConfig().then(() => {
          this.jsonFilePath = this.configService.getConfigValue('JsonFilePath') || '';
          this.playerManifestXmlPath = this.configService.getConfigValue('PlayerManifestXmlPath') || '';
          console.log('Config Loaded:', this.jsonFilePath, this.playerManifestXmlPath);
          resolve();
        }).catch((error) => {
          console.error('Failed to load configuration:', error);
          reject(error);
        });
      } else {
        this.jsonFilePath = this.configService.getConfigValue('JsonFilePath') || '';
        this.playerManifestXmlPath = this.configService.getConfigValue('PlayerManifestXmlPath') || '';
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
    //console.log("jsonPath", this.jsonFilePath);
    if (!this.jsonFilePath) {
      console.error("JSON file path is not defined.");
      return of(null); // Return an empty observable or handle the error gracefully
    }

    if (!id) {
      // If there is no category the top level is returned and it has a
      // slightly different shape.
      //obs = this.http.get<VODMenu>(`video_player/vod`);
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
              id: 111, // A unique ID for the special category
              name: "Special Categories",
              displayOrder: 0,
              menuItems: specialMenuItems as unknown as Array<Video | Presentation | Folder>, // Cast to the expected type
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

          // Return the modified data for further processing
          return data;
        }),
        switchMap((data) => {
          // Fetch the XML file to process customIcon updates
          return this.http.get(this.playerManifestXmlPath, { responseType: 'text' }).pipe(
            map((xml) => {
              console.log("Processing XML...");
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xml, 'text/xml');
              const files = Array.from(xmlDoc.getElementsByTagName('file'));

              console.log("Parsed XML files:", files);

              // Function to update customIcons in categories
              const updateCustomIcons = (categories) => {
                categories.forEach((category) => {
                  const matchingFile = files.find(
                    (file) => file.getAttribute('destination') === category.customIcon
                  );

                  if (matchingFile) {
                    const url = matchingFile.getAttribute('url');
                    const urlFormate = matchingFile.getAttribute('destination');
                    if (url && (urlFormate.endsWith('.jpg') || urlFormate.endsWith('.png'))) {
                      category.customIcon = decodeURIComponent(url); // Update customIcon if it's an image
                    }
                  }

                  // Process nested menuItems recursively
                  if (category.menuItems && category.menuItems.length > 0) {
                    updateCustomIcons(category.menuItems);
                  }
                });
              };

              // Update categories with customIcons
              updateCustomIcons(data.categories);

              console.log("Updated categories with customIcons:", data.categories);

              return data;
            })
          );
        })
      );


    } else if (type === 'category' || type === 'folder') {
      /**
       * The category case is covered by the API, and so is included here, but
       * doesn't seem to be used in the application.
       */
      obs = this.http
        .get<MenuItemCollection>(this.jsonFilePath, {
          params: { type }
        })
        .pipe(
          map(data => {
            let menuItems
            let FindManucategory = data.categories.find(category => category.menuItems.find(item => item.id === id));
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
                // Optionally map more properties if needed
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
      console.log("obs", obs)
      // obs = this.http
      // .get<MenuItemCollection>(assets/json-test/THD-Demo-2021-11_5.json, {
      //   params: { type }
      // })
      // .pipe(
      //   map(x => ({
      //     id: x.id,
      //     requestedType: type === 'folder' ? 'Folder' : 'Category',
      //     name: x.name,
      //     breadcrumbs: x.breadcrumbs,
      //     categories: [x]
      //   })) // Wrap in array for compatability
      // );
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
      // Fix folder types
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
        if (!this.jsonFilePath || !this.playerManifestXmlPath) {
          console.error("Configuration paths are not defined.");
          return of(null);
        }
         
        // Fetch data from the JSON file
        return this.http
          .get<{ categories: Array<{ menuItems: any[] }> }>(this.jsonFilePath)
          .pipe(
            switchMap((data) => {
              // Find all categories without `menuItems`
              const specialMenuItems = data.categories.filter(
                category => !category.menuItems
              ).map(category => ({
                ...category
              }));
              // Create the "Special Categories" object
              if (specialMenuItems.length > 0) {
                const specialCategorie: Category = {
                  id: 111, // A unique ID for the special category

                  name: "Special Categories",
                  displayOrder: 0,
                  // categories: [], // Ensure valid `categories` property
                  menuItems: specialMenuItems as unknown as Array<Video | Presentation | Folder>, // Cast to the expected type
                  // breadcrumbs: [], // Ensure valid `breadcrumbs` property
                };
                console.log("specialCategorie", specialCategorie)
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
                return of(null);
              }

              console.log("Item found:", item);

              // Fetch the playerManifest.xml and map filePath values
              return this.http
                .get(this.playerManifestXmlPath, { responseType: 'text' })
                .pipe(
                  map((xml) => {
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(xml, 'text/xml');
                    const files = Array.from(xmlDoc.getElementsByTagName('file'));
                    // Function to recursively update and decode filePaths
                    const updateAndDecodeFilePaths = (item) => {
                      if (item.items && item.items.length > 0) {
                        // Process sub-items recursively
                        item.items.forEach((subItem) => updateAndDecodeFilePaths(subItem));
                      } else {
                        // Update and decode filePath for the main item or sub-item
                        if (item.filePath) {
                          const matchingFile = files.find(
                            (file) => file.getAttribute('destination') === item.filePath
                          );
                          if (matchingFile) {
                            const url = matchingFile.getAttribute('url');
                            const decodedUrl = decodeURIComponent(url); // Decode URL
                            item.filePath = decodedUrl; // Assign decoded URL
                          } else {
                            console.warn("No matching file found for:", item.filePath);
                          }
                        }
                      }

                      // Decode existing filePath regardless of match
                      if (item.filePath) {
                        item.filePath = decodeURIComponent(item.filePath);
                      }
                    };

                    // Update and decode filePaths for the main item and its nested items
                    updateAndDecodeFilePaths(item);

                    // Log the updated structure
                    console.log("Updated item with decoded URLs:", item);
                    return this.fixFolderType(item);
                  })
                );
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
