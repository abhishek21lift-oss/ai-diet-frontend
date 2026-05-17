import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface DietPlanInput {
  clientName: string;
  goal: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  bodyType: string;
  dietType: string;
  activityLevel: string;
  medicalConditions: string[];
  allergies: string[];
  foodsToAvoid: string[];
  weightKg: number;
}

export async function generateAIDietPlan(input: DietPlanInput) {
  const prompt = buildPrompt(input);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = response.content[0].type === 'text' ? response.content[0].text : '';
  return { parsed: parseAIResponse(raw), prompt };
}

function buildPrompt(input: DietPlanInput): string {
  const goalLabels: Record<string, string> = {
    FAT_LOSS: 'Fat Loss', MUSCLE_GAIN: 'Muscle Gain',
    MAINTENANCE: 'Maintenance', BODY_RECOMPOSITION: 'Body Recomposition',
  };
  const dietLabels: Record<string, string> = {
    VEG: 'Vegetarian', VEGAN: 'Vegan',
    NON_VEG: 'Non-Vegetarian', JAIN: 'Jain (no root vegetables)',
  };

  return `
You are a certified sports dietitian creating a personalized meal plan for an Indian fitness client.
Respond ONLY with valid JSON. No markdown, no explanations, no code blocks.

CLIENT PROFILE:
- Name: ${input.clientName}
- Goal: ${goalLabels[input.goal] || input.goal}
- Body Type: ${input.bodyType}
- Diet Type: ${dietLabels[input.dietType] || input.dietType}
- Activity Level: ${input.activityLevel.replace('_', ' ')}
- Body Weight: ${input.weightKg}kg

DAILY TARGETS:
- Calories: ${input.dailyCalories} kcal
- Protein: ${input.proteinGrams}g
- Carbs: ${input.carbsGrams}g
- Fats: ${input.fatsGrams}g

RESTRICTIONS:
- Medical Conditions: ${input.medicalConditions.join(', ') || 'None'}
- Allergies: ${input.allergies.join(', ') || 'None'}
- Foods to Avoid: ${input.foodsToAvoid.join(', ') || 'None'}

INSTRUCTIONS:
- Create 5-6 meals spread throughout the day
- Use Indian foods where appropriate
- Each meal should have 2-4 food items
- Provide practical quantities
- Include 2-3 alternatives per food item
- Ensure macros add up to daily targets

RESPOND WITH THIS EXACT JSON STRUCTURE:
{
  "planSummary": "Brief 2-sentence personalized summary",
  "totalCalories": ${input.dailyCalories},
  "totalProtein": ${input.proteinGrams},
  "totalCarbs": ${input.carbsGrams},
  "totalFats": ${input.fatsGrams},
  "meals": [
    {
      "mealName": "Breakfast",
      "mealTime": "7:00 AM",
      "calories": 450,
      "proteinGrams": 35,
      "carbsGrams": 40,
      "fatsGrams": 12,
      "foods": [
        {
          "foodName": "Oats",
          "quantity": "80g (dry)",
          "calories": 300,
          "protein": 10,
          "carbs": 54,
          "fats": 6,
          "alternatives": ["Upma", "Poha", "Whole wheat bread toast"]
        }
      ]
    }
  ],
  "hydrationTips": "...",
  "supplementSuggestions": ["Whey Protein", "Creatine 5g"],
  "trainerNotes": "..."
}
`.trim();
}

function parseAIResponse(raw: string): any {
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AI returned invalid JSON. Please try again.');
  }
}
