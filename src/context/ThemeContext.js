import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    colors: isDarkMode ? {
      background: '#121212',
      card: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#AAAAAA',
      primary: '#4A90E2',
      secondary: '#2C5282',
      accent: '#63B3ED',
    } : {
      background: '#f5f5f5',
      card: '#FFFFFF',
      text: '#000000',
      textSecondary: '#666666',
      primary: '#4A90E2',
      secondary: '#2C5282',
      accent: '#63B3ED',
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 