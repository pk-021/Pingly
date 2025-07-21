'use server';
/**
 * @fileOverview Resolves schedule conflicts by identifying overlapping tasks,
 * prioritizing entries from the official calendar.
 *
 * - resolveScheduleConflicts - A function that resolves schedule conflicts.
 * - ResolveScheduleConflictsInput - The input type for the resolveScheduleConflicts function.
 * - ResolveScheduleConflictsOutput - The return type for the resolveScheduleConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalendarEntrySchema = z.object({
  title: z.string().describe('The title of the calendar event.'),
  startTime: z.string().describe('The start time of the event (ISO format).'),
  endTime: z.string().describe('The end time of the event (ISO format).'),
  isOfficial: z.boolean().describe('Whether this entry is from the official calendar.'),
});

const ResolveScheduleConflictsInputSchema = z.object({
  tasks: z.array(CalendarEntrySchema).describe('A list of calendar tasks to check for overlaps.'),
});
export type ResolveScheduleConflictsInput = z.infer<typeof ResolveScheduleConflictsInputSchema>;

const ConflictSchema = z.object({
  task1: z.string().describe('Title of the first conflicting task.'),
  task2: z.string().describe('Title of the second conflicting task.'),
  startTime: z.string().describe('The start time of the conflict (ISO format).'),
  endTime: z.string().describe('The end time of the conflict (ISO format).'),
  resolutionRecommendation: z.string().describe('Recommendation on how to resolve the conflict, prioritizing official calendar entries.'),
});

const ResolveScheduleConflictsOutputSchema = z.object({
  conflicts: z.array(ConflictSchema).describe('A list of schedule conflicts.'),
});
export type ResolveScheduleConflictsOutput = z.infer<typeof ResolveScheduleConflictsOutputSchema>;

export async function resolveScheduleConflicts(input: ResolveScheduleConflictsInput): Promise<ResolveScheduleConflictsOutput> {
  return resolveScheduleConflictsFlow(input);
}

const resolveScheduleConflictsPrompt = ai.definePrompt({
  name: 'resolveScheduleConflictsPrompt',
  input: {schema: ResolveScheduleConflictsInputSchema},
  output: {schema: ResolveScheduleConflictsOutputSchema},
  prompt: `You are a schedule conflict resolver.  Given a list of tasks with start and end times, identify any overlaps.  Prioritize entries from the official calendar when recommending resolutions.

Tasks:
{{#each tasks}}
- Title: {{title}}, Start: {{startTime}}, End: {{endTime}}, Official: {{#if isOfficial}}Yes{{else}}No{{/if}}
{{/each}}

Output the conflicts in JSON format. For each conflict, include a resolutionRecommendation that prioritizes official calendar entries. If a conflict occurs between an official calendar entry and a non-official entry, recommend rescheduling the non-official entry.
`,
});

const resolveScheduleConflictsFlow = ai.defineFlow(
  {
    name: 'resolveScheduleConflictsFlow',
    inputSchema: ResolveScheduleConflictsInputSchema,
    outputSchema: ResolveScheduleConflictsOutputSchema,
  },
  async input => {
    const {output} = await resolveScheduleConflictsPrompt(input);
    return output!;
  }
);
