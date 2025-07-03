interface SkillExtractionResponse {
  skills: string[];
  confidence: number;
}

interface JobRecommendationResponse {
  recommendations: Array<{
    jobId: string;
    score: number;
    reasons: string[];
    urgency: 'high' | 'medium' | 'low';
    estimatedEarnings: number;
  }>;
}

interface JobCategorizationResponse {
  category: string;
  complexity: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  estimatedDuration: string;
  suggestedBudget: {
    min: number;
    max: number;
  };
  requiredSkills: string[];
  confidence: number;
}

interface SkillGapAnalysisResponse {
  missingSkills: string[];
  learningResources: Array<{
    skill: string;
    resource: string;
    estimatedTime: string;
  }>;
  alternativeJobs: string[];
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
        // Log GPT extraction
        console.log('[Skill Extraction][GPT]', { input: text, skills });
      } catch (parseError) {
        console.warn('Failed to parse OpenAI response as JSON, using fallback extraction');
        skills = this.fallbackSkillExtraction(text);
        // Log fallback extraction
        console.log('[Skill Extraction][Fallback]', { input: text, skills });
      }

      return {
        skills: skills.filter(skill => typeof skill === 'string' && skill.trim().length > 0),
        confidence: 0.8
      };

    } catch (error) {
      console.error('OpenAI skill extraction failed:', error);
      const skills = this.fallbackSkillExtraction(text);
      // Log fallback extraction
      console.log('[Skill Extraction][Fallback]', { input: text, skills });
      return {
        skills,
        confidence: 0.3
      };
    }
  }

  async generateJobRecommendations(
    userProfile: any,
    availableJobs: any[],
    userPreferences?: {
      maxDistance?: number;
      minPay?: number;
      preferredCategories?: string[];
      availability?: string;
    }
  ): Promise<JobRecommendationResponse> {
    try {
      const prompt = `Given a user profile and available jobs, generate personalized job recommendations. Consider skills, location, experience, and preferences.

User Profile: ${JSON.stringify(userProfile)}
Available Jobs: ${JSON.stringify(availableJobs.slice(0, 20))} // Limit to first 20 for token efficiency
User Preferences: ${JSON.stringify(userPreferences || {})}

Return a JSON object with recommendations array containing jobId, score (0-100), reasons array, urgency level, and estimated earnings.`;

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
              content: 'You are an AI job matching specialist. Analyze user profiles and job requirements to provide personalized recommendations.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000,
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

      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(cleanContent);
        return result as JobRecommendationResponse;
      } catch (parseError) {
        console.error('Failed to parse job recommendations:', parseError);
        return this.fallbackJobRecommendations(userProfile, availableJobs);
      }

    } catch (error) {
      console.error('OpenAI job recommendations failed:', error);
      return this.fallbackJobRecommendations(userProfile, availableJobs);
    }
  }

  async categorizeJob(jobDescription: string, title: string): Promise<JobCategorizationResponse> {
    try {
      const prompt = `Analyze this job posting and categorize it appropriately.

Job Title: "${title}"
Job Description: "${jobDescription}"

Return a JSON object with:
- category: one of the predefined job categories
- complexity: Beginner, Intermediate, Advanced, or Expert
- estimatedDuration: estimated time to complete (e.g., "2-4 hours", "1-2 days")
- suggestedBudget: min and max suggested pay range
- requiredSkills: array of required skills
- confidence: confidence score (0-1)`;

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
              content: 'You are a job categorization expert. Analyze job postings and provide detailed categorization and requirements analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
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

      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(cleanContent);
        return result as JobCategorizationResponse;
      } catch (parseError) {
        console.error('Failed to parse job categorization:', parseError);
        return this.fallbackJobCategorization(jobDescription, title);
      }

    } catch (error) {
      console.error('OpenAI job categorization failed:', error);
      return this.fallbackJobCategorization(jobDescription, title);
    }
  }

  async analyzeSkillGap(
    userSkills: string[],
    targetJobSkills: string[],
    userExperience: string
  ): Promise<SkillGapAnalysisResponse> {
    try {
      const prompt = `Analyze the skill gap between a user's current skills and the skills required for a target job.

User Skills: ${JSON.stringify(userSkills)}
User Experience: ${userExperience}
Target Job Skills: ${JSON.stringify(targetJobSkills)}

Return a JSON object with:
- missingSkills: array of skills the user needs to learn
- learningResources: array of objects with skill, resource (learning platform/course), and estimatedTime
- alternativeJobs: array of job categories that match the user's current skills`;

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
              content: 'You are a career development specialist. Help users understand skill gaps and provide learning resources.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
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

      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(cleanContent);
        return result as SkillGapAnalysisResponse;
      } catch (parseError) {
        console.error('Failed to parse skill gap analysis:', parseError);
        return this.fallbackSkillGapAnalysis(userSkills, targetJobSkills);
      }

    } catch (error) {
      console.error('OpenAI skill gap analysis failed:', error);
      return this.fallbackSkillGapAnalysis(userSkills, targetJobSkills);
    }
  }

  async generateQuickMoneySuggestions(
    userLocation: string,
    userSkills: string[],
    urgency: 'immediate' | 'within_week' | 'flexible' = 'immediate'
  ): Promise<Array<{
    opportunity: string;
    estimatedEarnings: string;
    timeToComplete: string;
    requirements: string[];
    platforms: string[];
  }>> {
    try {
      const prompt = `Generate quick money-making opportunities for someone in ${userLocation} with these skills: ${userSkills.join(', ')}. 
      Urgency level: ${urgency}

      Return a JSON array of opportunities with:
      - opportunity: description of the opportunity
      - estimatedEarnings: estimated pay range
      - timeToComplete: how long it takes
      - requirements: what's needed
      - platforms: where to find these opportunities`;

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
              content: 'You are a financial advisor specializing in quick money-making opportunities. Provide practical, actionable suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 600,
          temperature: 0.4,
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

      try {
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const result = JSON.parse(cleanContent);
        return result;
      } catch (parseError) {
        console.error('Failed to parse quick money suggestions:', parseError);
        return this.fallbackQuickMoneySuggestions(userLocation, userSkills, urgency);
      }

    } catch (error) {
      console.error('OpenAI quick money suggestions failed:', error);
      return this.fallbackQuickMoneySuggestions(userLocation, userSkills, urgency);
    }
  }

  // Fallback methods
  private fallbackJobRecommendations(userProfile: any, availableJobs: any[]): JobRecommendationResponse {
    const recommendations = availableJobs.slice(0, 5).map((job, index) => ({
      jobId: job.id,
      score: 80 - (index * 10),
      reasons: ['Based on available opportunities'],
      urgency: 'medium' as const,
      estimatedEarnings: job.budget?.min || 50
    }));

    return { recommendations };
  }

  private fallbackJobCategorization(jobDescription: string, title: string): JobCategorizationResponse {
    const categoryKeywords = {
      'Technology': ['tech', 'computer', 'software', 'programming', 'coding'],
      'Design': ['design', 'graphic', 'creative', 'art'],
      'Writing': ['writing', 'content', 'copy', 'article'],
      'Administrative': ['admin', 'data entry', 'filing', 'organization'],
      'Customer Service': ['customer', 'support', 'service', 'help'],
      'Cleaning': ['cleaning', 'housekeeping', 'maintenance'],
      'Pet Care': ['pet', 'dog', 'cat', 'animal'],
      'Childcare': ['child', 'babysit', 'care'],
      'Handyman': ['repair', 'fix', 'install', 'assembly'],
      'Other': []
    };

    let category = 'Other';
    const lowerDesc = jobDescription.toLowerCase();
    const lowerTitle = title.toLowerCase();

    for (const [cat, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDesc.includes(keyword) || lowerTitle.includes(keyword))) {
        category = cat;
        break;
      }
    }

    return {
      category,
      complexity: 'Beginner',
      estimatedDuration: '2-4 hours',
      suggestedBudget: { min: 25, max: 100 },
      requiredSkills: [],
      confidence: 0.6
    };
  }

  private fallbackSkillGapAnalysis(userSkills: string[], targetJobSkills: string[]): SkillGapAnalysisResponse {
    const missingSkills = targetJobSkills.filter(skill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );

    return {
      missingSkills,
      learningResources: missingSkills.map(skill => ({
        skill,
        resource: 'Online courses and tutorials',
        estimatedTime: '2-4 weeks'
      })),
      alternativeJobs: ['General gig work', 'Basic tasks']
    };
  }

  private fallbackQuickMoneySuggestions(
    userLocation: string,
    userSkills: string[],
    urgency: string
  ): Array<{
    opportunity: string;
    estimatedEarnings: string;
    timeToComplete: string;
    requirements: string[];
    platforms: string[];
  }> {
    const suggestions = [
      {
        opportunity: 'Food delivery',
        estimatedEarnings: '$15-25/hour',
        timeToComplete: 'Immediate',
        requirements: ['Vehicle or bike', 'Smartphone'],
        platforms: ['DoorDash', 'Uber Eats', 'Grubhub']
      },
      {
        opportunity: 'Grocery shopping',
        estimatedEarnings: '$20-30/hour',
        timeToComplete: 'Same day',
        requirements: ['Vehicle', 'Smartphone'],
        platforms: ['Instacart', 'Shipt']
      },
      {
        opportunity: 'House cleaning',
        estimatedEarnings: '$25-40/hour',
        timeToComplete: '1-2 days',
        requirements: ['Cleaning supplies', 'Transportation'],
        platforms: ['TaskRabbit', 'Thumbtack']
      }
    ];

    return suggestions;
  }

  public fallbackSkillExtraction(text: string): string[] {
    // Only run fallback if input is not empty and at least 4 characters long
    if (!text || text.trim().length < 4) {
      // Log fallback extraction (empty)
      console.log('[Skill Extraction][Fallback]', { input: text, skills: [] });
      return [];
    }
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
      'cybersecurity', 'data science', 'machine learning', 'AI',
      'communication', 'problem-solving', 'time management'
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

    const allSkills = [...foundSkills, ...capitalizedSkills.slice(0, 3)];
    // Log fallback extraction
    console.log('[Skill Extraction][Fallback]', { input: text, skills: allSkills });
    return allSkills;
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