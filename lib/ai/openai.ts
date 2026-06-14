/**
 * CreatorVault AI - OpenAI Integration Client Template
 * This file outlines the architecture for future OpenAI (or other LLM) integrations.
 * It provides standard wrappers and templates for analyzing uploaded assets.
 */
import { CREATOR_PROMPTS } from './prompts';

export interface AIServiceResponse {
  summary: string;
  outline: string[];
  suggestedTitles: string[];
  ctrInsights: string;
}

export class CreatorAIService {
  private static apiKey = process.env.OPENAI_API_KEY || '';

  /**
   * Generates creator-centric analysis based on file type and content.
   * This function contains the pipeline for future backend transcription/vision calls.
   */
  static async analyzeAsset(
    fileUrl: string,
    fileName: string,
    fileType: string,
    category: string
  ): Promise<AIServiceResponse> {
    // Boilerplate check
    if (!this.apiKey) {
      console.warn("OpenAI API Key is missing. Using simulated AI response pipeline.");
      return this.getSimulatedResponse(fileName, fileType, category);
    }

    try {
      // Choose prompt template based on category or file type
      let systemPrompt = CREATOR_PROMPTS.METADATA_OPTIMIZER;
      const lowerType = fileType.toLowerCase();
      const lowerName = fileName.toLowerCase();

      if (category === 'Thumbnail References' || lowerType.startsWith('image/')) {
        systemPrompt = CREATOR_PROMPTS.THUMBNAIL_CRITIQUE;
      } else if (
        category === 'Scripts' || 
        lowerType.startsWith('text/') || 
        lowerName.endsWith('.txt') || 
        lowerName.endsWith('.md') || 
        lowerName.endsWith('.pdf')
      ) {
        systemPrompt = CREATOR_PROMPTS.SCRIPT_ANALYZER;
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `${systemPrompt}\n\nIMPORTANT: You must return a JSON object matching this structure:\n{\n  "summary": "Short paragraph summary of key insights",\n  "outline": ["Point 1", "Point 2", "Point 3", ...],\n  "suggestedTitles": ["Title 1", "Title 2", "Title 3"],\n  "ctrInsights": "Specific recommendation to improve click-through-rate"\n}`
            },
            {
              role: 'user',
              content: `Analyze this asset: "${fileName}" (Type: ${fileType}, Category: ${category}). Remote URL (if vision critique needed): ${fileUrl}`
            }
          ]
        })
      });

      if (!response.ok) throw new Error(`OpenAI API call failed with status ${response.status}`);
      const data = await response.json();
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from OpenAI');

      // Safe JSON parse
      const parsed = JSON.parse(content);
      
      return {
        summary: parsed.summary || 'No summary generated.',
        outline: Array.isArray(parsed.outline) ? parsed.outline : [],
        suggestedTitles: Array.isArray(parsed.suggestedTitles) ? parsed.suggestedTitles : [],
        ctrInsights: parsed.ctrInsights || 'No visual CTR insights provided.'
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getSimulatedResponse(fileName, fileType, category);
    }
  }

  /**
   * Helper that yields structured simulated responses based on the category/type
   * to provide a fully interactive experience prior to adding OpenAI billing keys.
   */
  private static getSimulatedResponse(
    fileName: string,
    fileType: string,
    category: string
  ): AIServiceResponse {
    const defaultOutline = [
      "Hook (0:00 - 0:30): Retain audience attention with high-contrast visuals.",
      "Body Segment 1 (0:30 - 3:00): Core value proposition / problem explanation.",
      "Body Segment 2 (3:00 - 7:00): Step-by-step breakdown & screenshot proofs.",
      "Conclusion & Outro (7:00 - 8:30): Drive traffic to companion reference videos."
    ];

    if (category === 'Thumbnail References' || fileType.startsWith('image/')) {
      return {
        summary: `Visual analysis of "${fileName}". The thumbnail layout utilizes premium glassmorphic cards and a vibrant color palette, focusing on centered subject placement. Visual weight is balanced, optimizing potential CTR.`,
        outline: [
          "Focal Point: Clear, high-contrast human subject placed on the right third.",
          "Typography: Bold, sans-serif title text highlighted in electric purple.",
          "Background: Dark luxury theme with neon ambient glow to enhance depth.",
          "Visual Hierarchy: Image element takes 60% weight, typography takes 40%."
        ],
        suggestedTitles: [
          "I Built the Ultimate Creator Vault (And How it Doubled My CTR)",
          "Why 99% of Content Creators Fail to Organize Their Assets",
          "Inside My $10,000/Month Second Brain Dashboard"
        ],
        ctrInsights: "Increase visual contrast of text borders by 15% to improve mobile readability."
      };
    }

    if (category === 'Scripts' || fileType.startsWith('text/') || fileType === 'application/pdf') {
      return {
        summary: `Script outline and hook analysis for "${fileName}". The narrative arc is engaging, establishing immediate stakes within the first 10 seconds. Audience retention optimization is high.`,
        outline: [
          "0:00-0:15 - Hook: The Shocking Truth (Show visual proof of a disorganized creator dashboard).",
          "0:15-1:30 - Core Conflict: Why creators lose hours digging for brand assets and PDF scripts.",
          "1:30-4:30 - The Solution: Step-by-step walk-through of a custom Next.js database.",
          "4:30-6:00 - Call To Action: Download the open-source templates."
        ],
        suggestedTitles: [
          "How to Stop Wasting Hours Organizing Brand Assets",
          "My Automations for Content Creators: Complete Workflow",
          "Why Every Video Editor Needs a Second Brain"
        ],
        ctrInsights: "Consider starting the script directly on the conflict rather than an introductory greeting."
      };
    }

    // Default Fallback
    return {
      summary: `Automated summary of "${fileName}" (${category}). Successfully cataloged in your CreatorVault. Ready for content drafting and brand outreach.`,
      outline: defaultOutline,
      suggestedTitles: [
        `Ultimate Guide: ${fileName.split('.')[0]}`,
        `How I Organized My ${category}`,
        `Why This ${category} Changed Everything`
      ],
      ctrInsights: "Add metadata tags matching your niche keywords to boost organic search indexing."
    };
  }
}
