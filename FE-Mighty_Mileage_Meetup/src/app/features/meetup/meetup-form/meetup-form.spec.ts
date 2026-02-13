import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetupForm } from './meetup-form';

describe('MeetupForm', () => {
  let component: MeetupForm;
  let fixture: ComponentFixture<MeetupForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetupForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetupForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
