/**
 * Script de inicialización para systemStats/main
 *
 * Crea el documento singleton que almacenará estadísticas globales
 * de toda la plataforma.
 *
 * Uso:
 *   node functions/init-system-stats.js
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./src/serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function initSystemStats() {
  console.log('🚀 Iniciando creación del documento systemStats/main...\n');

  const docRef = db.collection('systemStats').doc('main');
  const doc = await docRef.get();

  if (doc.exists) {
    console.log('⚠️  El documento systemStats/main ya existe.');
    const data = doc.data();
    console.log('📊 Datos actuales:');
    console.log(JSON.stringify(data, null, 2));
    console.log('\n💡 Si deseas reinicializar el documento, elimínalo primero desde Firebase Console.');
    process.exit(0);
  }

  // Crear la estructura inicial
  const initialData = {
    totalGlobalUnits: 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  console.log('📝 Creando documento con la siguiente estructura:');
  console.log(JSON.stringify({
    totalGlobalUnits: 0,
    createdAt: 'timestamp',
    updatedAt: 'timestamp'
  }, null, 2));

  await docRef.set(initialData);

  console.log('\n✅ Documento systemStats/main creado exitosamente!');
  console.log('📍 Ruta completa: systemStats/main');
  console.log('🔗 Colección raíz: systemStats\n');

  // Verificar la creación
  const verifyDoc = await docRef.get();
  if (verifyDoc.exists) {
    console.log('✨ Verificación exitosa. Datos guardados:');
    console.log(JSON.stringify(verifyDoc.data(), null, 2));
  }

  process.exit(0);
}

// Ejecutar el script
initSystemStats().catch(error => {
  console.error('❌ Error al crear el documento systemStats:', error);
  process.exit(1);
});
