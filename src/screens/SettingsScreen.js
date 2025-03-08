import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { getUser, deleteUser } from '../services/DatabaseService';
import { LinearGradient } from 'expo-linear-gradient';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    height: 110,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
    marginHorizontal: 16,
  },
  sectionHeader: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sectionContent: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    marginLeft: 12,
    fontSize: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
  },
  resetButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  aboutContent: {
    padding: 8,
  },
  appInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  developersList: {
    marginBottom: 8,
  },
  developerName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  developerRole: {
    fontSize: 14,
  },
  techList: {
    marginTop: 8,
  },
  techItem: {
    fontSize: 14,
    marginBottom: 4,
  },
  copyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default function SettingsScreen() {
  const { theme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  const [notificaciones, setNotificaciones] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUser();
      setUserData(user);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleNotificationsToggle = () => {
    Alert.alert(
      'Próximamente',
      'La gestión de notificaciones estará disponible en futuras actualizaciones. ¡Estamos trabajando para ofrecerte la mejor experiencia!'
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción eliminará todos tus datos y no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Register' }],
              });
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'No se pudo eliminar el usuario');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Ajustes</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Preferencias</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <View style={[styles.settingItem, { backgroundColor: theme.colors.background }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="notifications-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>Notificaciones</Text>
              </View>
              <Switch
                value={notificaciones}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={notificaciones ? '#ffffff' : '#f4f3f4'}
              />
            </View>

            <View style={[styles.settingItem, { backgroundColor: theme.colors.background }]}>
              <View style={styles.settingInfo}>
                <Ionicons name="moon-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.settingText, { color: theme.colors.text }]}>Modo Oscuro</Text>
              </View>
              <Switch
                value={theme.isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.colors.primary }}
                thumbColor={theme.isDarkMode ? '#ffffff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Cuenta</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: theme.colors.background }]}
              onPress={handleDeleteAccount}
            >
              <View style={styles.buttonContent}>
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.buttonText, { color: theme.colors.text }]}>Eliminar cuenta y datos</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Acerca de</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <View style={styles.aboutContent}>
              <View style={styles.appInfo}>
                <Text style={[styles.appName, { color: theme.colors.text }]}>GymApp</Text>
                <Text style={[styles.version, { color: theme.colors.textSecondary }]}>Versión 1.0.0</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              
              <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Equipo</Text>
              
              <View style={styles.developersList}>
                <Text style={[styles.developerName, { color: theme.colors.text }]}>Ismael Valle Martínez</Text>
                <Text style={[styles.developerRole, { color: theme.colors.textSecondary }]}>Desarrollador Principal & Diseñador</Text>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              
              <Text style={[styles.sectionSubtitle, { color: theme.colors.text }]}>Tecnologías</Text>
              <View style={styles.techList}>
                <Text style={[styles.techItem, { color: theme.colors.textSecondary }]}>React Native</Text>
                <Text style={[styles.techItem, { color: theme.colors.textSecondary }]}>Expo</Text>
                <Text style={[styles.techItem, { color: theme.colors.textSecondary }]}>SQLite</Text>
              </View>
              
              <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              
              <Text style={[styles.copyright, { color: theme.colors.textSecondary }]}>
                © 2025 GymApp. Todos los derechos reservados.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 