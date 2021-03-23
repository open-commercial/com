import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { HelperService } from '../../services/helper.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'sic-com-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit, OnDestroy {
  menuVisible = false;
  menuRight = 0;
  private subscription: Subscription;

  constructor(private menuService: MenuService,
              private helper: HelperService,
              public authService: AuthService) {}

  ngOnInit() {
    this.subscription = this.menuService.getValue().subscribe(value => {
      this.menuVisible = value;
      if (value) {
        this.updateMenuRight();
      }
      if (this.menuIsFullScreen()) {
        if (value) {
          this.helper.lockBodyScroll();
        } else {
          this.helper.unlockBodyScroll();
        }
      }
    });
  }

  getMenu() {
    return document.getElementById('sic-com-menu');
  }

  getMenuButton() {
    return document.getElementById('menu-button');
  }

  ngOnDestroy() {
    this.helper.unlockBodyScroll();
    this.subscription.unsubscribe();
  }

  menuIsFullScreen(): boolean {
    const menu = this.getMenu();
    return menu && menu.classList.contains('full-screen');
  }

  updateMenuRight() {
    const menu = this.getMenu();
    const menuButton = this.getMenuButton();
    if (menu && menuButton) {
      this.menuRight = this.menuIsFullScreen() ? 0 : document.body.clientWidth - (menuButton.offsetLeft + menuButton.offsetWidth);
    }
  }


  @HostListener('document:click', ['$event'])
  onClick(event) {
    const menu = this.getMenu();
    const menuButton = this.getMenuButton();
    if (!(menu && menuButton)) { return; }

    const menuId = menu.id;
    const menuButtonId = menuButton.id;

    if (!HelperService.isDescendant(event.target, menuId) && !HelperService.isDescendant(event.target, menuButtonId)) {
      if (this.menuVisible) { this.menuService.close(); }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    const menu = this.getMenu();
    if (menu) {
      this.updateMenuRight();
      if (this.menuRight <= 0 && this.menuVisible) {
        this.helper.lockBodyScroll();
      }
    }
  }
}
