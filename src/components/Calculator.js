import React, { useState, useContext } from 'react';
import { ReactComponent as Male } from '../Icons/male.svg';
import { ReactComponent as Female } from '../Icons/female.svg';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; 
import moment from 'moment';
import { LanguageContext } from './LanguageContext'; // Import LanguageContext

const Calculator = () => {
  const { language } = useContext(LanguageContext); // Získanie aktuálneho jazyka
  const [selectedGender, setSelectedGender] = useState(null);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [calorieIntake, setCalorieIntake] = useState('');
  const [calorieExpenditure, setCalorieExpenditure] = useState('');
  const [date, setDate] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [weightLoss, setWeightLoss] = useState(null);

  const translations = {
    en: {
      male: 'Male',
      female: 'Female',
      unitLabel: 'Choose Unit:',
      height: 'Height:',
      weight: 'Weight:',
      calorieIntake: 'Calorie Intake:',
      calorieExpenditure: 'Calorie Expenditure (Burned):',
      chooseDate: 'Choose Date:',
      submit: 'Submit',
      errorFillFields: 'Please fill out all fields.',
      errorFutureDate: 'Please select a future date.',
      weightLossResult: 'Estimated Weight Loss:',
      resultMessage: (kg, pounds, date) => `You could lose ${kg} kg (${pounds} lbs) by ${date}.`,
    },
    sk: {
      male: 'Muž',
      female: 'Žena',
      unitLabel: 'Vyberte jednotku:',
      height: 'Výška:',
      weight: 'Hmotnosť:',
      calorieIntake: 'Kalorický príjem:',
      calorieExpenditure: 'Kalorický výdaj (spálené):',
      chooseDate: 'Vyberte dátum:',
      submit: 'Odoslať',
      errorFillFields: 'Vyplňte všetky polia.',
      errorFutureDate: 'Vyberte budúci dátum.',
      weightLossResult: 'Odhadovaná strata hmotnosti:',
      resultMessage: (kg, pounds, date) => `Môžete schudnúť ${kg} kg (${pounds} lbs) do ${date}.`,
    },
  };

  const t = translations[language]; // Preklady pre aktuálny jazyk

  const handleButtonClick = (gender) => {
    setSelectedGender(gender);
  };

  const formSubmit = (e) => {
    e.preventDefault();

    if (!selectedGender || !height || !weight || !calorieIntake || !calorieExpenditure || !date) {
      setErrorMessage(t.errorFillFields);
      return;
    }

    const currentDate = moment();
    const selectedDateMoment = moment(date);

    if (selectedDateMoment.isBefore(currentDate)) {
      setErrorMessage(t.errorFutureDate);
      return;
    }

    let bmr = 0;
    if (selectedGender === 'male') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * 23 + 5; 
    } else if (selectedGender === 'female') {
      bmr = 10 * parseFloat(weight) + 6.25 * parseFloat(height) - 5 * 23 - 161; 
    }

    const totalCalorieExpenditure = parseFloat(calorieExpenditure) + bmr;
    const netCalorieDeficit = parseFloat(calorieIntake) - totalCalorieExpenditure;
    const daysDifference = selectedDateMoment.diff(currentDate, 'days');
    const kgLost = (Math.abs(netCalorieDeficit) * daysDifference) / 7700;
    const poundsLost = kgLost * 2.20462;

    setWeightLoss({
      kg: kgLost.toFixed(2),
      pounds: poundsLost.toFixed(2),
    });
    setErrorMessage('');
  };

  return (
    <div className="flex justify-center items-center pt-20 h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <div className="flex justify-center space-x-8 mb-8">
          <div className="flex flex-col items-center">
            <p className="mb-2 text-lg">{t.male}</p>
            <button
              onClick={() => handleButtonClick('male')}
              className={`p-4 rounded-full ${selectedGender === 'male' ? 'bg-blue-600' : 'bg-blue-800'} text-white`}
            >
              <Male className="w-12 h-12" />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <p className="mb-2 text-lg">{t.female}</p>
            <button
              onClick={() => handleButtonClick('female')}
              className={`p-4 rounded-full ${selectedGender === 'female' ? 'bg-pink-500' : 'bg-pink-700'} text-white`}
            >
              <Female className="w-12 h-12" />
            </button>
          </div>
        </div>

        <form onSubmit={formSubmit} className="space-y-6">
          <div>
            <label htmlFor="unit" className="block text-lg font-medium mb-2">{t.unitLabel}</label>
            <select id="unit" className="w-full p-2 border border-gray-300 rounded-lg">
              <option value="Cm/KG">Cm/kg</option>
              <option value="Inch/pounds">Inch/pounds</option>
            </select>
          </div>

          <div>
            <label htmlFor="Height" className="block text-lg font-medium mb-2">{t.height}</label>
            <input 
              id="Height" 
              name="Height" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg" 
              type="number" 
            />
          </div>

          <div>
            <label htmlFor="Weight" className="block text-lg font-medium mb-2">{t.weight}</label>
            <input 
              id="Weight" 
              name="Weight" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg" 
              type="number" 
            />
          </div>

          <div>
            <label htmlFor="CalorieIntake" className="block text-lg font-medium mb-2">{t.calorieIntake}</label>
            <input 
              id="CalorieIntake" 
              name="calorieintake" 
              value={calorieIntake}
              onChange={(e) => setCalorieIntake(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg" 
              type="number" 
            />
          </div>

          <div>
            <label htmlFor="CalorieExpenditure" className="block text-lg font-medium mb-2">{t.calorieExpenditure}</label>
            <input 
              id="CalorieExpenditure" 
              name="vydaj" 
              value={calorieExpenditure}
              onChange={(e) => setCalorieExpenditure(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg" 
              type="number" 
            />
          </div>

          <div>
            <label htmlFor="Date" className="block text-lg font-medium mb-2">{t.chooseDate}</label>
            <DatePicker
              selected={date}
              onSelect={setDate}
              onChange={setDate}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded-lg mt-4">{t.submit}</button>
        </form>

        {weightLoss && (
          <div className="mt-8 text-center">
            <p className="text-xl font-medium">{t.weightLossResult}</p>
            <p className="text-lg">{t.resultMessage(weightLoss.kg, weightLoss.pounds, moment(date).format('MMMM Do YYYY'))}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calculator;
