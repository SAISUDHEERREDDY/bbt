import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SysinfoMenuComponent } from './submenu.component';

describe('SysinfoMenuComponent', () => {
  let component: SysinfoRootComponentenuComponent;
  let fixture: ComponentFixture<SubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SysinfoMenuComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SysinfoMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
