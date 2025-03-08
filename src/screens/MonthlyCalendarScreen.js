import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getWorkoutDays } from '../services/DatabaseService';

const { width } = Dimensions.get('window');
const MONTH_WIDTH = width - 40;
const DAY_SIZE = (MONTH_WIDTH - 14) / 7;

const MonthlyCalendarScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [workoutDays, setWorkoutDays] = useState([]);
  const [months, setMonths] = useState([]);

  // Inicializar los meses del año
  useEffect(() => {
    const monthsData = [];
    for (let month = 0; month < 12; month++) {
      const firstDay = new Date(selectedYear, month, 1);
      const lastDay = new Date(selectedYear, month + 1, 0);
      const daysInMonth = lastDay.getDate();
      
      // Obtener el día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
      let firstDayOfWeek = firstDay.getDay();
      // Convertir a formato europeo (0 = Lunes, ..., 6 = Domingo)
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
      
      const days = [];
      
      // Añadir días vacíos al principio para alinear con el día de la semana
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: 0, date: null });
      }
      
      // Añadir los días del mes
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(selectedYear, month, day);
        days.push({ day, date });
      }
      
      monthsData.push({
        name: getMonthName(month),
        days
      });
    }
    
    setMonths(monthsData);
    
    // Cargar los días con entrenamientos para todo el año
    loadWorkoutDaysForYear(selectedYear);
  }, [selectedYear]);
  
  // Referencia al ScrollView para poder desplazarse al mes actual
  const scrollViewRef = useRef(null);
  
  // Desplazarse al mes actual cuando se cargue la pantalla
  useEffect(() => {
    if (scrollViewRef.current && months.length > 0) {
      // Obtener el mes actual (0-11)
      const currentMonth = new Date().getMonth();
      
      // Calcular la posición aproximada del mes actual
      // Cada mes tiene una altura aproximada que podemos estimar
      const estimatedMonthHeight = 350; // Altura estimada en píxeles
      const scrollPosition = currentMonth * estimatedMonthHeight;
      
      // Desplazarse a la posición calculada con un pequeño retraso para asegurar que el componente esté renderizado
      setTimeout(() => {
        scrollViewRef.current.scrollTo({ y: scrollPosition, animated: true });
      }, 100);
    }
  }, [months]);
  
  // Cargar los días con entrenamientos para todo el año
  const loadWorkoutDaysForYear = async (year) => {
    try {
      const startDate = new Date(year, 0, 1);
      const endDate = new Date(year, 11, 31);
      
      console.log(`Cargando días con entrenamientos para el año ${year}...`);
      const days = await getWorkoutDays(startDate, endDate);
      console.log(`Días con entrenamientos cargados: ${days.length}`);
      
      setWorkoutDays(days);
    } catch (error) {
      console.error('Error cargando días con entrenamientos:', error);
    }
  };
  
  // Obtener el nombre del mes en español
  const getMonthName = (month) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month];
  };
  
  // Verificar si un día tiene entrenamientos
  const hasWorkout = (date) => {
    if (!date) return false;
    
    const formattedDate = date.toISOString().split('T')[0];
    return workoutDays.includes(formattedDate);
  };
  
  // Cambiar el año
  const changeYear = (increment) => {
    setSelectedYear(prev => prev + increment);
  };
  
  // Renderizar el selector de año
  const renderYearSelector = () => (
    <View style={styles.yearSelectorContainer}>
      <TouchableOpacity
        style={styles.yearButton}
        onPress={() => changeYear(-1)}
      >
        <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
      </TouchableOpacity>
      
      <Text style={[styles.yearText, { color: theme.colors.text }]}>
        {selectedYear}
      </Text>
      
      <TouchableOpacity
        style={styles.yearButton}
        onPress={() => changeYear(1)}
      >
        <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
  
  // Renderizar un mes
  const renderMonth = (month, index) => (
    <View key={index} style={styles.monthContainer}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.monthHeader}
      >
        <Text style={styles.monthName}>{month.name}</Text>
      </LinearGradient>
      
      <View style={styles.daysHeader}>
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day, index) => (
          <Text key={index} style={[styles.dayName, { color: theme.colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      <View style={styles.daysGrid}>
        {month.days.map((day, index) => (
          <View key={index} style={styles.dayContainer}>
            {day.day > 0 && (
              <>
                <Text style={[styles.dayNumber, { color: theme.colors.text }]}>
                  {day.day}
                </Text>
                {hasWorkout(day.date) && (
                  <View style={[styles.workoutIndicator, { backgroundColor: '#4CAF50' }]} />
                )}
              </>
            )}
          </View>
        ))}
      </View>
    </View>
  );
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{ width: 24 }} />
      </LinearGradient>
      
      {renderYearSelector()}
      
      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {months.map((month, index) => renderMonth(month, index))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  yearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  monthContainer: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  monthHeader: {
    padding: 15,
    alignItems: 'center',
  },
  monthName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  daysHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 7,
  },
  dayContainer: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '500',
  },
  workoutIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 5,
  },
});

export default MonthlyCalendarScreen; 