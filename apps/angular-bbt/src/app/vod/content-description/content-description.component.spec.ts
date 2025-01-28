import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContentDescriptionComponent } from './content-description.component';

describe('ContentDescriptionComponent', () => {
  let component: ContentDescriptionComponent;
  let fixture: ComponentFixture<ContentDescriptionComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ContentDescriptionComponent]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ContentDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
