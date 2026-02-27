import { Routes } from "@angular/router";
import { ManagerComponent } from "./manager.component";

export const managerRoutes: Routes = [
  {
    path: "",
    component: ManagerComponent,
    children: [
      { path: "", redirectTo: "approvals", pathMatch: "full" },
      {
        path: "approvals",
        loadComponent: () => import("./pages/approvals/manager-approvals.component").then(m => m.ManagerApprovalsComponent)
      },
      {
        path: "all",
        loadComponent: () => import("./pages/all-requests/manager-all.component").then(m => m.ManagerAllComponent)
      }
    ]
  }
];
