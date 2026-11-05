# Operaciones manuales vinculadas a las evidencias

Las siguientes operaciones explican los resultados esperados y se contrastan con las capturas originales, que no se han editado. Son un anexo de cálculo, no una captura de ejecución adicional.

| Caso | Operación | Resultado visible | Captura |
|---|---|---|---|
| C-01 | 12.50 × 3 = 37.50 | Subtotal y total 37.50 | [C-01_spa.png](C-01_spa.png) |
| C-02 | 18.90 × 3 = 56.70 | Subtotal y total 56.70 | [C-02_spa.png](C-02_spa.png) |
| C-03 antes | 12.50 × 3 + 1.20 × 2 + 18.90 × 2 = 37.50 + 2.40 + 37.80 = 77.70 | Tres líneas, 7 unidades, 77.70 | [C-03_antes.png](C-03_antes.png) |
| C-03 después | 77.70 − 2.40 = 75.30 | Dos líneas, 5 unidades, 75.30 | [C-03_spa.png](C-03_spa.png) |
| C-04 | 12.50 × 3 + 18.90 × 2 = 75.30 | Venta 41 y HTTP 201 | [C-04_spa-network.png](C-04_spa-network.png) |
| V-04 | 12.50 × 2 = 25.00 | Una línea, 2 unidades, 25.00 | [V-04_spa.png](V-04_spa.png) |
| V-05 aceptada | 12.50 × 1 + 12.50 × 2 = 37.50; stock 27 − (1 + 2) = 24 | Venta 42; stock final 24 | [V-05_api.png](V-05_api.png), [V-05_stock-despues.png](V-05_stock-despues.png) |
| V-05 rollback | Stock 24; 13 + 13 = 26 > 24. Tras primera línea quedan 11 en la transacción; al fallar la segunda, rollback devuelve 24. | 409 disponible 11 solicitado 13; stock final 24 | [V-05_rollback.png](V-05_rollback.png), [V-05_stock-conservado.png](V-05_stock-conservado.png) |
| C-05 antes | 12.50 + 18.90 = 31.40 | Dos líneas, total 31.40 | [C-05_antes.png](C-05_antes.png) |
| C-05 después | 12.50 × 2 + 18.90 = 43.90 | Subtotal A 25.00 y total 43.90 | [C-05_spa.png](C-05_spa.png) |
| M-01 | 4.35 × 2 = 8.70; stock 2 − 2 = 0 | Venta 44; segunda petición 409 | [M-01_primera.png](M-01_primera.png), [M-01_conflicto.png](M-01_conflicto.png) |
| Histórico | 75.30 + 37.50 + 18.90 + 8.70 + 18.90 = 159.30 | Ventas 41–45, total 159.30 | [R-01_historico.png](R-01_historico.png), [I-01_consulta.pdf](I-01_consulta.pdf) |
| Vitaminas | 12.50 × 6 = 75.00 | 6 unidades, 75.00 | [R-01_historico.png](R-01_historico.png) |
| Higiene | 18.90 × 4 + 4.35 × 2 = 75.60 + 8.70 = 84.30 | 6 unidades, 84.30 | [R-01_historico.png](R-01_historico.png) |
| Barras | Higiene: 84.30 / 84.30 × 100 = 100%. Vitaminas: 75 / 84.30 × 100 ≈ 88.968%, mostrado 89%. | 100% y 89% | [R-01_historico.png](R-01_historico.png) |
| Anulación I-01 | El registro 46 añade 12.50 y su anulación lo excluye: 159.30 + 12.50 − 12.50 = 159.30. | 12 unidades y 159.30 tras anulación | [R-07_exclusion-anulada.png](R-07_exclusion-anulada.png) |
