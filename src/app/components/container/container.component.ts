import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MenuService } from '../../services/menu.service';
import { Subscription } from 'rxjs';
import { HelperService } from '../../services/helper.service';

@Component({
  selector: 'sic-com-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.scss']
})
export class ContainerComponent implements OnInit, AfterViewInit, OnDestroy {
  menu = null;
  menuButton = null;
  menuVisible = false;
  menuRight = 0;
  private subscription: Subscription;

  constructor(private menuService: MenuService,
              private helper: HelperService) {}

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

  ngAfterViewInit() {
    this.menu = document.getElementById('sic-com-menu');
    this.menuButton = document.getElementById('menu-button');
  }

  ngOnDestroy() {
    this.helper.unlockBodyScroll();
    this.subscription.unsubscribe();
  }

  menuIsFullScreen(): boolean {
    return this.menu && this.menu.classList.contains('full-screen');
  }

  updateMenuRight() {
    const menuButton = document.getElementById('menu-button');
    this.menuRight = this.menuIsFullScreen() ? 0 : document.body.clientWidth - menuButton.offsetLeft - menuButton.offsetWidth;
  }


  @HostListener('document:click', ['$event'])
  onClick(event) {
    const menuId = this.menu.id;
    const menuButtonId = this.menuButton.id;

    if (!HelperService.isDescendant(event.target, menuId) && !HelperService.isDescendant(event.target, menuButtonId)) {
      if (this.menuVisible ) { this.menuService.toggle(); }
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateMenuRight();
    if (this.menuRight <= 0 && this.menuVisible) {
      this.helper.lockBodyScroll();
    }
  }
}
