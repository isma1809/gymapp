import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getUser } from '../services/DatabaseService';
import { LinearGradient } from 'expo-linear-gradient';
import { DEFAULT_PROFILE_IMAGE } from '../constants/images';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 15,
    marginBottom: 16,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 16,
    borderRadius: 15,
    overflow: 'hidden',
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
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 12,
    borderRadius: 10,
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
  },
  healthCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  healthCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthCardDescription: {
    fontSize: 14,
  },
});

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [userData, setUserData] = useState({
    name: '',
    peso: null,
    altura: null,
    edad: null,
    sexo: null,
    imageUri: DEFAULT_PROFILE_IMAGE
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUserData(prevData => ({
          ...prevData,
          name: user.name || '',
          peso: user.peso,
          altura: user.altura,
          edad: user.edad,
          sexo: user.sexo,
          imageUri: user.imageUri || DEFAULT_PROFILE_IMAGE
        }));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });

    return unsubscribe;
  }, [navigation]);

  const calcularIMC = () => {
    if (userData.peso && userData.altura) {
      const alturaEnMetros = userData.altura / 100;
      const imc = userData.peso / (alturaEnMetros * alturaEnMetros);
      return imc.toFixed(1);
    }
    return null;
  };

  const obtenerEstadoIMC = (imc) => {
    if (!imc) return null;
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Peso normal';
    if (imc < 30) return 'Sobrepeso';
    return 'Obesidad';
  };

  const calcularPesoIdeal = () => {
    if (userData.altura && userData.sexo) {
      // Fórmula de Hamwi
      const alturaEnCm = userData.altura;
      if (userData.sexo === 'hombre') {
        return (48.0 + 2.7 * (alturaEnCm - 152.4) / 2.54).toFixed(1);
      } else {
        return (45.5 + 2.2 * (alturaEnCm - 152.4) / 2.54).toFixed(1);
      }
    }
    return null;
  };

  const calcularGEB = () => {
    if (userData.peso && userData.altura && userData.edad && userData.sexo) {
      // Fórmula de Harris-Benedict
      if (userData.sexo === 'hombre') {
        return (66.5 + (13.75 * userData.peso) + (5.003 * userData.altura) - (6.75 * userData.edad)).toFixed(0);
      } else {
        return (655.1 + (9.563 * userData.peso) + (1.850 * userData.altura) - (4.676 * userData.edad)).toFixed(0);
      }
    }
    return null;
  };

  const handleEditProfileImage = () => {
    // Implement the logic to handle editing the profile image
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerSpacer} />
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <Ionicons name="pencil" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.profileImageContainer}>
            <Image
              source={userData.imageUri.startsWith('file://') ? { uri: userData.imageUri } : { uri: userData.imageUri }}
              style={styles.profileImage}
              defaultSource={{ uri: DEFAULT_PROFILE_IMAGE }}
              resizeMode="cover"
              onError={(error) => console.log('Error loading image:', error)}
            />
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEditProfileImage}
            >
              <Ionicons name="pencil" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.name, { color: theme.colors.text }]}>{userData.name}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primary + '80']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </LinearGradient>
          
          <View style={styles.sectionContent}>
            <View style={styles.infoItem}>
              <Ionicons name="barbell-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {userData.peso ? `${userData.peso} kg` : 'Peso no especificado'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="resize-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {userData.altura ? `${userData.altura} cm` : 'Altura no especificada'}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {userData.edad ? `${userData.edad} años` : 'Edad no especificada'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Ionicons name="male-female-outline" size={20} color={theme.colors.primary} />
              <Text style={[styles.infoText, { color: theme.colors.text }]}>
                {userData.sexo ? userData.sexo.charAt(0).toUpperCase() + userData.sexo.slice(1) : 'Sexo no especificado'}
              </Text>
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
            <Text style={styles.sectionTitle}>Indicadores de Salud</Text>
          </LinearGradient>

          <View style={styles.sectionContent}>
            {calcularIMC() && (
              <View style={[styles.healthCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.healthCardHeader}>
                  <Ionicons name="fitness-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.healthCardTitle, { color: theme.colors.text }]}>IMC</Text>
                </View>
                <Text style={[styles.healthCardValue, { color: theme.colors.primary }]}>{calcularIMC()}</Text>
                <Text style={[styles.healthCardDescription, { color: theme.colors.textSecondary }]}>
                  {obtenerEstadoIMC(calcularIMC())}
                </Text>
              </View>
            )}

            {calcularPesoIdeal() && (
              <View style={[styles.healthCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.healthCardHeader}>
                  <Ionicons name="scale-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.healthCardTitle, { color: theme.colors.text }]}>Peso Ideal</Text>
                </View>
                <Text style={[styles.healthCardValue, { color: theme.colors.primary }]}>{calcularPesoIdeal()} kg</Text>
                <Text style={[styles.healthCardDescription, { color: theme.colors.textSecondary }]}>
                  Según tu altura y sexo
                </Text>
              </View>
            )}

            {calcularGEB() && (
              <View style={[styles.healthCard, { backgroundColor: theme.colors.background }]}>
                <View style={styles.healthCardHeader}>
                  <Ionicons name="flame-outline" size={24} color={theme.colors.primary} />
                  <Text style={[styles.healthCardTitle, { color: theme.colors.text }]}>Metabolismo Basal</Text>
                </View>
                <Text style={[styles.healthCardValue, { color: theme.colors.primary }]}>{calcularGEB()} kcal</Text>
                <Text style={[styles.healthCardDescription, { color: theme.colors.textSecondary }]}>
                  Calorías que quemas en reposo
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
} 