import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loginUser, checkIfUsersExist } from '../services/DatabaseService';
import { Ionicons } from '@expo/vector-icons';
import Footer from '../components/Footer';

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const hasUsers = await checkIfUsersExist();
        if (!hasUsers) {
          navigation.navigate('CreateUserScreen');
        }
      } catch (error) {
        if (error.message.includes('Database not initialized')) {
          // Si la base de datos no está inicializada, intentamos de nuevo en 1 segundo
          setTimeout(() => init(), 1000);
        } else {
          console.error('Error checking for users:', error);
          Alert.alert('Error', 'Ha ocurrido un error al inicializar la aplicación');
        }
      }
    };
    
    init();
  }, []);

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Error', 'Por favor, rellena todos los campos');
        return;
      }

      const user = await loginUser(email, password);
      if (user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        Alert.alert('Error', 'Email o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Ha ocurrido un error al intentar iniciar sesión');
    }
  };

  const handleCreateAccount = () => {
    navigation.navigate('CreateUserScreen');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[styles.title, { color: theme.colors.text }]}>Iniciar Sesión</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border
          }]}
          placeholder="Email"
          placeholderTextColor={theme.colors.textSecondary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {email.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setEmail('')}
          >
            <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.colors.card,
            color: theme.colors.text,
            borderColor: theme.colors.border
          }]}
          placeholder="Contraseña"
          placeholderTextColor={theme.colors.textSecondary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {password.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setPassword('')}
          >
            <Ionicons name="close-circle" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.colors.primary }]}
        onPress={handleLogin}
      >
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.createAccountButton]}
        onPress={handleCreateAccount}
      >
        <Text style={[styles.createAccountText, { color: theme.colors.primary }]}>
          Crear nueva cuenta
        </Text>
      </TouchableOpacity>

      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingRight: 40,
    fontSize: 16,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    height: '100%',
    justifyContent: 'center',
    padding: 5,
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
  createAccountButton: {
    marginTop: 20,
    padding: 10,
  },
  createAccountText: {
    textAlign: 'center',
    fontSize: 16,
  },
}); 