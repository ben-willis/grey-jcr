import { SetMetadata } from '@nestjs/common';

/**
 * 
 * @param level The level required to access the endpoint (0 any user, 1 reps, 2 welfare, 3 officers, 4 exec, 5 admins)
 */
export const RequireLevel = (level: number) => SetMetadata('requiredLevel', level);