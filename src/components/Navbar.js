import React, { useContext, useState } from 'react';
import ChangeLanguage from './ChangeLanguage';
import { LanguageContext } from './LanguageContext'; // Import LanguageContext

const Navbar = () => {
  const { language } = useContext(LanguageContext); // Získanie aktuálneho jazyka z kontextu
  const [menuOpen, setMenuOpen] = useState(false); // Stav pre otváranie a zatváranie menu

  // Preklady pre podporované jazyky
  const translations = {
    en: {
      title: 'Weightloss Calculator',
      projects: 'Other Projects',
      about: 'About Me',
    },
    sk: {
      title: 'Kalkulačka na chudnutie',
      projects: 'Iné projekty',
      about: 'O mne',
    },
  };

  return (
    <header className="flex items-center justify-between p-4 w-full bg-[#e3f1ff]">
      {/* Logo alebo názov stránky */}
      <div className="flex-1 flex justify-center">
        <h1 className="font-bold font-serif text-sm sm:text-xs md:text-sm">{translations[language].title}</h1>
      </div>

      {/* Mobilné menu (hamburger menu) */}
      <div className="block lg:hidden">
        <button 
          className="text-2xl" 
          onClick={() => setMenuOpen(!menuOpen)} 
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Navigácia pre desktopové zariadenia */}
      <div className={`flex-1 flex justify-center items-center space-x-8 md:flex ${menuOpen ? 'block' : 'hidden'} lg:block`}>
        <ol className="flex space-x-8 list-none p-0">
          <li className="text-base sm:text-sm md:text-lg">{translations[language].projects}</li>
          <li className="text-base sm:text-sm md:text-lg">{translations[language].about}</li>
        </ol>
        <ChangeLanguage /> {/* Komponent na zmenu jazyka */}
      </div>
    </header>
  );
};

export default Navbar;
