import React, { useContext } from 'react';
import "../Fonts/Fonts.css";
import { LanguageContext } from './LanguageContext'; // Import LanguageContext

const InfoContainer = () => {
  const { language } = useContext(LanguageContext); // Získanie aktuálneho jazyka z kontextu

  // Preklady pre podporované jazyky
  const translations = {
    en: {
      welcome: 'Welcome',
      description:
        'This application is designed to help you achieve your weight loss goals efficiently and systematically. It provides accurate calculations based on your personal data, such as gender, height, weight, and daily caloric intake. It uses scientifically proven methods to determine your Basal Metabolic Rate (BMR) and, by combining this with your activity level, calculates your caloric needs. Set a target date and get a clear picture of how your efforts will translate into results. The app is the ideal companion for anyone starting their journey towards better health or wishing to maintain motivation.',
    },
    sk: {
      welcome: 'Vitajte',
      description:
        'Táto aplikácia je navrhnutá tak, aby vám pomohla dosiahnuť vaše ciele v chudnutí efektívne a systematicky. Poskytuje presné výpočty na základe vašich osobných údajov, ako sú pohlavie, výška, hmotnosť a denný kalorický príjem. Využíva vedecky overené metódy na určenie bazálneho metabolizmu (BMR) a kombináciou s úrovňou aktivity vypočíta vaše kalorické potreby. Nastavte si cieľový dátum a získajte jasný obraz o tom, ako sa vaše úsilie premietne do výsledkov. Aplikácia je ideálnym sprievodcom pre každého, kto začína svoju cestu za lepším zdravím alebo si chce udržať motiváciu.',
    },
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-sky-500 bg-clip-padding backdrop-filter backdrop-blur bg-opacity-10 backdrop-saturate-100 backdrop-contrast-100 rounded-lg shadow-lg p-6">
        <h2 className="text-center text-2xl md:text-3xl font-semibold font-poppins text-black">
          {translations[language].welcome} {/* Dynamický nadpis */}
        </h2>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-black">
          {translations[language].description} {/* Dynamický text */}
        </p>
      </div>
    </div>
  );
};

export default InfoContainer;
