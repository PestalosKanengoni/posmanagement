import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { AppRole } from "../models/auth.model";

export function roleGuard(requiredRole: AppRole): CanActivateFn {
  return () => {
    const auth   = inject(AuthService);
    const router = inject(Router);
    if (!auth.isAuthenticated())      return router.createUrlTree(["/auth/login"]);
    if (!auth.hasRole(requiredRole))  return router.createUrlTree(["/auth/login"]);
    return true;
  };
}
