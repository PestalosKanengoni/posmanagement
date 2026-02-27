import { Routes } from "@angular/router";
import { AnalystComponent } from "./analyst.component";


export const analystRoutes: Routes = [
  {
    path: "",
    component: AnalystComponent,
    children: [
      { path: "", redirectTo: "configure", pathMatch: "full" },
      {
        path: "configure",
        loadComponent: () => import("./pages/configure/analyst-configure.component").then(m => m.AnalystConfigureComponent)
      },
      {
        path: "machines",
        loadComponent: () => import("./pages/machines/analyst-machines.component").then(m => m.AnalystMachinesComponent)
      }
    ]
  }
];