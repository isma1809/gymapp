import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';

let db;
let isInitialized = false;

// Función principal para inicializar la base de datos
const initDatabase = async () => {
  if (isInitialized) {
    return db;
  }
  
  try {
    console.log('Abriendo conexión a la base de datos...');
    db = await SQLite.openDatabaseAsync('app.db');
    
    // Activar el modo WAL para mejor rendimiento
    await db.execAsync('PRAGMA journal_mode = WAL;');
    await db.execAsync('PRAGMA foreign_keys = ON;');
    
    // Crear tabla de control si no existe
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_control (
        key TEXT PRIMARY KEY,
        value TEXT
      );
    `);
    
    // Verificar si ya se realizó la inicialización
    const initResult = await db.getFirstAsync('SELECT value FROM app_control WHERE key = "init_done";');
    
    // Solo realizar la inicialización si no se ha hecho antes
    if (!initResult?.value) {
      console.log('Inicializando base de datos por primera vez...');
      
      // Eliminar tablas existentes para asegurar una inicialización limpia
      await db.execAsync('DROP TABLE IF EXISTS user;');
      await db.execAsync('DROP TABLE IF EXISTS ejercicios;');
      await db.execAsync('DROP TABLE IF EXISTS registro_ejercicio;');
      await db.execAsync('DROP TABLE IF EXISTS entrenamientos;');
      await db.execAsync('DROP TABLE IF EXISTS entrenamiento_detalles;');
      
      // Crear tabla user si no existe
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS user (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          peso REAL,
          altura REAL,
          edad INTEGER,
          sexo TEXT CHECK(sexo IN ('hombre', 'mujer') OR sexo IS NULL),
          imageUri TEXT,
          CONSTRAINT single_user UNIQUE(id)
          CHECK (id = 1)
        );
      `);

      // Crear la tabla de ejercicios
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS ejercicios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nombre TEXT NOT NULL,
          grupo TEXT NOT NULL,
          video TEXT
        );
      `);

      // Insertar ejercicios predefinidos
      await db.execAsync(`
        INSERT INTO ejercicios (nombre, grupo, video)
        SELECT 'Press de banca', 'push', 'https://www.youtube.com/watch?v=rT7DgCr-3pg' UNION ALL
        SELECT 'Press militar', 'push', 'https://www.youtube.com/watch?v=2yjwXTZQDDI' UNION ALL
        SELECT 'Flexiones', 'push', 'https://www.youtube.com/watch?v=AhdtowFDKT0' UNION ALL
        SELECT 'Fondos', 'push', 'https://www.youtube.com/watch?v=C5K416bIVpU' UNION ALL
        SELECT 'Press inclinado con mancuernas', 'push', 'https://www.youtube.com/watch?v=8i2lFO6NNPI' UNION ALL
        SELECT 'Press de pecho con mancuernas', 'push', 'https://www.youtube.com/watch?v=8i2lFO6NNPI' UNION ALL
        SELECT 'Press de hombros con mancuernas', 'push', 'https://www.youtube.com/watch?v=qEwKCR5JCog' UNION ALL
        SELECT 'Aperturas de pecho', 'push', 'https://www.youtube.com/watch?v=eozdVDA78K0' UNION ALL
        SELECT 'Elevaciones laterales', 'push', 'https://www.youtube.com/watch?v=3VcKaXpzqRo' UNION ALL
        SELECT 'Peso muerto', 'pull', 'https://www.youtube.com/watch?v=1ZXobu7JvvE' UNION ALL
        SELECT 'Pull-up', 'pull', 'https://www.youtube.com/watch?v=XB_7En-zf_M' UNION ALL
        SELECT 'Remo con barra', 'pull', 'https://www.youtube.com/watch?v=G8l_8chR5BE' UNION ALL
        SELECT 'Remo con mancuernas', 'pull', 'https://www.youtube.com/watch?v=roCP6wCXPqo' UNION ALL
        SELECT 'Remo en polea baja', 'pull', 'https://www.youtube.com/watch?v=xQNrFHEMhI4' UNION ALL
        SELECT 'Pull-over con mancuerna', 'pull', 'https://www.youtube.com/watch?v=mjnseqLB1qs' UNION ALL
        SELECT 'Bíceps con barra', 'pull', 'https://www.youtube.com/watch?v=LY1V6UbRHFM' UNION ALL
        SELECT 'Bíceps con mancuernas', 'pull', 'https://www.youtube.com/watch?v=sAq_ocpRh_I' UNION ALL
        SELECT 'Face pull', 'pull', 'https://www.youtube.com/watch?v=V8dZ3pyiCBo' UNION ALL
        SELECT 'Chin-up', 'pull', 'https://www.youtube.com/watch?v=brhRXlOhsAM' UNION ALL
        SELECT 'Sentadilla', 'piernas', 'https://www.youtube.com/watch?v=Dy28eq2PjcM' UNION ALL
        SELECT 'Sentadilla frontal', 'piernas', 'https://www.youtube.com/watch?v=tlfahNdNPPI' UNION ALL
        SELECT 'Peso muerto rumano', 'piernas', 'https://www.youtube.com/watch?v=JCXUYuzwNrM' UNION ALL
        SELECT 'Prensa de pierna', 'piernas', 'https://www.youtube.com/watch?v=GvRgijoJ2xY' UNION ALL
        SELECT 'Zancadas', 'piernas', 'https://www.youtube.com/watch?v=3lM8n0kAzHE' UNION ALL
        SELECT 'Elevación de talones', 'piernas', 'https://www.youtube.com/watch?v=JbyjNymZOt0' UNION ALL
        SELECT 'Curl de piernas', 'piernas', 'https://www.youtube.com/watch?v=ELOCsoDSmrg' UNION ALL
        SELECT 'Extensión de piernas', 'piernas', 'https://www.youtube.com/watch?v=YyvSfVjQeL0' UNION ALL
        SELECT 'Sentadilla búlgara', 'piernas', 'https://www.youtube.com/watch?v=2-UyDnC-sAU';
      `);

      // Crear tabla de entrenamientos
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entrenamientos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          fecha TEXT NOT NULL,
          nombre TEXT
        );
      `);
      
      // Crear tabla de detalles de entrenamiento
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS entrenamiento_detalles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entrenamiento_id INTEGER NOT NULL,
          ejercicio_id INTEGER NOT NULL,
          serie INTEGER NOT NULL,
          repeticiones INTEGER,
          peso REAL,
          FOREIGN KEY (entrenamiento_id) REFERENCES entrenamientos(id),
          FOREIGN KEY (ejercicio_id) REFERENCES ejercicios(id)
        );
      `);

      // Marcar la inicialización como completada
      await db.execAsync(`
        INSERT INTO app_control (key, value)
        VALUES ('init_done', 'true');
      `);
      
      console.log('Base de datos inicializada correctamente');
    } else {
      console.log('La base de datos ya estaba inicializada');
    }
    
    isInitialized = true;
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Función auxiliar para asegurar que la base de datos está inicializada
const getDatabase = async () => {
  if (!isInitialized) {
    return await initDatabase();
  }
  return db;
};

// Función para resetear la base de datos
const resetDatabase = async () => {
  try {
    // Primero cerramos la conexión actual si existe
    if (db) {
      await db.closeAsync();
      db = null;
    }

    // Eliminamos el archivo de la base de datos
    const dbPath = `${FileSystem.documentDirectory}SQLite/app.db`;
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    
    if (dbExists.exists) {
      await FileSystem.deleteAsync(dbPath);
      console.log('Base de datos eliminada correctamente');
    }
    
    // Reiniciamos el estado
    isInitialized = false;
    
    // Volvemos a inicializar la base de datos
    return await initDatabase();
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  }
};

// Función para obtener el usuario
const getUser = async () => {
  try {
    const database = await getDatabase();
    const user = await database.getFirstAsync('SELECT * FROM user LIMIT 1;');
    return user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// Función para crear un usuario
const createUser = async (userData) => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(
      'INSERT INTO user (name, peso, altura, edad, sexo, imageUri) VALUES (?, ?, ?, ?, ?, ?);',
      [userData.name, userData.peso, userData.altura, userData.edad, userData.sexo, userData.imageUri]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// Función para actualizar un usuario
const updateUser = async (userData) => {
  try {
    const database = await getDatabase();
    await database.runAsync(
      'UPDATE user SET name = ?, peso = ?, altura = ?, edad = ?, sexo = ?, imageUri = ? WHERE id = 1;',
      [userData.name, userData.peso, userData.altura, userData.edad, userData.sexo, userData.imageUri]
    );
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Función para eliminar un usuario
const deleteUser = async () => {
  try {
    // Primero cerramos la conexión actual si existe
    if (db) {
      await db.closeAsync();
      db = null;
    }

    // Eliminamos el archivo de la base de datos
    const dbPath = `${FileSystem.documentDirectory}SQLite/app.db`;
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    
    if (dbExists.exists) {
      await FileSystem.deleteAsync(dbPath);
      console.log('Base de datos eliminada correctamente');
    }
    
    // Reiniciamos el estado
    isInitialized = false;
    
    // Volvemos a inicializar la base de datos
    return await initDatabase();
  } catch (error) {
    console.error('Error deleting user and resetting database:', error);
    throw error;
  }
};

// Función para verificar si existe un usuario
const checkUserExists = async () => {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync('SELECT COUNT(*) as count FROM user;');
    return result && result.count > 0;
  } catch (error) {
    console.error('Error checking user exists:', error);
    throw error;
  }
};

// Función para obtener ejercicios
const getEjercicios = async (grupo) => {
  try {
    const database = await getDatabase();
    let query = 'SELECT DISTINCT id, nombre, grupo, video FROM ejercicios';
    let params = [];
    
    if (grupo) {
      query += ' WHERE grupo = ?';
      params.push(grupo);
    }
    
    query += ' ORDER BY nombre';
    const result = await database.getAllAsync(query, params);
    return result || [];
  } catch (error) {
    console.error('Error getting ejercicios:', error);
    throw error;
  }
};

// Función para obtener los mejores logros de un ejercicio
const getMejoresLogros = async (ejercicioId) => {
  try {
    const database = await getDatabase();
    
    // Consulta para obtener el mejor set (mayor peso) de cada día para un ejercicio específico
    // y solo un registro por día (el de mayor ID si hay varios con el mismo peso)
    const result = await database.getAllAsync(`
      WITH DailyMaxWeights AS (
        SELECT 
          e.fecha,
          MAX(ed.peso) as max_peso
        FROM entrenamiento_detalles ed
        JOIN entrenamientos e ON ed.entrenamiento_id = e.id
        WHERE ed.ejercicio_id = ? 
        GROUP BY e.fecha
      ),
      BestSets AS (
        SELECT 
          ed.id, 
          ed.peso, 
          ed.repeticiones, 
          e.fecha,
          ROW_NUMBER() OVER (PARTITION BY e.fecha ORDER BY ed.id DESC) as row_num
        FROM entrenamiento_detalles ed
        JOIN entrenamientos e ON ed.entrenamiento_id = e.id
        JOIN DailyMaxWeights dmw ON e.fecha = dmw.fecha AND ed.peso = dmw.max_peso
        WHERE ed.ejercicio_id = ?
      )
      SELECT 
        id, 
        peso, 
        repeticiones, 
        fecha
      FROM BestSets
      WHERE row_num = 1
      ORDER BY fecha DESC;
    `, [ejercicioId, ejercicioId]);
    
    return result || [];
  } catch (error) {
    console.error('Error getting mejores logros:', error);
    throw error;
  }
};

// Función para crear un nuevo ejercicio personalizado
const createExercise = async (exerciseData) => {
  try {
    const database = await getDatabase();
    const result = await database.runAsync(
      'INSERT INTO ejercicios (nombre, grupo, video) VALUES (?, ?, ?);',
      [exerciseData.nombre, exerciseData.grupo, exerciseData.video]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error creating exercise:', error);
    throw error;
  }
};

// Función para guardar un entrenamiento personalizado
const saveWorkout = async (workoutData) => {
  try {
    const database = await getDatabase();
    
    // Verificar si ya existe un entrenamiento para esta fecha
    const existingWorkouts = await getWorkoutsByDate(workoutData.fecha);
    let workoutId;
    
    // Usar una transacción para asegurar la integridad de los datos
    await database.execAsync('BEGIN TRANSACTION;');
    
    try {
      if (existingWorkouts && existingWorkouts.length > 0) {
        // Si existe, usar el ID del primer entrenamiento encontrado
        workoutId = existingWorkouts[0].id;
        
        console.log(`Actualizando entrenamiento existente ID: ${workoutId}`);
        
        // Verificar si hay detalles existentes
        const existingDetails = await database.getAllAsync(
          'SELECT COUNT(*) as count FROM entrenamiento_detalles WHERE entrenamiento_id = ?;',
          [workoutId]
        );
        
        const detailsCount = existingDetails[0].count;
        console.log(`Detalles existentes para el entrenamiento ID ${workoutId}: ${detailsCount}`);
        
        // Eliminar TODOS los detalles existentes para este entrenamiento
        if (detailsCount > 0) {
          const deleteResult = await database.execAsync(
            'DELETE FROM entrenamiento_detalles WHERE entrenamiento_id = ?;',
            [workoutId]
          );
          console.log(`Detalles eliminados para el entrenamiento ID: ${workoutId}`);
          
          // Verificar que realmente se eliminaron
          const afterDeleteCount = await database.getAllAsync(
            'SELECT COUNT(*) as count FROM entrenamiento_detalles WHERE entrenamiento_id = ?;',
            [workoutId]
          );
          console.log(`Detalles después de eliminar: ${afterDeleteCount[0].count}`);
          
          if (afterDeleteCount[0].count > 0) {
            console.log(`Intentando eliminar de nuevo los detalles para el entrenamiento ID: ${workoutId}`);
            
            // Intentar eliminar de nuevo con una consulta más directa
            await database.execAsync(`
              DELETE FROM entrenamiento_detalles 
              WHERE entrenamiento_id = ${workoutId};
            `);
            
            // Verificar de nuevo
            const finalCount = await database.getAllAsync(
              'SELECT COUNT(*) as count FROM entrenamiento_detalles WHERE entrenamiento_id = ?;',
              [workoutId]
            );
            console.log(`Detalles después del segundo intento: ${finalCount[0].count}`);
          }
        }
        
        // Actualizar el nombre del entrenamiento
        await database.execAsync(
          'UPDATE entrenamientos SET nombre = ? WHERE id = ?;',
          [workoutData.nombre || `Entrenamiento ${workoutData.fecha}`, workoutId]
        );
      } else {
        // Si no existe, crear un nuevo entrenamiento
        console.log(`Creando nuevo entrenamiento para fecha: ${workoutData.fecha}`);
        
        const workoutResult = await database.runAsync(
          'INSERT INTO entrenamientos (fecha, nombre) VALUES (?, ?);',
          [workoutData.fecha, workoutData.nombre || `Entrenamiento ${workoutData.fecha}`]
        );
        
        workoutId = workoutResult.lastInsertRowId;
      }
      
      // Insertar los detalles del entrenamiento solo si hay ejercicios
      if (workoutData.exercises && workoutData.exercises.length > 0) {
        console.log(`Guardando ${workoutData.exercises.length} ejercicios`);
        
        for (const exercise of workoutData.exercises) {
          console.log(`Ejercicio ID: ${exercise.id}, Series: ${exercise.sets.length}`);
          
          // Solo guardar ejercicios que tengan series
          if (exercise.sets && exercise.sets.length > 0) {
            for (let i = 0; i < exercise.sets.length; i++) {
              const set = exercise.sets[i];
              
              // Validar que los datos sean números válidos
              const reps = parseInt(set.reps) || 0;
              const weight = parseFloat(set.weight) || 0;
              
              if (reps <= 0 || weight <= 0) {
                console.warn(`Datos inválidos para serie: reps=${set.reps}, weight=${set.weight}`);
                continue; // Saltar esta serie si los datos no son válidos
              }
              
              // Verificar si ya existe esta serie (no debería, pero por si acaso)
              const existingSets = await database.getAllAsync(
                'SELECT id FROM entrenamiento_detalles WHERE entrenamiento_id = ? AND ejercicio_id = ? AND serie = ?;',
                [workoutId, exercise.id, i + 1]
              );
              
              if (existingSets && existingSets.length > 0) {
                console.warn(`Ya existe una serie ${i+1} para el ejercicio ${exercise.id}, eliminando...`);
                await database.execAsync(
                  'DELETE FROM entrenamiento_detalles WHERE entrenamiento_id = ? AND ejercicio_id = ? AND serie = ?;',
                  [workoutId, exercise.id, i + 1]
                );
              }
              
              // Insertar el set en entrenamiento_detalles
              const insertResult = await database.runAsync(
                'INSERT INTO entrenamiento_detalles (entrenamiento_id, ejercicio_id, serie, repeticiones, peso) VALUES (?, ?, ?, ?, ?);',
                [workoutId, exercise.id, i + 1, reps, weight]
              );
              
              console.log(`Serie ${i+1} guardada: ${reps} reps, ${weight} kg, ID: ${insertResult.lastInsertRowId}`);
            }
          } else {
            console.log(`El ejercicio ID: ${exercise.id} no tiene series, no se guarda`);
          }
        }
      } else {
        console.log('No hay ejercicios para guardar en este entrenamiento');
        
        // Si no hay ejercicios, eliminar el entrenamiento
        if (workoutId) {
          console.log(`Eliminando entrenamiento vacío ID: ${workoutId}`);
          
          // Primero, asegurarse de que no quedan detalles
          await database.execAsync(
            'DELETE FROM entrenamiento_detalles WHERE entrenamiento_id = ?;',
            [workoutId]
          );
          
          // Luego eliminar el entrenamiento
          const deleteResult = await database.execAsync(
            'DELETE FROM entrenamientos WHERE id = ?;',
            [workoutId]
          );
          
          // Verificar que se eliminó correctamente
          const checkWorkout = await database.getAllAsync(
            'SELECT COUNT(*) as count FROM entrenamientos WHERE id = ?;',
            [workoutId]
          );
          
          if (checkWorkout[0].count > 0) {
            console.log(`Intentando eliminar de nuevo el entrenamiento ID: ${workoutId}`);
            
            // Intentar eliminar de nuevo con una consulta más directa
            await database.execAsync(`
              DELETE FROM entrenamientos 
              WHERE id = ${workoutId};
            `);
            
            // Verificar de nuevo
            const finalCheck = await database.getAllAsync(
              'SELECT COUNT(*) as count FROM entrenamientos WHERE id = ?;',
              [workoutId]
            );
            
            console.log(`Entrenamiento después del segundo intento: ${finalCheck[0].count === 0 ? 'Eliminado' : 'No eliminado'}`);
          } else {
            console.log(`Entrenamiento ID: ${workoutId} eliminado correctamente`);
          }
          
          workoutId = null;
        }
      }
      
      // Confirmar la transacción
      await database.execAsync('COMMIT;');
      console.log(`Entrenamiento guardado correctamente con ID: ${workoutId}`);
      
      return workoutId;
    } catch (error) {
      // Revertir la transacción en caso de error
      await database.execAsync('ROLLBACK;');
      console.error('Error en transacción:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving workout:', error);
    throw error;
  }
};

// Función para obtener los entrenamientos de una fecha
const getWorkoutsByDate = async (date) => {
  try {
    const database = await getDatabase();
    const result = await database.getAllAsync(
      'SELECT * FROM entrenamientos WHERE fecha = ?;',
      [date]
    );
    return result || [];
  } catch (error) {
    console.error('Error getting workouts by date:', error);
    throw error;
  }
};

// Función para obtener los detalles de un entrenamiento
const getWorkoutDetails = async (workoutId) => {
  try {
    const database = await getDatabase();
    console.log(`Obteniendo detalles del entrenamiento ID: ${workoutId}`);
    
    // Primero verificamos si el entrenamiento existe
    const workoutExists = await database.getFirstAsync(
      'SELECT id FROM entrenamientos WHERE id = ?;',
      [workoutId]
    );
    
    if (!workoutExists) {
      console.log(`El entrenamiento ID: ${workoutId} no existe`);
      return [];
    }
    
    // Luego obtenemos los detalles
    const result = await database.getAllAsync(`
      SELECT ed.*, e.nombre, e.grupo
      FROM entrenamiento_detalles ed
      JOIN ejercicios e ON ed.ejercicio_id = e.id
      WHERE ed.entrenamiento_id = ?
      ORDER BY ed.ejercicio_id, ed.serie;
    `, [workoutId]);
    
    console.log(`Se encontraron ${result.length} detalles de entrenamiento`);
    
    // Verificar si hay detalles
    if (result.length === 0) {
      console.log(`No hay detalles para el entrenamiento ID: ${workoutId}`);
    } else {
      // Mostrar un resumen de los ejercicios encontrados
      const ejerciciosIds = [...new Set(result.map(r => r.ejercicio_id))];
      console.log(`Ejercicios encontrados: ${ejerciciosIds.length}`);
      
      for (const ejercicioId of ejerciciosIds) {
        const series = result.filter(r => r.ejercicio_id === ejercicioId);
        const nombre = series[0].nombre;
        console.log(`- ${nombre}: ${series.length} series`);
      }
    }
    
    return result || [];
  } catch (error) {
    console.error('Error getting workout details:', error);
    throw error;
  }
};

// Función para limpiar duplicados en la tabla entrenamiento_detalles
const cleanupDuplicateWorkoutDetails = async () => {
  try {
    const database = await getDatabase();
    console.log('Iniciando limpieza de duplicados en entrenamiento_detalles...');
    
    // Usar una transacción para asegurar la integridad de los datos
    await database.execAsync('BEGIN TRANSACTION;');
    
    try {
      // Primero identificamos los duplicados
      const duplicates = await database.getAllAsync(`
        SELECT entrenamiento_id, ejercicio_id, serie, COUNT(*) as count
        FROM entrenamiento_detalles
        GROUP BY entrenamiento_id, ejercicio_id, serie
        HAVING COUNT(*) > 1
      `);
      
      console.log(`Se encontraron ${duplicates.length} grupos de duplicados`);
      
      // Para cada grupo de duplicados, mantenemos solo el registro con el ID más alto
      for (const dup of duplicates) {
        console.log(`Limpiando duplicados: entrenamiento=${dup.entrenamiento_id}, ejercicio=${dup.ejercicio_id}, serie=${dup.serie}`);
        
        // Obtener todos los IDs de los duplicados
        const records = await database.getAllAsync(`
          SELECT id
          FROM entrenamiento_detalles
          WHERE entrenamiento_id = ? AND ejercicio_id = ? AND serie = ?
          ORDER BY id
        `, [dup.entrenamiento_id, dup.ejercicio_id, dup.serie]);
        
        // Mantener solo el último registro (el de ID más alto)
        const idsToDelete = records.slice(0, -1).map(r => r.id);
        
        if (idsToDelete.length > 0) {
          console.log(`Eliminando ${idsToDelete.length} registros duplicados`);
          
          // Eliminar los duplicados
          for (const id of idsToDelete) {
            await database.execAsync(
              'DELETE FROM entrenamiento_detalles WHERE id = ?;',
              [id]
            );
          }
        }
      }
      
      // Confirmar la transacción
      await database.execAsync('COMMIT;');
      console.log('Limpieza de duplicados completada');
      
      return true;
    } catch (error) {
      // Revertir la transacción en caso de error
      await database.execAsync('ROLLBACK;');
      console.error('Error en limpieza de duplicados:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en cleanupDuplicateWorkoutDetails:', error);
    throw error;
  }
};

// Función para obtener los días con entrenamientos en un rango de fechas
const getWorkoutDays = async (startDate, endDate) => {
  try {
    const database = await getDatabase();
    
    // Formatear las fechas para la consulta SQL
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
    console.log(`Buscando entrenamientos entre ${formattedStartDate} y ${formattedEndDate}`);
    
    // Consulta para obtener las fechas con entrenamientos en el rango especificado
    // Asegurarse de que solo se devuelvan entrenamientos que tienen detalles
    const result = await database.getAllAsync(`
      SELECT DISTINCT e.fecha 
      FROM entrenamientos e
      INNER JOIN entrenamiento_detalles ed ON e.id = ed.entrenamiento_id
      WHERE e.fecha BETWEEN ? AND ?
      GROUP BY e.fecha
      HAVING COUNT(ed.id) > 0;
    `, [formattedStartDate, formattedEndDate]);
    
    console.log(`Días con entrenamientos encontrados: ${result.length}`);
    if (result.length > 0) {
      console.log(`Fechas: ${result.map(item => item.fecha).join(', ')}`);
    }
    
    // Devolver un array con las fechas en formato string
    return result.map(item => item.fecha);
  } catch (error) {
    console.error('Error getting workout days:', error);
    return [];
  }
};

// Exportar todas las funciones necesarias
export {
  initDatabase,
  resetDatabase,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  checkUserExists,
  getEjercicios,
  getMejoresLogros,
  createExercise,
  saveWorkout,
  getWorkoutsByDate,
  getWorkoutDetails,
  cleanupDuplicateWorkoutDetails,
  getWorkoutDays,
  getDatabase
};
