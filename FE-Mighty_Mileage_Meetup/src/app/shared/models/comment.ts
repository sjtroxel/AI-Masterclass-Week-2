import { MeetupUser } from './meetup';

export interface Comment {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user: MeetupUser;
}
