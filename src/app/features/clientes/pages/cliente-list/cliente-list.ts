import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { mensajeError } from '../../../../core/utils/http-error';
import { Cliente, ClienteOrden } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';

@Component({
  selector: 'app-cliente-list',
  imports: [RouterLink],
  templateUrl: './cliente-list.html',
  styleUrl: './cliente-list.css',
})
export class ClienteList implements OnInit {
  private readonly service = inject(ClienteService);
  private readonly destroyRef = inject(DestroyRef);
  private peticion?: Subscription;
  protected readonly respuesta = signal<PaginaResponse<Cliente> | null>(null);
  protected readonly pagina = signal(0);
  protected readonly tamanio = signal(10);
  protected readonly ordenarPor = signal<ClienteOrden>('apellidos');
  protected readonly direccion = signal<'asc' | 'desc'>('asc');
  protected readonly cargando = signal(false);
  protected readonly dandoBaja = signal<number | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly filtro = signal('');
  protected readonly filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    return (this.respuesta()?.contenido ?? []).filter(c =>
      c.dni.includes(texto) || `${c.nombres} ${c.apellidos}`.toLowerCase().includes(texto)
      || `${c.apellidos} ${c.nombres}`.toLowerCase().includes(texto));
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.peticion?.unsubscribe();
    this.cargando.set(true);
    this.error.set(null);
    this.peticion = this.service.listar(this.pagina(), this.tamanio(), this.ordenarPor(), this.direccion())
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: datos => {
          // An older backend returns an array and ignores pagination parameters.
          if (Array.isArray(datos)) {
            this.respuesta.set(null);
            this.error.set('El backend debe devolver un listado paginado de clientes. Actualice PharmaBackend a la versión de consultas y reportes.');
          } else {
            this.respuesta.set(datos);
            this.pagina.set(datos.pagina);
          }
          this.cargando.set(false);
        },
        error: err => {
          this.respuesta.set(null);
          this.error.set(mensajeError(err));
          this.cargando.set(false);
        },
      });
  }

  cambiarPagina(delta: number): void {
    if (this.cargando() || this.dandoBaja() !== null || !this.respuesta()) return;
    const siguiente = this.pagina() + delta;
    if (siguiente < 0 || siguiente >= this.respuesta()!.totalPaginas) return;
    this.pagina.set(siguiente);
    this.cargar();
  }

  cambiarTamanio(valor: string): void {
    const tamanio = Number(valor);
    if (![5, 10, 20].includes(tamanio)) return;
    this.tamanio.set(tamanio);
    this.pagina.set(0);
    this.cargar();
  }

  ordenar(campo: ClienteOrden): void {
    this.direccion.set(this.ordenarPor() === campo && this.direccion() === 'asc' ? 'desc' : 'asc');
    this.ordenarPor.set(campo);
    this.pagina.set(0);
    this.cargar();
  }

  eliminar(cliente: Cliente): void {
    if (this.dandoBaja() !== null || !confirm(`¿Dar de baja a ${cliente.nombres} ${cliente.apellidos}?`)) return;
    this.error.set(null);
    this.dandoBaja.set(cliente.id);
    this.service.eliminar(cliente.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.dandoBaja.set(null); this.cargar(); },
      error: err => { this.dandoBaja.set(null); this.error.set(mensajeError(err)); },
    });
  }
}
