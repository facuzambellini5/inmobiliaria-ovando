import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  styleUrl: './home.scss',
  templateUrl: './home.html',
  standalone: true,
})
export class Home {}
