import { GeneratedStep } from './generated-step.type';

const MIN_STEPS = 6;
const MAX_STEPS = 12;

export function validateGeneratedSteps(raw: unknown): GeneratedStep[] {
  if (!Array.isArray(raw)) {
    throw new Error('AI_OUTPUT_INVALID: steps is not an array');
  }

  if (raw.length < MIN_STEPS || raw.length > MAX_STEPS) {
    throw new Error(
      `AI_OUTPUT_INVALID: step count must be between ${MIN_STEPS} and ${MAX_STEPS}`,
    );
  }

  const steps: GeneratedStep[] = [];

  for (let i = 0; i < raw.length; i++) {
    const step = raw[i];

    // Order validation
    if (typeof step.order !== 'number' || step.order !== i + 1) {
      throw new Error(
        `AI_OUTPUT_INVALID: step.order must be sequential starting at 1 (error at index ${i})`,
      );
    }

    // Title validation
    if (
      typeof step.title !== 'string' ||
      step.title.trim().length < 3 ||
      step.title.trim().length > 80
    ) {
      throw new Error(
        `AI_OUTPUT_INVALID: step.title must be 3–80 characters (error at step ${i + 1})`,
      );
    }

    // Description validation
    if (
      typeof step.description !== 'string' ||
      step.description.trim().length < 20 ||
      step.description.trim().length > 500
    ) {
      throw new Error(
        `AI_OUTPUT_INVALID: step.description must be 20–500 characters (error at step ${i + 1})`,
      );
    }

    // Optional safety warning validation
    if (
      step.safetyWarning !== undefined &&
      (typeof step.safetyWarning !== 'string' ||
        step.safetyWarning.trim().length > 160)
    ) {
      throw new Error(
        `AI_OUTPUT_INVALID: step.safetyWarning must be <= 160 characters (error at step ${i + 1})`,
      );
    }

    steps.push({
      order: step.order,
      title: step.title.trim(),
      description: step.description.trim(),
      safetyWarning: step.safetyWarning?.trim(),
    });
  }

  return steps;
}
