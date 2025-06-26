interface SkillExtractionResponse {
  skills: string[];
  confidence: number;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractSkillsFromText(text: string): Promise<SkillExtractionResponse> {
    try {
      const prompt = `Extract a list of professional skills from this text. Return only a JSON array of skill names, no explanations. Text: "${text}"`;

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a skill extraction assistant. Extract professional skills from user input and return them as a JSON array of strings.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from OpenAI');
      }

      // Try to parse JSON from the response
      let skills: string[] = [];
      try {
        // Remove any markdown formatting and parse JSON
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        skills = JSON.parse(cleanContent);
        
        if (!Array.isArray(skills)) {
          throw new Error('Response is not an array');
        }
      } catch (parseError) {
        console.warn('Failed to parse OpenAI response as JSON, using fallback extraction');
        skills = this.fallbackSkillExtraction(text);
      }

      return {
        skills: skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0),
        confidence: 0.8
      };

    } catch (error) {
      console.error('OpenAI skill extraction failed:', error);
      return {
        skills: this.fallbackSkillExtraction(text),
        confidence: 0.3
      };
    }
  }

  public fallbackSkillExtraction(text: string): string[] {
    const skillKeywords = [
      'design', 'graphic', 'web', 'development', 'programming', 'coding',
      'writing', 'content', 'marketing', 'social media', 'photography',
      'video', 'editing', 'translation', 'teaching', 'tutoring',
      'customer service', 'sales', 'administration', 'data entry',
      'research', 'analysis', 'consulting', 'coaching', 'fitness',
      'cooking', 'cleaning', 'gardening', 'handyman', 'repair',
      'plumbing', 'electrical', 'carpentry', 'painting', 'landscaping',
      'accounting', 'bookkeeping', 'legal', 'medical', 'nursing',
      'childcare', 'eldercare', 'pet care', 'driving', 'delivery',
      'event planning', 'catering', 'music', 'art', 'crafts',
      'technology', 'IT', 'software', 'hardware', 'networking',
      'cybersecurity', 'data science', 'machine learning', 'AI'
    ];

    const foundSkills = skillKeywords.filter(keyword => 
      text.toLowerCase().includes(keyword)
    );

    // Also extract capitalized words that might be skills
    const words = text.split(/\s+/);
    const capitalizedSkills = words.filter(word => 
      word.length > 2 && 
      /^[A-Z]/.test(word) && 
      !skillKeywords.includes(word.toLowerCase())
    );

    return [...foundSkills, ...capitalizedSkills.slice(0, 3)];
  }
}

// Create a singleton instance
let openAIService: OpenAIService | null = null;

export const getOpenAIService = (): OpenAIService | null => {
  return openAIService;
};

export const initializeOpenAI = (apiKey?: string): void => {
  // Use provided API key or try to get from environment
  const key = apiKey || process.env.OPENAI_API_KEY;
  if (key) {
    openAIService = new OpenAIService(key);
    console.log('OpenAI service initialized successfully');
  } else {
    console.warn('No OpenAI API key provided. AI features will use fallback extraction.');
  }
};

// Auto-initialize if API key is available
if (typeof process !== 'undefined' && process.env.OPENAI_API_KEY) {
  initializeOpenAI();
}

export const extractSkillsFromText = async (text: string): Promise<string[]> => {
  if (!openAIService) {
    // Fallback to keyword extraction if OpenAI is not configured
    const fallbackService = new OpenAIService('');
    return fallbackService.fallbackSkillExtraction(text);
  }

  const result = await openAIService.extractSkillsFromText(text);
  return result.skills;
}; 