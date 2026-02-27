import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';


export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  const user = storageService.getUser();

  console.log("logged in user",user)
  if (!storageService.isLoggedIn()) {

    router.navigate(['/login'], { replaceUrl: true });
    return false;
  }
  return true;
};

// export const guestGuard: CanActivateFn = (route, state) => {
//   const storageService = inject(StorageService);
//   const router = inject(Router);
//   const user = storageService.getUser();

//    console.log("logged in user",user)
//   if (storageService.isLoggedIn()) {
//     router.navigate(['/merchant-overview'], { replaceUrl: true });
//     return false;
//   }

//   return true;
// };
