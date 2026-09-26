import { query } from '@anthropic-ai/claude-agent-sdk';
import { ReviewReport, ReviewReportJSONSchema } from './types/report-types';
import { mcpServersConfig } from './config/mcp.config';
import { withRetry, withTimeout } from './utils/error-handler';
import { ORCHESTRATOR_PROMPT } from './prompts/orchestrator.prompt';
import {
  codeQualityAnalyzer,
  testCoverageAnalyzer,
  refactoringSuggester,
} from './agents';

export interface OrchestratorOptions {
  model?: string;
}

export class CodeReviewOrchestrator {
  private readonly model: string;

  constructor(options: OrchestratorOptions = {}) {
    this.model = options.model || process.env.ANTHROPIC_MODEL || 'sonnet';
  }

  async reviewPullRequest(
    owner: string,
    repo: string,
    prNumber: number
  ): Promise<ReviewReport> {
    const prompt = `${ORCHESTRATOR_PROMPT}

Repository: ${owner}/${repo}
Pull Request: #${prNumber}
`;

    return withTimeout(
      () =>
        withRetry(
          async () => {
            const result = query({
              prompt,
              options: {
                allowedTools: ['Task'],
                model: this.model,
                mcpServers: mcpServersConfig,
                agents: {
                  codeQualityAnalyzer,
                  testCoverageAnalyzer,
                  refactoringSuggester,
                },
                outputFormat: {
                  type: 'json_schema',
                  schema: ReviewReportJSONSchema,
                },
              },
            });

            for await (const message of result) {
              if (message.type === 'result' && message.subtype === 'success') {
                return message.structured_output as ReviewReport;
              }
            }

            throw new Error(
              'Code review did not produce a structured report.'
            );
          },
          3,
          2000
        ),
      300_000,
      'Code review timed out after 5 minutes'
    );
  }
}
