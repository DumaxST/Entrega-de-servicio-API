# Implementación de Métricas Históricas - Historical Stats

## Resumen Ejecutivo

Se ha implementado un sistema completo de métricas históricas que rastrea automáticamente los servicios completados mes a mes. Esta funcionalidad permite generar reportes de rendimiento basados en datos históricos confiables.

---

## Arquitectura de la Implementación

### 1. Modelo de Datos (Domain Layer)

#### **Ubicación**: `functions/src/domain/entities/account.entity.ts`

Se agregaron dos nuevas interfaces al modelo de datos:

```typescript
/**
 * Estadísticas mensuales de servicios completados
 * Contadores que se incrementan cuando un ticket se completa
 */
export interface MonthlyStats {
    instalacionesCompletadas: number;
    renovacionesCompletadas: number;
    reubicacionesCompletadas: number;
    ticketsSoporteCerrados: number;
}

/**
 * Historial de estadísticas por mes
 * La clave es el formato "YYYY_MM" (ej: "2024_11" para noviembre 2024)
 */
export interface HistoricalStats {
    [monthKey: string]: MonthlyStats;
}
```

**Cambios en AccountEntity**:
- Se agregó el campo opcional `historicalStats?: HistoricalStats` al constructor
- Se actualizó el método `fromObject()` para parsear y validar `historicalStats`

---

### 2. Capa de Infraestructura

#### **Ubicación**: `functions/src/infrastructure/datasource/account.datasource.imp.ts`

**Cambios**:
- Al crear una nueva cuenta, se inicializa `historicalStats: {}` como objeto vacío
- Los métodos de lectura (`getAll`, `getById`) automáticamente mapean el campo gracias a `AccountEntity.fromObject()`

---

### 3. Cloud Function - Actualización Automática

#### **Ubicación**: `functions/index.ts`

#### **Función**: `updateHistoricalStatsOnTicketComplete`

**Trigger**:
```typescript
functions.firestore
  .document("accounts/{accountId}/serviceTickets/{ticketId}")
  .onWrite(...)
```

**Flujo de Ejecución**:

1. **Detección de Cambio de Estado**
   - Solo procesa cuando un ticket cambia a estado "completado"
   - Ignora creaciones, eliminaciones y tickets ya completados

2. **Garantía de Idempotencia**
   - Usa `eventId` único de Firebase para evitar procesamiento duplicado
   - Guarda eventos procesados en subcolección `_processedEvents`
   - Si el evento ya fue procesado, se omite silenciosamente

3. **Extracción de Fecha**
   - Obtiene la fecha de finalización del campo `updatedAt` del ticket
   - Fallback a fecha actual si `updatedAt` no está disponible
   - Soporta tanto Date objects como Firestore Timestamps

4. **Generación de Clave de Mes**
   - Formato: `YYYY_MM` (ej: `2024_11` para noviembre 2024)
   - Se calcula basándose en la fecha de finalización

5. **Mapeo de Tipo de Servicio**
   ```typescript
   switch (ticketType) {
     case "instalacion":
       fieldToIncrement = `historicalStats.${monthKey}.instalacionesCompletadas`;
       break;
     case "renovacion":
       fieldToIncrement = `historicalStats.${monthKey}.renovacionesCompletadas`;
       break;
     case "reubicacion":
       fieldToIncrement = `historicalStats.${monthKey}.reubicacionesCompletadas`;
       break;
     case "soporte":
       fieldToIncrement = `historicalStats.${monthKey}.ticketsSoporteCerrados`;
       break;
   }
   ```

6. **Actualización Atómica**
   - Usa `FieldValue.increment(1)` para incrementar el contador
   - No requiere leer el documento primero
   - Evita race conditions en escrituras concurrentes
   - Actualiza también el campo `updatedAt` de la cuenta

---

## Estructura de Datos en Firestore

### Ejemplo de Documento Account:

```json
{
  "id": "account123",
  "clientCode": "CLIENT001",
  "companyName": "Empresa XYZ",
  "status": "active",
  "stats": { ... },
  "historicalStats": {
    "2024_10": {
      "instalacionesCompletadas": 15,
      "renovacionesCompletadas": 8,
      "reubicacionesCompletadas": 3,
      "ticketsSoporteCerrados": 22
    },
    "2024_11": {
      "instalacionesCompletadas": 12,
      "renovacionesCompletadas": 10,
      "reubicacionesCompletadas": 5,
      "ticketsSoporteCerrados": 18
    }
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-11-08T12:00:00Z"
}
```

