import { Routes } from "@angular/router";
import { DashboardShellComponent } from "./dashboard-shell.component";

export const dashboardRoutes: Routes = [
  {
    path: "",
    component: DashboardShellComponent,
    children: [
      { path: "", redirectTo: "requests", pathMatch: "full" },
      {
        path: "requests",
        loadComponent: () => import("./components/requests/requests.component").then(m => m.RequestsComponent)
      },
      {
        path: "machines",
        loadComponent: () => import("./components/machines/machines.component").then(m => m.MachinesComponent)
      }
    ]
  }
];
