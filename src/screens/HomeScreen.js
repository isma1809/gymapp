import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
  Platform,
  Animated,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  getEjercicios,
  getMejoresLogros,
  getUser
} from '../services/DatabaseService';
import EuropeanWeeklyCalendar from '../components/EuropeanWeeklyCalendar';
import { DEFAULT_PROFILE_IMAGE } from '../constants/images';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    height: 110,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  welcomeSection: {
    marginVertical: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeSubtext: {
    fontSize: 16,
    marginTop: 4,
  },
  grupoContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
  },
  grupoHeader: {
    overflow: 'hidden',
    borderRadius: 15,
  },
  headerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grupoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  ejerciciosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
    gap: 8,
  },
  ejercicioCard: {
    width: '48%',
    marginBottom: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ejercicioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  ejercicioNombre: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  ejercicioActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    fontSize: 16,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  pesosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 10,
  },
  pesoButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  pesoButtonSelected: {
    borderWidth: 2,
    borderColor: 'white',
  },
  pesoButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  registrarButton: {
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  registrarButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registrosContainer: {
    marginBottom: 20,
  },
  registroItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  registroInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIcon: {
    marginRight: 8,
  },
  registroText: {
    fontSize: 16,
  },
  registroFecha: {
    fontSize: 14,
  },
  ejercicioIconos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyIcon: {
    marginRight: 10,
  },
  modalInputsContainer: {
    paddingBottom: 20,
  },
  historialContainer: {
    paddingTop: 10,
  },
  calendarWrapper: {
    paddingVertical: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  emptyHistorial: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyHistorialText: {
    fontSize: 16,
    marginTop: 10,
  },
  calendarLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    paddingVertical: 8,
  },
  calendarLinkText: {
    fontSize: 16,
    color: '#4A90E2',
    marginRight: 5,
    fontWeight: '500',
  },
});

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const [ejercicios, setEjercicios] = useState({
    push: [],
    pull: [],
    piernas: []
  });
  const [gruposExpandidos, setGruposExpandidos] = useState({
    push: false,
    pull: false,
    piernas: false
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEjercicio, setSelectedEjercicio] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [userData, setUserData] = useState({
    name: 'Usuario',
    imageUri: DEFAULT_PROFILE_IMAGE
  });
  const scrollViewRef = useRef(null);
  const [calendarKey, setCalendarKey] = useState(0);

  useEffect(() => {
    cargarDatos();
    loadUser();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
      setCalendarKey(prevKey => prevKey + 1);
      cargarDatos();
      console.log('Pantalla de inicio enfocada, actualizando calendario...');
    });
    
    return unsubscribe;
  }, [navigation]);

  const cargarDatos = async () => {
    try {
      const [pushEjercicios, pullEjercicios, piernasEjercicios] = await Promise.all([
        getEjercicios('push'),
        getEjercicios('pull'),
        getEjercicios('piernas')
      ]);

      // Eliminar posibles duplicados usando un Set con los IDs
      const uniquePush = Array.from(new Map(pushEjercicios.map(item => [item.id, item])).values());
      const uniquePull = Array.from(new Map(pullEjercicios.map(item => [item.id, item])).values());
      const uniquePiernas = Array.from(new Map(piernasEjercicios.map(item => [item.id, item])).values());

      setEjercicios({
        push: uniquePush,
        pull: uniquePull,
        piernas: uniquePiernas
      });
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los ejercicios');
    }
  };

  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        console.log('User image URI:', user.imageUri);
        setUserData({
          name: user.name || '',
          imageUri: user.imageUri && user.imageUri !== '' ? user.imageUri : DEFAULT_PROFILE_IMAGE
        });
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const toggleGrupo = (grupo) => {
    setGruposExpandidos(prev => ({
      ...prev,
      [grupo]: !prev[grupo]
    }));
  };

  const handleEjercicioPress = async (ejercicio) => {
    setSelectedEjercicio(ejercicio);
    try {
      // Cargar historial de registros
      const historialRegistros = await getMejoresLogros(ejercicio.id);
      setRegistros(historialRegistros);
      setModalVisible(true);
    } catch (error) {
      console.error('Error cargando datos del ejercicio:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del ejercicio');
    }
  };

  const handleVerVideo = async (videoUrl) => {
    try {
      await Linking.openURL(videoUrl);
    } catch (error) {
      console.error('Error abriendo video:', error);
      Alert.alert('Error', 'No se pudo abrir el video');
    }
  };

  const handleDayPress = (day) => {
    navigation.navigate('CustomWorkout', { 
      selectedDay: day,
      onWorkoutSaved: () => {
        // Forzar la actualización del calendario cuando se guarda un entrenamiento
        console.log('Entrenamiento guardado, actualizando calendario...');
        setCalendarKey(prevKey => prevKey + 1);
        cargarDatos();
      }
    });
  };

  const renderGrupoEjercicios = (titulo, grupo, ejerciciosGrupo, iconName) => {
    const gradientColors = {
      push: [theme.colors.primary, theme.colors.primary + '80'],
      pull: [theme.colors.primary, theme.colors.primary + '80'],
      piernas: [theme.colors.primary, theme.colors.primary + '80']
    };

    return (
      <View style={[styles.grupoContainer]}>
        <TouchableOpacity 
          style={[styles.grupoHeader, { backgroundColor: theme.colors.card }]}
          onPress={() => toggleGrupo(grupo)}
        >
          <LinearGradient
            colors={gradientColors[grupo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
          >
            <View style={styles.headerLeft}>
              {grupo === 'push' && (
                <MaterialCommunityIcons name="human-handsup" size={28} color="white" />
              )}
              {grupo === 'pull' && (
                <MaterialCommunityIcons name="human-handsdown" size={28} color="white" />
              )}
              {grupo === 'piernas' && (
                <MaterialCommunityIcons name="human-male" size={28} color="white" />
              )}
              <Text style={styles.grupoTitulo}>{titulo}</Text>
            </View>
            <Ionicons 
              name={gruposExpandidos[grupo] ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="white" 
            />
          </LinearGradient>
        </TouchableOpacity>
        {gruposExpandidos[grupo] && (
          <View style={styles.ejerciciosGrid}>
            {ejerciciosGrupo.map((ejercicio) => (
              <TouchableOpacity
                key={ejercicio.id}
                style={[styles.ejercicioCard, { backgroundColor: theme.colors.card }]}
                onPress={() => handleEjercicioPress(ejercicio)}
              >
                <View style={styles.ejercicioIconContainer}>
                  <MaterialCommunityIcons 
                    name={grupo === 'push' ? 'dumbbell' : grupo === 'pull' ? 'weight-lifter' : 'run'}
                    size={24} 
                    color={theme.colors.primary}
                  />
                </View>
                <Text style={[styles.ejercicioNombre, { color: theme.colors.text }]}>
                  {ejercicio.nombre}
                </Text>
                <View style={styles.ejercicioActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
                    onPress={() => handleVerVideo(ejercicio.video)}
                  >
                    <Ionicons name="logo-youtube" size={20} color="#FF0000" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: theme.colors.primary + '20' }]}
                    onPress={() => handleEjercicioPress(ejercicio)}
                  >
                    <MaterialCommunityIcons name="trophy-outline" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {selectedEjercicio?.nombre}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            keyboardDismissMode="none"
          >
            <View style={{ paddingBottom: 20 }}>
              {registros.length > 0 ? (
                <View style={styles.historialContainer}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                    Historial de logros
                  </Text>
                  <View style={styles.registrosContainer}>
                    {registros.map((registro, index) => (
                      <View 
                        key={index}
                        style={[styles.registroItem, { backgroundColor: theme.colors.background }]}
                      >
                        <View style={styles.registroInfo}>
                          <MaterialCommunityIcons 
                            name="trophy" 
                            size={24} 
                            color="#FFD700"
                            style={styles.checkIcon}
                          />
                          <Text style={[styles.registroText, { color: theme.colors.text }]}>
                            {registro.peso} kg × {registro.repeticiones} reps
                          </Text>
                        </View>
                        <Text style={[styles.registroFecha, { color: theme.colors.textSecondary }]}>
                          {new Date(registro.fecha).toLocaleDateString()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.emptyHistorial}>
                  <MaterialCommunityIcons 
                    name="trophy-outline" 
                    size={64} 
                    color={theme.colors.textSecondary}
                  />
                  <Text style={[styles.emptyHistorialText, { color: theme.colors.textSecondary }]}>
                    No hay logros registrados para este ejercicio
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={{ uri: userData.imageUri }}
            style={styles.profileImage}
            defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
            resizeMode="cover"
            onError={(error) => console.log('Error loading image:', error)}
          />
        </TouchableOpacity>
        <Text style={styles.appTitle}>GymApp</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => Alert.alert('Próximamente', 'Las notificaciones estarán disponibles en futuras actualizaciones.')}
        >
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
            ¡Hola, {userData.name}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: theme.colors.textSecondary }]}>
            ¿Qué vas a entrenar hoy?
          </Text>
        </View>

        <View style={styles.calendarWrapper}>
          <EuropeanWeeklyCalendar key={calendarKey} onDayPress={handleDayPress} />
          <TouchableOpacity 
            style={styles.calendarLinkButton}
            onPress={() => navigation.navigate('MonthlyCalendar')}
          >
            <Text style={styles.calendarLinkText}>Ver calendario completo</Text>
            <Ionicons name="calendar-outline" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {renderGrupoEjercicios('Empuje', 'push', ejercicios.push)}
        {renderGrupoEjercicios('Jalón', 'pull', ejercicios.pull)}
        {renderGrupoEjercicios('Piernas', 'piernas', ejercicios.piernas)}
      </ScrollView>

      {renderModal()}
    </View>
  );
} 