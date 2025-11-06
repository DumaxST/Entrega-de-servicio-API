# Google Secret Manager - Configuración y Uso

Esta guía explica cómo usar Google Secret Manager para almacenar y gestionar secretos de forma segura en tu aplicación.

## ¿Por qué usar Google Secret Manager?

Google Secret Manager te permite:
- **No almacenar secretos en texto plano** en tu base de datos Firestore
- **Centralizar la gestión de secretos** en un servicio seguro
- **Controlar el acceso** mediante IAM (Identity and Access Management)
- **Auditar el acceso** a los secretos
- **Rotar secretos** sin modificar tu código

## Arquitectura

En lugar de guardar los tokens de API directamente en Firestore:

```json
{
  "name": "Wialon",
  "credentials": {
    "token": "SECRET_TOKEN_123456789"  // ❌ NUNCA hagas esto
  }
}
```

Solo guardas **referencias** a los secretos:

```json
{
  "name": "Wialon",
  "credentials": {
    "tokenSecretName": "WIALON_API_TOKEN"  // ✅ Solo la referencia
  }
}
```

El valor real del secreto se almacena de forma segura en Google Secret Manager.

## Prerrequisitos

1. Tener instalado el [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)
2. Estar autenticado con gcloud:
   ```bash
   gcloud auth login
   ```
3. Configurar el proyecto correcto:
   ```bash
   gcloud config set project service-delivery-development
   ```

## Comandos gcloud para gestionar secretos

### 1. Crear un nuevo secreto

Para crear un secreto llamado `WIALON_API_TOKEN`:

```bash
# Opción 1: Ingresar el valor manualmente (recomendado para producción)
echo -n "tu_token_secreto_aqui" | gcloud secrets create WIALON_API_TOKEN \
  --data-file=- \
  --replication-policy="automatic" \
  --project=service-delivery-development
```

```bash
# Opción 2: Crear desde un archivo
echo -n "tu_token_secreto_aqui" > /tmp/secret.txt
gcloud secrets create WIALON_API_TOKEN \
  --data-file=/tmp/secret.txt \
  --replication-policy="automatic" \
  --project=service-delivery-development
rm /tmp/secret.txt  # Eliminar el archivo después de crear el secreto
```

**Parámetros:**
- `WIALON_API_TOKEN`: Nombre del secreto (debe coincidir con el valor de `tokenSecretName` en Firestore)
- `--data-file=-`: Lee el valor desde stdin
- `--replication-policy="automatic"`: Replica automáticamente en todas las regiones
- `--project`: Tu proyecto de Google Cloud

### 2. Listar todos los secretos

```bash
gcloud secrets list --project=service-delivery-development
```

### 3. Ver información de un secreto

```bash
gcloud secrets describe WIALON_API_TOKEN --project=service-delivery-development
```

### 4. Acceder al valor de un secreto

```bash
# Obtener la última versión
gcloud secrets versions access latest \
  --secret=WIALON_API_TOKEN \
  --project=service-delivery-development
```

```bash
# Obtener una versión específica
gcloud secrets versions access 1 \
  --secret=WIALON_API_TOKEN \
  --project=service-delivery-development
```

### 5. Actualizar un secreto (agregar nueva versión)

```bash
echo -n "nuevo_token_secreto" | gcloud secrets versions add WIALON_API_TOKEN \
  --data-file=- \
  --project=service-delivery-development
```

**Nota:** Esto NO elimina la versión anterior, crea una nueva versión. La aplicación siempre usará la versión `latest` por defecto.

### 6. Listar versiones de un secreto

```bash
gcloud secrets versions list WIALON_API_TOKEN --project=service-delivery-development
```

### 7. Eliminar un secreto

```bash
gcloud secrets delete WIALON_API_TOKEN --project=service-delivery-development
```

**⚠️ Advertencia:** Esta acción es irreversible y eliminará todas las versiones del secreto.

### 8. Otorgar permisos para acceder a un secreto

Para que Cloud Functions pueda acceder a los secretos, necesitas otorgar permisos:

```bash
# Obtener el service account de Cloud Functions
PROJECT_ID="service-delivery-development"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

# Otorgar permiso de lectura (Secret Manager Secret Accessor)
gcloud secrets add-iam-policy-binding WIALON_API_TOKEN \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=service-delivery-development
```

### 9. Verificar permisos de un secreto

```bash
gcloud secrets get-iam-policy WIALON_API_TOKEN --project=service-delivery-development
```

## Ejemplo de uso completo

### 1. Crear el secreto en Google Secret Manager

```bash
# Crear el secreto para Wialon
echo -n "wialon_token_abc123xyz789" | gcloud secrets create WIALON_API_TOKEN \
  --data-file=- \
  --replication-policy="automatic" \
  --project=service-delivery-development

# Verificar que se creó correctamente
gcloud secrets describe WIALON_API_TOKEN --project=service-delivery-development
```

