import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type { CommitService } from '../../application/services/commit-service';
import { Commit } from '../../domain/entities/commit';
import type { Logger } from '../logger/logger';

/**
 * MCP Server implementation for easy-commit
 * Uses the high-level McpServer class for easier tool registration
 */
export class EasyCommitMcpServer {
  private server: McpServer;

  constructor(
    private commitService: CommitService,
    private logger: Logger
  ) {
    this.server = new McpServer({
      name: 'easy-commit-mcp',
      version: '1.0.0',
    });

    this.setupTools();
  }

  /**
   * Start the MCP server using stdio transport
   */
  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.logger.debug('MCP Server started on stdio');
  }

  private setupTools(): void {
    // Tool: get_git_status
    this.server.tool(
      'get_git_status',
      'Get current git status and staged changes',
      {}, // No input arguments
      async () => {
        try {
          const hasStaged = await this.commitService.hasStagedChanges();
          const lastCommit = await this.commitService.getLastCommitMessage();

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    hasStagedChanges: hasStaged,
                    lastCommitMessage: lastCommit,
                    status: hasStaged ? 'Ready to commit' : 'No staged changes',
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Error checking status: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool: validate_commit
    this.server.tool(
      'validate_commit',
      'Validate a commit message without creating it',
      {
        type: z.string().describe('Commit type (feat, fix, docs, etc.)'),
        message: z.string().describe('Commit description (short summary)'),
        scope: z.string().optional().describe('Commit scope (optional)'),
        breaking: z.boolean().optional().describe('Is this a breaking change?'),
      },
      async ({ type, message, scope, breaking }) => {
        try {
          const commit = new Commit(type, message, scope, undefined, breaking);
          const result = await this.commitService.validateCommit(commit);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Validation error: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );

    // Tool: create_commit
    this.server.tool(
      'create_commit',
      'Create a new git commit',
      {
        type: z.string().describe('Commit type (feat, fix, docs, etc.)'),
        message: z.string().describe('Commit description (short summary)'),
        scope: z.string().optional().describe('Commit scope (optional)'),
        breaking: z.boolean().optional().describe('Is this a breaking change?'),
      },
      async ({ type, message, scope, breaking }) => {
        try {
          const commit = new Commit(type, message, scope, undefined, breaking);
          await this.commitService.createCommit(commit);

          return {
            content: [
              {
                type: 'text',
                text: `Commit created successfully: ${commit.format()}`,
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `Failed to create commit: ${error instanceof Error ? error.message : String(error)}`,
              },
            ],
            isError: true,
          };
        }
      }
    );
  }
}
