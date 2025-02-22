import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'tr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isLanguageSelected: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  isLanguageSelected: false,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    setIsLanguageSelected(true);
  }, []);

  return (
    <LanguageContext.Provider 
      value={{ 
        language, 
        setLanguage: handleSetLanguage,
        isLanguageSelected 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}; 