import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartnerModal } from './partner-modal';

describe('PartnerModal', () => {
  let component: PartnerModal;
  let fixture: ComponentFixture<PartnerModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
