
'use server';

/**
 * @fileOverview Analyzes an interview answer and provides feedback.
 *
 * - analyzeInterviewAnswer - A function that analyzes the answer and returns feedback.
 * - AnalyzeInterviewAnswerInput - The input type for the analyzeInterviewAnswer function.
 * - AnalyzeInterviewAnswerOutput - The return type for the analyzeInterviewAnswer function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeInterviewAnswerInputSchema = z.object({
  question: z.string().describe('The interview question that was asked.'),
  answer: z.string().describe("The user's answer to the question."),
});
export type AnalyzeInterviewAnswerInput = z.infer<typeof AnalyzeInterviewAnswerInputSchema>;

const AnalyzeInterviewAnswerOutputSchema = z.object({
  analysis: z.object({
    clarity: z.string().describe("Analysis of the clarity of the candidate's answer."),
    content: z.string().describe("Analysis of the content and correctness of the candidate's answer."),
  }),
  score: z.number().describe('Overall score evaluating relevance, correctness, fluency and confidence.'),
  improvementTips: z.string().describe('Tips for improvement based on the interview simulation.'),
});
export type AnalyzeInterviewAnswerOutput = z.infer<typeof AnalyzeInterviewAnswerOutputSchema>;

export async function analyzeInterviewAnswer(
  input: AnalyzeInterviewAnswerInput
): Promise<AnalyzeInterviewAnswerOutput> {
  return analyzeInterviewAnswerFlow(input);
}

const analyzeAnswerPrompt = ai.definePrompt({
  name: 'analyzeInterviewAnswerPrompt',
  input: { schema: AnalyzeInterviewAnswerInputSchema },
  output: { schema: AnalyzeInterviewAnswerOutputSchema },
  prompt: `You are an expert interviewer. Analyze the candidate's answer based on the question asked.

Question: {{{question}}}
Candidate's Answer: {{{answer}}}

Provide the following feedback:
1.  **Clarity**: Was the answer well-structured and easy to follow?
2.  **Content**: Provide a clear and optimized analysis of the answer's relevance and accuracy.
3.  **Score**: Provide an overall score from 0-100 based on clarity, content, relevance, and confidence.
4.  **Improvement Tips**: Offer specific, actionable, and optimized advice for how the candidate could improve their answer.
`,
});

const analyzeInterviewAnswerFlow = ai.defineFlow(
  {
    name: 'analyzeInterviewAnswerFlow',
    inputSchema: AnalyzeInterviewAnswerInputSchema,
    outputSchema: AnalyzeInterviewAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeAnswerPrompt(input);
    return output!;
  }
);
