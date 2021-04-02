import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ScrollPositionService {
  scrollValues: {[key: string]: {[key: string]: number }} = {};
  constructor() { }

  storeScrollPosition(key: string, url: string) {
    if (!this.scrollValues[key]) { this.scrollValues[key] = {}; }
    this.scrollValues[key][url] = window.pageYOffset || document.documentElement.scrollTop;
  }

  restorePosition(key: string, url: string) {
    if (this.hasUrl(key, url)) {
      window.scrollTo(0, this.scrollValues[key][url]);
      this.removeScrollPosition(key);
    }
  }

  private removeScrollPosition(key: string) {
    delete this.scrollValues[key];
  }

  private hasUrl(key: string, url: string): boolean {
    return !!(this.scrollValues[key] && this.scrollValues[key][url]);
  }
}
