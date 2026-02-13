import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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

    const formData = this.signupForm.value;

    this.authService.signup(formData).subscribe({
      next: (res: any) => {
        // Optionally log the user in automatically
        if (res.token) {
          this.authService.setToken(res.token);
          this.router.navigate(['/']);
        } else {
          this.router.navigate(['/login']);
        }
        this.errors = [];
      },
      error: (err: any) => {
        // Capture Rails validation errors if returned as { errors: [...] }
        if (err.error && err.error.errors) {
          this.errors = err.error.errors;
        } else {
          this.errors = ['An unexpected error occurred. Please try again.'];
        }
      },
    });
  }
}
