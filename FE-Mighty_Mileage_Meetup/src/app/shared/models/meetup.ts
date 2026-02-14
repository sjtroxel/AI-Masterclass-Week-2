import { Location as AppLocation } from './location';

export interface MeetupUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
}

export interface Meetup {
  id: number;
  title?: string;
  activity: 'run' | 'bicycle';
  start_date_time: string;
  end_date_time: string;
  guests: number;
  user?: MeetupUser;
  location?: AppLocation;
}
