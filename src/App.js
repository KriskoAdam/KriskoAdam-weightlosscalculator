import React from 'react';
import Navbar from './components/Navbar';
import './index.css';
import InfoContainer from './components/InfoContainer';
import Calculator from './components/Calculator';

import { LanguageProvider } from "./components/LanguageContext"

const App = () => {
  return (
    <LanguageProvider> {/* Obalenie aplikácie LanguageProvider */}
      <div>
        <Navbar />
        <InfoContainer />
        <Calculator />
      </div>
    </LanguageProvider>
  );
};

export default App;
