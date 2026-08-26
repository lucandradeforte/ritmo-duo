import type { UserId, WorkoutCode, WorkoutPlan, WorkoutTemplate } from '@/types';
import { geovannaWorkoutPlan } from './geovanna';
import { lucasWorkoutPlan } from './lucas';

export { geovannaWorkoutPlan, lucasWorkoutPlan };

export const workoutPlans: readonly WorkoutPlan[] = [lucasWorkoutPlan, geovannaWorkoutPlan];

export const workoutPlansByUserId: Readonly<Record<UserId, WorkoutPlan>> = {
  lucas: lucasWorkoutPlan,
  geovanna: geovannaWorkoutPlan,
};

export const getWorkoutPlan = (userId: UserId): WorkoutPlan => workoutPlansByUserId[userId];

export const getWorkoutTemplate = (
  userId: UserId,
  workoutCode: WorkoutCode,
): WorkoutTemplate | undefined =>
  workoutPlansByUserId[userId].templates.find((template) => template.code === workoutCode);

export const getWorkoutTemplateById = (templateId: string): WorkoutTemplate | undefined =>
  workoutPlans.flatMap((plan) => plan.templates).find((template) => template.id === templateId);
