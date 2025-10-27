# Autenticación

La autenticación se gestiona a través de un token que, al ser validado, devuelve un ID de sesión (sid) para las llamadas subsecuentes. El flujo de trabajo típico implica la autenticación, la búsqueda de identificadores de ítems (como unidades o recursos), la ejecución de operaciones (como la generación de reportes), la consulta de resultados y, finalmente, la limpieza de la sesión.

[Cliente]                                [Servidor Wialon API]
    |                                              |
    |-- 1. Login (token/login con token) --------->|
    |                                              |
    |<-- 2. Recibe { "eid": `sid` ... } ----------|  (Guarda el sid)
    |                                              |
    |-- 3. Búsqueda (core/search_items) ---------->|  (Busca IDs de unidad/recurso)
    |    (Usa el sid guardado)                     |
    |                                              |
    |<-- 4. Recibe { "items": [...] } -------------|  (Obtiene IDs)
    |                                              |
    |-- 5. Ejecutar Reporte (report/exec_report) ->|  (Envía IDs y parámetros)
    |                                              |
    |<-- 6. Recibe { ... } ------------------------|  (Reporte en cola)
    |                                              |
    |-- 7. Polling (report/get_report_status) ---->|  (Pregunta periódicamente)
    |                                              |
    |<-- 8. Recibe { "status": <1, 2, o 4> } ------|  (Espera hasta que status sea 4)
    |                                              |
    |-- 9. Obtener Datos (report/get_report_data) ->|
    |       o                                      |
    |-- 9. Exportar (report/export_result) ------>|
    |                                              |
    |<-- 10. Recibe Datos/Archivo -----------------|
    |                                              |
    |-- 11. Limpiar (report/cleanup_result) ------>|  (Libera recursos del servidor)
    |                                              |
    |<-- 12. Recibe { "error": 0 } ----------------|
    |                                              |
    |-- (Opcional) Logout (core/logout) ---------->|
    |                                              |

## Autenticación y Sesión
La autenticación se basa en tokens. Un token es una clave de acceso única que autoriza a una aplicación a interactuar con los datos de Wialon en nombre de un usuario.

Flujo de Autenticación:

Se realiza una llamada a token/login con el token como parámetro.

Si el token es válido, la API devuelve un objeto JSON que contiene eid (el ID de sesión o sid).

Este sid debe incluirse en todas las solicitudes posteriores.

