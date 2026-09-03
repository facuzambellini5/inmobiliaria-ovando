import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-shell',
  imports: [RouterLink, RouterOutlet],
  styleUrl: './public-shell.scss',
  templateUrl: './public-shell.html',
  standalone: true,
})
export class PublicShell {
  protected readonly currentYear = new Date().getFullYear();
}
