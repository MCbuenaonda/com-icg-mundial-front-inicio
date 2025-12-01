# ------------ STAGE 1: Build Angular App ------------
# Usa una imagen de Node.js como base (elige una versión LTS o la que uses en desarrollo)
FROM node:20-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto de los archivos del proyecto al contenedor
COPY . .

# Construye la aplicación para producción
# Reemplaza 'tu-shell-app' con el nombre real de tu proyecto si es diferente
# La ruta de salida por defecto en Angular 17+ es dist/tu-nombre-de-proyecto/browser/
RUN npm run build -- --configuration production

# ------------ STAGE 2: Serve App with Nginx ------------
# Usa una imagen ligera de Nginx
FROM nginx:alpine

# Elimina la configuración por defecto de Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia tu archivo de configuración personalizado de Nginx (lo crearemos a continuación)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos construidos de la aplicación desde la etapa 'build'
# al directorio donde Nginx sirve los archivos estáticos.
# Asegúrate que la ruta '/app/dist/tu-shell-app/browser/' coincida con tu proyecto.
COPY --from=build /app/dist/mf-listar-incidentes/browser/ /usr/share/nginx/html
# Si el nombre de tu proyecto es diferente a "shell-app", ajústalo aquí arriba.

# Expone el puerto 80 (el puerto por defecto de Nginx)
EXPOSE 8080

# Comando para iniciar Nginx cuando el contenedor arranque
CMD ["nginx", "-g", "daemon off;"]