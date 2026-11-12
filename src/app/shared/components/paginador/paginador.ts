import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-paginador',
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly totalElementos = input.required<number>();
  readonly tamanio = input.required<number>();
  readonly tamanios = input<readonly number[]>([10, 20, 50]);
  readonly deshabilitado = input(false);
  readonly cambioPagina = output<number>();
  readonly cambioTamanio = output<number>();
  protected readonly desde = computed(() =>
    this.totalElementos() === 0 || this.pagina() >= this.totalPaginas()
      ? 0
      : this.pagina() * this.tamanio() + 1,
  );
  protected readonly hasta = computed(() =>
    this.desde() === 0 ? 0 : Math.min((this.pagina() + 1) * this.tamanio(), this.totalElementos()),
  );
  protected readonly esPrimera = computed(() => this.pagina() === 0);
  protected readonly esUltima = computed(() => this.pagina() >= this.totalPaginas() - 1);

  protected ir(pagina: number): void {
    if (
      !this.deshabilitado() &&
      pagina >= 0 &&
      pagina < this.totalPaginas() &&
      pagina !== this.pagina()
    )
      this.cambioPagina.emit(pagina);
  }

  protected cambiarTamanio(valor: string): void {
    const tamanio = Number(valor);
    if (!this.deshabilitado() && this.tamanios().includes(tamanio) && tamanio !== this.tamanio())
      this.cambioTamanio.emit(tamanio);
  }
}
