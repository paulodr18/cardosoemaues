import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Chatbox } from './chatbox';

describe('Chatbox', () => {
  let component: Chatbox;
  let fixture: ComponentFixture<Chatbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chatbox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Chatbox);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
