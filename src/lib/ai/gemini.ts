import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';

// Initialize the Google Generative AI SDK
// Uses GEMINI_API_KEY from environment
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

// Define the structured schema for the Case Study
const caseStudySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: 'The overall title of the case study project.' },
    subtitle: { type: Type.STRING, description: 'A brief subtitle or tagline.' },
    description: { type: Type.STRING, description: 'A short overview description of the project.' },
    theme: {
      type: Type.OBJECT,
      description: 'The visual theme extracted from the design of the PDF document.',
      properties: {
        background: { type: Type.STRING, description: 'Main background color (e.g., #000000 or #FFFFFF)' },
        surface: { type: Type.STRING, description: 'Surface or card background color' },
        text: { type: Type.STRING, description: 'Primary text color' },
        mutedText: { type: Type.STRING, description: 'Secondary or muted text color' },
        accent: { type: Type.STRING, description: 'Primary accent or brand color' },
        border: { type: Type.STRING, description: 'Border color' }
      },
      required: ['background', 'surface', 'text', 'mutedText', 'accent', 'border']
    },
    typography: {
      type: Type.OBJECT,
      description: 'Typography intent extracted from the design of the PDF document.',
      properties: {
        headingStyle: { type: Type.STRING, description: 'Description of heading style (e.g., "Bold Sans-serif", "Elegant Serif")' },
        bodyStyle: { type: Type.STRING, description: 'Description of body text style' },
        hierarchy: { type: Type.STRING, description: 'Notes on typographical hierarchy' }
      },
      required: ['headingStyle', 'bodyStyle', 'hierarchy']
    },
    hero: {
      type: Type.OBJECT,
      description: 'Hero section configuration.',
      properties: {
        layout: { type: Type.STRING, description: 'Layout type (e.g., "centered", "split", "image_background")' },
        title: { type: Type.STRING },
        description: { type: Type.STRING }
      },
      required: ['layout', 'title', 'description']
    },
    navigation: {
      type: Type.OBJECT,
      description: 'Table of contents or section navigation.',
      properties: {
        enabled: { type: Type.BOOLEAN },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              sectionId: { type: Type.STRING }
            },
            required: ['label', 'sectionId']
          }
        }
      },
      required: ['enabled', 'items']
    },
    sections: {
      type: Type.ARRAY,
      description: 'The main content sections of the case study.',
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'A unique URL-friendly ID for this section (e.g., "user-research")' },
          title: { type: Type.STRING, description: 'The title of the section as written in the PDF' },
          layout: { type: Type.STRING, description: 'The suggested web layout component (e.g., "logo_presentation", "typography_specimen", "color_palette", "iconography_grid", "component_gallery", "user_flow_sequence", "text_block", "two_column", "three_column", "image_grid", "full_width_image", "stats_row", "quote_block")' },
          sourcePage: { type: Type.INTEGER, description: 'The 1-indexed page number in the PDF where this section is visually represented. If there is no specific visual page, leave undefined.' },
          content: { type: Type.STRING, description: 'The textual content of the section, formatted in Markdown.' },
          visualNotes: {
            type: Type.OBJECT,
            properties: {
              alignment: { type: Type.STRING, description: 'Text alignment (left, center, right)' },
              emphasis: { type: Type.STRING, description: 'Visual emphasis notes (e.g., "Dark background section")' },
              spacing: { type: Type.STRING, description: 'Spacing notes (e.g., "Compact", "Generous")' }
            },
            required: ['alignment', 'emphasis', 'spacing']
          }
        },
        required: ['id', 'title', 'layout', 'content', 'visualNotes']
      }
    }
  },
  required: ['title', 'subtitle', 'description', 'theme', 'typography', 'hero', 'navigation', 'sections']
};

