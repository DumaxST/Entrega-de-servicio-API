# Documento Singleton de Estadísticas Globales

## 📋 Tabla de Contenido

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Estructura del Documento](#estructura-del-documento)
4. [Implementación](#implementación)
5. [Uso](#uso)
6. [Mantenimiento](#mantenimiento)
7. [Consideraciones Técnicas](#consideraciones-técnicas)

---

## Descripción General

### Propósito

El documento singleton `systemStats/main` almacena métricas agregadas de toda la plataforma, evitando la necesidad de realizar consultas costosas para obtener estadísticas globales.

### Patrón Singleton

Se implementa como un **documento único** en Firestore:
- **Colección**: `systemStats`
- **Documento**: `main`
- **Ruta completa**: `systemStats/main`

### Beneficios

✅ **Performance**: Evita consultas costosas de agregación
✅ **Escalabilidad**: Lecturas O(1) en lugar de O(n)
✅ **Consistencia**: Fuente única de verdad para métricas globales
✅ **Mantenimiento**: Actualizaciones atómicas con FieldValue.increment()

---

## Arquitectura

### Clean Architecture

La implementación sigue los principios de Clean Architecture del proyecto:

```
┌─────────────────────────────────────────┐
│   DOMAIN LAYER                          │
│   ├── entities/system-stats.entity.ts   │
│   ├── datasources/system-stats.ds.ts    │
│   └── repositories/system-stats.repo.ts │
└──────────────────┬──────────────────────┘
                   │ implementado por
┌──────────────────▼──────────────────────┐
│   INFRASTRUCTURE LAYER                  │
│   ├── datasource.imp.ts                 │
│   └── repository.imp.ts                 │
└─────────────────────────────────────────┘
```

### Componentes

#### 1. Entity (`system-stats.entity.ts`)

**Ubicación**: `functions/src/domain/entities/system-stats.entity.ts`

Encapsula la lógica de negocio de las estadísticas globales:

```typescript
export class SystemStatsEntity {
  constructor(
    public readonly totalGlobalUnits: number,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}

  // Factory method
  public static fromObject(object: any): SystemStatsEntity

  // Business methods
  public incrementUnits(amount: number): SystemStatsEntity
  public toObject(): object

  // Getters
  public get hasUnits(): boolean
  public get formattedTotal(): string
}
```

#### 2. DataSource Interface

**Ubicación**: `functions/src/domain/datasources/system-stats.datasource.ts`

Define el contrato de acceso a datos:

```typescript
export abstract class SystemStatsDataSource {
  abstract getStats(): Promise<SystemStatsEntity>
  abstract updateStats(stats: SystemStatsEntity): Promise<SystemStatsEntity>
  abstract incrementGlobalUnits(amount: number): Promise<void>
  abstract initializeStats(): Promise<SystemStatsEntity>
}
```

#### 3. Repository Interface

**Ubicación**: `functions/src/domain/repositories/system-stats.repository.ts`

Misma interfaz que el datasource (patrón adaptador).

#### 4. Firestore Implementation

**Ubicación**: `functions/src/infrastructure/datasource/system-stats.datasource.imp.ts`

Implementa el acceso a Firestore con operaciones atómicas:

```typescript
export class SystemStatsDataSourceImp implements SystemStatsDataSource {
  private readonly collectionPath = "systemStats";
  private readonly docId = "main";

  async incrementGlobalUnits(amount: number): Promise<void> {
    // Operación atómica - no requiere leer primero
    await docRef.update({
      totalGlobalUnits: FieldValue.increment(amount),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}
```

---

## Estructura del Documento

### Schema

```json
{
  "totalGlobalUnits": 0,
  "createdAt": "2025-11-14T10:00:00.000Z",
  "updatedAt": "2025-11-14T10:00:00.000Z"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `totalGlobalUnits` | `number` | Total de dispositivos (unidades) en toda la plataforma |
| `createdAt` | `timestamp` | Fecha de creación del documento |
| `updatedAt` | `timestamp` | Fecha de última actualización |

### Validaciones

- `totalGlobalUnits` debe ser un número >= 0
- Los timestamps se gestionan automáticamente con `FieldValue.serverTimestamp()`

---

## Implementación

### Inicialización

#### Opción 1: Script JavaScript (Recomendado)

```bash
# Desde el directorio raíz del proyecto
node functions/init-system-stats.js
```

**Salida esperada**:
```
🚀 Iniciando creación del documento systemStats/main...
📝 Creando documento con la siguiente estructura:
{
  "totalGlobalUnits": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
✅ Documento systemStats/main creado exitosamente!
```

#### Opción 2: Script TypeScript

```bash
# Compilar y ejecutar
cd functions
npx ts-node scripts/init-system-stats.ts
```

#### Opción 3: Programáticamente

```typescript
import { SystemStatsDataSourceImp } from './infrastructure/datasource/system-stats.datasource.imp';
import { SystemStatsRepositoryImp } from './infrastructure/repositories/system-stats.repository.imp';

const datasource = new SystemStatsDataSourceImp();
const repository = new SystemStatsRepositoryImp(datasource);

// Inicializar
await repository.initializeStats();
```

### Verificación

El script verifica automáticamente si el documento ya existe:

```bash
node functions/init-system-stats.js
```

```
⚠️  El documento systemStats/main ya existe.
📊 Datos actuales:
{
  "totalGlobalUnits": 0,
  ...
}
```

---

## Uso

### 1. Leer Estadísticas

```typescript
import { SystemStatsDataSourceImp } from './infrastructure/datasource/system-stats.datasource.imp';
import { SystemStatsRepositoryImp } from './infrastructure/repositories/system-stats.repository.imp';

const datasource = new SystemStatsDataSourceImp();
const repository = new SystemStatsRepositoryImp(datasource);

// Obtener estadísticas
const stats = await repository.getStats();
console.log(`Total de unidades: ${stats.totalGlobalUnits}`);
console.log(`Total formateado: ${stats.formattedTotal}`); // "1,234"
```

### 2. Incrementar Contador (Operación Atómica)

```typescript
// Incrementar cuando se crea un dispositivo
await repository.incrementGlobalUnits(1);

// Decrementar cuando se elimina un dispositivo
await repository.incrementGlobalUnits(-1);
```

**⚠️ Ventaja de las operaciones atómicas**:
- No requiere leer el documento primero
- Previene condiciones de carrera
- Múltiples Cloud Functions pueden actualizar concurrentemente

### 3. Actualizar Estadísticas Completas

```typescript
const stats = await repository.getStats();
const updatedStats = stats.incrementUnits(5);
await repository.updateStats(updatedStats);
```

### 4. En Cloud Functions

**Ejemplo: Actualizar al crear/eliminar dispositivo**

```typescript
import * as functions from "firebase-functions";
import { SystemStatsDataSourceImp } from "./infrastructure/datasource/system-stats.datasource.imp";
import { SystemStatsRepositoryImp } from "./infrastructure/repositories/system-stats.repository.imp";

export const updateGlobalStatsOnDeviceChange = functions.firestore
  .document("accounts/{accountId}/devices/{deviceId}")
  .onWrite(async (change, context) => {
    const datasource = new SystemStatsDataSourceImp();
    const repository = new SystemStatsRepositoryImp(datasource);

    try {
      const before = change.before.exists;
      const after = change.after.exists;

      if (!before && after) {
        // Dispositivo creado
        await repository.incrementGlobalUnits(1);
        console.log("✅ Global stats incremented: +1");
      } else if (before && !after) {
        // Dispositivo eliminado
        await repository.incrementGlobalUnits(-1);
        console.log("✅ Global stats decremented: -1");
      }
      // Si es una actualización (before && after), no cambiar el contador
    } catch (error) {
      console.error("❌ Error updating global stats:", error);
    }
  });
```

---

## Mantenimiento

### Recalcular Estadísticas

Si las estadísticas se desincronizaron, puedes recalcularlas:

```typescript
import { db } from './config/firebaseAdmin';

async function recalculateGlobalStats() {
  // Contar todos los dispositivos
  let totalDevices = 0;
  const accountsSnapshot = await db.collection('accounts').get();

  for (const accountDoc of accountsSnapshot.docs) {
    const devicesSnapshot = await db
      .collection(`accounts/${accountDoc.id}/devices`)
      .get();
    totalDevices += devicesSnapshot.size;
  }

  // Actualizar el documento
  await db.collection('systemStats').doc('main').update({
    totalGlobalUnits: totalDevices,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`✅ Recalculated: ${totalDevices} units`);
}
```

### Resetear Documento

```bash
# 1. Eliminar el documento existente desde Firebase Console
# 2. Ejecutar el script de inicialización
node functions/init-system-stats.js
```

### Agregar Nuevas Métricas

Para agregar un nuevo campo (por ejemplo, `totalActiveAccounts`):

**1. Actualizar la Entity**:

```typescript
export class SystemStatsEntity {
  constructor(
    public readonly totalGlobalUnits: number,
    public readonly totalActiveAccounts: number, // NUEVO
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}
```

**2. Actualizar el DataSource**:

```typescript
async initializeStats(): Promise<SystemStatsEntity> {
  const defaultStats = {
    totalGlobalUnits: 0,
    totalActiveAccounts: 0, // NUEVO
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
  // ...
}
```

**3. Migrar el documento existente**:

```typescript
await db.collection('systemStats').doc('main').update({
  totalActiveAccounts: 0
});
```

---

## Consideraciones Técnicas

### Performance

| Operación | Complejidad | Costo Firestore |
|-----------|-------------|-----------------|
| Leer stats | O(1) | 1 lectura |
| Incrementar | O(1) | 1 escritura |
| Actualizar | O(1) | 1 escritura |

**vs. Agregación tradicional**:
```typescript
// ❌ Costoso - O(n) lecturas
const snapshot = await db.collectionGroup('devices').get();
const total = snapshot.size; // Miles de lecturas
```

### Concurrencia

Las operaciones atómicas con `FieldValue.increment()` son seguras:

```typescript
// ✅ Seguro - Operación atómica
await repository.incrementGlobalUnits(1);

// ❌ No seguro - Condición de carrera
const stats = await repository.getStats();
const updated = stats.incrementUnits(1);
await repository.updateStats(updated);
```

### Escalabilidad

**Límites de Firestore**:
- Máximo 1 escritura/segundo en un documento
- Si tienes > 1 dispositivo creado/segundo, considera:
  - Sharding (múltiples documentos de stats)
  - Batch updates periódicos
  - Distributed counters

**Solución con Sharding**:
```
systemStats/
  ├── shard_0
  ├── shard_1
  └── shard_2
```

### Consistencia

El documento es **eventualmente consistente**:
- Las actualizaciones de Cloud Functions pueden tener latencia (< 1s típicamente)
- Para datos críticos en tiempo real, lee directamente de la fuente

### Seguridad

**Firestore Rules** (recomendadas):

```javascript
match /systemStats/{document=**} {
  // Solo lectura para usuarios autenticados
  allow read: if request.auth != null;

  // Solo Cloud Functions pueden escribir
  allow write: if false;
}
```

---

## Resumen

### ✅ Criterios de Aceptación Cumplidos

- [x] Nueva colección raíz `systemStats` en Firestore
- [x] Documento único con ID `main`
- [x] Estructura inicial: `{ "totalGlobalUnits": 0 }`
- [x] Script de inicialización funcional
- [x] Arquitectura Clean Architecture
- [x] Operaciones atómicas para concurrencia

### 📁 Archivos Creados

```
functions/
├── init-system-stats.js                          # Script de inicialización
├── scripts/
│   └── init-system-stats.ts                      # Script TypeScript
└── src/
    ├── domain/
    │   ├── entities/
    │   │   └── system-stats.entity.ts            # Entidad de dominio
    │   ├── datasources/
    │   │   └── system-stats.datasource.ts        # Interface datasource
    │   └── repositories/
    │       └── system-stats.repository.ts        # Interface repository
    └── infrastructure/
        ├── datasource/
        │   └── system-stats.datasource.imp.ts    # Implementación Firestore
        └── repositories/
            └── system-stats.repository.imp.ts    # Implementación repository

docs/
└── SYSTEM_STATS_SINGLETON.md                     # Esta documentación
```

### 🚀 Próximos Pasos

1. **Implementar Cloud Function** para mantener `totalGlobalUnits` actualizado
2. **Agregar más métricas** según necesidades del negocio
3. **Crear endpoint REST** para consultar estadísticas
4. **Dashboard**: Integrar stats en el frontend
5. **Monitoring**: Alertas si las stats se desincronizaran

---

**Autor**: Erika F.
**Fecha**: 2025-11-14
**Versión**: 1.0.0
**Historia**: SD-128 - Crear endpoint stats
