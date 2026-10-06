import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ClienteRequest } from '../../models/cliente.model';
import { ClienteService } from '../../services/cliente-service';
import { erroresDeValidacion, mensajeError } from '../../../../core/utils/http-error';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
  styleUrl: './cliente-form.css',
})
export class ClienteForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(ClienteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly id = input<string>();
  protected readonly cargando = signal(false);
  protected readonly guardando = signal(false);
  protected readonly cargaFallida = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly erroresServidor = signal<Record<string, string>>({});
  protected readonly campos = [
    { clave: 'dni', etiqueta: 'DNI', tipo: 'text', ayuda: 'El DNI es obligatorio y debe tener exactamente 8 dígitos.', maximo: 8 },
    { clave: 'nombres', etiqueta: 'Nombres', tipo: 'text', ayuda: 'Los nombres son obligatorios y deben tener entre 2 y 100 caracteres.', maximo: 100 },
    { clave: 'apellidos', etiqueta: 'Apellidos', tipo: 'text', ayuda: 'Los apellidos son obligatorios y deben tener entre 2 y 100 caracteres.', maximo: 100 },
    { clave: 'email', etiqueta: 'Correo electrónico', tipo: 'email', ayuda: 'Ingrese un correo válido de hasta 150 caracteres.', maximo: 150 },
    { clave: 'telefono', etiqueta: 'Teléfono (opcional)', tipo: 'tel', ayuda: 'El teléfono debe tener exactamente 9 dígitos.', maximo: 9 },
  ] as const;
  protected readonly form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: ['', [Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.maxLength(250)]],
    estado: [true],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) return;
    if (!/^\d+$/.test(id) || Number(id) <= 0 || !Number.isSafeInteger(Number(id))) {
      this.error.set('El identificador del cliente no es válido.');
      this.cargaFallida.set(true);
      return;
    }
    this.cargando.set(true);
    this.service.obtener(Number(id)).pipe(
      takeUntilDestroyed(this.destroyRef), finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: c => this.form.setValue({ dni: c.dni, nombres: c.nombres, apellidos: c.apellidos,
        email: c.email, telefono: c.telefono ?? '', direccion: c.direccion ?? '', estado: c.estado }),
      error: err => { this.error.set(mensajeError(err)); this.cargaFallida.set(true); },
    });
  }

  guardar(): void {
    if (this.guardando() || this.cargando() || this.cargaFallida()) return;
    // Validate the same trimmed text that will be sent to the API.
    const valor = this.form.getRawValue();
    this.form.patchValue({ dni: valor.dni.trim(), nombres: valor.nombres.trim(),
      apellidos: valor.apellidos.trim(), email: valor.email.trim(),
      telefono: valor.telefono.trim(), direccion: valor.direccion.trim() });
    this.error.set(null);
    this.erroresServidor.set({});
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const dto: ClienteRequest = { ...v, telefono: v.telefono || null, direccion: v.direccion || null };
    const peticion = this.id() ? this.service.actualizar(Number(this.id()), dto) : this.service.crear(dto);
    this.guardando.set(true);
    peticion.pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this.guardando.set(false))).subscribe({
      next: () => { void this.router.navigate(['/clientes']); },
      error: err => { this.error.set(mensajeError(err)); this.erroresServidor.set(erroresDeValidacion(err)); },
    });
  }
}
