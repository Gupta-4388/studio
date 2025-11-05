
'use server';

/**
 * @fileOverview Provides job market trend data for visualization.
 *
 * - getJobTrends - A function that returns job market trends.
 * - GetJobTrendsOutput - The return type for the getJobTrends function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TrendDataSchema = z.object({
  month: z.string().describe('The month for the data point (e.g., "Jan").'),
  'Software Engineer': z.number().describe('The average salary for a Software Engineer.'),
  'Data Scientist': z.number().describe('The average salary for a Data Scientist.'),
  'Product Manager': z.number().describe('The average salary for a Product Manager.'),
});

const DemandDataSchema = z.object({
  role: z.string().describe('The job role.'),
  demand: z.number().describe('A score from 1-100 indicating current market demand.'),
});

const GetJobTrendsOutputSchema = z.object({
  salaryTrends: z
    .array(TrendDataSchema)
    .length(12)
    .describe('An array of salary data for the last 12 months.'),
  marketDemand: z
    .array(DemandDataSchema)
    .length(3)
    .describe('An array representing the current market demand for key roles.'),
});
export type GetJobTrendsOutput = z.infer<typeof GetJobTrendsOutputSchema>;

export async function getJobTrends(): Promise<GetJobTrendsOutput> {
  return getJobTrendsFlow();
}

const getJobTrendsPrompt = ai.definePrompt({
  name: 'getJobTrendsPrompt',
  output: { schema: GetJobTrendsOutputSchema },
  prompt: `You are a job market analyst. Generate realistic, but fictional, trend data for the last 12 months for the following roles: Software Engineer, Data Scientist, and Product Manager.

Provide the following:
1.  **Salary Trends**: Create a month-by-month breakdown of the average salary (in USD, without symbols, e.g., 120000) for each role. Start from 12 months ago and end with the current month. The months should be abbreviated (Jan, Feb, etc.). Show a believable progression, including slight dips and rises, reflecting market dynamics.
2.  **Market Demand**: Provide a current demand score (1-100) for each of the three roles. A higher score means more demand.

Make the data look authentic and reflective of a typical tech job market.`,
});

const getJobTrendsFlow = ai.defineFlow(
  {
    name: 'getJobTrendsFlow',
    outputSchema: GetJobTrendsOutputSchema,
  },
  async () => {
    const { output } = await getJobTrendsPrompt();
    return output!;
  }
);
