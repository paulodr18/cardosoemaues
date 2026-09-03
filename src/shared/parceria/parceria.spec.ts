import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { Parceria } from './parceria';

describe('Parceria', () => {
  let component: Parceria;
  let fixture: ComponentFixture<Parceria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Parceria],
      providers: [provideZonelessChangeDetection()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Parceria);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
