// Script para desactivar la telemetría de Expo
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

console.log('🔒 Desactivando telemetría y analítica...');

// 1. Configuración a nivel de proyecto
try {
  // Crear archivo .expo-shared/settings.json
  const expoSharedDir = path.join(__dirname, '.expo-shared');
  if (!fs.existsSync(expoSharedDir)) {
    fs.mkdirSync(expoSharedDir, { recursive: true });
  }

  const settingsPath = path.join(expoSharedDir, 'settings.json');
  const settings = {
    devClient: false,
    strictMode: false,
    telemetry: {
      enabled: false
    }
  };

  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  
  // Crear archivo .expo/settings.json en el proyecto
  const expoProjectDir = path.join(__dirname, '.expo');
  if (!fs.existsSync(expoProjectDir)) {
    fs.mkdirSync(expoProjectDir, { recursive: true });
  }
  
  const expoProjectSettingsPath = path.join(expoProjectDir, 'settings.json');
  const expoProjectSettings = {
    "hostType": "lan",
    "lanType": "ip",
    "dev": false,
    "minify": true,
    "telemetryEnabled": false
  };
  
  fs.writeFileSync(expoProjectSettingsPath, JSON.stringify(expoProjectSettings, null, 2));
  
  // Crear archivo .env
  const envPath = path.join(__dirname, '.env');
  const envContent = `EXPO_NO_TELEMETRY=1
EXPO_TELEMETRY_DISABLED=1
NODE_ENV=production`;

  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Configuración a nivel de proyecto completada');
} catch (error) {
  console.error('❌ Error en configuración de proyecto:', error.message);
}

// 2. Configuración a nivel global
try {
  const homeDir = os.homedir();
  
  // Configuración global de Expo
  const expoConfigDir = path.join(homeDir, '.expo');
  if (!fs.existsSync(expoConfigDir)) {
    fs.mkdirSync(expoConfigDir, { recursive: true });
  }
  
  const expoSettingsPath = path.join(expoConfigDir, 'settings.json');
  const expoSettings = {
    telemetry: false
  };
  
  fs.writeFileSync(expoSettingsPath, JSON.stringify(expoSettings, null, 2));
  
  // Archivo .expo-cli.json
  const expoCliPath = path.join(homeDir, '.expo-cli.json');
  const expoCliSettings = {
    "telemetry": false,
    "analyticsEnabled": false
  };
  
  fs.writeFileSync(expoCliPath, JSON.stringify(expoCliSettings, null, 2));
  
  console.log('✅ Configuración global completada');
} catch (error) {
  console.error('❌ Error en configuración global:', error.message);
}

// 3. Configuración de npm
try {
  execSync('npm config set update-notifier false');
  execSync('npm config set fund false');
  execSync('npm config set audit false');
  
  console.log('✅ Configuración de npm completada');
} catch (error) {
  console.error('❌ Error en configuración de npm:', error.message);
}

console.log('\n🎉 ¡Telemetría desactivada con éxito! 🎉');
console.log('Para asegurarte de que los cambios surtan efecto, reinicia tu terminal y editor de código.'); 