# Integración de Estadísticas Globales en updateAccountStatsOnDeviceChange

## 📋 Resumen de Cambios

La Cloud Function `updateAccountStatsOnDeviceChange` ha sido refactorizada para actualizar tanto las estadísticas de la cuenta como el contador global de dispositivos en el documento singleton `systemStats/main` de forma **atómica** usando **Write Batch**.

---

## 🎯 Objetivo

Mantener sincronizado el contador global `totalGlobalUnits` con el número real de dispositivos en la plataforma, actualizándolo automáticamente cada vez que se crea o elimina un dispositivo.

---

## ⚙️ Implementación

### Cambios Realizados

#### 1. **Detección de Tipo de Operación**

```typescript
// Detectar el tipo de operación
const isCreate = !change.before.exists && change.after.exists;
const isDelete = change.before.exists && !change.after.exists;

let operationType = "update";
if (isCreate) operationType = "create";
if (isDelete) operationType = "delete";
```

**Casos:**
- **onCreate**: `!change.before.exists && change.after.exists` → Dispositivo creado
- **onDelete**: `change.before.exists && !change.after.exists` → Dispositivo eliminado
- **onUpdate**: `change.before.exists && change.after.exists` → Dispositivo actualizado

#### 2. **Write Batch para Atomicidad**

```typescript
// Crear Write Batch
const batch = db.batch();

// Agregar actualización de stats de la cuenta
const accountRef = db.collection("accounts").doc(accountId);
batch.update(accountRef, {
  "stats.totalUnits": totalUnits,
  "stats.reportingUnits": statusBreakdown.reporting,
  // ... más stats
});

// Agregar actualización del contador global
const globalStatsRef = db.doc("systemStats/main");

if (isCreate) {
  batch.update(globalStatsRef, {
    totalGlobalUnits: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp(),
  });
} else if (isDelete) {
  batch.update(globalStatsRef, {
    totalGlobalUnits: FieldValue.increment(-1),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

// Ejecutar batch de forma atómica
await batch.commit();
```

**Ventajas del Write Batch:**
- ✅ **Atomicidad**: Ambas operaciones se ejecutan o fallan juntas
- ✅ **Consistencia**: No hay posibilidad de que una actualización falle y la otra no
- ✅ **Performance**: Una sola llamada de red en lugar de dos

#### 3. **Incremento/Decremento Atómico**

```typescript
// onCreate: Incrementar contador global
totalGlobalUnits: FieldValue.increment(1)

// onDelete: Decrementar contador global
totalGlobalUnits: FieldValue.increment(-1)

// onUpdate: No modificar el contador (solo actualizar stats del account)
```

**Uso de `FieldValue.increment()`:**
- Operación atómica en Firestore
- No requiere leer el documento primero
- Previene condiciones de carrera
- Múltiples Cloud Functions pueden ejecutarse concurrentemente

---

## 📊 Flujo de Ejecución

### Caso 1: Crear Dispositivo

```
1. Usuario crea dispositivo via API
   └─> POST /accounts/{accountId}/devices

2. Firestore: Dispositivo creado en accounts/{accountId}/devices/{deviceId}

3. Trigger: updateAccountStatsOnDeviceChange (onWrite)

4. Cloud Function detecta: isCreate = true

5. Leer todos los dispositivos del account

6. Calcular stats: totalUnits, statusBreakdown, etc.

7. Crear Write Batch:
   ├─> batch.update(accountRef, { stats: {...} })
   └─> batch.update(globalStatsRef, { totalGlobalUnits: FieldValue.increment(1) })

8. Ejecutar: batch.commit()

9. Resultado:
   ├─> Account stats actualizadas ✅
   └─> Global counter incrementado (+1) ✅
```

### Caso 2: Eliminar Dispositivo

```
1. Usuario elimina dispositivo via API
   └─> DELETE /accounts/{accountId}/devices/{deviceId}

2. Firestore: Dispositivo eliminado de accounts/{accountId}/devices/{deviceId}

3. Trigger: updateAccountStatsOnDeviceChange (onWrite)

4. Cloud Function detecta: isDelete = true

5. Leer dispositivos restantes del account

6. Calcular stats actualizadas

7. Crear Write Batch:
   ├─> batch.update(accountRef, { stats: {...} })
   └─> batch.update(globalStatsRef, { totalGlobalUnits: FieldValue.increment(-1) })

8. Ejecutar: batch.commit()

9. Resultado:
   ├─> Account stats actualizadas ✅
   └─> Global counter decrementado (-1) ✅
```

### Caso 3: Actualizar Dispositivo

