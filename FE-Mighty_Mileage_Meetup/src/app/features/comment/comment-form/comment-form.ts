import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { CommentService } from '../../../core/services/comment';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './comment-form.html',
  styleUrl: './comment-form.scss',
})
export class CommentFormComponent {
  private commentService = inject(CommentService);
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);

  meetupId = input.required<number>();

  submitting = signal(false);
  private contentLengthSignal = signal(0);
  charCount = this.contentLengthSignal.asReadonly();

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  constructor() {
    this.form.get('content')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => this.contentLengthSignal.set((val ?? '').length));
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    const content = this.form.get('content')!.value!;
    this.commentService.addComment(this.meetupId(), content).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe(() => {
      this.form.reset();
    });
  }
}
