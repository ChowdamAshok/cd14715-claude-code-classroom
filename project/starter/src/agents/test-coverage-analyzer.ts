import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

export const testCoverageAnalyzer: AgentDefinition = {
  description: 'Analyzes test coverage and identifies missing test cases.',
  prompt: `Analyze the repository for test coverage.
Identify missing or insufficient tests and suggest specific test cases
that would improve coverage and reliability.
Return clear, actionable findings.`,
  tools: ['mcp__github__get_file_contents'],
  model: 'inherit',
};
