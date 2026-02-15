import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Comment } from '../../../shared/models/comment';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.scss',
})
export class CommentListComponent {
  comments = input.required<Comment[]>();
}
