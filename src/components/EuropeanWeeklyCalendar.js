import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getWorkoutDays } from '../services/DatabaseService';

const { width } = Dimensions.get('window');
const DAY_WIDTH = (width - 80) / 7;

const EuropeanWeeklyCalendar = ({ onDayPress }) => {
  const { theme } = useTheme();
  const [selectedDay, setSelectedDay] = useState(null);
  const [weekDays, setWeekDays] = useState([]);
  const [workoutDays, setWorkoutDays] = useState([]);

  // Obtener los días de la semana actual (formato europeo: lunes a domingo)
  useEffect(() => {
    console.log('Inicializando calendario...');
    const today = new Date();
    const currentDayJS = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    // Convertir al formato europeo (1 = Lunes, ..., 7 = Domingo)
    const currentDay = currentDayJS === 0 ? 7 : currentDayJS;
    
    const days = [];

    // Crear array con los 7 días de la semana empezando por lunes
    for (let i = 1; i <= 7; i++) {
      // Calcular la diferencia de días respecto a hoy
      // Si hoy es miércoles (3), para el lunes sería -2, para el martes -1, etc.
      const dayDiff = i - currentDay;
      
      const date = new Date(today);
      date.setDate(today.getDate() + dayDiff);
      
      days.push({
        date,
        dayName: getDayName(i),
        dayNumber: date.getDate(),
        isToday: i === currentDay
      });
    }

    setWeekDays(days);
    setSelectedDay(currentDay);
    
    // Cargar los días con entrenamientos
    loadWorkoutDays(days[0].date, days[6].date);
  }, []);
  
  // Recargar los días con entrenamientos cada vez que el componente se monte o se actualice la key
  useEffect(() => {
    if (weekDays.length > 0) {
      console.log('Recargando días con entrenamientos...');
      // Forzar una recarga completa de los días con entrenamientos
      const loadData = async () => {
        // Pequeño retraso para asegurar que la base de datos esté actualizada
        setTimeout(async () => {
          await loadWorkoutDays(weekDays[0].date, weekDays[weekDays.length - 1].date);
        }, 100);
      };
      loadData();
    }
  }, [weekDays]);

  // Cargar los días con entrenamientos
  const loadWorkoutDays = async (startDate, endDate) => {
    try {
      console.log('Intentando cargar días con entrenamientos...');
      const days = await getWorkoutDays(startDate, endDate);
      console.log(`Días con entrenamientos cargados: ${days.length}`);
      if (days.length > 0) {
        console.log(`Fechas con entrenamientos: ${days.join(', ')}`);
      } else {
        console.log('No se encontraron días con entrenamientos');
      }
      setWorkoutDays(days);
    } catch (error) {
      console.error('Error cargando días con entrenamientos:', error);
    }
  };

  // Obtener el nombre del día en español
  const getDayName = (dayIndex) => {
    const days = ['', 'L', 'M', 'X', 'J', 'V', 'S', 'D']; // Índice 1 = Lunes
    return days[dayIndex];
  };

  // Manejar la selección de un día
  const handleDayPress = (index, day) => {
    setSelectedDay(index);
    if (onDayPress) {
      onDayPress(day);
    }
  };
  
  // Verificar si un día tiene entrenamientos
  const hasWorkout = (date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      return workoutDays.includes(formattedDate);
    } catch (error) {
      console.error('Error en hasWorkout:', error);
      return false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarContainer}>
        {weekDays.map((day, index) => {
          const dayIndex = index + 1; // Convertir índice 0-6 a 1-7
          const isSelected = selectedDay === dayIndex;
          const hasWorkoutDay = hasWorkout(day.date);
          
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayContainer,
                isSelected && { 
                  backgroundColor: theme.colors.primary,
                }
              ]}
              onPress={() => handleDayPress(dayIndex, day)}
            >
              <LinearGradient
                colors={isSelected ? ['#4A90E2', '#2C5282'] : ['transparent', 'transparent']}
                style={styles.dayGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text
                  style={[
                    styles.dayName,
                    { color: isSelected ? 'white' : theme.colors.textSecondary }
                  ]}
                >
                  {day.dayName}
                </Text>
                <Text
                  style={[
                    styles.dayNumber,
                    { color: isSelected ? 'white' : theme.colors.text }
                  ]}
                >
                  {day.dayNumber < 10 ? '0' + day.dayNumber : day.dayNumber}
                </Text>
                
                {/* SOLO mostrar punto verde si hay entrenamiento */}
                {hasWorkoutDay && (
                  <View
                    style={[
                      styles.workoutIndicator,
                      { backgroundColor: '#4CAF50' }
                    ]}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  calendarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  dayContainer: {
    width: DAY_WIDTH,
    height: 70,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 2,
  },
  dayGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  workoutIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  }
});

export default EuropeanWeeklyCalendar; 