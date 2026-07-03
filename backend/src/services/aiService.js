import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from './prisma.js';

const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * AI Fitness Chatbot Response
 */
export const getAIChatResponse = async (userId, userMessage) => {
  // Save user message to history
  await prisma.aIChatHistory.create({
    data: {
      userId,
      role: 'USER',
      message: userMessage
    }
  });

  const aiClient = getGenAIClient();

  if (!aiClient) {
    // Fallback Mock Chatbot
    const reply = getMockChatReply(userMessage);
    await prisma.aIChatHistory.create({
      data: {
        userId,
        role: 'MODEL',
        message: reply
      }
    });
    return reply;
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Fetch conversation history
    const history = await prisma.aIChatHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 20 // Last 20 messages for context
    });

    // Format chat context
    const contents = history.map(h => ({
      role: h.role === 'USER' ? 'user' : 'model',
      parts: [{ text: h.message }]
    }));

    // Add instructions as system guidance (or prepend to message)
    const systemPrompt = "You are a professional, motivating AI Fitness Coach named 'Aegis'. You provide scientifically sound, encouraging advice on exercises, diet, workouts, BMI, BMR, and recovery. Keep your answers concise, structured, and easy to read. Use bullet points where appropriate.";
    
    // Create chat session
    const chat = model.startChat({
      history: contents.slice(0, -1), // Everything except the newly created user message
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(userMessage);
    const textReply = result.response.text();

    // Save model response to history
    await prisma.aIChatHistory.create({
      data: {
        userId,
        role: 'MODEL',
        message: textReply
      }
    });

    return textReply;
  } catch (err) {
    console.error('Gemini API Error in Chatbot:', err);
    // Fallback inside catch
    const reply = "I'm having a little trouble connecting to my central neural network, but here is my coach advice: " + getMockChatReply(userMessage);
    await prisma.aIChatHistory.create({
      data: {
        userId,
        role: 'MODEL',
        message: reply
      }
    });
    return reply;
  }
};

/**
 * AI Workout Plan Generator
 */
