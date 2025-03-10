# 💪 GymApp - Tu Compañero de Fitness Personal 🏋️‍♂️

![Logo de GymApp](./assets/icon.png)

## 📱 Acerca de la Aplicación

**GymApp** es una aplicación móvil completa diseñada para ayudarte a alcanzar tus objetivos de fitness. Con una interfaz elegante y funcionalidades intuitivas, te permite planificar, seguir y optimizar tu rutina de entrenamiento.

## ✨ Características Principales

- 🗓️ **Calendario Semanal y Mensual**: Planifica tus entrenamientos con anticipación
- 💪 **Biblioteca de Ejercicios**: Accede a una amplia variedad de ejercicios organizados por grupos musculares
- 📊 **Seguimiento de Progreso**: Registra tus logros y visualiza tu evolución
- 👤 **Perfil Personalizado**: Configura tu perfil con tus datos y objetivos
- 🎯 **Entrenamientos Personalizados**: Crea rutinas adaptadas a tus necesidades
- 🌙 **Modo Oscuro**: Interfaz adaptable para mayor comodidad visual

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- npm o yarn
- Expo CLI
- iOS Simulator o Android Emulator (para desarrollo local)

## 🛠️ Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/GymApp.git

# Navegar al directorio del proyecto
cd GymApp

# Instalar dependencias
npm install
# o
yarn install

# Iniciar la aplicación
npm start
# o
yarn start
```

## 📲 Uso

1. **Registro/Inicio de Sesión**: Crea tu cuenta personal o inicia sesión
2. **Explora Ejercicios**: Navega por la biblioteca de ejercicios organizados por grupos musculares
3. **Planifica tu Rutina**: Utiliza el calendario para programar tus entrenamientos
4. **Personaliza tu Perfil**: Configura tus datos personales y objetivos de fitness
5. **Realiza Seguimiento**: Registra tus entrenamientos y visualiza tu progreso

## 🔧 Configuración

La aplicación permite personalizar:
- 🎨 Tema (claro/oscuro)
- 🔔 Notificaciones
- 📊 Unidades de medida
- 🔐 Preferencias de privacidad

## 🔒 Privacidad y Desactivación de Telemetría

GymApp respeta tu privacidad. Para desactivar toda la telemetría y recopilación de datos analíticos, hemos incluido un script dedicado:

```bash
# Desactivar toda la telemetría y analítica
npm run disable-telemetry
```

### ¿Qué hace el script?

El script `disable-telemetry.js` realiza las siguientes acciones:

1. **Configuración a nivel de proyecto**:
   - Desactiva la telemetría en la configuración local de Expo
   - Crea variables de entorno para prevenir la recopilación de datos

2. **Configuración a nivel global**:
   - Modifica la configuración global de Expo en tu sistema
   - Desactiva la telemetría para todas las herramientas de Expo

3. **Configuración de npm**:
   - Desactiva notificaciones y mensajes promocionales
   - Previene auditorías automáticas que envían datos

### ¿Cuándo ejecutar el script?

- Al iniciar un nuevo proyecto
- Después de actualizar Expo
- Al clonar el repositorio en una nueva máquina
- Si sospechas que la telemetría se ha reactivado

En general, solo necesitas ejecutarlo **una vez por proyecto y por máquina**.

## 👨‍💻 Desarrollo

```bash
# Ejecutar en dispositivo Android
npm run android
# o
yarn android

# Ejecutar en dispositivo iOS
npm run ios
# o
yarn ios
```

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

¿Preguntas o sugerencias? ¡Nos encantaría saber de ti!

- 📧 Email: [ismael@ismaelvalle.es](mailto:ismael@ismaelvalle.es)
- 🌐 Sitio web: [ismaelvalle.es](https://ismaelvalle.es)

---

⭐ **GymApp** - Desarrollado con ❤️ para amantes del fitness ⭐ 