import React, { useEffect, useState } from 'react';
import { ThemeProvider } from './src/context/ThemeContext';
import { initDatabase } from './src/services/DatabaseService';
import AppNavigator from './src/navigation/AppNavigator';
import { Alert } from 'react-native';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        console.log('Iniciando la aplicación...');
        // Inicializar la base de datos
        await initDatabase();
        console.log('Base de datos inicializada correctamente');
      } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        Alert.alert(
          'Error de inicialización',
          'Hubo un problema al inicializar la base de datos. La aplicación podría no funcionar correctamente.'
        );
      } finally {
        // Indicar que la app está lista
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