```
1. Usuario actualiza dispositivo via API
   └─> PUT /accounts/{accountId}/devices/{deviceId}

2. Firestore: Dispositivo actualizado en accounts/{accountId}/devices/{deviceId}

3. Trigger: updateAccountStatsOnDeviceChange (onWrite)

4. Cloud Function detecta: isUpdate = true

5. Leer todos los dispositivos del account

6. Calcular stats actualizadas

7. Crear Write Batch:
   └─> batch.update(accountRef, { stats: {...} })
   (NO actualizar global counter - el total no cambió)

8. Ejecutar: batch.commit()

9. Resultado:
   ├─> Account stats actualizadas ✅
   └─> Global counter sin cambios ✅
```

---

## 🔍 Criterios de Aceptación (AC)

### ✅ AC 1: Firma del Trigger No Cambia
```typescript
export const updateAccountStatsOnDeviceChange = functions.firestore
  .document("accounts/{accountId}/devices/{deviceId}")  // ✅ Sin cambios
  .onWrite(async (change, context) => {
```

### ✅ AC 2: Uso de Write Batch
```typescript
const batch = db.batch();  // ✅ Implementado

// Agregar operaciones al batch
batch.update(accountRef, {...});
batch.update(globalStatsRef, {...});

// Commit atómico
await batch.commit();  // ✅ Implementado
```

### ✅ AC 3: Referencia al Documento Global
```typescript
const globalStatsRef = db.doc('systemStats/main');  // ✅ Implementado
```

### ✅ AC 4: onCreate - Incrementar Ambos Contadores
```typescript
if (isCreate) {
  // Account stats
  batch.update(accountRef, {
    "stats.totalUnits": totalUnits,  // ✅ Recalculado
    // ... más stats
  });

  // Global counter
  batch.update(globalStatsRef, {
    totalGlobalUnits: FieldValue.increment(1)  // ✅ Incremento atómico
  });
}
```

### ✅ AC 5: onDelete - Decrementar Ambos Contadores
```typescript
if (isDelete) {
  // Account stats
  batch.update(accountRef, {
    "stats.totalUnits": totalUnits,  // ✅ Recalculado
    // ... más stats
  });

  // Global counter
  batch.update(globalStatsRef, {
    totalGlobalUnits: FieldValue.increment(-1)  // ✅ Decremento atómico
  });
}
```

### ✅ AC 6: Ejecutar Batch Commit
```typescript
await batch.commit();  // ✅ Implementado al final
```

---

## 🧪 Testing

### Prueba Manual (Requiere emuladores o deployment)

#### Opción 1: Con Firebase Emulators

```bash
# Terminal 1: Iniciar emuladores
firebase emulators:start

# Terminal 2: Ejecutar test
node functions/test-global-stats.js
```

#### Opción 2: Con Deployment

```bash
# 1. Compilar
cd functions
npm run build

# 2. Desplegar solo esta función
firebase deploy --only functions:updateAccountStatsOnDeviceChange

# 3. Crear dispositivo via API y verificar logs
firebase functions:log --only updateAccountStatsOnDeviceChange
```

### Verificación Manual

```bash
# 1. Leer contador global actual
curl -X GET http://localhost:5001/.../api/system-stats
# O en Firestore Console: systemStats/main

# 2. Crear dispositivo
curl -X POST http://localhost:5001/.../api/accounts/ACCOUNT_ID/devices \
  -H "Content-Type: application/json" \
  -d '{
    "uid": "123456789012345",
    "name": "GPS Test",
    "platform": "wialon",
    "status": "reporting",
    "deviceType": "GPS Tracker"
  }'

# 3. Verificar que el contador global se incrementó
# systemStats/main.totalGlobalUnits debería ser +1

# 4. Eliminar dispositivo
curl -X DELETE http://localhost:5001/.../api/accounts/ACCOUNT_ID/devices/DEVICE_ID

# 5. Verificar que el contador global se decrementó
# systemStats/main.totalGlobalUnits debería volver al valor original
```

---

## 📝 Logging

La función ahora incluye logs mejorados para debugging:

```typescript
console.log(`📍 [DeviceChange] Operation: ${operationType} | Device: ${deviceId} | Account: ${accountId}`);

// onCreate
console.log(`✅ [GlobalStats] Device created | Global counter: +1`);

// onDelete
console.log(`✅ [GlobalStats] Device deleted | Global counter: -1`);

// Resultado final
console.log(`✅ [AccountStats] Account ${accountId} stats updated successfully:`, {
  totalUnits,
  statusBreakdown,
  statusPercentages,
  deliveryPercentage,
  deliveryStatus,
  operationType,
});
```

**Formato de logs:**
- `📍 [DeviceChange]` - Información de la operación
- `✅ [GlobalStats]` - Actualización del contador global
- `✅ [AccountStats]` - Actualización de stats de la cuenta
- `❌ Error` - Errores capturados

---

## 🚨 Manejo de Errores

```typescript
try {
  // ... operaciones
  await batch.commit();
  return null;
} catch (error) {
  console.error(`❌ Error updating account ${accountId} stats:`, error);
  // No lanzamos el error para evitar reintentos innecesarios
  return null;
}
```

