import { Location as AppLocation } from './location';

export interface Meetup {
  id: number;
  title?: string;
  activity: 'run' | 'bicycle';
  start_date_time: string;
  end_date_time: string;
  guests: number;
  user_id: number;
  location?: AppLocation;
}
