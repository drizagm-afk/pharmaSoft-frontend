import {
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  timer,
} from 'rxjs';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { PaginaResponse } from '../../../../core/models/pagina-response';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';
import { VentaRequest } from '../../models/venta.model';
import { VentaService } from '../../services/venta-service';

interface LineaForm {
  productoId: FormControl<number | null>;
  cantidad: FormControl<number>;
}

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, KeyValuePipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ventaService = inject(VentaService);
  private readonly router = inject(Router);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly imprimirAlRegistrar = signal(true);
  protected readonly erroresServidor = signal<Record<string, string>>({});
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    detalles: this.fb.array<FormGroup<LineaForm>>([], Validators.required),
  });

  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly productoPorId = computed(() => new Map(this.productos().map((p) => [p.id, p])));
  protected readonly clienteElegido = computed(() =>
    this.clientes().find((c) => c.id === this.valor().clienteId),
  );
  protected readonly lineas = computed(() =>
    (this.valor().detalles ?? []).map((d) => {
      const producto = d.productoId ? this.productoPorId().get(d.productoId) : undefined;
      const cantidad = Number(d.cantidad) || 0;
      const precio = producto?.precio ?? 0;
      return {
        producto,
        cantidad,
        precio,
        subtotal: redondear(precio * cantidad),
        excedeStock: !!producto && cantidad > producto.stock,
      };
    }),
  );
  protected readonly total = computed(() =>
    redondear(this.lineas().reduce((suma, linea) => suma + linea.subtotal, 0)),
  );
  protected readonly unidades = computed(() =>
    this.lineas().reduce((suma, linea) => suma + linea.cantidad, 0),
  );
  protected readonly hayExcesoDeStock = computed(() =>
    this.lineas().some((linea) => linea.excedeStock),
  );
  protected readonly hayProductoNoDisponible = computed(() =>
    this.lineas().some(
      (linea) => !linea.producto || !linea.producto.estado || linea.producto.stock <= 0,
    ),
  );

  protected readonly buscarCliente = new FormControl('', { nonNullable: true });
  protected readonly buscarProducto = new FormControl('', { nonNullable: true });
  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges, { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges, { initialValue: '' });
  protected readonly cargandoClientes = signal(false);
  protected readonly cargandoProductos = signal(false);
  protected readonly errorClientes = signal<string | null>(null);
  protected readonly errorProductos = signal<string | null>(null);
  protected readonly clientesEncontrados = signal<Cliente[]>([]);
  protected readonly productosEncontrados = signal<Producto[]>([]);
  protected readonly hayBusquedaCliente = computed(() => this.textoCliente().trim().length > 0);
  protected readonly hayBusquedaProducto = computed(() => this.textoProducto().trim().length > 0);

  get detalles() {
    return this.form.controls.detalles;
  }

  ngOnInit(): void {
    this.iniciarBusqueda(
      this.buscarCliente,
      (texto) => this.clienteService.buscar(texto),
      this.clientesEncontrados,
      this.cargandoClientes,
      this.errorClientes,
    );
    this.iniciarBusqueda(
      this.buscarProducto,
      (texto) => this.productoService.buscar(texto),
      this.productosEncontrados,
      this.cargandoProductos,
      this.errorProductos,
    );
  }

  private iniciarBusqueda<T>(
    control: FormControl<string>,
    buscar: (texto: string) => Observable<PaginaResponse<T>>,
    resultados: WritableSignal<T[]>,
    cargando: WritableSignal<boolean>,
    error: WritableSignal<string | null>,
  ): void {
    control.valueChanges
      .pipe(
        map((texto) => texto.trim()),
        distinctUntilChanged(),
        switchMap((texto) => {
          resultados.set([]);
          error.set(null);
          cargando.set(!!texto);
          return texto
            ? timer(250).pipe(
                switchMap(() => buscar(texto)),
                map((pagina) => pagina.contenido),
                catchError((err) => {
                  error.set(mensajeError(err));
                  return of([] as T[]);
                }),
                finalize(() => cargando.set(false)),
              )
            : of([] as T[]);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((lista) => resultados.set(lista));
  }

  private actualizarSeleccion(): void {
    this.cargando.set(true);
    const clienteId = this.form.controls.clienteId.value;
    forkJoin({
      cliente: clienteId ? this.clienteService.obtener(clienteId) : of(null),
      productos: this.productos().length
        ? forkJoin(this.productos().map((producto) => this.productoService.obtener(producto.id)))
        : of([]),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ cliente, productos }) => {
          this.clientes.set(cliente ? [cliente] : []);
          this.productos.set(productos);
          this.cargando.set(false);
        },
        error: (err) => {
          this.error.update(
            (mensaje) =>
              `${mensaje ?? ''} No se pudo actualizar la disponibilidad: ${mensajeError(err)}`,
          );
          this.cargando.set(false);
        },
      });
  }
  agregarProducto(producto: Producto): void {
    if (this.confirmando() || this.guardando() || !producto.estado || producto.stock <= 0) return;
    this.productos.update((lista) => [...lista.filter((p) => p.id !== producto.id), producto]);
    const existente = this.detalles.controls.find(
      (l) => l.controls.productoId.value === producto.id,
    );
    if (existente) {
      existente.controls.cantidad.setValue(Number(existente.controls.cantidad.value) + 1);
    } else {
      this.detalles.push(
        this.fb.group({
          productoId: this.fb.control<number | null>(producto.id, Validators.required),
          cantidad: this.fb.control(1, [
            Validators.required,
            Validators.min(1),
            Validators.pattern(/^\d+$/),
          ]),
        }),
      );
    }
    this.buscarProducto.setValue('');
  }

  agregarPrimero(evento: Event): void {
    evento.preventDefault();
    const primero = this.productosEncontrados()[0];
    if (primero) this.agregarProducto(primero);
  }

  elegirCliente(cliente: Cliente): void {
    if (this.confirmando() || this.guardando() || !cliente.estado) return;
    this.clientes.set([cliente]);
    this.form.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
  }

  cantidadEnDetalle(productoId: number): number {
    return Number(this.valor().detalles?.find((d) => d.productoId === productoId)?.cantidad) || 0;
  }

  quitarLinea(indice: number): void {
    if (this.confirmando() || this.guardando()) return;
    this.detalles.removeAt(indice);
    const elegidos = new Set(
      this.detalles.controls.map((linea) => linea.controls.productoId.value),
    );
    this.productos.update((lista) => lista.filter((producto) => elegidos.has(producto.id)));
  }

  cambiarCliente(): void {
    if (!this.confirmando() && !this.guardando()) this.form.controls.clienteId.setValue(null);
  }

  private ventaValida(): boolean {
    return (
      this.form.valid &&
      !!this.clienteElegido()?.estado &&
      !this.hayExcesoDeStock() &&
      !this.hayProductoNoDisponible()
    );
  }

  revisar(): void {
    if (this.cargando() || this.confirmando() || this.guardando()) return;
    this.form.markAllAsTouched();
    this.error.set(null);
    this.erroresServidor.set({});
    if (!this.ventaValida()) return;
    this.confirmando.set(true);
  }

  volver(): void {
    if (!this.guardando()) this.confirmando.set(false);
  }

  confirmar(): void {
    if (!this.confirmando() || this.guardando()) return;
    if (!this.ventaValida()) {
      this.confirmando.set(false);
      this.form.markAllAsTouched();
      return;
    }
    const valor = this.form.getRawValue();
    const dto: VentaRequest = {
      clienteId: Number(valor.clienteId),
      detalles: valor.detalles.map((d) => ({
        productoId: Number(d.productoId),
        cantidad: Number(d.cantidad),
      })),
    };
    this.guardando.set(true);
    this.ventaService
      .registrar(dto)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (venta) => {
          void this.router.navigate(['/ventas', venta.id], {
            queryParams: this.imprimirAlRegistrar() ? { nueva: 1, imprimir: 1 } : { nueva: 1 },
          });
        },
        error: (err) => {
          this.guardando.set(false);
          this.confirmando.set(false);
          this.error.set(mensajeError(err));
          this.erroresServidor.set(erroresDeValidacion(err));
          if (err.status === 409) this.actualizarSeleccion();
        },
      });
  }
}