**Estrategia:**
- Capturar errores y logearlos
- No lanzar excepciones (evitar reintentos infinitos)
- Retornar `null` para indicar finalización de la función

**Si el batch falla:**
- Ninguna actualización se aplica (rollback automático)
- Stats del account NO cambian
- Contador global NO cambia
- Ambas permanecen consistentes ✅

---

## 🔄 Sincronización y Consistencia

### Garantías de Atomicidad

**Write Batch garantiza:**
```
SI batch.commit() ÉXITO:
  ├─> Account stats actualizadas ✅
  └─> Global counter actualizado ✅

SI batch.commit() FALLA:
  ├─> Account stats SIN CAMBIOS ✅
  └─> Global counter SIN CAMBIOS ✅
```

**No hay estado intermedio** donde una actualización se aplique y la otra no.

### Prevención de Race Conditions

```typescript
// ✅ SEGURO: FieldValue.increment() es atómico
totalGlobalUnits: FieldValue.increment(1)

// ❌ NO SEGURO: Requiere leer primero (race condition)
const stats = await getStats();
const newTotal = stats.totalGlobalUnits + 1;
await updateStats(newTotal);
```

### Tolerancia a Fallos

**Escenarios manejados:**
1. **Falla la lectura de dispositivos**: No se ejecuta el batch
2. **Falla la lectura de systemConfig**: Usa valores por defecto
3. **Falla el batch.commit()**: Rollback automático, ambas actualizaciones canceladas
4. **Multiple concurrent executions**: `FieldValue.increment()` maneja concurrencia

---

## 📈 Performance

### Operaciones en la Cloud Function

| Operación | Cantidad | Costo Firestore |
|-----------|----------|-----------------|
| Leer dispositivos del account | 1 query | n lecturas |
| Leer systemConfig | 1 lectura | 1 lectura |
| Batch write | 1 batch | 2 escrituras |

**Total (onCreate/onDelete):**
- Lecturas: n + 1 (n = dispositivos del account)
- Escrituras: 2 (account + global)

**Total (onUpdate):**
- Lecturas: n + 1
- Escrituras: 1 (solo account, no global)

### Comparación con Enfoque Anterior

**Antes:**
```typescript
await accountRef.update({...});  // 1 escritura
// Sin actualización global
```

**Ahora:**
```typescript
await batch.commit();  // 2 escrituras en 1 batch
```

**Impacto:** +1 escritura por operación onCreate/onDelete, pero con atomicidad garantizada.

---

## 🔐 Seguridad

### Firestore Security Rules (Recomendadas)

```javascript
// firestore.rules
match /systemStats/{document=**} {
  // Solo lectura para usuarios autenticados
  allow read: if request.auth != null;

  // Solo Cloud Functions pueden escribir
  allow write: if false;
}

match /accounts/{accountId} {
  // Stats solo modificables por Cloud Functions
  allow update: if request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['stats', 'updatedAt']) == false;
}
```

---

## 🛠️ Troubleshooting

### Problema: Contador Global No Se Actualiza

**Síntomas:**
- `totalGlobalUnits` no cambia al crear/eliminar dispositivos

**Causas posibles:**
1. Cloud Function no desplegada
2. Documento `systemStats/main` no existe
3. Error en el batch que causa rollback

**Solución:**
```bash
# 1. Verificar que el documento existe
node functions/init-system-stats.js

# 2. Desplegar la función
npm run build
firebase deploy --only functions:updateAccountStatsOnDeviceChange

# 3. Verificar logs
firebase functions:log --only updateAccountStatsOnDeviceChange
```

### Problema: Stats del Account No Coinciden con Global

**Síntomas:**
- Suma de `totalUnits` de todas las cuentas ≠ `totalGlobalUnits`

**Causa:** Desincronización (posible si hubo errores)

**Solución:**
```bash
# Recalcular estadísticas globales
firebase functions:call recalculateGlobalStats
```

---

## 📚 Referencias

- **Implementación**: `functions/index.ts` líneas 80-227
- **Entity**: `functions/src/domain/entities/system-stats.entity.ts`
- **DataSource**: `functions/src/infrastructure/datasource/system-stats.datasource.imp.ts`
- **Documentación**: `docs/SYSTEM_STATS_SINGLETON.md`
- **Test Script**: `functions/test-global-stats.js`

---

## ✅ Checklist de Deployment

- [x] Código refactorizado con Write Batch
- [x] Documento `systemStats/main` inicializado
- [x] Compilación exitosa (sin errores TypeScript)
- [ ] Prueba en emuladores locales
- [ ] Deployment a Firebase Functions
- [ ] Verificación en producción
- [ ] Logs confirmando incrementos/decrementos
- [ ] Security Rules configuradas

---

**Autor**: Senior Developer
**Fecha**: 2025-11-14
**Historia**: SD-128 - Modificar updateAccountStatsOnDeviceChange
**Status**: ✅ Implementación Completa - Pendiente Deployment
