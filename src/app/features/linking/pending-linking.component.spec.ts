import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingLinkingComponent } from './pending-linking.component';

describe('PendingLinkingComponent', () => {
  let component: PendingLinkingComponent;
  let fixture: ComponentFixture<PendingLinkingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingLinkingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PendingLinkingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
