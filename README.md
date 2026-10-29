# TEAMROOT — T.E.T.O & M.I.K.U

Web de presentación de las asistentes de TEAMROOT, dirigida a desarrolladores independientes y pequeños estudios.

- **T.E.T.O:** supervisión técnica, auditoría y seguimiento del proyecto.
- **M.I.K.U:** asistencia en programación; en construcción.

La página presenta sus funciones. No se conectará a los bots; enlazará a sus repositorios de GitHub cuando estén disponibles.

## Desarrollo local

Es una web estática, sin dependencias de compilación. Abre `index.html` o sirve esta carpeta con un servidor HTTP estático. GSAP 3.15.0 se sirve localmente desde `assets/gsap.min.js`; su aviso de origen y licencia está en `assets/GSAP-NOTICE.txt`.

## GitHub Pages

En Settings → Pages, selecciona **Deploy from a branch**, la rama **gh-pages** y la carpeta **/(root)**. El archivo `.nojekyll` permite servir los archivos estáticos directamente.

## Interacción y accesibilidad

Selecciona un personaje para ver su presentación; usa «Volver a las dos» o Escape para regresar. La navegación conserva enlaces directos `#inicio`, `#teto` y `#miku`, y respeta la preferencia de movimiento reducido.

La portada ofrece respuesta visual y frases al enfocar una compañera. Las fichas incluyen ejemplos ilustrativos de revisión y programación. No ejecutan el código mostrado ni contienen datos de proyectos reales.

El símbolo de TEAMROOT se usa como favicon y en la cabecera. Los metadatos Open Graph y Twitter apuntan a `assets/social-preview.png`, una imagen de 1200 × 630 píxeles para compartir el sitio.

## Recursos visuales

Las ilustraciones provisionales, generadas con IA, se basan en Kasane Teto y Hatsune Miku. No son arte oficial. Este es un proyecto independiente de TEAMROOT y no implica afiliación con los titulares de los personajes.

Las fuentes Sora y DM Sans se cargan desde Google Fonts, con una fuente local de respaldo cuando no hay conexión.
