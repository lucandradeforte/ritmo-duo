import type { UserId, UserProfile } from '@/types';
import { geovanna } from './geovanna';
import { lucas } from './lucas';

export { geovanna, lucas };

export const users: readonly UserProfile[] = [lucas, geovanna];

export const usersById: Readonly<Record<UserId, UserProfile>> = {
  lucas,
  geovanna,
};
