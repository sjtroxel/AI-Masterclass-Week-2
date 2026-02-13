import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeetupCard } from './meetup-card';

describe('MeetupCard', () => {
  let component: MeetupCard;
  let fixture: ComponentFixture<MeetupCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetupCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MeetupCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
