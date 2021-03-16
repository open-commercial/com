import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private visible = false;
  private menuSubject: BehaviorSubject<boolean>;

  constructor() {
    this.menuSubject = new BehaviorSubject<boolean>(false);
  }

  isVisible() {
    return this.visible;
  }

  toggle() {
    this.visible = !this.visible;
    this.menuSubject.next(this.isVisible());
  }

  getValue(): Observable<boolean> {
    return this.menuSubject.asObservable();
  }
}