### Subcolección de Eventos Procesados:

```
accounts/{accountId}/_processedEvents/{eventId}
{
  "ticketId": "ticket123",
  "processedAt": "2024-11-08T12:00:00Z",
  "eventType": "ticket_completed"
}
```

---

## Características Técnicas

### ✅ Idempotencia
- **Problema**: Firebase puede ejecutar Cloud Functions más de una vez para el mismo evento
- **Solución**: Se usa el `eventId` único para rastrear eventos procesados
- **Implementación**: Subcolección `_processedEvents` en cada cuenta

### ✅ Operaciones Atómicas
- **Problema**: Múltiples tickets pueden completarse simultáneamente
- **Solución**: `FieldValue.increment(1)` es atómico a nivel de Firestore
- **Beneficio**: No hay riesgo de conteos incorrectos por race conditions

### ✅ Rendimiento Optimizado
- **No lee el documento**: La actualización usa dot notation
- **Solo escribe**: `update({ "historicalStats.2024_11.instalacionesCompletadas": increment(1) })`
- **Costo**: 1 escritura por ticket completado (mínimo posible)

### ✅ Manejo de Errores Robusto
- Logging detallado en cada paso
- Los errores no se propagan (evita reintentos infinitos)
- Validaciones en cada etapa del procesamiento

---

## Uso y Consultas

### Consultar Métricas de un Mes Específico

```typescript
// Obtener cuenta con métricas
const accountDoc = await db.collection("accounts").doc(accountId).get();
const accountData = accountDoc.data();

// Acceder a métricas de noviembre 2024
const november2024 = accountData.historicalStats["2024_11"];
console.log(`Instalaciones: ${november2024.instalacionesCompletadas}`);
console.log(`Renovaciones: ${november2024.renovacionesCompletadas}`);
console.log(`Reubicaciones: ${november2024.reubicacionesCompletadas}`);
console.log(`Tickets Soporte: ${november2024.ticketsSoporteCerrados}`);
```

### Generar Reporte de Rango de Fechas

```typescript
// Obtener todas las métricas y filtrar por rango
const accountDoc = await db.collection("accounts").doc(accountId).get();
const historicalStats = accountDoc.data()?.historicalStats || {};

// Filtrar por año 2024
const stats2024 = Object.entries(historicalStats)
  .filter(([monthKey]) => monthKey.startsWith("2024_"))
  .map(([monthKey, stats]) => ({
    month: monthKey,
    ...stats
  }));

// Calcular totales del año
const totals = stats2024.reduce((acc, month) => ({
  instalaciones: acc.instalaciones + month.instalacionesCompletadas,
  renovaciones: acc.renovaciones + month.renovacionesCompletadas,
  reubicaciones: acc.reubicaciones + month.reubicacionesCompletadas,
  soporte: acc.soporte + month.ticketsSoporteCerrados
}), { instalaciones: 0, renovaciones: 0, reubicaciones: 0, soporte: 0 });
```

### Migración de Datos Históricos (Script Opcional)

Si necesitas inicializar métricas históricas para tickets completados antes de esta implementación:

```typescript
// Script de migración (ejecutar una vez)
async function migrateHistoricalData(accountId: string) {
  const ticketsSnapshot = await db
    .collection(`accounts/${accountId}/serviceTickets`)
    .where("status", "==", "completado")
    .get();

  const updates: { [key: string]: any } = {};

  ticketsSnapshot.forEach(doc => {
    const ticket = doc.data();
    const completionDate = ticket.updatedAt?.toDate() || new Date();
    const year = completionDate.getFullYear();
    const month = String(completionDate.getMonth() + 1).padStart(2, "0");
    const monthKey = `${year}_${month}`;

    let fieldName: string;
    switch (ticket.type) {
      case "instalacion":
        fieldName = `historicalStats.${monthKey}.instalacionesCompletadas`;
        break;
      case "renovacion":
        fieldName = `historicalStats.${monthKey}.renovacionesCompletadas`;
        break;
      case "reubicacion":
        fieldName = `historicalStats.${monthKey}.reubicacionesCompletadas`;
        break;
      case "soporte":
        fieldName = `historicalStats.${monthKey}.ticketsSoporteCerrados`;
        break;
    }

    updates[fieldName] = FieldValue.increment(1);
  });

  await db.collection("accounts").doc(accountId).update(updates);
  console.log(`✅ Migrated ${ticketsSnapshot.size} historical tickets for account ${accountId}`);
}
```

---

## Testing

### Prueba Manual

