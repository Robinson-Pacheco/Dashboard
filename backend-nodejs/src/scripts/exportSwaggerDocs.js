const fs = require('fs');
const path = require('path');
const axios = require('axios');

/**
 * Script para exportar la documentación de Swagger/OpenAPI a archivos JSON y TXT
 * Uso: node src/scripts/exportSwaggerDocs.js [url] [outputDir]
 */

// Configuración por defecto
const DEFAULT_URL = 'http://localhost:3000/api-docs/swagger.json';
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../../docs');

// Obtener parámetros de línea de comandos
const args = process.argv.slice(2);
const swaggerUrl = args[0] || DEFAULT_URL;
const outputDir = args[1] ? path.resolve(args[1]) : DEFAULT_OUTPUT_DIR;

// Crear directorio de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function exportSwaggerDocs() {
  try {
    console.log(`📥 Obteniendo documentación de: ${swaggerUrl}`);
    
    // Obtener la especificación OpenAPI
    const response = await axios.get(swaggerUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });

    const swaggerSpec = response.data;
    
    // Guardar como JSON
    const jsonPath = path.join(outputDir, 'api-documentation.json');
    fs.writeFileSync(jsonPath, JSON.stringify(swaggerSpec, null, 2));
    console.log(`✅ Documentación JSON guardada en: ${jsonPath}`);

    // Generar versión TXT legible
    const txtPath = path.join(outputDir, 'api-documentation.txt');
    const txtContent = generateReadableDocumentation(swaggerSpec);
    fs.writeFileSync(txtPath, txtContent);
    console.log(`✅ Documentación TXT guardada en: ${txtPath}`);

    // Generar resumen para IA
    const aiPath = path.join(outputDir, 'api-documentation-ai.txt');
    const aiContent = generateAIDocumentation(swaggerSpec);
    fs.writeFileSync(aiPath, aiContent);
    console.log(`✅ Documentación para IA guardada en: ${aiPath}`);

    console.log(`\n📊 Resumen de la API:`);
    console.log(`   - Título: ${swaggerSpec.info?.title || 'N/A'}`);
    console.log(`   - Versión: ${swaggerSpec.info?.version || 'N/A'}`);
    console.log(`   - Descripción: ${swaggerSpec.info?.description || 'N/A'}`);
    console.log(`   - Total de endpoints: ${countEndpoints(swaggerSpec)}`);
    console.log(`   - Total de esquemas: ${Object.keys(swaggerSpec.components?.schemas || {}).length}`);

  } catch (error) {
    console.error('❌ Error al exportar la documentación:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Asegúrate de que el servidor esté ejecutándose en el puerto correcto.');
      console.error('   Puedes iniciar el servidor con: npm start');
      console.error('   O especificar una URL diferente: node src/scripts/exportSwaggerDocs.js http://localhost:3001/api-docs/swagger.json');
    }
    
    process.exit(1);
  }
}

function generateReadableDocumentation(spec) {
  let content = '';
  
  // Información general
  content += '='.repeat(60) + '\n';
  content += `DOCUMENTACIÓN DE API: ${spec.info?.title || 'API Sin Título'}\n`;
  content += '='.repeat(60) + '\n\n';
  
  if (spec.info?.description) {
    content += `Descripción: ${spec.info.description}\n\n`;
  }
  
  content += `Versión: ${spec.info?.version || 'N/A'}\n`;
  content += `Servidores: ${spec.servers?.map(s => s.url).join(', ') || 'N/A'}\n\n`;

  // Esquemas/Modelos
  if (spec.components?.schemas) {
    content += '\n' + '-'.repeat(40) + '\n';
    content += 'ESQUEMAS DE DATOS (MODELOS)\n';
    content += '-'.repeat(40) + '\n\n';
    
    for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
      content += `${schemaName}:\n`;
      if (schema.description) {
        content += `  Descripción: ${schema.description}\n`;
      }
      
      if (schema.properties) {
        content += '  Propiedades:\n';
        for (const [propName, prop] of Object.entries(schema.properties)) {
          const required = schema.required?.includes(propName) ? ' (REQUERIDO)' : '';
          const type = prop.type || 'object';
          const description = prop.description ? ` - ${prop.description}` : '';
          content += `    - ${propName}: ${type}${description}${required}\n`;
        }
      }
      content += '\n';
    }
  }

  // Endpoints
  if (spec.paths) {
    content += '\n' + '-'.repeat(40) + '\n';
    content += 'ENDPOINTS DE LA API\n';
    content += '-'.repeat(40) + '\n\n';
    
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (typeof operation === 'object' && operation.summary) {
          content += `${method.toUpperCase()} ${path}\n`;
          content += `  Resumen: ${operation.summary}\n`;
          
          if (operation.description) {
            content += `  Descripción: ${operation.description}\n`;
          }
          
          if (operation.tags) {
            content += `  Etiquetas: ${operation.tags.join(', ')}\n`;
          }
          
          if (operation.security) {
            content += `  Seguridad: Requiere autenticación\n`;
          }
          
          // Parámetros
          if (operation.parameters) {
            content += '  Parámetros:\n';
            operation.parameters.forEach(param => {
              const required = param.required ? ' (REQUERIDO)' : '';
              content += `    - ${param.name} (${param.in}): ${param.description || 'Sin descripción'}${required}\n`;
            });
          }
          
          // Respuestas
          if (operation.responses) {
            content += '  Respuestas:\n';
            for (const [statusCode, response] of Object.entries(operation.responses)) {
              content += `    ${statusCode}: ${response.description || 'Sin descripción'}\n`;
            }
          }
          
          content += '\n';
        }
      }
    }
  }

  return content;
}

