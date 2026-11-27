import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthenticationService } from './shared/services/authentication.service';

export const authGuard: CanActivateFn = async () => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (authenticationService.isUserLoggedIn) {
    return true;
  }

  await authenticationService.checkLogin();

  if (authenticationService.isUserLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/']);
};