const geminiResponseSchema = z.object({
  title: z.string().default('Untitled Case Study'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  theme: z.object({
    background: z.string().optional(),
    surface: z.string().optional(),
    text: z.string().optional(),
    mutedText: z.string().optional(),
    accent: z.string().optional(),
    border: z.string().optional(),
  }).optional(),
  typography: z.object({
    headingStyle: z.string().optional(),
    bodyStyle: z.string().optional(),
    hierarchy: z.string().optional(),
  }).optional(),
  hero: z.object({
    layout: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
  }).optional(),
  navigation: z.object({
    enabled: z.boolean().default(false),
    items: z.array(z.object({
      label: z.string(),
      sectionId: z.string(),
    })).default([]),
  }).optional(),
  sections: z.array(z.object({
    id: z.string(),
    title: z.string(),
    layout: z.string().optional(),
    sourcePage: z.number().int().optional(),
    content: z.string().optional(),
    visualNotes: z.object({
      alignment: z.string().optional(),
      emphasis: z.string().optional(),
      spacing: z.string().optional(),
    }).optional(),
  })).default([]),
});

export type CaseStudyAnalysis = z.infer<typeof geminiResponseSchema>;

const VALID_LAYOUTS = new Set([
  'logo_presentation', 'typography_specimen', 'color_palette', 'iconography_grid', 'component_gallery', 'user_flow_sequence',
  'text_block', 'two_column', 'three_column', 
  'image_grid', 'full_width_image', 'stats_row', 'quote_block'
]);

/**
 * Safely extracts a JSON object from a string that might contain
 * markdown code blocks or conversational padding from an LLM.
 */
function extractJSON(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start === -1 || end === -1 || start > end) {
    throw new Error('No JSON object found in the Gemini response.');
  }
  
  const jsonString = text.substring(start, end + 1);
  return JSON.parse(jsonString);
}

export async function analyzeCaseStudyPdf(pdfBuffer: Buffer, mimeType: string = 'application/pdf') {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set.');
  }

  const prompt = `
You are an expert UI/UX Designer and Web Developer.
I am providing you with a PDF document which is a design portfolio Case Study.
Your job is to analyze BOTH the textual content AND the visual design of this PDF, and convert it into a structured JSON representation that can be used to render a highly polished, responsive web case study.

CRITICAL INSTRUCTIONS:
1. Extract the actual text content accurately. Do NOT invent or hallucinate information, metrics, or client names.
2. Analyze the visual design (colors, typography, layout) and map it to the requested JSON structure. Extract exact HEX codes for themes and exact typography descriptions where available.
3. For sections, choose an appropriate 'layout' value that best matches the PDF's visual representation of that section. 
   - New Visual Layouts: "logo_presentation", "typography_specimen", "color_palette", "iconography_grid", "component_gallery", "user_flow_sequence". 
   - Standard Layouts: "text_block", "two_column", "three_column", "image_grid", "full_width_image", "stats_row", "quote_block".
4. Determine the 'sourcePage' for each section. This is the 1-indexed page number of the PDF that visually showcases this section (e.g. if the user flow screens are on page 8, set sourcePage: 8). This is critical for visual rendering.
5. Preserve the actual section titles used in the PDF (e.g., if it says "Discovery Phase", do not rename it to "Research").
6. The 'content' field in each section should contain the text formatted as standard Markdown.
7. Make sure the navigation items correspond to the extracted section IDs.
  `;

  try {
    const response = await genAI.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: pdfBuffer.toString('base64'), mimeType } }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: caseStudySchema,
        temperature: 0.2, // Low temperature for more deterministic structural extraction
      }
    });

    const textResponse = response.text;
    if (!textResponse) {
        throw new Error('Gemini returned an empty response.');
    }
    
    let json: unknown;
    try {
      json = extractJSON(textResponse);
    } catch (parseError) {
      const msg = parseError instanceof Error ? parseError.message : 'Unknown error';
      console.error('Failed to parse Gemini text into JSON:', msg);
      console.debug('Raw Gemini output:', textResponse);
      throw new Error('Gemini returned an unparseable response.');
    }
    
    // Strict runtime validation
    const parsed = geminiResponseSchema.safeParse(json);
    if (!parsed.success) {
      console.error('Gemini generated invalid schema:', JSON.stringify(parsed.error.format(), null, 2));
      throw new Error('Gemini returned an invalid data structure that does not match our required schema.');
    }

    const data = parsed.data;

    // Fallback unsupported layouts
    data.sections = data.sections.map(section => {
      if (section.layout && !VALID_LAYOUTS.has(section.layout)) {
        console.warn(`Unsupported layout "${section.layout}" found in section "${section.title}". Falling back to text_block.`);
        section.layout = 'text_block';
      }
      return section;
    });

    return data;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    // Sanitize API errors so we don't leak keys
    console.error('Error in analyzeCaseStudyPdf:', errorMsg);
    
    // Pass the specific sanitized message up so the UI can display it
    const safeMessage = errorMsg || 'Failed to analyze PDF with Gemini.';
    throw new Error(safeMessage.includes('GEMINI_API_KEY') ? 'Server configuration error.' : safeMessage);
  }
}
