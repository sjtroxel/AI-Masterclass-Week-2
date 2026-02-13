import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../core/services/authentication';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class NavbarComponent {
  constructor(
    public authService: AuthenticationService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleTheme() {
    const checkbox = document.querySelector<HTMLInputElement>('.theme-toggle input');
    const isChecked = checkbox?.checked ?? false;

    // Apply dark or light theme to body
    document.body.classList.toggle('dark-mode', isChecked);

    // Add a glow effect on toggle container for visual feedback
    const toggleEl = document.querySelector('.theme-toggle');
    if (toggleEl) {
      toggleEl.classList.toggle('dark', isChecked);
    }
  }
}
