import { AgentDefinition } from '@anthropic-ai/claude-agent-sdk';

export const codeQualityAnalyzer: AgentDefinition = {
  description: 'Analyzes code quality, style, and potential issues.',
  prompt: `Analyze the provided code for quality, style, maintainability, and potential problems.
Use the available ESLint MCP tools when appropriate.
Return clear, actionable findings.`,
  tools: ['mcp__eslint__lint', 'Skill'],
  model: 'inherit',
};
