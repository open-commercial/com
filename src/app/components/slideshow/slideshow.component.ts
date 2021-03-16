import { Component, ElementRef, Input, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { IImagen } from '../../services/slideshow.service';

@Component({
  selector: 'sic-com-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrls: ['./slideshow.component.scss']
})
export class SlideshowComponent implements OnInit, AfterViewInit {
  private pImagenes: IImagen[] = [];
  @Input() set imagenes(value: IImagen[]) { this.pImagenes = value; }
  get imagenes(): IImagen[] { return this.pImagenes; }

  imgCount = 0;
  interval = null;
  intervalTime = 20;
  pauseTime = 5000;

  @ViewChild('imgContainer', { static: false }) imgContainer: ElementRef;

  constructor() {
    // This is intentional
  }

  ngOnInit() {
    this.imgCount = this.imagenes.length;
  }

  ngAfterViewInit() {
    setTimeout(() => this.scrollToImg(1), this.pauseTime);
  }

  scrollToImg(index) {
    if (this.imgCount < 2) { return; }

    this.checkIndex(index);

    const step = Math.floor(this.imgContainer.nativeElement.offsetWidth / 10);
    const toScroll = this.imgContainer.nativeElement.offsetWidth * index;

    let i = this.imgContainer.nativeElement.scrollLeft;
    this.interval = setInterval(() => {
      const dir = i < toScroll ? 1 : -1;
      i += dir * step;
      const endCondition = dir > 0 ? i >= toScroll : i <= toScroll;

      if (endCondition) {
        i = toScroll;
        clearInterval(this.interval);
        const nextIndex = index === (this.imgCount - 1) ? 0 : index + 1;

        setTimeout(() => {
          if (nextIndex === 0) { this.reorderImgs(); }
          this.scrollToImg(nextIndex);
        }, this.pauseTime - 2000);
      }
      this.imgContainer.nativeElement.scrollLeft = i;
    }, this.intervalTime);
  }

  checkIndex(index) {
    if (index < 0 || index >= this.imgCount) {
      throw new Error('Invalid index');
    }
  }

  reorderImgs() {
    if (this.imgCount < 2) { return; }
    const lastImg = this.pImagenes.splice(this.imgCount - 1, 1);
    const imgsToMove = this.pImagenes.splice(0, this.imgCount - 1);
    this.imagenes = lastImg.concat(imgsToMove);
    this.imgContainer.nativeElement.scrollLeft = 0;
  }
}
