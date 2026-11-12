-- S14, pasos 1 a 4. Ejecutar SOLO en una copia/esquema de desarrollo.
-- DBeaver (conexion Oracle): seleccionar desde DECLARE hasta END; inclusive
-- y ejecutar la seleccion con Ctrl+Enter como una sola sentencia.
-- Despues ejecutar los SELECT finales para comprobar los resultados.
-- No usar SET SERVEROUTPUT ON: es un comando de SQL*Plus, no SQL de Oracle.
-- No es una migracion Flyway. No requiere V4 ni columnas de auditoria del paso 5.
-- Las 20000 ventas NO tienen detalle: solo sirven para medir el listado.
-- La carga modifica totales/reportes del esquema de pruebas; no usarlo como produccion.
declare
  categoria number;
  cliente number;
  existentes number;
begin
  select min(id) into categoria from categorias where estado = true;
  select min(id) into cliente from clientes where estado = true;
  if categoria is null or cliente is null then
    raise_application_error(-20001, 'Se necesita una categoria y un cliente activos.');
  end if;
  select count(*) into existentes from productos
    where descripcion = 'Carga de volumen S14 - esquema de desarrollo';
  if existentes > 0 then
    raise_application_error(-20002, 'La carga S14 ya existe. No repetir sobre este esquema.');
  end if;

  insert into productos (nombre, descripcion, precio, stock, estado, categoria_id, fecha_creacion)
  select case mod(level, 10)
      when 0 then 'Paracetamol 500 mg'
      when 1 then 'Ibuprofeno 400 mg'
      when 2 then 'Vitamina C 500 mg'
      when 3 then 'Solucion salina 100 ml'
      when 4 then 'Alcohol medicinal 70%'
      when 5 then 'Gasa esteril'
      when 6 then 'Protector solar FPS 50'
      when 7 then 'Jabon liquido 250 ml'
      when 8 then 'Suero oral 500 ml'
      else 'Termometro digital'
    end || ' Ref. ' || lpad(level, 5, '0'),
    'Carga de volumen S14 - esquema de desarrollo',
    round(dbms_random.value(1, 200), 2), trunc(dbms_random.value(0, 500)),
    true, categoria, systimestamp
  from dual connect by level <= 5000;
  dbms_output.put_line('Productos insertados: ' || sql%rowcount);

  insert into ventas (fecha, total, estado, cliente_id)
  select timestamp '2026-11-12 12:00:00' - numtodsinterval(dbms_random.value(0, 365), 'DAY'),
    round(dbms_random.value(5, 500), 2), 'REGISTRADA', cliente
  from dual connect by level <= 20000;
  dbms_output.put_line('Ventas insertadas: ' || sql%rowcount);
  commit;
exception
  when others then
    rollback;
    raise;
end;

select count(*) total_productos from productos;
select count(*) productos_carga_s14 from productos
  where descripcion = 'Carga de volumen S14 - esquema de desarrollo';
select count(*) total_ventas from ventas;
-- La ultima pagina real es floor((total_productos - 1) / 20), no siempre 249.
select floor((count(*) - 1) / 20) ultima_pagina_base_cero from productos;
