import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Parceria } from './parceria';

describe('Parceria', () => {
  let component: Parceria;
  let fixture: ComponentFixture<Parceria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Parceria]
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
