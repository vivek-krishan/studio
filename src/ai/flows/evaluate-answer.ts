'use server';

/**
 * @fileOverview AI-powered answer evaluation flow.
 *
 * - evaluateAnswer - A function that evaluates a student's answer based on keywords.
 * - EvaluateAnswerInput - The input type for the evaluateAnswer function.
 * - EvaluateAnswerOutput - The return type for the evaluateAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EvaluateAnswerInputSchema = z.object({
  question: z.string().describe('The question being asked.'),
  studentAnswer: z.string().describe('The student\u2019s answer.'),
  keywords: z.string().describe('Keywords that should be present in the answer.'),
});
export type EvaluateAnswerInput = z.infer<typeof EvaluateAnswerInputSchema>;

const EvaluateAnswerOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the answer is correct based on the keywords.'),
  feedback: z.string().describe('Feedback for the student regarding their answer.'),
});
export type EvaluateAnswerOutput = z.infer<typeof EvaluateAnswerOutputSchema>;

export async function evaluateAnswer(input: EvaluateAnswerInput): Promise<EvaluateAnswerOutput> {
  return evaluateAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'evaluateAnswerPrompt',
  input: {schema: EvaluateAnswerInputSchema},
  output: {schema: EvaluateAnswerOutputSchema},
  prompt: `You are an expert teacher, adept at evaluating student answers. A student has provided an answer to a question, and your task is to assess the answer's correctness based on predefined keywords.  Provide feedback to the student.

Question: {{{question}}}
Student's Answer: {{{studentAnswer}}}
Keywords: {{{keywords}}}

Determine if the student's answer is correct based on the presence of the keywords. Provide a boolean value for isCorrect. Provide constructive feedback to the student, explaining why their answer was correct or incorrect, in the feedback field.
`,
});

const evaluateAnswerFlow = ai.defineFlow(
  {
    name: 'evaluateAnswerFlow',
    inputSchema: EvaluateAnswerInputSchema,
    outputSchema: EvaluateAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
