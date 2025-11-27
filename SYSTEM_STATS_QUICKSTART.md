# Guía Rápida: Sistema de Estadísticas Globales

## 🚀 Inicio Rápido

### 1. Inicializar el Documento Singleton

```bash
node functions/init-system-stats.js
```

**Resultado**:
- Crea la colección `systemStats`
- Crea el documento `main` con `{ totalGlobalUnits: 0 }`

### 2. Verificar Creación

El script detecta automáticamente si ya existe:

```bash
node functions/init-system-stats.js
# ⚠️ El documento systemStats/main ya existe.
```

---

## 📖 Uso Básico

### Leer Estadísticas

```typescript
import { SystemStatsDataSourceImp } from './infrastructure/datasource/system-stats.datasource.imp';
import { SystemStatsRepositoryImp } from './infrastructure/repositories/system-stats.repository.imp';

const datasource = new SystemStatsDataSourceImp();
const repository = new SystemStatsRepositoryImp(datasource);

const stats = await repository.getStats();
console.log(`Total unidades: ${stats.totalGlobalUnits}`);
```

### Incrementar Contador (Atómico)

```typescript
// +1 cuando se crea un dispositivo
await repository.incrementGlobalUnits(1);

// -1 cuando se elimina un dispositivo
await repository.incrementGlobalUnits(-1);
```

---

## 🔧 Integración con Cloud Functions

### Agregar al index.ts

```typescript
// functions/index.ts
import {
  updateGlobalStatsOnDeviceChange,
  recalculateGlobalStats
} from "./src/cloud-functions/update-global-stats.function";

// Exportar las funciones
export {
  updateGlobalStatsOnDeviceChange,
  recalculateGlobalStats
};
```

### Desplegar

```bash
npm run build
firebase deploy --only functions:updateGlobalStatsOnDeviceChange
firebase deploy --only functions:recalculateGlobalStats
```

---

## 📊 Estructura del Documento

**Ruta**: `systemStats/main`

```json
{
  "totalGlobalUnits": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🛠️ Mantenimiento

### Recalcular Estadísticas (si se desincronizaron)

#### Opción 1: Llamar Cloud Function

```bash
firebase functions:call recalculateGlobalStats
```

#### Opción 2: Script Manual

```typescript
import { db, FieldValue } from './config/firebaseAdmin';

async function recalculate() {
  let total = 0;
  const accounts = await db.collection('accounts').get();

  for (const account of accounts.docs) {
    const devices = await db.collection(`accounts/${account.id}/devices`).get();
    total += devices.size;
  }

  await db.collection('systemStats').doc('main').update({
    totalGlobalUnits: total,
    updatedAt: FieldValue.serverTimestamp()
  });

  console.log(`✅ Total: ${total} unidades`);
}
```

---

## 📁 Archivos Creados

```
functions/
├── init-system-stats.js                              # ⭐ Script inicialización
├── src/
│   ├── domain/
│   │   ├── entities/system-stats.entity.ts
│   │   ├── datasources/system-stats.datasource.ts
│   │   └── repositories/system-stats.repository.ts
│   ├── infrastructure/
│   │   ├── datasource/system-stats.datasource.imp.ts
│   │   └── repositories/system-stats.repository.imp.ts
│   └── cloud-functions/
│       └── update-global-stats.function.ts           # ⭐ Cloud Function

docs/
├── SYSTEM_STATS_SINGLETON.md                         # Documentación completa
└── SYSTEM_STATS_QUICKSTART.md                        # Esta guía
```

---

## ✅ Checklist de Implementación

- [x] Inicializar documento singleton
- [ ] Agregar Cloud Function al index.ts
- [ ] Desplegar Cloud Function
- [ ] Configurar Firestore Security Rules
- [ ] Crear endpoint REST para consultar stats (opcional)
- [ ] Integrar en el frontend (opcional)

---

## 🔒 Security Rules (Recomendadas)

```javascript
// firestore.rules
match /systemStats/{document=**} {
  allow read: if request.auth != null;  // Solo usuarios autenticados
  allow write: if false;                 // Solo Cloud Functions
}
```

---

## 📚 Documentación Completa

Para más detalles, consulta: `docs/SYSTEM_STATS_SINGLETON.md`

---

**Autor**: Erika F.
**Fecha**: 2025-11-14
**Historia**: SD-128
