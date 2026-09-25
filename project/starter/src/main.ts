import * as dotenv from 'dotenv';
import { CodeReviewOrchestrator } from './orchestrator';
import { ReportGenerator } from './utils/report-generator';
import { mkdir, writeFile } from 'fs/promises';

// Load environment variables
dotenv.config();

async function main() {
  const [owner, repo, prStr] = process.argv.slice(2);

  // Validate command line arguments
  if (!owner || !repo || !prStr) {
    console.error('Usage: npm run dev <owner> <repo> <pr-number>');
    process.exit(1);
  }

  const prNumber = Number(prStr);

  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    console.error('Error: pr-number must be a positive integer.');
    process.exit(1);
  }

  // Validate authentication
  const hasAnthropicApiKey = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasAwsCredentials =
    Boolean(process.env.AWS_ACCESS_KEY_ID) &&
    Boolean(process.env.AWS_SECRET_ACCESS_KEY);

  if (!hasAnthropicApiKey && !hasAwsCredentials) {
    console.error(
      'Error: Configure either ANTHROPIC_API_KEY or AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY.'
    );
    process.exit(1);
  }

  if (hasAwsCredentials && !hasAnthropicApiKey) {
    if (!process.env.AWS_REGION) {
      console.error('Error: AWS_REGION is required when using AWS Bedrock.');
      process.exit(1);
    }
    console.log('🔐 Using AWS Bedrock authentication');
  } else {
    console.log('🔐 Using Anthropic API authentication');
  }

  // Validate model
  const model = process.env.ANTHROPIC_MODEL;

  if (!model) {
    console.error('Error: ANTHROPIC_MODEL is required.');
    process.exit(1);
  }

  try {
    const orchestrator = new CodeReviewOrchestrator({ model });

    console.log(`Reviewing ${owner}/${repo}#${prNumber}...`);

    const report = await orchestrator.reviewPullRequest(
      owner,
      repo,
      prNumber
    );

    console.log(
      `Review complete: ${report.summary.totalFiles} file(s) analyzed.`
    );

    const reportGenerator = new ReportGenerator();
    const outputDir = 'reports';

    await mkdir(outputDir, { recursive: true });

    await writeFile(
      `${outputDir}/review-${owner}-${repo}-${prNumber}.md`,
      reportGenerator.generateMarkdownReport(report),
      'utf8'
    );

    await writeFile(
      `${outputDir}/review-${owner}-${repo}-${prNumber}.html`,
      reportGenerator.generateHTMLReport(report),
      'utf8'
    );

    await writeFile(
      `${outputDir}/review-${owner}-${repo}-${prNumber}.json`,
      reportGenerator.generateJSONReport(report),
      'utf8'
    );

    console.log(`Reports written to ${outputDir}/`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
