import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth-service';
import { PerfilUsuario, Permiso } from '../../../../core/auth/auth.model';
import { mensajeError } from '../../../../core/utils/http-error';

const MODULOS: { nombre: string; permisos: { codigo: Permiso; etiqueta: string }[] }[] = [
  {
    nombre: 'Catálogo',
    permisos: [
      { codigo: 'CATALOGO_LEER', etiqueta: 'Consultar catálogo' },
      { codigo: 'CATALOGO_ESCRIBIR', etiqueta: 'Administrar catálogo' },
    ],
  },
  {
    nombre: 'Clientes',
    permisos: [
      { codigo: 'CLIENTES_LEER', etiqueta: 'Consultar clientes' },
      { codigo: 'CLIENTES_ESCRIBIR', etiqueta: 'Administrar clientes' },
    ],
  },
  {
    nombre: 'Ventas',
    permisos: [
      { codigo: 'VENTAS_LEER', etiqueta: 'Consultar ventas' },
      { codigo: 'VENTAS_REGISTRAR', etiqueta: 'Registrar ventas' },
    ],
  },
  { nombre: 'Reportes', permisos: [{ codigo: 'REPORTES_VER', etiqueta: 'Consultar reportes' }] },
  {
    nombre: 'Usuarios',
    permisos: [{ codigo: 'USUARIOS_ADMINISTRAR', etiqueta: 'Administrar usuarios' }],
  },
];

@Component({
  selector: 'app-mi-cuenta',
  templateUrl: './mi-cuenta.html',
  styleUrl: './mi-cuenta.css',
})
export class MiCuenta implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly perfil = signal<PerfilUsuario | null>(null);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly modulos = MODULOS;
  protected readonly permisosCambiaron = computed(() => {
    const perfil = this.perfil();
    const sesion = this.auth.sesion();
    if (!perfil || !sesion) return false;
    const servidor = new Set(perfil.permisos);
    const guardados = new Set(sesion.permisos);
    return servidor.size !== guardados.size || [...servidor].some((p) => !guardados.has(p));
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    if (this.cargando()) return;
    this.cargando.set(true);
    this.error.set(null);
    this.perfil.set(null);
    this.auth
      .obtenerPerfil()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (perfil) => this.perfil.set(perfil),
        error: (err) => this.error.set(mensajeError(err)),
      });
  }

  tienePermiso(permiso: Permiso): boolean {
    return this.perfil()?.permisos.includes(permiso) ?? false;
  }
}
