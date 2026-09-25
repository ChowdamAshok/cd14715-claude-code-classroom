import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

export const refactoringSuggester: AgentDefinition = {
  description: 'Identifies practical refactoring opportunities and suggests improvements.',
  prompt: `Review the code for practical refactoring opportunities.

Focus on:
- Duplicated code
- Overly complex logic
- Difficult-to-maintain code
- Poor separation of responsibilities
- Opportunities to improve readability and structure

Suggest practical refactorings while preserving existing behavior.
Explain the benefit and potential impact of each recommendation.`,
  model: 'inherit',
};