export const getAIWorkoutPlan = async (params) => {
  const { age, gender, height, weight, goal, fitnessLevel, equipment, daysPerWeek } = params;

  const aiClient = getGenAIClient();

  if (!aiClient) {
    return generateMockWorkoutPlan(params);
  }

  try {
    const model = aiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an elite personal trainer. Generate a highly customized weekly workout plan in JSON format based on the following client parameters:
      - Age: ${age}
      - Gender: ${gender}
      - Height: ${height}cm
      - Weight: ${weight}kg
      - Main Goal: ${goal} (e.g. LOSE_WEIGHT, GAIN_MUSCLE, MAINTAIN_WEIGHT, INCREASE_STRENGTH, IMPROVE_ENDURANCE)
      - Fitness Level: ${fitnessLevel} (e.g. BEGINNER, INTERMEDIATE, ADVANCED)
      - Equipment Available: ${equipment} (e.g. dumbbells, barbell, full gym, bodyweight)
      - Days per Week: ${daysPerWeek}

      Respond strictly with a JSON object of this structure:
      {
        "planName": "Name of the customized program",
        "description": "Short overview explaining the split and philosophy",
        "split": "Summary of active days vs rest days",
        "weeklySchedule": [
          {
            "day": "Monday",
            "isRestDay": false,
            "focus": "Muscle group or target",
            "exercises": [
              { "name": "Exercise Name", "sets": 3, "reps": "10-12", "rest": "60s", "notes": "Form tip" }
            ],
            "cardio": "Description of any cardio, or 'None'",
            "stretching": "Stretching focus"
          },
          {
            "day": "Tuesday",
            "isRestDay": true,
            "focus": "Rest & Recovery",
            "exercises": [],
            "cardio": "None",
            "stretching": "Light lower body stretching"
          }
          // Include all 7 days of the week matching daysPerWeek count.
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const planText = result.response.text();
    return JSON.parse(planText);
  } catch (err) {
    console.error('Gemini API Error in Workout Plan:', err);
    return generateMockWorkoutPlan(params);
  }
};

/**
 * AI Nutrition Planner
 */
export const getAINutritionPlan = async (params) => {
  const { goal, calories, dietType, allergies, budget } = params;

  const aiClient = getGenAIClient();

  if (!aiClient) {
    return generateMockNutritionPlan(params);
  }

  try {
    const model = aiClient.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      You are an expert sports nutritionist. Generate a detailed daily meal plan in JSON format based on:
      - Goal: ${goal}
      - Target Calories: ${calories} kcal
      - Diet Preference: ${dietType} (e.g., VEGETARIAN, NON_VEGETARIAN, VEGAN, KETO)
      - Allergies/Exclusions: ${allergies || 'None'}
      - Budget Profile: ${budget || 'MEDIUM'}

      Respond strictly with a JSON object of this structure:
      {
        "planName": "Meal Plan Title",
        "macroSplit": { "protein": "grams", "carbs": "grams", "fat": "grams", "fiber": "grams" },
        "meals": {
          "breakfast": { "title": "Breakfast Name", "ingredients": ["item 1", "item 2"], "calories": 450, "macros": "P: 30g, C: 50g, F: 12g", "instructions": "Preparation details" },
          "lunch": { "title": "Lunch Name", "ingredients": ["item 1", "item 2"], "calories": 650, "macros": "P: 45g, C: 60g, F: 15g", "instructions": "Preparation details" },
          "dinner": { "title": "Dinner Name", "ingredients": ["item 1", "item 2"], "calories": 550, "macros": "P: 40g, C: 40g, F: 18g", "instructions": "Preparation details" },
          "snacks": { "title": "Snack Name", "ingredients": ["item 1"], "calories": 250, "macros": "P: 15g, C: 20g, F: 8g", "instructions": "Preparation details" }
        },
        "tips": ["Hydration reminder", "Prep advice"]
      }
    `;

    const result = await model.generateContent(prompt);
    const nutritionText = result.response.text();
    return JSON.parse(nutritionText);
  } catch (err) {
    console.error('Gemini API Error in Nutrition Plan:', err);
    return generateMockNutritionPlan(params);
  }
};

/**
 * AI Progress Insights Analyzer
 */
export const getAIProgressInsights = async (userId) => {
  // Fetch user data for context
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { insights: ['Could not load user profile details.'] };

  // Fetch weight history (last 5 logs)
  const weightLogs = await prisma.progressLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5
  });

  // Fetch workouts completed (last 10)
  const workouts = await prisma.workout.findMany({
    where: { userId, completed: true },
    orderBy: { date: 'desc' },
    take: 10
  });

  // Fetch nutrition log count
  const mealsCount = await prisma.meal.count({ where: { userId } });
  const waterLogCount = await prisma.waterLog.count({ where: { userId } });

  const aiClient = getGenAIClient();

  if (!aiClient) {
    return generateMockInsights(user, weightLogs, workouts, mealsCount, waterLogCount);
  }

  try {
    const model = aiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an AI Health Coach. Analyze the user's logged fitness logs and write a natural-language analysis.
      User Profile:
      - Goal: ${user.goal}
      - Target Weight: ${user.targetWeight}kg
      - Current Weight: ${user.weight}kg
      - Age: ${user.age}, Gender: ${user.gender}, Height: ${user.height}cm

      Logs Data:
      - Last Weight Logs: ${JSON.stringify(weightLogs.map(w => ({ date: w.date.toISOString().split('T')[0], weight: w.weight })))}
      - Completed Workouts in past week: ${workouts.length} workouts
      - Total Meals Logged: ${mealsCount}
      - Total Water Logs: ${waterLogCount}

      Please write exactly 4 distinct, highly personalized bullet points in plain text covering:
      1. Workout Consistency: Analyze their frequency and structure.
      2. Weight & Measurement Changes: Note weight trends in relation to their target.
      3. Nutrition & Calorie Balance: Offer tips based on their goal (e.g. surplus vs deficit).
      4. Motivation & Next Actionable Step: Provide a specific exercise or diet tip.

      Keep the language encouraging and technical. Avoid headers. Separate bullets with newlines.
    `;

    const result = await model.generateContent(prompt);
    const insightsText = result.response.text();
    const insights = insightsText.split('\n').filter(line => line.trim().length > 0);
    return { insights };
  } catch (err) {
    console.error('Gemini API Error in Progress Insights:', err);
    return generateMockInsights(user, weightLogs, workouts, mealsCount, waterLogCount);
  }
};

// ==========================================
// FALLBACK / MOCK AI LOGIC GENERATORS
// ==========================================

const getMockChatReply = (message) => {
  const msg = message.toLowerCase();
  if (msg.includes('chest') || msg.includes('push')) {
    return "**Chest Coach Aegis Advice:**\nTo build your chest, prioritize horizontal pressing movements. Here are three highly effective exercises:\n\n1. **Barbell Bench Press** (3-4 sets of 6-8 reps) - Great for overall chest density and mechanical tension.\n2. **Dumbbell Incline Press** (3 sets of 10-12 reps) - Emphasizes the upper fibers of the pectorals.\n3. **Cable Crossover / Chest Fly** (3 sets of 12-15 reps) - Maximizes peak contraction and stretch in a safer plane.\n\n*Form Tip:* Focus on retracting your shoulder blades and puffing your chest out to isolate the chest and protect your shoulders.";
  }
  if (msg.includes('lose') || msg.includes('fat') || msg.includes('weight')) {
    return "**Weight Loss Insights:**\nLosing fat requires a sustained energy deficit (burning more calories than you consume). Here's a 3-step strategy:\n\n1. **Calculate TDEE:** Find your maintenance calories and subtract 300 to 500 calories for a safe deficit.\n2. **Prioritize Protein:** Consume 1.6-2.2g of protein per kg of bodyweight. Protein increases satiety and prevents muscle loss.\n3. **Combine Resistance Training & Cardio:** Resistance training preserves calorie-burning muscle tissue, while cardio (like walking 8-10k steps) raises daily expenditure.\n\nBe consistent! A healthy weight loss pace is 0.5kg to 1kg per week.";
  }
  if (msg.includes('beginner') || msg.includes('routine')) {
    return "**Beginner Full-Body Workout Routine:**\nWelcome to your fitness journey! As a beginner, focus on compound movements that recruit multiple joints. Try this 3-day-a-week full-body split (e.g., Mon/Wed/Fri):\n\n- **Barbell Squats:** 3 sets of 8-10 reps (Legs/Glutes)\n- **Dumbbell Bench Press:** 3 sets of 10 reps (Chest/Triceps)\n- **Bent-Over Dumbbell Rows:** 3 sets of 10 reps (Back/Biceps)\n- **Dumbbell Shoulder Press:** 3 sets of 12 reps (Shoulders)\n- **Planks:** 3 sets, hold for 30-45 seconds (Core)\n\nRest 90 seconds between sets. Focus on mastering the execution form before adding heavier weights.";
  }
  if (msg.includes('protein') || msg.includes('meal') || msg.includes('eat')) {
    return "**High-Protein Meal Ideas:**\nFueling muscle recovery requires adequate protein. Try these quick high-protein meals:\n\n- **Breakfast:** Scrambled eggs (3 eggs) + 100g egg whites, spinach, and a slice of whole-wheat toast (Approx: 35g Protein)\n- **Lunch:** Grilled chicken breast (150g) with quinoa (150g) and roasted broccoli (Approx: 45g Protein)\n- **Dinner:** Pan-seared Salmon fillet (150g) with sweet potato mash and asparagus (Approx: 38g Protein)\n- **Snack:** Greek Yogurt (200g) with mixed berries and a scoop of whey protein powder (Approx: 35g Protein)";
  }
  if (msg.includes('bmi')) {
    return "**Understanding BMI (Body Mass Index):**\nBMI is a quick reference tool that estimates body fatness based on height and weight:\n\n- **Formula:** `Weight (kg) / Height (m)²`\n- **Underweight:** Under 18.5\n- **Healthy Range:** 18.5 – 24.9\n- **Overweight:** 25.0 – 29.9\n- **Obese:** 30.0 and above\n\n*Note:* BMI is a screening tool. It does not account for muscle mass vs. fat mass (e.g., bodybuilders often record 'obese' BMIs despite low body fat). Check your Progress Logs alongside BMI!";
  }
  if (msg.includes('bmr')) {
    return "**Understanding BMR (Basal Metabolic Rate):**\nBMR is the base number of calories your body burns simply to survive and perform basic life functions (breathing, circulating blood, cell production) at absolute rest.\n\nYour BMR is calculated using your weight, height, age, and biological sex. To find your actual maintenance calories, we multiply BMR by an Activity Multiplier (TDEE). Eating below TDEE leads to weight loss, while eating above it leads to weight gain.";
  }
  return "**Aegis Fitness Coach:**\nThat is an excellent fitness question. To achieve your goals, focus on tracking your daily inputs (workouts, hydration, meals) in the app. Consistency is the single most important factor.\n\nIs there a specific muscle group you want to train, or do you need help setting up your nutrition targets for the week?";
};

const generateMockWorkoutPlan = (params) => {
  const { goal, daysPerWeek, equipment, fitnessLevel } = params;
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activeDaysCount = parseInt(daysPerWeek) || 3;
  
  const schedule = days.map((day, idx) => {
    // Distribute rest days
    const isRestDay = idx >= activeDaysCount;
    
    if (isRestDay) {
      return {
        day,
        isRestDay: true,
        focus: 'Rest & Recovery',
        exercises: [],
        cardio: idx === 5 ? '30 mins low-intensity walk' : 'None',
        stretching: '10 mins Full Body Static Stretching'
      };
    }

    // Assign active workout focus
    let focus = 'Full Body';
    let exercises = [];
    if (activeDaysCount === 3) {
      const splits = ['Lower Body & Core', 'Upper Body Press', 'Upper Body Pull'];
      focus = splits[idx % 3];
    } else if (activeDaysCount >= 4) {
      const splits = ['Chest & Triceps', 'Back & Biceps', 'Legs & Calves', 'Shoulders & Core'];
      focus = splits[idx % splits.length];
    }

    if (focus.includes('Chest') || focus.includes('Press') || focus.includes('Upper Body')) {
      exercises = [
        { name: equipment.includes('barbell') ? 'Barbell Bench Press' : 'Dumbbell Chest Press', sets: 3, reps: '10-12', rest: '60-90s', notes: 'Keep elbows at a 45-degree angle.' },
        { name: 'Overhead Shoulder Press', sets: 3, reps: '10', rest: '60s', notes: 'Keep core tight, don\'t arch back.' },
        { name: 'Tricep Rope Pushdowns', sets: 3, reps: '12', rest: '60s', notes: 'Isolate the triceps at the bottom stretch.' }
      ];
    } else if (focus.includes('Back') || focus.includes('Pull')) {
      exercises = [
        { name: 'Lat Pulldowns / Pull-ups', sets: 4, reps: '8-10', rest: '90s', notes: 'Squeeze shoulder blades together.' },
        { name: 'Seated Cable Row', sets: 3, reps: '12', rest: '60s', notes: 'Pull toward belly button.' },
        { name: 'Dumbbell Bicep Curls', sets: 3, reps: '12', rest: '60s', notes: 'Controlled eccentric phase.' }
      ];
    } else {
      exercises = [
        { name: equipment.includes('barbell') ? 'Barbell Squats' : 'Dumbbell Goblet Squats', sets: 4, reps: '8-10', rest: '90-120s', notes: 'Break parallel in depth safely.' },
        { name: 'Romanian Deadlifts', sets: 3, reps: '10', rest: '90s', notes: 'Feel the stretch in your hamstrings.' },
        { name: 'Lying Leg Curls', sets: 3, reps: '12', rest: '60s', notes: 'Smooth concentric squeeze.' }
      ];
    }

    return {
      day,
      isRestDay: false,
      focus,
      exercises,
      cardio: '10-15 mins Low-Intensity Interval Cardio',
      stretching: '5 mins dynamic warm-up, 5 mins post-workout stretch'
    };
  });

  return {
    planName: `Customized ${fitnessLevel} ${goal} Split`,
    description: `A customized ${daysPerWeek}-day split optimized for ${goal.replace('_', ' ')}. Uses ${equipment} to build progression.`,
    split: `${activeDaysCount} Days Training / ${7 - activeDaysCount} Days Rest`,
    weeklySchedule: schedule
  };
};

const generateMockNutritionPlan = (params) => {
  const { goal, calories, dietType } = params;
  
  const cals = parseInt(calories) || 2000;
  const isVeg = dietType === 'VEGETARIAN' || dietType === 'VEGAN';
  
  const protein = Math.round((cals * 0.3) / 4);
  const carbs = Math.round((cals * 0.45) / 4);
  const fat = Math.round((cals * 0.25) / 9);
  const fiber = 30;

  return {
    planName: `Aegis Daily ${dietType} Diet (${cals} kcal)`,
    macroSplit: { protein: `${protein}g`, carbs: `${carbs}g`, fat: `${fat}g`, fiber: `${fiber}g` },
    meals: {
      breakfast: {
        title: isVeg ? "Oatmeal with Protein & Berries" : "Egg Scramble & Avocado Toast",
        ingredients: isVeg 
          ? ["50g Oats", "1 scoop Vegan Protein Powder", "100g Berries", "10g Chia seeds"]
          : ["3 Whole Eggs", "1 slice Whole-Wheat Toast", "50g Avocado", "Spinach"],
        calories: Math.round(cals * 0.25),
        macros: `P: ${Math.round(protein * 0.25)}g, C: ${Math.round(carbs * 0.25)}g, F: ${Math.round(fat * 0.25)}g`,
        instructions: "Cook base grains. Add ingredients together. Serve warm."
      },
      lunch: {
        title: isVeg ? "Tofu Rice Bowl with Vegetables" : "Grilled Chicken Quinoa Bowl",
        ingredients: isVeg
          ? ["150g Tofu pan-seared", "150g Brown Rice", "Mixed Broccoli & Bell Peppers", "1 tbsp Olive Oil"]
          : ["150g Chicken Breast", "150g Quinoa", "Steamed Broccoli", "1 tbsp Olive Oil"],
        calories: Math.round(cals * 0.35),
        macros: `P: ${Math.round(protein * 0.35)}g, C: ${Math.round(carbs * 0.35)}g, F: ${Math.round(fat * 0.35)}g`,
        instructions: "Pan-sear the protein. Steam the grains and vegetables. Drizzle healthy fats."
      },
      dinner: {
        title: isVeg ? "Tempeh Stir-Fry & Sweet Potato" : "Baked Salmon with Asparagus & Yam",
        ingredients: isVeg
          ? ["150g Tempeh", "200g Baked Sweet Potato", "Stir-fry snap peas & carrots", "10g sesame oil"]
          : ["150g Salmon fillet", "200g Sweet Potato", "Asparagus spears", "Lemon juice"],
        calories: Math.round(cals * 0.30),
        macros: `P: ${Math.round(protein * 0.30)}g, C: ${Math.round(carbs * 0.30)}g, F: ${Math.round(fat * 0.30)}g`,
        instructions: "Bake or pan-sear ingredients. Season with herbs and spices. Enjoy."
      },
      snacks: {
        title: "Greek Yogurt or Vegan Shake",
        ingredients: isVeg
          ? ["250ml Soy Milk", "1 scoop Protein Powder", "1 banana"]
          : ["200g Low-Fat Greek Yogurt", "30g Almonds"],
        calories: Math.round(cals * 0.10),
        macros: `P: ${Math.round(protein * 0.10)}g, C: ${Math.round(carbs * 0.10)}g, F: ${Math.round(fat * 0.10)}g`,
        instructions: "Consume as mid-afternoon snack or post-workout fuel."
      }
    },
    tips: [
      "Drink at least 3 liters of water throughout the day.",
      "Prep your meals in advance to avoid impulsive eating.",
      "Season with calorie-free seasonings like garlic powder, cayenne, or lemon."
    ]
  };
};

const generateMockInsights = (user, weightLogs, workouts, mealsCount, waterLogCount) => {
  const currentWeight = user.weight || 70.0;
  const targetWeight = user.targetWeight || 70.0;
  
  const insights = [
    `**Workout Consistency:** You completed ${workouts.length} workouts recently. To maximize your ${user.goal.toLowerCase().replace('_', ' ')} goal, aim to hit your weekly target of ${user.activityLevel === 'VERY_ACTIVE' ? '4-5' : '3-4'} workouts.`,
    `**Weight Trend:** Your current weight is ${currentWeight}kg, compared to your target weight of ${targetWeight}kg. ${currentWeight === targetWeight ? 'You have hit your target weight exactly! Outstanding.' : `You are ${Math.abs(currentWeight - targetWeight).toFixed(1)}kg away from your target.`}`,
    `**Calorie Balance:** With ${mealsCount} meals logged, your current daily intake is trending towards maintenance. Adjust portions slightly to maintain a clean ${user.goal === 'LOSE_WEIGHT' ? 'deficit' : 'surplus'}.`,
    `**Actionable Suggestion:** Ensure you log water intake consistently. Hydration is vital for fat metabolism and muscle recovery. Try drinking 250ml upon waking tomorrow.`
  ];

  return { insights };
};
