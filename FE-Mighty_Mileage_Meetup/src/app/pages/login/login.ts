import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthenticationService } from '../../core/services/authentication';
import { MeetupService } from '../../core/services/meetup';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  loginForm: FormGroup;
  isError = false;
  submitting = signal(false);

  constructor(
    private meetupService: MeetupService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.submitting.set(true);
    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: (res: any) => {
        this.authService.setToken(res.token);
        this.authService.setUserId(res.user.id);
        this.authService.setUser(username);
        this.isError = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.isError = true;
      },
    });
  }
}
