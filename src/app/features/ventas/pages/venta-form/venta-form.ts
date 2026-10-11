import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, KeyValuePipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { coincide } from '../../../../core/utils/texto';
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
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
  protected readonly cargaFallida = signal(false);
  protected readonly confirmando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly imprimirAlRegistrar = signal(true);
  protected readonly erroresServidor = signal<Record<string, string>>({});
  protected readonly form = this.fb.group({
    clienteId: this.fb.control<number | null>(null, Validators.required),
    detalles: this.fb.array<FormGroup<LineaForm>>([], Validators.required),
  });

  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  private readonly productoPorId = computed(() => new Map(this.productos().map(p => [p.id, p])));
  protected readonly clienteElegido = computed(() =>
    this.clientes().find(c => c.id === this.valor().clienteId));
  protected readonly lineas = computed(() => (this.valor().detalles ?? []).map(d => {
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
  }));
  protected readonly total = computed(() =>
    redondear(this.lineas().reduce((suma, linea) => suma + linea.subtotal, 0)));
  protected readonly unidades = computed(() =>
    this.lineas().reduce((suma, linea) => suma + linea.cantidad, 0));
  protected readonly hayExcesoDeStock = computed(() => this.lineas().some(linea => linea.excedeStock));
  protected readonly hayProductoNoDisponible = computed(() =>
    this.lineas().some(linea => !linea.producto || !linea.producto.estado || linea.producto.stock <= 0));

  protected readonly buscarCliente = new FormControl('', { nonNullable: true });
  protected readonly buscarProducto = new FormControl('', { nonNullable: true });
  private readonly textoCliente = toSignal(this.buscarCliente.valueChanges, { initialValue: '' });
  private readonly textoProducto = toSignal(this.buscarProducto.valueChanges, { initialValue: '' });
  protected readonly hayBusquedaCliente = computed(() => this.textoCliente().trim().length > 0);
  protected readonly hayBusquedaProducto = computed(() => this.textoProducto().trim().length > 0);
  protected readonly clientesEncontrados = computed(() => !this.hayBusquedaCliente() ? [] :
    this.clientes().filter(c => c.estado && coincide(this.textoCliente(), c.nombres, c.apellidos, c.dni)).slice(0, 6));
  protected readonly productosEncontrados = computed(() => !this.hayBusquedaProducto() ? [] :
    this.productos().filter(p => p.estado && p.stock > 0 &&
      coincide(this.textoProducto(), p.nombre, p.categoriaNombre)).slice(0, 6));

  get detalles() { return this.form.controls.detalles; }

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(0, 100),
      productos: this.productoService.listar(0, 100, 'nombre', 'asc'),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ clientes, productos }) => {
        if (Array.isArray(clientes) || Array.isArray(productos)) {
          this.error.set('El servidor debe devolver clientes y productos paginados.');
          this.cargaFallida.set(true);
        } else {
          this.clientes.set(clientes.contenido);
          this.productos.set(productos.contenido);
        }
        this.cargando.set(false);
      },
      error: err => { this.error.set(mensajeError(err)); this.cargaFallida.set(true); this.cargando.set(false); },
    });
  }

  agregarProducto(producto: Producto): void {
    if (this.confirmando() || this.guardando() || !producto.estado || producto.stock <= 0) return;
    const existente = this.detalles.controls.find(l => l.controls.productoId.value === producto.id);
    if (existente) {
      existente.controls.cantidad.setValue(Number(existente.controls.cantidad.value) + 1);
    } else {
      this.detalles.push(this.fb.group({
        productoId: this.fb.control<number | null>(producto.id, Validators.required),
        cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
      }));
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
    this.form.controls.clienteId.setValue(cliente.id);
    this.buscarCliente.setValue('');
  }

  cantidadEnDetalle(productoId: number): number {
    return Number(this.valor().detalles?.find(d => d.productoId === productoId)?.cantidad) || 0;
  }

  quitarLinea(indice: number): void {
    if (!this.confirmando() && !this.guardando()) this.detalles.removeAt(indice);
  }

  cambiarCliente(): void {
    if (!this.confirmando() && !this.guardando()) this.form.controls.clienteId.setValue(null);
  }

  private ventaValida(): boolean {
    return this.form.valid && !!this.clienteElegido()?.estado &&
      !this.hayExcesoDeStock() && !this.hayProductoNoDisponible();
  }

  revisar(): void {
    if (this.cargando() || this.cargaFallida() || this.confirmando() || this.guardando()) return;
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
      detalles: valor.detalles.map(d => ({ productoId: Number(d.productoId), cantidad: Number(d.cantidad) })),
    };
    this.guardando.set(true);
    this.ventaService.registrar(dto).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: venta => {
        void this.router.navigate(['/ventas', venta.id], {
          queryParams: this.imprimirAlRegistrar() ? { nueva: 1, imprimir: 1 } : { nueva: 1 },
        });
      },
      error: err => {
        this.guardando.set(false);
        this.confirmando.set(false);
        this.error.set(mensajeError(err));
        this.erroresServidor.set(erroresDeValidacion(err));
        if (err.status === 409) this.actualizarDisponibilidad();
      },
    });
  }

  private actualizarDisponibilidad(): void {
    this.cargando.set(true);
    forkJoin({
      clientes: this.clienteService.listar(0, 100),
      productos: this.productoService.listar(0, 100, 'nombre', 'asc'),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ clientes, productos }) => {
        if (!Array.isArray(clientes) && !Array.isArray(productos)) {
          this.clientes.set(clientes.contenido);
          this.productos.set(productos.contenido);
        }
        this.cargando.set(false);
      },
      error: () => {
        this.error.update(mensaje => `${mensaje ?? ''} No se pudo actualizar la disponibilidad; revise el stock antes de reintentar.`);
        this.cargando.set(false);
      },
    });
  }
}
