import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetTopComponent } from './net-top.component';

describe('NetTopComponent', () => {
  let component: NetTopComponent;
  let fixture: ComponentFixture<NetTopComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetTopComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetTopComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
