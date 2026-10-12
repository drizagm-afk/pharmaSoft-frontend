/** Round PEN amounts to two decimal places. */
export function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}
