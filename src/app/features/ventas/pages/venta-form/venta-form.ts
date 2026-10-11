import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensajeError } from '../../../../core/utils/http-error';
import { redondear } from '../../../../core/utils/numeros';
import { Cliente } from '../../../clientes/models/cliente.model';
import { ClienteService } from '../../../clientes/services/cliente-service';
import { Producto } from '../../../productos/models/producto.model';
import { ProductoService } from '../../../productos/services/producto-service';

interface LineaForm {
  productoId: FormControl<number | null>;
  cantidad: FormControl<number>;
}

@Component({
  selector: 'app-venta-form',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './venta-form.html',
  styleUrl: './venta-form.css',
})
export class VentaForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly clienteService = inject(ClienteService);
  private readonly productoService = inject(ProductoService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly clientes = signal<Cliente[]>([]);
  protected readonly productos = signal<Producto[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);
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

  get detalles() { return this.form.controls.detalles; }

  ngOnInit(): void {
    forkJoin({
      clientes: this.clienteService.listar(0, 100),
      productos: this.productoService.listar(0, 100, 'nombre', 'asc'),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: ({ clientes, productos }) => {
        if (Array.isArray(clientes) || Array.isArray(productos)) {
          this.error.set('El servidor debe devolver clientes y productos paginados.');
        } else {
          this.clientes.set(clientes.contenido.filter(c => c.estado));
          this.productos.set(productos.contenido.filter(p => p.estado && p.stock > 0));
        }
        this.cargando.set(false);
      },
      error: err => { this.error.set(mensajeError(err)); this.cargando.set(false); },
    });
  }

  agregarProducto(producto: Producto): void {
    const existente = this.detalles.controls.find(l => l.controls.productoId.value === producto.id);
    if (existente) {
      existente.controls.cantidad.setValue(Number(existente.controls.cantidad.value) + 1);
      return;
    }
    this.detalles.push(this.fb.group({
      productoId: this.fb.control<number | null>(producto.id, Validators.required),
      cantidad: this.fb.control(1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]),
    }));
  }

  quitarLinea(indice: number): void { this.detalles.removeAt(indice); }

  cambiarCliente(): void { this.form.controls.clienteId.setValue(null); }
}
