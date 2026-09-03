import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { PartnerModalComponent } from './partner-modal';

describe('PartnerModalComponent', () => {
  let component: PartnerModalComponent;
  let fixture: ComponentFixture<PartnerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PartnerModalComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: { close: () => {} } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