1. **Crear un ticket**:
```bash
curl -X POST http://localhost:5001/.../accounts/{accountId}/serviceTickets \
  -H "Content-Type: application/json" \
  -d '{
    "type": "instalacion",
    "status": "pendiente",
    "description": "Instalar GPS en vehículo nuevo"
  }'
```

2. **Completar el ticket**:
```bash
curl -X PUT http://localhost:5001/.../accounts/{accountId}/serviceTickets/{ticketId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completado"
  }'
```

3. **Verificar métricas**:
```bash
curl http://localhost:5001/.../accounts/{accountId}
```

Deberías ver `historicalStats` con el contador incrementado.

### Logs Esperados

```
✅ Ticket ticket123 cambió de estado "en_progreso" a "completado"
📅 Mes de finalización: 2024_11
✅ Métricas históricas actualizadas para cuenta account123: {
  monthKey: '2024_11',
  ticketType: 'instalacion',
  fieldIncremented: 'historicalStats.2024_11.instalacionesCompletadas'
}
```

---

## Mantenimiento y Consideraciones

### Limpieza de Eventos Procesados
La subcolección `_processedEvents` crecerá con el tiempo. Considera implementar una Cloud Function programada para limpiar eventos antiguos (>30 días):

```typescript
export const cleanupProcessedEvents = functions.pubsub
  .schedule("0 0 * * 0") // Cada domingo a medianoche
  .onRun(async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const accountsSnapshot = await db.collection("accounts").get();

    for (const accountDoc of accountsSnapshot.docs) {
      const eventsToDelete = await accountDoc.ref
        .collection("_processedEvents")
        .where("processedAt", "<", thirtyDaysAgo)
        .get();

      const batch = db.batch();
      eventsToDelete.forEach(doc => batch.delete(doc.ref));
      await batch.commit();

      console.log(`Cleaned ${eventsToDelete.size} old events for account ${accountDoc.id}`);
    }
  });
```

### Costos de Firestore
- **Escrituras**: 1 por ticket completado + 1 por evento procesado = 2 escrituras
- **Lecturas**: 1 para verificar idempotencia = 1 lectura
- **Total por ticket completado**: 2 escrituras + 1 lectura

### Escalabilidad
- El sistema escala horizontalmente sin problemas
- Múltiples tickets pueden completarse simultáneamente
- Las operaciones atómicas garantizan consistencia

---

## Archivos Modificados

1. ✅ `functions/src/domain/entities/account.entity.ts`
   - Agregadas interfaces `MonthlyStats` y `HistoricalStats`
   - Actualizado constructor y método `fromObject()`

2. ✅ `functions/src/infrastructure/datasource/account.datasource.imp.ts`
   - Inicialización de `historicalStats` en método `createAccount()`

3. ✅ `functions/index.ts`
   - Agregada Cloud Function `updateHistoricalStatsOnTicketComplete`
   - Importado `FieldValue` desde firebaseAdmin

---

## Estado de la Implementación

✅ **Completado**:
- Modelo de datos (interfaces y entidades)
- Capa de infraestructura (datasource)
- Cloud Function con lógica idempotente
- Operaciones atómicas con `FieldValue.increment()`
- Manejo de errores y logging
- Type-check pasado
- Build exitoso
- Linter (solo warnings de `any` consistentes con el codebase)

📝 **Próximos Pasos Sugeridos**:
1. Desplegar a Firebase Functions
2. Probar con datos reales
3. Implementar script de migración para datos históricos (opcional)
4. Crear endpoints API para consultar métricas históricas
5. Implementar limpieza automática de eventos procesados antiguos

---

## Deployment

Para desplegar la nueva funcionalidad:

```bash
# 1. Compilar el código
npm run build

# 2. Desplegar a Firebase
firebase deploy --only functions

# 3. Verificar que ambas funciones se desplegaron
firebase functions:list
```

Deberías ver:
- ✅ `api` (HTTP function)
- ✅ `updateAccountStatsOnDeviceChange` (Firestore trigger)
- ✅ `updateHistoricalStatsOnTicketComplete` (Firestore trigger) ← **NUEVA**

---

## Soporte

Para cualquier problema o pregunta sobre esta implementación, referirse a:
- Este documento de implementación
- Logs de Cloud Functions en Firebase Console
- Arquitectura general en `docs/BACKEND_ARCHITECTURE.md`

**Autor**: Erika Flores (eflores@dumaxst.com)
**Fecha**: 2025-11-08
**Branch**: subtask-SD-120-be-cloud-function-stats
