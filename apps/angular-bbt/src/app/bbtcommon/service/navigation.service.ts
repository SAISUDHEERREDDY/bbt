import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private history: string[] = [];

  constructor(private router: Router) {
    // Listen to navigation events and push them to the history stack
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.history.push(event.urlAfterRedirects);
      }
    });
  }

  public getHistory(): string[] {
    return this.history;
  }

  public navigateBack(): void {
    this.history.pop(); // Remove the current page
    if (this.history.length > 0) {
      const previousUrl = this.history[this.history.length - 1];
      this.router.navigateByUrl(previousUrl); // Navigate to the previous URL
    } else {
      this.router.navigateByUrl('/'); // Default route if no history exists
    }
  }
}