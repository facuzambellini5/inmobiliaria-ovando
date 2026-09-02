import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Auth } from '../../core/services/auth';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule],
  styleUrl: './admin-shell.scss',
  templateUrl: './admin-shell.html',
})
export class AdminShell {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected onLogout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
