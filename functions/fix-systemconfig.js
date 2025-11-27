const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./src/serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixSystemConfig() {
  console.log('Starting systemConfig fix...');

  const docRef = db.collection('systemConfig').doc('main');
  const doc = await docRef.get();

  if (!doc.exists) {
    console.log('Document does not exist. It will be created on first GET request.');
    process.exit(0);
  }

  const data = doc.data();
  console.log('Current data:', JSON.stringify(data, null, 2));

  // Check if it has the old snake_case format
  if (data.serviceThresholds && data.serviceThresholds.good_range) {
    console.log('Found snake_case format. Converting to camelCase...');

    const fixedData = {
      serviceThresholds: {
        excellent: data.serviceThresholds.excellent || 100,
        goodRange: data.serviceThresholds.good_range || [95, 99],
        regularRange: data.serviceThresholds.regular_range || [80, 94],
        badRange: data.serviceThresholds.bad_range || [50, 79],
        criticalRange: data.serviceThresholds.critical_range || [0, 49]
      },
      notificationTemplate: data.notificationTemplate || '<html><body><p>Hola [Cliente], su reporte está disponible.</p></body></html>',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    await docRef.set(fixedData);
    console.log('✅ Document updated successfully!');
    console.log('New data:', JSON.stringify(fixedData, null, 2));
  } else if (data.serviceThresholds && data.serviceThresholds.goodRange) {
    console.log('✅ Document already has correct camelCase format!');
  } else {
    console.log('❌ Unexpected data structure:', data);
  }

  process.exit(0);
}

fixSystemConfig().catch(error => {
  console.error('Error fixing systemConfig:', error);
  process.exit(1);
});
