import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { GeneratedStep } from './types/generated-step.type';
import { validateGeneratedSteps } from './types/generated-steps.validator';
import { error } from 'console';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSteps(
    title: string,
    vehicleType?: string,
  ): Promise<GeneratedStep[]> {
    try {
      const prompt = this.buildPrompt(title, vehicleType);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo-0125',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are a technical assistant that generates step-by-step maintenance instructions.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'generate_steps',
              description: 'Generate ordered maintenance steps for a task.',
              parameters: {
                type: 'object',
                properties: {
                  steps: {
                    type: 'array',
                    minItems: 6,
                    maxItems: 12,
                    items: {
                      type: 'object',
                      properties: {
                        order: { type: 'number' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        safetyWarning: { type: 'string' },
                      },
                      required: ['order', 'title', 'description'],
                    },
                  },
                },
                required: ['steps'],
              },
            },
          },
        ],
        tool_choice: {
          type: 'function',
          function: { name: 'generate_steps' },
        },
      });

      const toolCall = response.choices[0]?.message?.tool_calls?.[0];

      // Narrow the union type returned by the SDK before accessing `function.arguments`
      if (
        !toolCall ||
        toolCall.type !== 'function' ||
        !('function' in toolCall)
      ) {
        throw new Error('AI did not return a function tool call');
      }

      const argsJson = toolCall.function?.arguments;
      if (!argsJson) {
        throw new Error('AI did not return tool arguments');
      }

      const parsed = JSON.parse(argsJson) as { steps: unknown };

      // 🔐 Validate AI output strictly
      return validateGeneratedSteps(parsed.steps);
    } catch (err) {
      // Important: never leak raw AI errors upward
      console.error('AI step generation error:', err);
      throw new BadGatewayException('AI step generation failed');
    }
  }

  private buildPrompt(title: string, vehicleType?: string): string {
    return `
Generate clear, safe, step-by-step maintenance instructions.

Task:
- Title: "${title}"
- Vehicle type: "${vehicleType ?? 'not specified'}"

Rules:
- Return 6 to 12 steps
- Each step must be concise and practical
- Include safety warnings where relevant
- Do not include extra commentary
- Steps must be ordered starting from 1
`;
  }
}
