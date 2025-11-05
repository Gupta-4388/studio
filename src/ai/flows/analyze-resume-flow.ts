'use server';

/**
 * @fileOverview Resume analysis flow.
 *
 * This flow analyzes a resume to identify skills, projects, and potential mistakes,
 * providing AI-driven insights to improve it and a summary of the user's skills.
 *
 * @remarks
 * - analyzeResume - The function to analyze the resume and provide insights.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const SkillSchema = z.object({
  name: z.string().describe('The name of the skill.'),
  category: z.string().describe('e.g., "Programming Language", "Framework", "Cloud", "Database"'),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).describe('The estimated proficiency based on the resume.')
});

const MarketSkillSchema = z.object({
  name: z.string().describe('The name of the in-demand market skill.'),
  inResume: z.boolean().describe('Whether this skill is present in the resume.'),
});


const AnalyzeResumeOutputSchema = z.object({
  skillSummary: z
    .string()
    .describe('A high-level summary of the skills identified in the resume.'),
  improvementInsights: z
    .array(z.string())
    .describe(
      'A short, optimized list of AI-driven insights to improve the resume, including identifying potential mistakes and missing skills.'
    ),
  extractedSkills: z.array(SkillSchema).describe("A detailed list of skills extracted from the resume, with proficiency and category."),
  marketSkillsComparison: z.array(MarketSkillSchema).describe("A comparison of the user's skills against the top 10 most in-demand market skills for their likely role.")
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert career coach and tech recruiter. Analyze the following resume.

Resume:
{{media url=resumeDataUri}}

1.  **Extract Skills**: Identify all technical skills. For each skill, determine its category (e.g., "Programming Language", "Framework", "Cloud", "Database") and estimate the user's proficiency level ('Beginner', 'Intermediate', 'Advanced', 'Expert') based on how it's mentioned (e.g., years of experience, project depth). Populate the 'extractedSkills' array.

2.  **Market Skill Comparison**: Based on the skills and experience in the resume, infer the user's likely job role (e.g., Frontend Developer, Data Scientist). Identify the top 10 most in-demand skills for that role in the current job market. For each of these top 10 skills, indicate if it's present in the user's resume. Populate the 'marketSkillsComparison' array.

3.  **Skill Summary**: Provide a brief, high-level summary of the user's key strengths and technical profile.

4.  **Improvement Insights**: Provide a short, optimized, and actionable list of bullet points for how to improve the resume. Focus on clarity, impact, and missing skills that are critical for their likely career path.
`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumePrompt(input);
    return output!;
  }
);
