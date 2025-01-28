import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContentInfoTileComponent } from './content-info-tile.component';

describe('ContentInfoTileComponent', () => {
  let component: ContentInfoTileComponent;
  let fixture: ComponentFixture<ContentInfoTileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContentInfoTileComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentInfoTileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
