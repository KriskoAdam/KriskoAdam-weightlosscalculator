import React, { useContext } from 'react';
import { LanguageContext } from './LanguageContext';

const ChangeLanguage = () => {
  const { language, changeLanguage } = useContext(LanguageContext);

  return (
    <div>
      <label htmlFor="Language" className="font-light italic">
        Change Language:
      </label>
      <select
        className="bg-[#e3f1ff] rounded cursor-pointer ml-2"
        name="Language"
        id="Language"
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="sk">Slovensky</option>
      </select>
    </div>
  );
};

export default ChangeLanguage;
