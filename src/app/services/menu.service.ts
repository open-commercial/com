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
    this.menuSubject.next(this.visible);
  }

  close() {
    this.visible = false;
    this.menuSubject.next(this.visible);
  }

  open() {
    this.visible = true;
    this.menuSubject.next(this.visible);
  }

  getValue(): Observable<boolean> {
    return this.menuSubject.asObservable();
  }
}
