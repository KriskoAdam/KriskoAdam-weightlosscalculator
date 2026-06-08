export interface UserProfile {
  height_cm: number
  weight_kg: number
  age: number
  gender: 'male' | 'female'
  goal_weight_kg: number
}

// Mifflin-St Jeor BMR
export function calculateBMR(profile: UserProfile): number {
  const { weight_kg, height_cm, age, gender } = profile
  const base = 10 * weight_kg + 6.25 * height_cm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

// Daily calorie deficit/surplus
export function calculateDeficit(intake: number, burned: number, bmr: number): number {
  return intake - (bmr + burned)
}

// Weight change in kg from calorie deficit
// 7700 kcal = 1 kg fat
export function calculateWeightChange(deficitKcal: number): number {
  return deficitKcal / 7700
}

// New calculated weight
export function calculateNewWeight(currentWeight: number, deficitKcal: number): number {
  const change = calculateWeightChange(deficitKcal)
  return Math.max(0, currentWeight + change)
}

// BMI
export function calculateBMI(weight_kg: number, height_cm: number): number {
  const heightM = height_cm / 100
  return weight_kg / (heightM * heightM)
}

export type BMICategory =
  | 'underweight'
  | 'normal'
  | 'overweight'
  | 'obese_1'
  | 'obese_2'
  | 'obese_3'

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  if (bmi < 35) return 'obese_1'
  if (bmi < 40) return 'obese_2'
  return 'obese_3'
}

export function getBMILabel(category: BMICategory): string {
  const labels: Record<BMICategory, string> = {
    underweight: 'Podváha',
    normal: 'Normálna váha',
    overweight: 'Nadváha',
    obese_1: 'Obezita I. stupňa',
    obese_2: 'Obezita II. stupňa',
    obese_3: 'Obezita III. stupňa',
  }
  return labels[category]
}

// Heart attack risk multiplier vs normal weight baseline
export function getHeartAttackRisk(bmi: number): { multiplier: number; percentIncrease: number } {
  let multiplier: number
  if (bmi < 18.5) multiplier = 1.1
  else if (bmi < 25) multiplier = 1.0
  else if (bmi < 30) multiplier = 1.22
  else if (bmi < 35) multiplier = 1.67
  else if (bmi < 40) multiplier = 2.0
  else multiplier = 3.0

  return {
    multiplier,
    percentIncrease: Math.round((multiplier - 1) * 100),
  }
}

// How much risk reduction per kg lost
export function getRiskReductionPerKg(currentWeight: number, height_cm: number): number {
  const currentBMI = calculateBMI(currentWeight, height_cm)
  const newBMI = calculateBMI(currentWeight - 1, height_cm)
  const currentRisk = getHeartAttackRisk(currentBMI).multiplier
  const newRisk = getHeartAttackRisk(newBMI).multiplier
  return Math.abs(currentRisk - newRisk) * 100
}

// Progress percentage toward goal
export function getProgressPercent(
  startWeight: number,
  currentWeight: number,
  goalWeight: number
): number {
  if (startWeight <= goalWeight) return 100
  const total = startWeight - goalWeight
  const done = startWeight - currentWeight
  return Math.min(100, Math.max(0, (done / total) * 100))
}

// Age from birth date
export function getAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// Days until next weigh-in (every 15 days)
export function daysUntilWeighIn(lastWeighIn: string | null): number {
  if (!lastWeighIn) return 0
  const last = new Date(lastWeighIn)
  const next = new Date(last)
  next.setDate(next.getDate() + 15)
  const today = new Date()
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

// Days until next photo update (every 31 days)
export function daysUntilPhotoUpdate(lastPhotoDate: string | null): number {
  if (!lastPhotoDate) return 0
  const last = new Date(lastPhotoDate)
  const next = new Date(last)
  next.setDate(next.getDate() + 31)
  const today = new Date()
  const diff = Math.ceil((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}
