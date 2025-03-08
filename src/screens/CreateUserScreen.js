import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createUser, checkEmailExists } from '../services/DatabaseService';

export default function CreateUserScreen({ navigation }) {
  const { theme } = useTheme();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    emailExists: false
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = async () => {
    const newErrors = {
      name: !userData.name.trim(),
      email: !validateEmail(userData.email),
      password: userData.password.length < 6,
      confirmPassword: userData.password !== confirmPassword,
      emailExists: false
    };

    if (validateEmail(userData.email)) {
      try {
        const exists = await checkEmailExists(userData.email);
        newErrors.emailExists = exists;
      } catch (error) {
        console.error('Error checking email:', error);
      }
    }

    setErrors(newErrors);
    setIsFormValid(
      !newErrors.name &&
      !newErrors.email &&
      !newErrors.password &&
      !newErrors.confirmPassword &&
      !newErrors.emailExists &&
      userData.name.trim() &&
      userData.email &&
      userData.password &&
      confirmPassword
    );
  };

  useEffect(() => {
    validateForm();
  }, [userData, confirmPassword]);

  const handleCreateUser = async () => {
    try {
      if (!isFormValid) {
        let errorMessage = 'Por favor, corrige los siguientes errores:\n';
        if (errors.name) errorMessage += '\n- El nombre es requerido';
        if (errors.email) errorMessage += '\n- El email no es válido';
        if (errors.emailExists) errorMessage += '\n- Este email ya está registrado';
        if (errors.password) errorMessage += '\n- La contraseña debe tener al menos 6 caracteres';
        if (errors.confirmPassword) errorMessage += '\n- Las contraseñas no coinciden';
        
        Alert.alert('Error', errorMessage);
        return;
      }

      await createUser(userData);
      
      Alert.alert(
        'Éxito',
        'Usuario creado correctamente',
        [{ text: 'OK', onPress: () => navigation.navigate('LoginScreen') }]
      );
    } catch (error) {
      console.error('Error creating user:', error);
      Alert.alert('Error', 'Ha ocurrido un error al crear el usuario');
    }
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={[styles.title, { color: theme.colors.text }]}>Crear Cuenta</Text>

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: errors.name ? theme.colors.error : theme.colors.border
        }]}
        placeholder="Nombre completo"
        placeholderTextColor={theme.colors.textSecondary}
        value={userData.name}
        onChangeText={(text) => setUserData({ ...userData, name: text })}
      />
      {errors.name && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          El nombre es requerido
        </Text>
      )}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: (errors.email || errors.emailExists) ? theme.colors.error : theme.colors.border
        }]}
        placeholder="Email"
        placeholderTextColor={theme.colors.textSecondary}
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Introduce un email válido
        </Text>
      )}
      {errors.emailExists && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Este email ya está registrado
        </Text>
      )}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: errors.password ? theme.colors.error : theme.colors.border
        }]}
        placeholder="Contraseña"
        placeholderTextColor={theme.colors.textSecondary}
        value={userData.password}
        onChangeText={(text) => setUserData({ ...userData, password: text })}
        secureTextEntry
      />
      {errors.password && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          La contraseña debe tener al menos 6 caracteres
        </Text>
      )}

      <TextInput
        style={[styles.input, { 
          backgroundColor: theme.colors.card,
          color: theme.colors.text,
          borderColor: errors.confirmPassword ? theme.colors.error : theme.colors.border
        }]}
        placeholder="Confirmar contraseña"
        placeholderTextColor={theme.colors.textSecondary}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      {errors.confirmPassword && (
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Las contraseñas no coinciden
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          { 
            backgroundColor: isFormValid ? theme.colors.primary : theme.colors.border,
            opacity: isFormValid ? 1 : 0.5
          }
        ]}
        onPress={handleCreateUser}
        disabled={!isFormValid}
      >
        <Text style={styles.buttonText}>Crear Cuenta</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
          Volver al inicio de sesión
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    fontSize: 16,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  button: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    padding: 10,
  },
  backButtonText: {
    textAlign: 'center',
    fontSize: 16,
  },
}); 