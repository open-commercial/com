import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarAlCarritoComponent } from './agregar-al-carrito.component';

describe('AgregarAlCarritoComponent', () => {
  let component: AgregarAlCarritoComponent;
  let fixture: ComponentFixture<AgregarAlCarritoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AgregarAlCarritoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarAlCarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
