import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentSubmitComponent } from './document-submit.component';

describe('DocumentSubmitComponent', () => {
  let component: DocumentSubmitComponent;
  let fixture: ComponentFixture<DocumentSubmitComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentSubmitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentSubmitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
