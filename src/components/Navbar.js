import React, { useContext } from 'react';
import ChangeLanguage from './ChangeLanguage';
import { LanguageContext } from './LanguageContext';

const Navbar = () => {
  const { language } = useContext(LanguageContext);

  const translations = {
    en: {
      title: 'Weightloss Calculator',
    },
    sk: {
      title: 'Kalkulačka na chudnutie',
    },
  };

  return (
    <header className="flex items-center justify-between p-4 w-full bg-[#e3f1ff]">
      <div className="flex-1 flex justify-start">
        <h1 className="font-bold font-serif text-sm sm:text-xs md:text-sm">{translations[language].title}</h1>
      </div>

      <div className="flex-1 flex justify-end items-center space-x-8 md:flex">
        <ChangeLanguage />
      </div>
    </header>
  );
};

export default Navbar;
