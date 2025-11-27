/**
 * Script de prueba para verificar la integración de updateAccountStatsOnDeviceChange
 * con el contador global de systemStats/main
 *
 * Este script:
 * 1. Lee el contador global actual
 * 2. Crea un dispositivo de prueba
 * 3. Espera 2 segundos para que la Cloud Function se ejecute
 * 4. Verifica que el contador global se incrementó
 * 5. Elimina el dispositivo de prueba
 * 6. Espera 2 segundos
 * 7. Verifica que el contador global se decrementó
 *
 * Uso:
 *   node functions/test-global-stats.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./src/serviceAccount.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Función auxiliar para esperar
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testGlobalStatsIntegration() {
  console.log('🧪 Iniciando prueba de integración de estadísticas globales...\n');

  const testAccountId = 'TEST_ACCOUNT_' + Date.now();
  const testDeviceId = 'TEST_DEVICE_' + Date.now();

  try {
    // 1. Crear cuenta de prueba
    console.log('1️⃣  Creando cuenta de prueba...');
    await db.collection('accounts').doc(testAccountId).set({
      clientCode: testAccountId,
      companyName: 'Test Company',
      status: 'active',
      stats: {
        totalUnits: 0,
        reportingUnits: 0,
        nonReportingUnits: 0,
        deviceStatusBreakdown: {
          reporting: 0,
          not_reporting: 0,
          maintenance: 0,
          inactive: 0
        },
        deviceStatusPercentages: {
          reporting: 0,
          not_reporting: 0,
          maintenance: 0,
          inactive: 0
        },
        deliveryPercentage: 0,
        status: 'bueno'
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Cuenta creada: ${testAccountId}\n`);

    // 2. Leer contador global inicial
    console.log('2️⃣  Leyendo contador global inicial...');
    const globalStatsDoc = await db.collection('systemStats').doc('main').get();

    if (!globalStatsDoc.exists) {
      console.error('❌ Error: El documento systemStats/main no existe.');
      console.error('   Ejecuta: node functions/init-system-stats.js');
      return;
    }

    const initialGlobalCount = globalStatsDoc.data().totalGlobalUnits;
    console.log(`   Contador global inicial: ${initialGlobalCount}\n`);

    // 3. Crear dispositivo de prueba
    console.log('3️⃣  Creando dispositivo de prueba...');
    await db.collection(`accounts/${testAccountId}/devices`).doc(testDeviceId).set({
      uid: '123456789012345',
      name: 'Test GPS Device',
      deviceType: 'GPS Tracker',
      platform: 'wialon',
      status: 'reporting',
      daysWithoutReporting: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log(`✅ Dispositivo creado: ${testDeviceId}`);

    // 4. Esperar a que la Cloud Function se ejecute
    console.log('⏳ Esperando 3 segundos para que la Cloud Function se ejecute...\n');
    await sleep(3000);

    // 5. Verificar que el contador global se incrementó
    console.log('4️⃣  Verificando incremento del contador global...');
    const afterCreateDoc = await db.collection('systemStats').doc('main').get();
    const afterCreateCount = afterCreateDoc.data().totalGlobalUnits;

    console.log(`   Contador global después de crear: ${afterCreateCount}`);

    if (afterCreateCount === initialGlobalCount + 1) {
      console.log('✅ El contador global se incrementó correctamente (+1)\n');
    } else {
      console.error(`❌ Error: Esperado ${initialGlobalCount + 1}, obtenido ${afterCreateCount}\n`);
    }

    // 6. Verificar stats de la cuenta
    console.log('5️⃣  Verificando stats de la cuenta...');
    const accountDoc = await db.collection('accounts').doc(testAccountId).get();
    const accountStats = accountDoc.data().stats;

    console.log('   Stats de la cuenta:', JSON.stringify(accountStats, null, 2));

    if (accountStats.totalUnits === 1 && accountStats.reportingUnits === 1) {
      console.log('✅ Las stats de la cuenta se actualizaron correctamente\n');
    } else {
      console.error('❌ Error: Las stats de la cuenta no se actualizaron correctamente\n');
    }

    // 7. Eliminar dispositivo de prueba
    console.log('6️⃣  Eliminando dispositivo de prueba...');
    await db.collection(`accounts/${testAccountId}/devices`).doc(testDeviceId).delete();
    console.log(`✅ Dispositivo eliminado: ${testDeviceId}`);

    // 8. Esperar a que la Cloud Function se ejecute
    console.log('⏳ Esperando 3 segundos para que la Cloud Function se ejecute...\n');
    await sleep(3000);

    // 9. Verificar que el contador global se decrementó
    console.log('7️⃣  Verificando decremento del contador global...');
    const afterDeleteDoc = await db.collection('systemStats').doc('main').get();
    const afterDeleteCount = afterDeleteDoc.data().totalGlobalUnits;

    console.log(`   Contador global después de eliminar: ${afterDeleteCount}`);

    if (afterDeleteCount === initialGlobalCount) {
      console.log('✅ El contador global se decrementó correctamente (-1)\n');
    } else {
      console.error(`❌ Error: Esperado ${initialGlobalCount}, obtenido ${afterDeleteCount}\n`);
    }

    // 10. Verificar stats de la cuenta después de eliminar
    console.log('8️⃣  Verificando stats de la cuenta después de eliminar...');
    const accountDocAfterDelete = await db.collection('accounts').doc(testAccountId).get();
    const accountStatsAfterDelete = accountDocAfterDelete.data().stats;

    console.log('   Stats de la cuenta:', JSON.stringify(accountStatsAfterDelete, null, 2));

    if (accountStatsAfterDelete.totalUnits === 0) {
      console.log('✅ Las stats de la cuenta se actualizaron correctamente a 0\n');
    } else {
      console.error('❌ Error: Las stats de la cuenta no se actualizaron correctamente\n');
    }

    // 11. Limpiar: eliminar cuenta de prueba
    console.log('9️⃣  Limpiando: eliminando cuenta de prueba...');
    await db.collection('accounts').doc(testAccountId).delete();
    console.log(`✅ Cuenta eliminada: ${testAccountId}\n`);

    console.log('🎉 ¡Prueba completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   • Contador global inicial: ${initialGlobalCount}`);
    console.log(`   • Después de crear dispositivo: ${afterCreateCount} (${afterCreateCount === initialGlobalCount + 1 ? '✅' : '❌'})`);
    console.log(`   • Después de eliminar dispositivo: ${afterDeleteCount} (${afterDeleteCount === initialGlobalCount ? '✅' : '❌'})`);

  } catch (error) {
    console.error('\n❌ Error durante la prueba:', error);

    // Intentar limpiar en caso de error
    try {
      console.log('\n🧹 Intentando limpiar recursos de prueba...');
      await db.collection(`accounts/${testAccountId}/devices`).doc(testDeviceId).delete();
      await db.collection('accounts').doc(testAccountId).delete();
      console.log('✅ Recursos limpiados');
    } catch (cleanupError) {
      console.error('⚠️  No se pudo limpiar completamente:', cleanupError.message);
    }
  } finally {
    process.exit(0);
  }
}

// Ejecutar la prueba
testGlobalStatsIntegration();
