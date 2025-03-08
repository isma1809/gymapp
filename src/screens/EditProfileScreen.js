import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { getUser, updateUser } from '../services/DatabaseService';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { DEFAULT_PROFILE_IMAGE } from '../constants/images';
import { LinearGradient } from 'expo-linear-gradient';

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [userData, setUserData] = useState({
    name: '',
    peso: '',
    altura: '',
    edad: '',
    sexo: null,
    imageUri: DEFAULT_PROFILE_IMAGE
  });

  useEffect(() => {
    loadUser();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para cambiar la foto de perfil');
    }
  };

  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setUserData({
          ...user,
          peso: user.peso ? user.peso.toString() : '',
          altura: user.altura ? user.altura.toString() : '',
          edad: user.edad ? user.edad.toString() : '',
          imageUri: user.imageUri || DEFAULT_PROFILE_IMAGE
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar el usuario');
      console.error(error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        const selectedImage = result.assets[0];
        
        // Crear directorio si no existe
        const dirInfo = await FileSystem.getInfoAsync(FileSystem.documentDirectory + 'profile_images/');
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + 'profile_images/');
        }

        // Generar nombre único para la imagen
        const newFileName = 'profile_' + Date.now() + '.jpg';
        const newFilePath = FileSystem.documentDirectory + 'profile_images/' + newFileName;

        // Copiar la imagen al directorio de la app
        await FileSystem.copyAsync({
          from: selectedImage.uri,
          to: newFilePath
        });

        // Actualizar el estado con la nueva imagen
        setUserData(prev => ({
          ...prev,
          imageUri: newFilePath
        }));
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedData = {
        ...userData,
        peso: userData.peso ? parseFloat(userData.peso) : null,
        altura: userData.altura ? parseFloat(userData.altura) : null,
      };
      await updateUser(updatedData);
      Alert.alert('Éxito', 'Usuario actualizado correctamente');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar el usuario');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = (field) => {
    if (editingField === field) {
      setEditingField(null);
    } else {
      setEditingField(field);
    }
  };

  const toggleSexo = (value) => {
    setUserData(prev => ({
      ...prev,
      sexo: prev.sexo === value ? null : value
    }));
  };

  const renderInputField = (label, value, key, icon, keyboardType = 'default') => {
    const isEditing = editingField === key;
    
    return (
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
        <View style={styles.inputIcon}>
          <Ionicons name={icon} size={22} color={theme.colors.primary} style={styles.icon} />
        </View>
        <View style={styles.inputWrapper}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{label}</Text>
          <View style={styles.inputRow}>
            {isEditing ? (
              <TextInput
                style={[styles.input, { color: theme.colors.text }]}
                value={value}
                onChangeText={(text) => setUserData({ ...userData, [key]: text })}
                autoFocus={true}
                keyboardType={keyboardType}
              />
            ) : (
              <Text style={[styles.valueText, { color: theme.colors.text }]}>
                {value || 'No especificado'}
              </Text>
            )}
            <TouchableOpacity 
              onPress={() => toggleEdit(key)}
              style={[
                styles.editButton,
                isEditing ? styles.editButtonActive : styles.editButtonInactive,
                { backgroundColor: theme.isDarkMode ? '#2C2C2C' : '#F5F5F5' }
              ]}
            >
              <Ionicons 
                name={isEditing ? "checkmark-circle" : "pencil"} 
                size={20} 
                color={isEditing ? theme.colors.primary : theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderSexoField = () => (
    <View style={[styles.inputContainer, { backgroundColor: theme.colors.card }]}>
      <View style={styles.inputIcon}>
        <Ionicons name="male-female-outline" size={22} color={theme.colors.primary} style={styles.icon} />
      </View>
      <View style={styles.inputWrapper}>
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Sexo</Text>
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
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary + '80']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header]}
      >
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: 'white' }]}>Editar Perfil</Text>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="white" />
          ) : (
            <Ionicons name="save" size={24} color="white" />
          )}
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => setShowHelp(true)}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </TouchableOpacity>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: userData.imageUri }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={[styles.changePhotoButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleImagePick}
          >
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {renderInputField('Nombre', userData.name, 'name', 'person-outline')}
        {renderInputField('Peso (kg)', userData.peso, 'peso', 'barbell-outline', 'decimal-pad')}
        {renderInputField('Altura (cm)', userData.altura, 'altura', 'resize-outline', 'decimal-pad')}
        {renderInputField('Edad', userData.edad, 'edad', 'calendar-outline', 'numeric')}
        {renderSexoField()}
      </ScrollView>

      <Modal
        visible={showHelp}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowHelp(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowHelp(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Cómo editar tu perfil
            </Text>
            <View style={styles.helpItem}>
              <Ionicons name="pencil" size={20} color={theme.colors.primary} />
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                Pulsa el botón del lápiz para editar un campo
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                Pulsa el botón de verificación para guardar los cambios
              </Text>
            </View>
            <View style={styles.helpItem}>
              <Ionicons name="save" size={20} color={theme.colors.primary} />
              <Text style={[styles.helpText, { color: theme.colors.text }]}>
                Guarda todos los cambios con el botón superior
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setShowHelp(false)}
            >
              <Text style={styles.closeButtonText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    height: 94,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 10,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changePhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    paddingVertical: 12,
    minHeight: 70,
  },
  inputIcon: {
    paddingHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
  },
  icon: {
    width: 22,
    height: 22,
    textAlign: 'center',
  },
  inputWrapper: {
    flex: 1,
    paddingRight: 15,
    justifyContent: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: 16,
    flex: 1,
    padding: 0,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    flex: 1,
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  editButtonInactive: {
    transform: [{ scale: 1 }],
  },
  editButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  helpButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },
  helpText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  closeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  sexoButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 10,
    marginTop: 4,
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
}); 