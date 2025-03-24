# ComparaSOFIPOS

ComparaSOFIPOS es una aplicación web que permite comparar opciones de inversión en Sociedades Financieras Populares (SOFIPOS) de México. La herramienta ayuda a los usuarios a encontrar la mejor tasa de interés para su dinero según sus necesidades específicas.

![ComparaSOFIPOS Logo](/public/img/logo.svg)

## Características

- **Comparación de SOFIPOS**: Compara rendimientos y beneficios de diferentes SOFIPOS en segundos.
- **Filtrado personalizado**: Filtra por montos, plazos y requisitos para encontrar la mejor opción según tus necesidades.
- **Visualización gráfica**: Visualiza los rendimientos estimados a través de gráficos interactivos.
- **Información detallada**: Accede a información actualizada sobre tasas de interés, seguros de depósito y condiciones.
- **Modo oscuro**: Interfaz adaptable con soporte para modo claro y oscuro.
- **Diseño responsivo**: Experiencia optimizada en dispositivos móviles, tablets y escritorio.

## Tecnologías utilizadas

- **Frontend**: HTML, CSS, JavaScript, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express
- **Datos**: CSV para almacenamiento de información de SOFIPOS

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/tu-usuario/comparasofipos.git
   cd comparasofipos
   ```

2. Instala las dependencias:
   ```
   npm install
   ```

3. Compila los estilos de Tailwind:
   ```
   npm run build:css
   ```

4. Inicia el servidor:
   ```
   npm start
   ```

5. Abre tu navegador y visita `http://localhost:3000`

## Desarrollo

Para ejecutar el proyecto en modo desarrollo con recarga automática:

```
npm run dev
```

## Estructura del proyecto

```
comparasofipos/
├── data/                  # Datos de SOFIPOS en formato CSV
├── public/                # Archivos estáticos
│   ├── css/               # Hojas de estilo
│   ├── img/               # Imágenes
│   ├── js/                # JavaScript del cliente
│   └── index.html         # Página principal
├── src/                   # Código fuente
│   ├── utils/             # Utilidades y funciones auxiliares
│   │   ├── calculations.ts # Cálculos de inversiones
│   │   └── csvParser.ts   # Parseador de archivos CSV
├── server.js              # Servidor Express
└── package.json           # Dependencias y scripts
```

## Funcionalidades principales

### Cálculo de inversiones

La aplicación permite a los usuarios:

1. Ingresar el monto de su inversión
2. Seleccionar el plazo deseado
3. Comparar las diferentes opciones de SOFIPOS
4. Visualizar los rendimientos estimados
5. Ver detalles como tasas de interés, montos mínimos y máximos, y plazos admitidos

### Filtrado de SOFIPOS

Los usuarios pueden:

- Seleccionar todas las SOFIPOS
- Deseleccionar todas
- Mostrar solo las SOFIPOS elegibles para su inversión
- Mostrar todas las SOFIPOS disponibles

## Contribución

Si deseas contribuir a este proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Realiza tus cambios y haz commit (`git commit -m 'Añadir nueva funcionalidad'`)
4. Sube tus cambios (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## Descargo de responsabilidad

La información proporcionada en ComparaSOFIPOS es solo con fines informativos y no constituye asesoría financiera, legal o de inversión. Los rendimientos mostrados son estimados y pueden variar. Antes de tomar cualquier decisión, te recomendamos consultar con un asesor financiero profesional. ComparaSOFIPOS no se hace responsable por las decisiones tomadas con base en la información presentada en el sitio.

## Contacto

¿Tienes preguntas o sugerencias? Escríbenos a contacto@comparasofipos.com