### 2. Otorgar permisos a Cloud Functions

```bash
PROJECT_ID="service-delivery-development"
SERVICE_ACCOUNT="${PROJECT_ID}@appspot.gserviceaccount.com"

gcloud secrets add-iam-policy-binding WIALON_API_TOKEN \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/secretmanager.secretAccessor" \
  --project=service-delivery-development
```

### 3. Crear el documento en Firestore

Usa la API del backend para crear la plataforma:

```bash
# POST /platform
curl -X POST http://localhost:5000/service-delivery-development/us-central1/api/platform \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wialon",
    "credentials": {
      "tokenSecretName": "WIALON_API_TOKEN"
    }
  }'
```

### 4. Usar el secreto en tu código

```typescript
import { SecretManagerService } from '../services/secret-manager.service';

// Crear instancia del servicio
const secretManager = new SecretManagerService();

// Obtener el token desde Secret Manager
const token = await secretManager.getSecret('WIALON_API_TOKEN');

// Usar el token para hacer llamadas a la API
console.log('Token obtenido:', token);
```

## Estructura de Firestore

Tu documento en la colección `platforms` debe verse así:

```json
{
  "id": "abc123",
  "name": "Wialon",
  "credentials": {
    "tokenSecretName": "WIALON_API_TOKEN"
  },
  "createdAt": "2025-01-15T10:00:00.000Z"
}
```

## Endpoints de la API

### GET /platform
Obtiene todas las plataformas configuradas.

**Response:**
```json
{
  "platforms": [
    {
      "id": "abc123",
      "name": "Wialon",
      "credentials": {
        "tokenSecretName": "WIALON_API_TOKEN"
      },
      "createdAt": "2025-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /platform
Crea una nueva plataforma.

**Request:**
```json
{
  "name": "Wialon",
  "credentials": {
    "tokenSecretName": "WIALON_API_TOKEN"
  }
}
```

**Response (201):**
```json
{
  "newPlatform": {
    "id": "abc123",
    "name": "Wialon",
    "credentials": {
      "tokenSecretName": "WIALON_API_TOKEN"
    },
    "createdAt": "2025-01-15T10:00:00.000Z"
  }
}
```

### GET /platform/:id
Obtiene una plataforma específica por ID.

### PUT /platform/:id
Actualiza una plataforma existente.

**Request:**
```json
{
  "credentials": {
    "tokenSecretName": "NEW_WIALON_TOKEN"
  }
}
```

### DELETE /platform/:id
Elimina una plataforma.

## Buenas prácticas

1. **Nunca guardes secretos en código fuente o archivos de configuración**
2. **Usa nombres descriptivos** para tus secretos (ej: `WIALON_API_TOKEN`, `STRIPE_SECRET_KEY`)
3. **Rota los secretos regularmente** usando `gcloud secrets versions add`
4. **Usa el principio de mínimo privilegio** al otorgar permisos IAM
5. **Audita el acceso** a los secretos regularmente con `gcloud secrets get-iam-policy`
6. **Documenta** qué secretos usa cada servicio
7. **No expongas los valores de los secretos** en logs o respuestas de API

## Solución de problemas

### Error: "Permission denied"

```bash
# Verifica que tu cuenta tenga permisos
gcloud auth list

# Verifica los permisos del service account
gcloud projects get-iam-policy service-delivery-development \
  --flatten="bindings[].members" \
  --format="table(bindings.role)" \
  --filter="bindings.members:serviceAccount:service-delivery-development@appspot.gserviceaccount.com"
```

### Error: "Secret not found"

```bash
# Lista todos los secretos para verificar el nombre
gcloud secrets list --project=service-delivery-development
```

### Error: "Failed to access secret version"

```bash
# Verifica que el secreto tenga versiones
gcloud secrets versions list WIALON_API_TOKEN --project=service-delivery-development

# Verifica los permisos IAM
gcloud secrets get-iam-policy WIALON_API_TOKEN --project=service-delivery-development
```

## Recursos adicionales

- [Documentación oficial de Google Secret Manager](https://cloud.google.com/secret-manager/docs)
- [Mejores prácticas para Secret Manager](https://cloud.google.com/secret-manager/docs/best-practices)
- [Pricing de Secret Manager](https://cloud.google.com/secret-manager/pricing)
- [Secret Manager con Firebase Functions](https://cloud.google.com/functions/docs/configuring/secrets)

## Instalación de dependencias

Para usar Secret Manager en tu proyecto, asegúrate de instalar la librería:

```bash
cd functions
npm install @google-cloud/secret-manager
```

Ya está incluido en el código del servicio `SecretManagerService` en:
```
functions/src/services/secret-manager.service.ts
```
