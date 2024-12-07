import React, { createContext, useState } from 'react';

// Vytvorenie kontextu
export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Predvolený jazyk je angličtina

  const changeLanguage = (lang) => setLanguage(lang); // Funkcia na zmenu jazyka

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