function generateAIDocumentation(spec) {
  let content = '';
  
  content += `# Documentación de API: ${spec.info?.title}\n\n`;
  content += `## Información General\n`;
  content += `- **Versión**: ${spec.info?.version || 'N/A'}\n`;
  content += `- **Descripción**: ${spec.info?.description || 'N/A'}\n`;
  content += `- **Servidor**: ${spec.servers?.[0]?.url || 'N/A'}\n\n`;

  // Esquemas
  if (spec.components?.schemas) {
    content += `## Esquemas de Datos\n\n`;
    
    for (const [schemaName, schema] of Object.entries(spec.components.schemas)) {
      content += `### ${schemaName}\n`;
      content += `${schema.description || 'Sin descripción'}\n\n`;
      
      if (schema.properties) {
        content += `**Propiedades:**\n`;
        for (const [propName, prop] of Object.entries(schema.properties)) {
          const required = schema.required?.includes(propName) ? ' ✅' : '';
          const type = prop.type || 'object';
          const description = prop.description || '';
          content += `- \`${propName}\` (${type}): ${description}${required}\n`;
        }
        content += '\n';
      }
    }
  }

  // Endpoints
  if (spec.paths) {
    content += `## Endpoints\n\n`;
    
    // Agrupar por tags
    const endpointsByTag = {};
    
    for (const [path, pathItem] of Object.entries(spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (typeof operation === 'object' && operation.summary) {
          const tags = operation.tags || ['Sin categoría'];
          tags.forEach(tag => {
            if (!endpointsByTag[tag]) {
              endpointsByTag[tag] = [];
            }
            endpointsByTag[tag].push({
              method: method.toUpperCase(),
              path,
              operation
            });
          });
        }
      }
    }
    
    for (const [tag, endpoints] of Object.entries(endpointsByTag)) {
      content += `### ${tag}\n\n`;
      
      endpoints.forEach(({ method, path, operation }) => {
        content += `**${method} \`${path}\`**\n`;
        content += `- **Resumen**: ${operation.summary}\n`;
        
        if (operation.description) {
          content += `- **Descripción**: ${operation.description}\n`;
        }
        
        if (operation.security?.length > 0) {
          content += `- **Autenticación**: ✅ Requerida\n`;
        }
        
        // Parámetros
        if (operation.parameters?.length > 0) {
          content += `- **Parámetros**:\n`;
          operation.parameters.forEach(param => {
            const required = param.required ? ' (requerido)' : '';
            content += `  - \`${param.name}\` (${param.in}): ${param.description || 'Sin descripción'}${required}\n`;
          });
        }
        
        // Respuestas principales
        if (operation.responses) {
          const successResponse = operation.responses['200'] || operation.responses['201'];
          if (successResponse) {
            content += `- **Éxito**: ${successResponse.description}\n`;
          }
        }
        
        content += '\n';
      });
    }
  }

  return content;
}

function countEndpoints(spec) {
  let count = 0;
  if (spec.paths) {
    for (const pathItem of Object.values(spec.paths)) {
      for (const method of ['get', 'post', 'put', 'delete', 'patch']) {
        if (pathItem[method]) {
          count++;
        }
      }
    }
  }
  return count;
}

// Ejecutar el script
if (require.main === module) {
  exportSwaggerDocs();
}

module.exports = { exportSwaggerDocs, generateReadableDocumentation, generateAIDocumentation };