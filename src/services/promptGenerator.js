export function generatePrompts(data) {
  return {
    analysisPrompt: generateAnalysisPrompt(data),
    stitchPrompt: generateStitchPrompt(data),
    frontendPrompt: generateFrontendPrompt(data),
    emailPrompt: generateEmailPrompt(data)
  };
}

function generateAnalysisPrompt(data) {
  return `# Prompt de análisis web

Analiza esta página web y extrae información útil para una posible propuesta de rediseño.

URL:
${data.url}

Título:
${data.title || "No detectado"}

Descripción:
${data.description || "No detectada"}

Texto extraído:
${data.textForAI || "No disponible"}

Devuelve:
- nombre de la empresa
- sector
- ciudad
- servicios
- público objetivo
- datos de contacto
- resumen de la actividad
- problemas detectados en la web
- oportunidades de mejora
- prioridad comercial: baja, media o alta

No inventes información.
Si no aparece un dato, indica "no detectado".`;
}

function generateStitchPrompt(data) {
  return `# Prompt para Stitch

Crea un rediseño moderno para esta página web.

URL original:
${data.url}

Título:
${data.title || "No detectado"}

Descripción:
${data.description || "No detectada"}

Contenido principal extraído:
${data.textForAI || "No disponible"}

Objetivo:
Crear una landing page moderna, clara, responsive y orientada a conversión.

Estilo visual:
- moderno
- profesional
- limpio
- confiable
- adaptado a móvil
- buena jerarquía visual
- botones de llamada a la acción claros
- secciones bien separadas
- imágenes grandes y bien integradas

Secciones recomendadas:
1. Hero principal con título, subtítulo y CTA
2. Servicios principales
3. Sobre la empresa
4. Beneficios
5. Galería
6. Contacto
7. Footer

Genera una propuesta visual de alta fidelidad para una web corporativa moderna.`;
}

function generateFrontendPrompt(data) {
  return `# Prompt para agente frontend

Eres un agente frontend senior.

Crea una versión rediseñada de esta web usando Astro + Tailwind CSS.

Información de la web original:
URL: ${data.url}
Título: ${data.title || "No detectado"}
Descripción: ${data.description || "No detectada"}

Contacto detectado:
Emails: ${(data.contact?.emails || []).join(", ") || "No detectados"}
Teléfonos: ${(data.contact?.phones || []).join(", ") || "No detectados"}

Contenido base:
${data.textForAI || "No disponible"}

Requisitos:
- Astro + Tailwind CSS
- HTML semántico
- diseño responsive
- buen SEO
- buena accesibilidad
- secciones claras
- botones CTA
- usar el contenido real extraído
- no inventar datos importantes
- preparar el proyecto para despliegue

Estructura esperada:
- src/pages/index.astro
- src/components/Header.astro
- src/components/Hero.astro
- src/components/Services.astro
- src/components/Gallery.astro
- src/components/Contact.astro
- src/components/Footer.astro
- src/styles/global.css`;
}

function generateEmailPrompt(data) {
  return `# Prompt para email comercial

Redacta un email comercial breve y profesional para contactar con esta empresa.

URL:
${data.url}

Título:
${data.title || "No detectado"}

Descripción:
${data.description || "No detectada"}

Contacto:
Emails: ${(data.contact?.emails || []).join(", ") || "No detectados"}
Teléfonos: ${(data.contact?.phones || []).join(", ") || "No detectados"}

Objetivo:
Ofrecer una mejora o rediseño de su página web de forma cercana y profesional.

Tono:
- natural
- profesional
- no agresivo
- personalizado
- orientado a ayudar

El email debe:
- mencionar que he revisado su web
- comentar 1 o 2 mejoras concretas
- proponer una conversación breve
- no sonar como spam.`;
}
