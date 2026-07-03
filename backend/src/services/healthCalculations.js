/**
 * Calculate Body Mass Index (BMI)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return 0;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - MALE, FEMALE, or OTHER
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return 0;
  
  let bmr = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'FEMALE') {
    bmr -= 161;
  } else {
    // Default to male calculation for general or other
    bmr += 5;
  }
  
  return Math.round(bmr);
};

/**
 * Calculate Total Daily Energy Expenditure (TDEE) based on activity level and BMR
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, EXTRA_ACTIVE
 */
export const calculateTDEE = (bmr, activityLevel) => {
  if (!bmr) return 0;
  
  let multiplier = 1.2;
  
  switch (activityLevel) {
    case 'SEDENTARY':
      multiplier = 1.2;
      break;
    case 'LIGHTLY_ACTIVE':
      multiplier = 1.375;
      break;
    case 'MODERATELY_ACTIVE':
      multiplier = 1.55;
      break;
    case 'VERY_ACTIVE':
      multiplier = 1.725;
      break;
    case 'EXTRA_ACTIVE':
      multiplier = 1.9;
      break;
    default:
      multiplier = 1.2;
  }
  
  return Math.round(bmr * multiplier);
};
