import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Alert,
  BackHandler
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { 
  getEjercicios, 
  createExercise, 
  saveWorkout, 
  getWorkoutsByDate, 
  getWorkoutDetails,
  cleanupDuplicateWorkoutDetails,
  getDatabase
} from '../services/DatabaseService';

const CustomWorkoutScreen = ({ route, navigation }) => {
  const { theme } = useTheme();
  const { selectedDay } = route.params || { selectedDay: new Date() };
  
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [originalExercises, setOriginalExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newExerciseModalVisible, setNewExerciseModalVisible] = useState(false);
  const [savedWorkouts, setSavedWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('todos');
  const [newExercise, setNewExercise] = useState({
    nombre: '',
    grupo: 'push',
    video: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Definir loadData fuera del useEffect para que sea accesible desde otras funciones
  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Cargando datos de entrenamiento...');
      
      // Limpiar duplicados en la base de datos
      try {
        await cleanupDuplicateWorkoutDetails();
      } catch (error) {
        console.error('Error al limpiar duplicados:', error);
        // Continuamos con la carga de datos aunque falle la limpieza
      }
      
      // Cargar ejercicios
      const pushExercises = await getEjercicios('push');
      const pullExercises = await getEjercicios('pull');
      const legExercises = await getEjercicios('piernas');
      
      const allExercisesData = [...pushExercises, ...pullExercises, ...legExercises];
      console.log(`Total de ejercicios cargados: ${allExercisesData.length}`);
      
      setAllExercises(allExercisesData);
      setFilteredExercises(allExercisesData);
      
      // Limpiar los ejercicios seleccionados por defecto
      setSelectedExercises([]);
      setOriginalExercises([]);
      setHasChanges(false);
      
      // Cargar entrenamientos guardados para esta fecha
      if (selectedDay && selectedDay.date) {
        // Convertir la fecha a formato ISO y extraer solo la parte de la fecha (YYYY-MM-DD)
        const formattedDate = selectedDay.date instanceof Date 
          ? selectedDay.date.toISOString().split('T')[0]
          : new Date(selectedDay.date).toISOString().split('T')[0];
          
        console.log(`Buscando entrenamientos para la fecha: ${formattedDate}`);
        
        const workouts = await getWorkoutsByDate(formattedDate);
        console.log(`Entrenamientos encontrados: ${workouts.length}`);
        
        if (workouts && workouts.length > 0) {
          // Si hay entrenamientos guardados, cargar los detalles del primero
          console.log(`Cargando detalles del entrenamiento ID: ${workouts[0].id}`);
          const workoutDetails = await getWorkoutDetails(workouts[0].id);
          console.log(`Detalles cargados: ${workoutDetails.length}`);
          
          if (workoutDetails.length > 0) {
            // Agrupar los detalles por ejercicio
            const exercisesMap = new Map();
            
            workoutDetails.forEach(detail => {
              console.log(`Procesando detalle: ejercicio=${detail.ejercicio_id}, serie=${detail.serie}, reps=${detail.repeticiones}, peso=${detail.peso}`);
              
              if (!exercisesMap.has(detail.ejercicio_id)) {
                exercisesMap.set(detail.ejercicio_id, {
                  id: detail.ejercicio_id,
                  nombre: detail.nombre,
                  grupo: detail.grupo,
                  sets: []
                });
                console.log(`Nuevo ejercicio añadido al mapa: ${detail.nombre}`);
              }
              
              const exercise = exercisesMap.get(detail.ejercicio_id);
              // Verificar si ya existe una serie con el mismo número
              const existingSetIndex = exercise.sets.findIndex(s => s.serie === detail.serie);
              
              if (existingSetIndex === -1) {
                exercise.sets.push({
                  serie: detail.serie,
                  reps: detail.repeticiones.toString(),
                  weight: detail.peso.toString()
                });
                console.log(`Serie ${detail.serie} añadida al ejercicio ${detail.nombre}`);
              } else {
                console.log(`Serie ${detail.serie} ya existe para el ejercicio ${detail.nombre}, no se añade`);
              }
            });
            
            // Ordenar las series por número de serie
            exercisesMap.forEach((exercise, id) => {
              console.log(`Ordenando series para ejercicio ${exercise.nombre} (${exercise.sets.length} series)`);
              exercise.sets.sort((a, b) => a.serie - b.serie);
              // Eliminar el campo serie que solo usamos para ordenar
              exercise.sets = exercise.sets.map(({serie, ...rest}) => rest);
            });
            
            // Convertir el mapa a un array
            const loadedExercises = Array.from(exercisesMap.values());
            console.log(`Ejercicios cargados: ${loadedExercises.length}`);
            
            // Crear copias profundas para evitar referencias compartidas
            const deepCopyExercises = JSON.parse(JSON.stringify(loadedExercises));
            
            setSelectedExercises(deepCopyExercises);
            setOriginalExercises(JSON.parse(JSON.stringify(deepCopyExercises)));
            setHasChanges(false);
          } else {
            console.log('No hay detalles de entrenamiento para esta fecha');
          }
          
          // Guardar todos los entrenamientos
          setSavedWorkouts(workouts);
        } else {
          // Si no hay entrenamientos, limpiar los ejercicios seleccionados
          console.log('No hay entrenamientos guardados para esta fecha');
          setSavedWorkouts([]);
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente o cuando cambia el día seleccionado
  useEffect(() => {
    loadData();
    
    // Exportar la función loadData para poder usarla desde otras funciones
    if (typeof route.params?.setRefreshFunction === 'function') {
      route.params.setRefreshFunction(() => loadData());
    }
  }, [selectedDay, route.params]);

  // Filtrar ejercicios según el texto de búsqueda y el grupo seleccionado
  useEffect(() => {
    let filtered = allExercises;
    
    // Filtrar por texto de búsqueda
    if (searchText.trim() !== '') {
      filtered = filtered.filter(exercise => 
        exercise.nombre.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    // Filtrar por grupo
    if (selectedGroup !== 'todos') {
      filtered = filtered.filter(exercise => exercise.grupo === selectedGroup);
    }
    
    setFilteredExercises(filtered);
  }, [searchText, allExercises, selectedGroup]);

  // Añadir un ejercicio al entrenamiento
  const addExerciseToWorkout = (exercise) => {
    // Verificar si el ejercicio ya está en el entrenamiento
    if (selectedExercises.some(ex => ex.id === exercise.id)) {
      Alert.alert('Ejercicio ya añadido', 'Este ejercicio ya está en tu entrenamiento');
      return;
    }
    
    const exerciseWithSets = {
      ...exercise,
      sets: []
    };
    
    setSelectedExercises(prev => [...prev, exerciseWithSets]);
    setModalVisible(false);
    setHasChanges(true);
  };

  // Eliminar un ejercicio del entrenamiento
  const removeExerciseFromWorkout = async (exerciseId) => {
    console.log(`Eliminando ejercicio ID: ${exerciseId} del estado local`);
    
    // Actualizar el estado local eliminando el ejercicio
    setSelectedExercises(prev => prev.filter(ex => ex.id !== exerciseId));
    
    // Marcar que hay cambios
    setHasChanges(true);
  };

  // Añadir una serie a un ejercicio
  const addSetToExercise = (exerciseId) => {
    setSelectedExercises(prev => 
      prev.map(ex => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: [...ex.sets, { reps: '', weight: '' }]
          };
        }
        return ex;
      })
    );
    setHasChanges(true);
  };

  // Actualizar una serie
  const updateSet = (exerciseId, setIndex, field, value) => {
    setSelectedExercises(prev => 
      prev.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = [...ex.sets];
          updatedSets[setIndex] = {
            ...updatedSets[setIndex],
            [field]: value
          };
          return {
            ...ex,
            sets: updatedSets
          };
        }
        return ex;
      })
    );
    setHasChanges(true);
  };

  // Eliminar una serie
  const removeSet = async (exerciseId, setIndex) => {
    console.log(`Eliminando serie ${setIndex} del ejercicio ${exerciseId} del estado local`);
    
    // Actualizar el estado local
    setSelectedExercises(prev => {
      const updated = prev.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = [...ex.sets];
          updatedSets.splice(setIndex, 1);
          
          // Si no quedan series, eliminar el ejercicio completo
          if (updatedSets.length === 0) {
            return null; // Marcar para eliminar
          }
          
          return {
            ...ex,
            sets: updatedSets
          };
        }
        return ex;
      }).filter(Boolean); // Eliminar los ejercicios marcados como null
      
      return updated;
    });
    
    // Marcar que hay cambios
    setHasChanges(true);
  };

  // Manejar cambios en el formulario de nuevo ejercicio
  const handleNewExerciseChange = (field, value) => {
    setNewExercise(prev => ({ ...prev, [field]: value }));
  };

  // Crear nuevo ejercicio
  const createNewExercise = async () => {
    try {
      // Validar que el nombre no esté vacío
      if (!newExercise.nombre.trim()) {
        Alert.alert('Error', 'El nombre del ejercicio es obligatorio');
        return;
      }
      
      // Guardar el nuevo ejercicio en la base de datos
      const newExerciseId = await createExercise(newExercise);
      
      // Añadir el ejercicio a la lista local con el ID real
      const newExerciseWithId = {
        ...newExercise,
        id: newExerciseId
      };
      
      setAllExercises(prev => [...prev, newExerciseWithId]);
      setNewExerciseModalVisible(false);
      setNewExercise({
        nombre: '',
        grupo: 'push',
        video: ''
      });
      
      // Añadir automáticamente al entrenamiento
      addExerciseToWorkout(newExerciseWithId);
      
      Alert.alert('Éxito', 'Ejercicio creado correctamente');
    } catch (error) {
      console.error('Error al crear ejercicio:', error);
      Alert.alert('Error', 'No se pudo crear el ejercicio');
    }
  };

  // Guardar el entrenamiento
  const saveWorkoutToDatabase = async () => {
    try {
      console.log('Guardando entrenamiento...');
      console.log(`Ejercicios seleccionados: ${selectedExercises.length}`);
      console.log(`Ejercicios originales: ${originalExercises.length}`);
      
      // Verificar si hay cambios en el entrenamiento
      let isEqual = false;
      if (!hasChanges) {
        // Comparar el estado actual con el original para asegurarnos
        isEqual = compareExercises(selectedExercises, originalExercises);
        
        // Forzar la detección de cambios si hay ejercicios con series eliminadas
        if (isEqual) {
          // Verificar si hay ejercicios que tenían series y ahora tienen menos
          const hasRemovedSets = selectedExercises.some((ex, index) => {
            if (index >= originalExercises.length) return false;
            const originalEx = originalExercises.find(o => o.id === ex.id);
            return originalEx && ex.sets.length < originalEx.sets.length;
          });
          
          if (hasRemovedSets) {
            console.log('Se detectaron series eliminadas, forzando guardado');
            isEqual = false;
          }
        }
        
        // También verificar si se eliminaron ejercicios completos
        if (isEqual && originalExercises.length > selectedExercises.length) {
          console.log('Se detectaron ejercicios eliminados, forzando guardado');
          isEqual = false;
        }
        
        if (isEqual) {
          Alert.alert('Sin cambios', 'No se han detectado cambios en el entrenamiento');
          return;
        }
      }
      
      // Solo validamos los ejercicios que existen
      if (selectedExercises.length > 0) {
        // Validar que todos los ejercicios tengan al menos una serie
        const exercisesWithoutSets = selectedExercises.filter(ex => ex.sets.length === 0);
        if (exercisesWithoutSets.length > 0) {
          Alert.alert('Error', 'Todos los ejercicios deben tener al menos una serie');
          return;
        }
        
        // Validar que todas las series tengan repeticiones y peso
        let hasIncompleteSets = false;
        selectedExercises.forEach(ex => {
          ex.sets.forEach(set => {
            if (!set.reps || !set.weight) {
              hasIncompleteSets = true;
            }
          });
        });
        
        if (hasIncompleteSets) {
          Alert.alert('Error', 'Todas las series deben tener repeticiones y peso');
          return;
        }
      }
      
      // Preparar los datos para guardar
      const formattedDate = selectedDay.date instanceof Date 
        ? selectedDay.date.toISOString().split('T')[0]
        : new Date(selectedDay.date).toISOString().split('T')[0];
        
      const workoutData = {
        fecha: formattedDate,
        nombre: `Entrenamiento ${selectedDay.dayName} ${selectedDay.dayNumber}`,
        exercises: selectedExercises
      };
      
      console.log('Enviando datos para guardar...');
      
      // Guardar el entrenamiento
      const workoutId = await saveWorkout(workoutData);
      console.log(`Entrenamiento guardado con ID: ${workoutId}`);
      
      // Recargar los datos para asegurarnos de que todo está actualizado
      await loadData();
      
      // Mensaje personalizado según si se guardó o eliminó el entrenamiento
      let mensaje = selectedExercises.length > 0
        ? `Entrenamiento para el ${selectedDay.date.toLocaleDateString()} guardado correctamente`
        : `Entrenamiento para el ${selectedDay.date.toLocaleDateString()} eliminado correctamente`;
      
      Alert.alert(
        selectedExercises.length > 0 ? 'Entrenamiento guardado' : 'Entrenamiento eliminado',
        mensaje,
        [{ 
          text: 'OK', 
          onPress: () => {
            // Forzar una actualización completa al volver a la pantalla de inicio
            if (route.params && route.params.onWorkoutSaved) {
              route.params.onWorkoutSaved();
            }
            navigation.goBack();
          } 
        }]
      );
    } catch (error) {
      console.error('Error al guardar entrenamiento:', error);
      Alert.alert('Error', 'No se pudo guardar el entrenamiento');
    }
  };
  
  // Función para comparar ejercicios y determinar si hay cambios
  const compareExercises = (current, original) => {
    console.log(`Comparando ejercicios: ${current.length} actuales vs ${original.length} originales`);
    
    // Si tienen diferente número de ejercicios, hay cambios
    if (current.length !== original.length) {
      console.log('Diferente número de ejercicios');
      return false;
    }
    
    // Si no hay ejercicios en ninguno de los dos, no hay cambios
    if (current.length === 0 && original.length === 0) {
      console.log('No hay ejercicios en ninguno de los dos arrays');
      return true;
    }
    
    // Crear mapas para facilitar la comparación
    const currentMap = new Map(current.map(ex => [ex.id, ex]));
    const originalMap = new Map(original.map(ex => [ex.id, ex]));
    
    // Verificar si todos los ejercicios actuales están en el original
    for (const [id, exercise] of currentMap) {
      // Si el ejercicio no existe en el original, hay cambios
      if (!originalMap.has(id)) {
        console.log(`Ejercicio ${id} no existe en original`);
        return false;
      }
      
      const originalExercise = originalMap.get(id);
      
      // Si tienen diferente número de series, hay cambios
      if (exercise.sets.length !== originalExercise.sets.length) {
        console.log(`Diferente número de series en ejercicio ${id}: ${exercise.sets.length} vs ${originalExercise.sets.length}`);
        return false;
      }
      
      // Comparar cada serie
      for (let i = 0; i < exercise.sets.length; i++) {
        const currentSet = exercise.sets[i];
        const originalSet = originalExercise.sets[i];
        
        // Si las repeticiones o el peso son diferentes, hay cambios
        if (currentSet.reps !== originalSet.reps || currentSet.weight !== originalSet.weight) {
          console.log(`Diferencia en serie ${i} del ejercicio ${id}: ${currentSet.reps}x${currentSet.weight} vs ${originalSet.reps}x${originalSet.weight}`);
          return false;
        }
      }
    }
    
    // Verificar si todos los ejercicios originales están en el actual
    for (const id of originalMap.keys()) {
      if (!currentMap.has(id)) {
        console.log(`Ejercicio original ${id} no existe en actual`);
        return false;
      }
    }
    
    // Si llegamos aquí, no hay cambios
    console.log('No se detectaron cambios');
    return true;
  };

  // Renderizar un ejercicio en la lista de selección
  const renderExerciseItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.exerciseItem, { backgroundColor: theme.colors.card }]}
      onPress={() => addExerciseToWorkout(item)}
    >
      <View style={styles.exerciseInfo}>
        <Text style={[styles.exerciseName, { color: theme.colors.text }]}>
          {item.nombre}
        </Text>
        <Text style={[styles.exerciseGroup, { color: theme.colors.textSecondary }]}>
          {item.grupo === 'push' ? 'Empuje' : item.grupo === 'pull' ? 'Jalón' : 'Piernas'}
        </Text>
      </View>
      <Ionicons name="add-circle-outline" size={24} color={theme.colors.primary} />
    </TouchableOpacity>
  );

  // Función para cambiar el grupo seleccionado
  const handleGroupChange = (group) => {
    setSelectedGroup(group);
  };

  // useEffect para mostrar una alerta cuando el usuario intenta salir de la pantalla con cambios sin guardar
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hasChanges) {
        Alert.alert(
          'Aviso',
          'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', onPress: () => navigation.goBack() }
          ]
        );
        return true;
      }
      return false;
    });

    return () => {
      backHandler.remove();
    };
  }, [hasChanges, navigation]);
  
  // Interceptar la navegación para mostrar una alerta cuando el usuario intenta salir con el botón de navegación
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) {
        // Si no hay cambios, permitir la navegación
        return;
      }

      // Prevenir la navegación por defecto
      e.preventDefault();

      // Mostrar una alerta
      Alert.alert(
        'Aviso',
        'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Salir',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action)
          }
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Entrenamiento {selectedDay.date.toLocaleDateString()}
        </Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveWorkoutToDatabase}
        >
          <Ionicons name="save-outline" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {selectedExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="dumbbell" 
              size={60} 
              color={theme.colors.textSecondary} 
            />
            <Text style={[styles.emptyStateText, { color: theme.colors.textSecondary }]}>
              No hay ejercicios seleccionados
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.colors.textSecondary }]}>
              Pulsa el botón + para añadir ejercicios
            </Text>
          </View>
        ) : (
          selectedExercises.map((exercise, index) => (
            <View 
              key={exercise.id} 
              style={[styles.exerciseCard, { backgroundColor: theme.colors.card }]}
            >
              <View style={styles.exerciseHeader}>
                <View>
                  <Text style={[styles.exerciseCardName, { color: theme.colors.text }]}>
                    {exercise.nombre}
                  </Text>
                  <Text style={[styles.exerciseCardGroup, { color: theme.colors.textSecondary }]}>
                    {exercise.grupo === 'push' ? 'Empuje' : exercise.grupo === 'pull' ? 'Jalón' : 'Piernas'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeExerciseFromWorkout(exercise.id)}
                >
                  <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {exercise.sets.map((set, setIndex) => (
                <View key={setIndex} style={styles.setRow}>
                  <Text style={[styles.setNumber, { color: theme.colors.text }]}>
                    {setIndex + 1}
                  </Text>
                  <View style={styles.setInputContainer}>
                    <TextInput
                      style={[styles.setInput, { 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }]}
                      placeholder="Reps"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="number-pad"
                      value={set.reps}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'reps', value)}
                    />
                    <Text style={[styles.setInputLabel, { color: theme.colors.text }]}>×</Text>
                    <TextInput
                      style={[styles.setInput, { 
                        backgroundColor: theme.colors.background,
                        color: theme.colors.text
                      }]}
                      placeholder="Kg"
                      placeholderTextColor={theme.colors.textSecondary}
                      keyboardType="decimal-pad"
                      value={set.weight}
                      onChangeText={(value) => updateSet(exercise.id, setIndex, 'weight', value)}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => removeSet(exercise.id, setIndex)}
                  >
                    <Ionicons name="remove-circle-outline" size={24} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[styles.addSetButton, { borderColor: theme.colors.primary }]}
                onPress={() => addSetToExercise(exercise.id)}
              >
                <Text style={[styles.addSetButtonText, { color: theme.colors.primary }]}>
                  Añadir serie
                </Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para seleccionar ejercicios */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Seleccionar ejercicio
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.searchContainer, { backgroundColor: theme.colors.card }]}>
              <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.colors.text }]}
                placeholder="Buscar ejercicio..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* Filtro por grupo de ejercicio */}
            <View style={styles.groupFilterContainer}>
              <TouchableOpacity
                style={[
                  styles.groupFilterButton,
                  selectedGroup === 'todos' && styles.groupFilterButtonSelected,
                  { backgroundColor: selectedGroup === 'todos' ? theme.colors.primary : theme.colors.card }
                ]}
                onPress={() => handleGroupChange('todos')}
              >
                <Text style={[
                  styles.groupFilterButtonText,
                  { color: selectedGroup === 'todos' ? 'white' : theme.colors.text }
                ]}>
                  Todos
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.groupFilterButton,
                  selectedGroup === 'push' && styles.groupFilterButtonSelected,
                  { backgroundColor: selectedGroup === 'push' ? theme.colors.primary : theme.colors.card }
                ]}
                onPress={() => handleGroupChange('push')}
              >
                <Text style={[
                  styles.groupFilterButtonText,
                  { color: selectedGroup === 'push' ? 'white' : theme.colors.text }
                ]}>
                  Empuje
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.groupFilterButton,
                  selectedGroup === 'pull' && styles.groupFilterButtonSelected,
                  { backgroundColor: selectedGroup === 'pull' ? theme.colors.primary : theme.colors.card }
                ]}
                onPress={() => handleGroupChange('pull')}
              >
                <Text style={[
                  styles.groupFilterButtonText,
                  { color: selectedGroup === 'pull' ? 'white' : theme.colors.text }
                ]}>
                  Jalón
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.groupFilterButton,
                  selectedGroup === 'piernas' && styles.groupFilterButtonSelected,
                  { backgroundColor: selectedGroup === 'piernas' ? theme.colors.primary : theme.colors.card }
                ]}
                onPress={() => handleGroupChange('piernas')}
              >
                <Text style={[
                  styles.groupFilterButtonText,
                  { color: selectedGroup === 'piernas' ? 'white' : theme.colors.text }
                ]}>
                  Piernas
                </Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredExercises}
              renderItem={renderExerciseItem}
              keyExtractor={item => item.id.toString()}
              style={styles.exerciseList}
            />

            <TouchableOpacity
              style={[styles.createExerciseButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setModalVisible(false);
                setNewExerciseModalVisible(true);
              }}
            >
              <Text style={styles.createExerciseButtonText}>
                Crear nuevo ejercicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal para crear nuevo ejercicio */}
      <Modal
        visible={newExerciseModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setNewExerciseModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                Crear nuevo ejercicio
              </Text>
              <TouchableOpacity onPress={() => setNewExerciseModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Nombre</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text
                }]}
                placeholder="Nombre del ejercicio"
                placeholderTextColor={theme.colors.textSecondary}
                value={newExercise.nombre}
                onChangeText={(value) => handleNewExerciseChange('nombre', value)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>Grupo muscular</Text>
              <View style={styles.groupButtonsContainer}>
                <TouchableOpacity
                  style={[
                    styles.groupButton,
                    newExercise.grupo === 'push' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => handleNewExerciseChange('grupo', 'push')}
                >
                  <Text style={[
                    styles.groupButtonText,
                    { color: newExercise.grupo === 'push' ? 'white' : theme.colors.text }
                  ]}>
                    Empuje
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.groupButton,
                    newExercise.grupo === 'pull' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => handleNewExerciseChange('grupo', 'pull')}
                >
                  <Text style={[
                    styles.groupButtonText,
                    { color: newExercise.grupo === 'pull' ? 'white' : theme.colors.text }
                  ]}>
                    Jalón
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.groupButton,
                    newExercise.grupo === 'piernas' && { backgroundColor: theme.colors.primary }
                  ]}
                  onPress={() => handleNewExerciseChange('grupo', 'piernas')}
                >
                  <Text style={[
                    styles.groupButtonText,
                    { color: newExercise.grupo === 'piernas' ? 'white' : theme.colors.text }
                  ]}>
                    Piernas
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.colors.text }]}>URL del video (opcional)</Text>
              <TextInput
                style={[styles.formInput, { 
                  backgroundColor: theme.colors.card,
                  color: theme.colors.text
                }]}
                placeholder="URL de YouTube"
                placeholderTextColor={theme.colors.textSecondary}
                value={newExercise.video}
                onChangeText={(value) => handleNewExerciseChange('video', value)}
              />
            </View>

            <TouchableOpacity
              style={[
                styles.createButton, 
                { 
                  backgroundColor: newExercise.nombre.trim() ? theme.colors.primary : theme.colors.textSecondary 
                }
              ]}
              onPress={createNewExercise}
              disabled={!newExercise.nombre.trim()}
            >
              <Text style={styles.createButtonText}>
                Crear ejercicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  saveButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 8,
  },
  exerciseCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseCardName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  exerciseCardGroup: {
    fontSize: 14,
    marginTop: 2,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  setInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  setInputLabel: {
    marginHorizontal: 8,
    fontSize: 16,
  },
  addSetButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetButtonText: {
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  exerciseList: {
    flex: 1,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '500',
  },
  exerciseGroup: {
    fontSize: 14,
    marginTop: 2,
  },
  createExerciseButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createExerciseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  formInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  groupButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  groupButtonText: {
    fontWeight: '500',
  },
  createButton: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  groupFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  groupFilterButton: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  groupFilterButtonSelected: {
    borderColor: 'transparent',
  },
  groupFilterButtonText: {
    fontWeight: '500',
    fontSize: 12,
  },
});

export default CustomWorkoutScreen; 