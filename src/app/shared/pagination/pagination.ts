import { Component, computed, input, output } from '@angular/core';

/**
 * Controles de paginación genéricos: "Mostrando X–Y de Z" + botones de
 * página. No sabe nada de propiedades ni de HTTP — solo recibe los
 * números que ya vienen en cualquier respuesta paginada de Spring
 * (Page<T>: totalElements, totalPages) y avisa con un evento cuándo el
 * usuario quiere ver otra página. Así se puede reusar tal cual tanto en
 * el sitio público como en la tabla del panel admin, sin repetir esta
 * lógica en los dos lugares.
 */
@Component({
  selector: 'app-pagination',
  imports: [],
  styleUrl: './pagination.scss',
  templateUrl: './pagination.html',
})
export class Pagination {
  // Página ACTUAL, en base 0 (0 = primera página) — el mismo criterio
  // que usa Spring Data Pageable del lado del backend. Mantener el mismo
  // criterio de los dos lados evita tener que sumar/restar 1 al armar el
  // query param `page` en cada componente que use esto.
  page = input.required<number>();
  totalPages = input.required<number>();
  totalElements = input.required<number>();
  pageSize = input.required<number>();

  // Emite la página elegida (también en base 0) cada vez que el usuario
  // toca un botón. El componente padre es quien decide qué hacer con eso
  // (actualizar su signal de página, hacer scroll, etc.) — este
  // componente no toca nada fuera de sí mismo.
  pageChange = output<number>();

  protected readonly isFirstPage = computed(() => this.page() === 0);
  protected readonly isLastPage = computed(() => this.page() >= this.totalPages() - 1);

  // "Mostrando 13–24 de 57": el rango de ítems que corresponde a la
  // página actual, calculado a partir del tamaño de página en vez de
  // venir armado del backend (el backend no lo manda, y sacarlo acá es
  // una cuenta simple).
  protected readonly rangeStart = computed(() =>
    this.totalElements() === 0 ? 0 : this.page() * this.pageSize() + 1,
  );
  protected readonly rangeEnd = computed(() =>
    Math.min((this.page() + 1) * this.pageSize(), this.totalElements()),
  );

  // Ventana de hasta 5 números de página alrededor de la actual, en vez
  // de listar TODAS las páginas (si hay 40 páginas no queremos 40
  // botones). Ej: parado en la página 8 de 20 (índices 0 a 19), se
  // muestran [6, 7, 8, 9, 10] — la actual siempre queda en el medio,
  // salvo que esté pegada al principio o al final.
  protected readonly visiblePages = computed(() => {
    const total = this.totalPages();
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let start = Math.max(0, this.page() - Math.floor(maxVisible / 2));
    const end = Math.min(total, start + maxVisible);
    start = Math.max(0, end - maxVisible); // reacomoda la ventana si "end" quedó pegado al final

    return Array.from({ length: end - start }, (_, i) => start + i);
  });

  protected goTo(page: number): void {
    if (page === this.page() || page < 0 || page >= this.totalPages()) {
      return;
    }
    this.pageChange.emit(page);
  }

  protected previous(): void {
    this.goTo(this.page() - 1);
  }

  protected next(): void {
    this.goTo(this.page() + 1);
  }
}
