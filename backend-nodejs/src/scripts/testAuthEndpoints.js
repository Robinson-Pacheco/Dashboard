const axios = require('axios');

/**
 * Script de prueba para los nuevos endpoints de autenticación
 * Uso: node src/scripts/testAuthEndpoints.js [token]
 * 
 * Nota: Requiere que el servidor esté ejecutándose
 */

const args = process.argv.slice(2);
const token = args[0];

if (!token) {
  console.log('❌ Por favor proporciona un token de autenticación');
  console.log('💡 Uso: node src/scripts/testAuthEndpoints.js tu_token_aqui');
  process.exit(1);
}

const API_BASE = 'http://localhost:3000/api/auth';
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

async function testEndpoints() {
  console.log('🧪 Probando nuevos endpoints de autenticación...\n');

  try {
    // Test 1: Listar usuarios
    console.log('📋 Test 1: Listar todos los usuarios');
    console.log(`GET ${API_BASE}/users`);
    
    try {
      const usersResponse = await axios.get(`${API_BASE}/users`, { headers });
      console.log(`✅ Éxito: ${usersResponse.status}`);
      console.log(`📊 Total de usuarios: ${usersResponse.data.data.length}`);
      
      if (usersResponse.data.data.length > 0) {
        console.log(`👤 Primer usuario: ${usersResponse.data.data[0].username} (${usersResponse.data.data[0].role})`);
        console.log(`📝 IDs disponibles para eliminar: ${usersResponse.data.data.map(u => u.id).join(', ')}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Si hay usuarios, intentar eliminar el primero (si no es el admin actual)
    const usersResponse = await axios.get(`${API_BASE}/users`, { headers });
    const availableUsers = usersResponse.data.data.filter(u => u.role !== 'admin');
    
    if (availableUsers.length > 0) {
      const userToDelete = availableUsers[0];
      console.log('🗑️ Test 2: Eliminar usuario');
      console.log(`DELETE ${API_BASE}/users/${userToDelete.id}`);
      console.log(`👤 Usuario a eliminar: ${userToDelete.username} (${userToDelete.role})`);
      
      try {
        const deleteResponse = await axios.delete(`${API_BASE}/users/${userToDelete.id}`, { headers });
        console.log(`✅ Éxito: ${deleteResponse.status}`);
        console.log(`📝 Usuario eliminado: ${deleteResponse.data.data.username}`);
      } catch (error) {
        console.log(`❌ Error: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
    } else {
      console.log('ℹ️ No hay usuarios no-admin disponibles para eliminar');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Intentar eliminar a uno mismo (debería fallar)
    console.log('🚫 Test 3: Intentar eliminarse a uno mismo (debería fallar)');
    
    // Obtener info del usuario actual
    const meResponse = await axios.get(`${API_BASE}/me`, { headers });
    const currentUserId = meResponse.data.data.user.id;
    
    console.log(`DELETE ${API_BASE}/users/${currentUserId}`);
    console.log(`👤 Tu ID: ${currentUserId}`);
    
    try {
      await axios.delete(`${API_BASE}/users/${currentUserId}`, { headers });
      console.log('❌ Error inesperado: No debería poder eliminarse a sí mismo');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ Éxito esperado: ${error.response.status} - ${error.response.data.error}`);
      } else {
        console.log(`❌ Error inesperado: ${error.response?.status} - ${error.response?.data?.error || error.message}`);
      }
    }

    console.log('\n✅ Pruebas completadas!');

  } catch (error) {
    console.log('❌ Error general:', error.message);
    if (error.response?.status === 403) {
      console.log('💡 Asegúrate de estar usando un token de usuario ADMIN');
    }
  }
}

// Ejecutar pruebas
testEndpoints().catch(console.error);