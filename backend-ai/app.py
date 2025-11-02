import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv()

# --- Configuration ---
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-pro-latest') # Or another suitable model

app = Flask(__name__)

# --- The Master Prompt Template ---
# This is the most critical part. It instructs the model on its role,
# the context it needs to consider, and the format of its output.
PROMPT_TEMPLATE = """
You are an expert agricultural advisor for Kenyan farmers. Your goal is to provide a highly relevant, data-driven crop recommendation.

**Context:**
1.  **Farmer Profile:** {farmer_profile}
2.  **Real-time Weather Data:** {weather_data}
3.  **Market Data:** {market_data}

**Your Task:**
Based on all the provided context, recommend the single best crop for this farmer to plant in the upcoming season.

**Reasoning Instructions:**
- Analyze the farmer's soil type, land size, and location.
- Cross-reference this with the provided real-time weather data (temperature, rainfall, drought risk).
- Consider the market demand and potential profitability from the market data.
- Your recommendation should be practical and tailored to the farmer's specific conditions.

**Output Format:**
You MUST respond with a JSON object. Do not include any other text or markdown formatting. The JSON object must have the following structure:

{{
  "recommendedCrop": "<Name of the Crop>",
  "confidenceScore": <A number between 0 and 100 representing your confidence>,
  "explanation": {{
    "summary": "<A brief, one-sentence summary of why you chose this crop.>",
    "keyFactors": [
      {{
        "factor": "Soil and Climate Match",
        "reasoning": "<Explain how the crop matches the farmer's soil and the local climate.>"
      }},
      {{
        "factor": "Weather Resilience",
        "reasoning": "<Explain how the crop choice is resilient to the forecasted weather (e.g., drought risk, rainfall patterns).>"
      }},
      {{
        "factor": "Market Opportunity",
        "reasoning": "<Explain the market demand and potential profitability for this crop.>"
      }}
    ]
  }},
  "guidance": {{
    "bestPlantingTime": "<Suggest the best planting season or months.>",
    "expectedYield": "<Provide an estimated yield per acre in Kg.>",
    "potentialRevenue": "<Estimate the potential revenue per acre in KES.>"
  }}
}}
"""

def create_prompt(farmer_profile, weather_data, market_data):
    """Fills the master prompt template with dynamic data."""
    return PROMPT_TEMPLATE.format(
        farmer_profile=farmer_profile,
        weather_data=weather_data,
        market_data=market_data
    )

@app.route('/generate-recommendation', methods=['POST'])
def generate_recommendation():
    """API endpoint to generate a crop recommendation."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    # Extract data from the request payload
    farmer_profile = data.get('farmer_profile')
    weather_data = data.get('weather_data')
    market_data = data.get('market_data', {"demand": "Stable", "prices": "Average"}) # Default market data

    # 1. Create the detailed prompt
    prompt = create_prompt(farmer_profile, weather_data, market_data)

    try:
        # 2. Call the Gemini API
        response = model.generate_content(prompt)
        
        # 3. Clean and parse the JSON response
        # The API might return the JSON string within markdown backticks
        response_text = response.text.strip().replace('```json', '').replace('```', '')
        recommendation_json = jsonify(response_text)
        
        return recommendation_json, 200

    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"error": "Failed to generate recommendation from AI model."}), 500

if __name__ == '__main__':
    app.run(port=5001, debug=True) # Run on a different port than the Node.js server
