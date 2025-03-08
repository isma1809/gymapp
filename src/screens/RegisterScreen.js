import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createUser } from '../services/DatabaseService';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const { theme } = useTheme();
  const [userData, setUserData] = useState({
    name: '',
    peso: '',
    altura: '',
    edad: '',
    sexo: null,
  });

  const handleRegister = async () => {
    if (!userData.name.trim()) {
      Alert.alert('Error', 'Por favor, ingresa tu nombre');
      return;
    }

    try {
      const dataToSend = {
        ...userData,
        peso: userData.peso ? parseFloat(userData.peso) : null,
        altura: userData.altura ? parseFloat(userData.altura) : null,
      };
      await createUser(dataToSend);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo crear el usuario');
    }
  };

  const toggleSexo = (value) => {
    setUserData(prev => ({
      ...prev,
      sexo: prev.sexo === value ? null : value
    }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Bienvenido</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Configura tu perfil para comenzar
          </Text>
        </View>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.inputIcon}>
              <Ionicons name="person-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nombre *</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={userData.name}
                onChangeText={(text) => setUserData({ ...userData, name: text })}
                placeholder="Tu nombre"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.inputIcon}>
              <Ionicons name="barbell-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Peso (kg) - Opcional</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={userData.peso}
                onChangeText={(text) => setUserData({ ...userData, peso: text })}
                placeholder="Ej: 70.5"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.inputIcon}>
              <Ionicons name="resize-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Altura (cm) - Opcional</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={userData.altura}
                onChangeText={(text) => setUserData({ ...userData, altura: text })}
                placeholder="Ej: 175"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.inputIcon}>
              <Ionicons name="calendar-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Edad - Opcional</Text>
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={userData.edad}
                onChangeText={(text) => setUserData({ ...userData, edad: text })}
                placeholder="Ej: 25"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
            <View style={styles.inputIcon}>
              <Ionicons name="male-female-outline" size={22} color={theme.colors.primary} />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Sexo - Opcional</Text>
              <View style={styles.sexoButtons}>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    { backgroundColor: userData.sexo === 'hombre' ? theme.colors.primary : theme.colors.card },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => toggleSexo('hombre')}
                >
                  <Text style={[
                    styles.sexoButtonText,
                    { color: userData.sexo === 'hombre' ? 'white' : theme.colors.text }
                  ]}>Hombre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    { backgroundColor: userData.sexo === 'mujer' ? theme.colors.primary : theme.colors.card },
                    { borderColor: theme.colors.border }
                  ]}
                  onPress={() => toggleSexo('mujer')}
                >
                  <Text style={[
                    styles.sexoButtonText,
                    { color: userData.sexo === 'mujer' ? 'white' : theme.colors.text }
                  ]}>Mujer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleRegister}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 12,
  },
  inputIcon: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  inputWrapper: {
    flex: 1,
    paddingRight: 15,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  sexoButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
  },
  sexoButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  sexoButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 