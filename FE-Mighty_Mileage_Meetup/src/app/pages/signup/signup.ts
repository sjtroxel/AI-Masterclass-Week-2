import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../core/services/authentication';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule],
  standalone: true,
  templateUrl: './signup.html',
  styleUrl: './signup.scss'
})
export class SignupComponent {
  signupForm: FormGroup;
  errors: string[] = [];
  submitting = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      password_confirmation: ['', Validators.required],
    });
  }

  signup() {
    if (this.signupForm.invalid) return;

    this.submitting.set(true);
    const formData = this.signupForm.value;

    this.authService.signup(formData).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: (res: any) => {
        if (res.token) {
          this.authService.setToken(res.token);
          this.authService.setUserId(res.user.id);
          this.authService.setUser(res.user.username);
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
        }
        this.errors = [];
      },
      error: (err: any) => {
        if (err.error && err.error.errors) {
          this.errors = err.error.errors;
        } else {
          this.errors = ['An unexpected error occurred. Please try again.'];
        }
      },
    });
  }
}
