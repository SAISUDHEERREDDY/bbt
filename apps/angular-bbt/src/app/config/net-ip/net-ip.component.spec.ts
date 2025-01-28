import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetIpComponent } from './net-ip.component';

describe('NetIpComponent', () => {
  let component: NetIpComponent;
  let fixture: ComponentFixture<NetIpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetIpComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetIpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
