import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom decorator to extract the current user from the JWT payload
 * Usage: @GetCurrentUser() user: { sub: number; email: string }
 */
export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (data) {
      return request.user[data]; // Return specific property if data is provided
    }
    return request.user; // Return entire user object
  },
);
// 'sub' is the standard JWT claim for user ID
// 'email' is a custom claim we added to the JWT payload