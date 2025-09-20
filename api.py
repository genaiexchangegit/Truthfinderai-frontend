

import os
import json
import re
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from newspaper import Article

app = Flask(__name__)
CORS(app) 

def get_analysis_from_gemini(article_text: str):
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("Error: GOOGLE_API_KEY environment variable not set.")
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel('gemini-1.5-flash-latest')

    prompt = f"""
    Analyze the following article text and provide a JSON response with your analysis.
    
    Your response must be ONLY a valid JSON object with these exact keys:
    - "title": string (article title or generated title)
    - "summary": string (brief summary of the article)
    - "toneAnalysis": string (analysis of the article's tone)
    - "sensationalismScore": integer from 1-10 (10 being most sensational)
    - "manipulativeTechniques": array of objects with "technique" and "explanation" keys
    - "trustScore": integer from 1-10 (10 being most trustworthy)
    - "finalVerdict": string (overall assessment)
    
    Do not include any text before or after the JSON object.
    
    ARTICLE TEXT:
    {article_text[:4000]}
    """
    
    try:
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        print(f"Raw Gemini response: {response_text[:500]}...")  
        
        
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            json_text = json_match.group()
        else:
            json_text = response_text
            
        
        json_text = re.sub(r'```json\s*', '', json_text)
        json_text = re.sub(r'\s*```', '', json_text)
        
        return json.loads(json_text)
        
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        print(f"Response text: {response_text}")
        
        return {
            "title": "Analysis Error",
            "summary": "Could not parse AI response",
            "toneAnalysis": "Unable to analyze due to parsing error",
            "sensationalismScore": 5,
            "manipulativeTechniques": [{"technique": "Error", "explanation": "Analysis failed"}],
            "trustScore": 5,
            "finalVerdict": "Analysis could not be completed due to technical issues"
        }
    except Exception as e:
        print(f"Error during Gemini analysis: {e}")
        return {
            "title": "Analysis Error",
            "summary": "AI analysis failed",
            "toneAnalysis": "Unable to analyze due to API error",
            "sensationalismScore": 5,
            "manipulativeTechniques": [{"technique": "Error", "explanation": str(e)}],
            "trustScore": 5,
            "finalVerdict": "Analysis could not be completed due to technical issues"
        }

@app.route('/analyze', methods=['POST'])
def analyze_article_endpoint():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "URL not provided"}), 400
    
    try:
        print(f"Analyzing URL: {url}")  
        
        article = Article(url)
        article.download()
        article.parse()

        if not article.text or len(article.text) < 100:
            return jsonify({"error": "Could not extract sufficient text from the article."}), 400

        print(f"Article extracted. Title: {article.title}, Text length: {len(article.text)}")  
        
        full_content = f"Title: {article.title}\n\n{article.text}"
        analysis_json = get_analysis_from_gemini(full_content)
        
        if "error" in analysis_json:
            return jsonify(analysis_json), 500
            
        return jsonify(analysis_json), 200
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  
        return jsonify({"error": f"An unexpected error occurred: {str(e)}"}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)