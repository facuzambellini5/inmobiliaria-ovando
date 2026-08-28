import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { form, FormField, submit, required, minLength, maxLength } from '@angular/forms/signals';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [
    FormField,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  styleUrl: './login.scss',
  templateUrl: './login.html',
  standalone: true,
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly credentialsModel = signal({
    username: '',
    password: '',
  });

  protected readonly loginForm = form(this.credentialsModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Ingresá tu usuario' });
    minLength(schemaPath.username, 3, { message: 'Mínimo 3 caracteres' });
    maxLength(schemaPath.username, 50, { message: 'Máximo 50 caracteres' });

    required(schemaPath.password, { message: 'Ingresá tu contraseña' });
    minLength(schemaPath.password, 4, { message: 'Mínimo 4 caracteres' });
    maxLength(schemaPath.password, 100, { message: 'Máximo 100 caracteres' });
  });

  protected readonly loginError = signal<string | null>(null);
  protected readonly isSubmitting = signal(false);

  protected onSubmit(): void {
    submit(this.loginForm, async () => {
      this.loginError.set(null);
      this.isSubmitting.set(true);

      try {
        await firstValueFrom(this.auth.login(this.credentialsModel()));
        this.router.navigateByUrl('/propiedades');
      } catch (error) {
        this.loginError.set(this.mapErrorToMessage(error));
      } finally {
        this.isSubmitting.set(false);
      }
    });
  }

  private mapErrorToMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401) {
        return 'Usuario o contraseña incorrectos.';
      }
      if (error.status === 0) {
        return 'No pudimos conectarnos con el servidor. Verificá tu conexión.';
      }
    }
    return 'Ocurrió un error inesperado. Probá de nuevo en unos minutos.';
  }
}
