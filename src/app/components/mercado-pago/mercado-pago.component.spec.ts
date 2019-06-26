import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MercadoPagoComponent } from './mercado-pago.component';

describe('MercadoPagoComponent', () => {
  let component: MercadoPagoComponent;
  let fixture: ComponentFixture<MercadoPagoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MercadoPagoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MercadoPagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
