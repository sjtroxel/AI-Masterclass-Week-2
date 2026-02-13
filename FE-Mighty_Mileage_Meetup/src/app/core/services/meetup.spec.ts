import { TestBed } from '@angular/core/testing';

import { Meetup } from './meetup';

describe('Meetup', () => {
  let service: Meetup;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Meetup);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
