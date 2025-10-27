## Resumen 

La Wialon Remote API es una interfaz HTTP de bajo nivel que permite a los desarrolladores integrar aplicaciones personalizadas con la plataforma Wialon. Su arquitectura se basa en un patrón de request-response mediante llamadas POST, donde cada solicitud especifica un servicio (svc) y sus parámetros (params) en formato JSON.

### Arquitectura

El contrato de la API es consistente y se basa en un único endpoint que recibe solicitudes POST.

Cada solicitud debe contener tres parámetros clave en su payload:

- svc (string): Especifica el servicio a ejecutar, siguiendo el formato `modulo/metodo`. Por ejemplo, core/search_items.

- params (string): Un objeto JSON que contiene todos los argumentos necesarios para el método invocado.

- sid (string): El ID de sesión obtenido tras una autenticación exitosa. Para la autenticación inicial, se usa un token en lugar del sid.

## Módulos Principales de la API

- token/*: Gestiona la autenticación. token/login es el método principal para iniciar una sesión usando un token.

- core/*: Módulo central para operaciones básicas. core/search_items es fundamental para buscar y filtrar unidades, recursos, usuarios, etc., y obtener sus IDs. core/logout termina la sesión. core/batch permite ejecutar múltiples llamadas en una sola solicitud HTTP.

- report/*: Dedicado a la gestión de reportes. Incluye métodos para ejecutar, verificar el estado, obtener resultados, exportar y limpiar reportes.

- resource/*: Administra recursos como geocercas, notificaciones y conductores. Permite crearlos, actualizarlos y obtener sus datos.

- messages/*: Se utiliza para cargar y consultar los mensajes (datos telemáticos) de las unidades en un intervalo de tiempo específico.

- events/*: Gestiona el registro y la consulta de eventos del sistema, como violaciones de velocidad o cambios de estado de sensores.
