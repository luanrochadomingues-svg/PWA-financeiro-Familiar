'use server';
/**
 * @fileOverview A Genkit flow for suggesting financial categories based on transaction descriptions.
 *
 * - suggestCategory - A function that handles the category suggestion process.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCategoryInputSchema = z.object({
  description: z.string().describe('The description of the financial transaction.'),
  availableCategories: z.array(z.string()).describe('A list of available categories to choose from.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  suggestedCategory: z.string().describe('The most relevant category for the transaction, chosen from the provided list.'),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

export async function suggestCategory(input: SuggestCategoryInput): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: {schema: SuggestCategoryInputSchema},
  output: {schema: SuggestCategoryOutputSchema},
  prompt: `You are an AI assistant specialized in categorizing financial transactions.
Based on the following transaction description, select the most appropriate category from the provided list.
You must choose one category exactly as it appears in the list.

Transaction Description: {{{description}}}

Available Categories:
{{#each availableCategories}}- {{{this}}}
{{/each}}

Please provide only the suggested category as a JSON object matching the output schema.`,
});

const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
