import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  windowLastTopPosition = 0;

  static isDescendant(el, parentId) {
    let isChild = false;

    if (el.id === parentId) {
      isChild = true;
    }

    el = el.parentNode;
    while (el) {
      if (el.id === parentId) {
        isChild = true;
      }
      el = el.parentNode;
    }

    return isChild;
  }

  constructor(private sanitizer: DomSanitizer) { }

  getSafeHtml(value: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value);
  }

  lockBodyScroll() {
    const body = document.body;
    this.windowLastTopPosition = window.pageYOffset || document.documentElement.scrollTop;
    window.scrollTo(0, 0);
    body.classList.add('hide-scroll');
  }

  unlockBodyScroll() {
    const body = document.body;
    body.classList.remove('hide-scroll');
    window.scrollTo(0, this.windowLastTopPosition);
  }
}
