import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { form, FormField, submit, required, minLength, maxLength } from '@angular/forms/signals';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  // FormField es la directiva que conecta cada <input> del HTML con su
  // campo correspondiente dentro de loginForm.
  imports: [FormField],
  styleUrl: './login.scss',
  templateUrl: './login.html',
  standalone: true,
})

export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  // El "modelo": los valores reales que vive el formulario.
  protected readonly credentialsModel = signal({
    username: '',
    password: '',
  });

  // form() arma la estructura del formulario a partir del modelo de arriba.
  // Los límites 3-50 / 4-100 son sentido común del lado del cliente (el
  // backend solo exige "no vacío"), pensados para pescar typos obvios antes
  // de gastar una llamada HTTP.
  protected readonly loginForm = form(this.credentialsModel, (schemaPath) => {
    required(schemaPath.username, { message: 'Ingresá tu usuario' });
    minLength(schemaPath.username, 3, { message: 'Mínimo 3 caracteres' });
    maxLength(schemaPath.username, 50, { message: 'Máximo 50 caracteres' });

    required(schemaPath.password, { message: 'Ingresá tu contraseña' });
    minLength(schemaPath.password, 4, { message: 'Mínimo 4 caracteres' });
    maxLength(schemaPath.password, 100, { message: 'Máximo 100 caracteres' });
  });

  // Error "general" (credenciales incorrectas, servidor caído), no de un
  // campo puntual. Se muestra arriba del botón.
  protected readonly loginError = signal<string | null>(null);

  // Mientras esperamos al backend, deshabilitamos el botón para que no se
  // pueda mandar el form dos veces haciendo doble click.
  protected readonly isSubmitting = signal(false);

  protected onSubmit(): void {
    // submit() marca todos los campos como "touched" (para que se vean los
    // errores) y SOLO ejecuta el callback si el form es válido.
    submit(this.loginForm, async () => {
      this.loginError.set(null);
      this.isSubmitting.set(true);

      try {
        // firstValueFrom convierte el Observable en Promise Y se suscribe,
        // que es lo que realmente dispara la petición HTTP.
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
