export const TAMANIOS_PAGINA = [5, 10, 20, 50, 100];

export function paginaUrl(valor: unknown): number {
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero >= 0 ? numero : 0;
}

export function tamanioUrl(valor: unknown): number {
  const numero = Number(valor);
  return TAMANIOS_PAGINA.includes(numero) ? numero : 20;
}

export function idUrl(valor: unknown): number | null {
  const numero = Number(valor);
  return Number.isSafeInteger(numero) && numero > 0 ? numero : null;
}

export function direccionUrl(valor: unknown): 'asc' | 'desc' {
  return valor === 'desc' ? 'desc' : 'asc';
}
