import { HttpErrorResponse } from '@angular/common/http';
import { erroresDeValidacion, mensajeError } from './http-error';

describe('HTTP error messages', () => {
  const databaseMessage = 'could not execute statement [ORA-02292: restricción de integridad (SYSVENTASDB.FK_TEST) violada - registro secundario encontrado] [delete from categorias where id=?]';

  it('replaces a referenced-record database error with the supplied business message', () => {
    const err = new HttpErrorResponse({ status: 409, error: { message: databaseMessage } });
    const friendly = 'No se puede eliminar la categoría porque tiene productos asociados.';
    expect(mensajeError(err, friendly)).toBe(friendly);
  });

  it('handles a plain-text database response even with status 500', () => {
    const err = new HttpErrorResponse({ status: 500, error: databaseMessage });
    expect(mensajeError(err)).toBe('No se puede eliminar este registro porque tiene registros asociados.');
  });

  it('preserves a readable backend conflict message', () => {
    const err = new HttpErrorResponse({ status: 409, error: { message: 'La categoría ya existe.' } });
    expect(mensajeError(err)).toBe('La categoría ya existe.');
  });

  it('does not misclassify a different Oracle error as a referenced-record error', () => {
    const err = new HttpErrorResponse({ status: 500, error: { message: 'ORA-02291: parent key not found' } });
    expect(mensajeError(err)).toBe('ORA-02291: parent key not found');
  });

  it('keeps the connection error understandable', () => {
    expect(mensajeError(new HttpErrorResponse({ status: 0 }))).toContain('No se pudo conectar');
  });

  it('keeps field validation errors available to the form', () => {
    const validationErrors = { nombre: 'El nombre es obligatorio.' };
    const err = new HttpErrorResponse({ status: 400, error: { validationErrors } });
    expect(erroresDeValidacion(err)).toEqual(validationErrors);
  });
});
