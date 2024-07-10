import { ModuleWithProviders, NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthModule } from "./auth/auth.module";
import { HomeComponent } from "./auth/home/home.component";
import { NewHomeComponent } from "./auth/new-home/new-home.component";
import { UlbNotRegisteredComponent } from "./auth/ulb-not-registered/ulb-not-registered.component";
import { ProfileUpdateComponent } from "./newPagesFc/profile-update/profile-update.component";
import { AboutIndicatorComponent } from "./shared/components/about-indicator/about-indicator.component";
import { CompareDialogComponent } from "./shared/components/compare-dialog/compare-dialog.component";
import { RevenuechartComponent } from "./shared/components/revenuechart/revenuechart.component";
import { WaterRejenuvationComponent } from "./shared/components/water-rejenuvation/water-rejenuvation.component";
import {ProTTaxFormComponent} from "./shared/components/pro-t-tax-form/pro-t-tax-form.component"
import { FiscalHomeComponent } from "./fiscal-ranking/fiscal-home/fiscal-home.component";
import { FiscalRankingModule } from "./fiscal-ranking/fiscal-ranking.module";
import { MunicipalityBondsProjectsComponent } from "./shared/components/municipality-bonds-projects/municipality-bonds-projects.component";
import { MunicipalityBudgetComponent } from "./shared/components/municipality-budget/municipality-budget.component";
export const appRouter: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: "home", component: NewHomeComponent },
  // { path: "oldhome", component: HomeComponent },
  // { path: "card", component: SharedCardComponent },
  // { path: "front", component: FrontPanelComponent },
  // { path: "tab", component: DashboardTabsComponent },
  // { path: "about", component: AboutIndicatorComponent },
  // { path: "filter", component: FilterDataComponent },
  { path: "revenuchart", component: RevenuechartComponent },
  { path: "compareDialog", component: CompareDialogComponent },
  { path: "prop-tax", component: ProTTaxFormComponent },
  {
    path: "dashboard",
    loadChildren: () =>
      import("./pages/new-dashbords/new-dashbords.module").then(
        (m) => m.NewDashbordsModule
      ),
  },
  {
    path: "analytics",
    loadChildren: () =>
      import("./pages/analytics/analytics.module").then(
        (m) => m.AnalyticsModule
      ),
  },
  {
    path: "rankings",
    loadChildren: () =>
      import("./fiscal-ranking/fiscal-ranking.module").then(
        (m) => m.FiscalRankingModule
      ),
  },
  {
    path: "fc_grant",
    loadChildren: () =>
      import("./pages/fc-grant/fc-grant.module").then((m) => m.FcGrantModule),
  },
  {
    path: "fc-home-page",
    loadChildren: () =>
      import("./pages/fc-grant-home/fc-grant-home.module").then(
        (m) => m.FcGrantHomeModule
      ),
  },
  {
    path: "ulbform",
    loadChildren: () =>
      import("./pages/ulbform/ulbform.module").then((m) => m.UlbformModule),
  },
  {
    path: "stateform",
    loadChildren: () =>
      import("./pages/stateforms/stateforms.module").then(
        (m) => m.StateformsModule
      ),
  },
  {
    path: "mohua",
    loadChildren: () =>
      import("./pages/mohuaform/mohuaform.module").then(
        (m) => m.MohuaformModule
      ),
  },

  {
    path: "questionnaires",
    loadChildren: () =>
      import("./pages/questionnaires/questionnaires.module").then(
        (m) => m.QuestionnairesModule
      ),
  },

  {
    path: "user",
    loadChildren: () =>
      import("./users/users.module").then((m) => m.UsersModule),
  },
  {
    path: "login",
    loadChildren: () =>
      import("./auth/login/login.module").then((m) => m.LoginModule),
  },
  {
    path: "login/xvi-fc",
    loadChildren: () =>
      import("./auth/login/login.module").then((m) => m.LoginModule),
  },
  {
    path: "register",
    loadChildren: () =>
      import("./auth/register/register.module").then((m) => m.RegisterModule),
  },
  {
    path: "password",
    loadChildren: () =>
      import("./auth/password/password.module").then((m) => m.PasswordModule),
  },
  {
    path: "account-reactivate",
    loadChildren: () =>
      import("./auth/account-reactivate/account-reactivate.module").then(
        (m) => m.AccountReactivateModule
      ),
  },
  {
    path: "borrowings",
    loadChildren: () =>
      import("./credit-rating/credit-rating.module").then(
        (m) => m.CreditRatingModule
      ),
  },

  {
    path: "municipal-law",
    loadChildren: () =>
      import("./municipal-law/municipal-law.module").then(
        (m) => m.MunicipalLawModule
      ),
  },

  {
    path: "financial-statement",
    loadChildren: () =>
      import("./dashboard/dashboard.module").then((m) => m.DashboardModule),
  },
  {
    path: "data-tracker",
    loadChildren: () =>
      import("./pages/data-tracker/data-tracker.module").then(
        (m) => m.DataTrackerModule
      ),
  },
  {
    path: "upload-annual-accounts",
    loadChildren: () =>
      import("./pages/annual-accounts/annual-accounts.module").then(
        (m) => m.AnnualAccountsModule
      ),
  },

  {
    path: "not-found",
    loadChildren: () =>
      import("./not-found/not-found.module").then((m) => m.NotFoundModule),
  },
  {
    path: "ulb-location-visualize",
    loadChildren: () =>
      import("./pages/ulbs-visualization/ulbs-visualization.module").then(
        (m) => m.UlbsVisualizationModule
      ),
  },
  {
    path: "ulb-not-registered",
    component: UlbNotRegisteredComponent,
  },
  // {
  //   path: "app-water-rejenuvation",
  //   component: WaterRejenuvationComponent,
  // },
  {
    path: "own-revenue-dashboard",
    loadChildren: () =>
      import("./pages/own-revenue-dashboard/own-revenue-dashboard.module").then(
        (m) => m.OwnRevenueDashboardModule
      ),
  },
  {
    path: "resources-dashboard",
    loadChildren: () =>
      import("./pages/resources-dashboard/resources-dashboard.module").then(
        (m) => m.ResourcesDashboardModule
      ),
  },
  {
    path: "ulbform2223",
    loadChildren: () =>
      import("./newPagesFc/xvfc2223-ulb/xvfc2223-ulb.module").then(
        (m) => m.Xvfc2223UlbModule
      ),
  },
  {
    path: "stateform2223",
    loadChildren: () =>
      import("./newPagesFc/xvfc2223-state/xvfc2223-state.module").then(
        (m) => m.Xvfc2223StateModule
      ),
  },
  {
    path: "mohua2223",
    loadChildren: () =>
      import("./newPagesFc/xvfc2223-mohua/xvfc2223-mohua.module").then(
        (m) => m.Xvfc2223MohuaModule
      ),
  },
  {
    path: "profile-update",
    component: ProfileUpdateComponent,
  },
  {
    path: "ulb-form",
    loadChildren: () =>
      import("./fc-grant-2324-onwards/ulb-form/ulb-form.module").then(
        (m) => m.UlbFormModule
      ),
  },
  {
    path: "state-form",
    loadChildren: () =>
      import("./fc-grant-2324-onwards/state-form/state-form.module").then(
        (m) => m.StateFormModule
      ),
  },
  {
    path: "mohua-form",
    loadChildren: () =>
      import("./fc-grant-2324-onwards/mohua-form/mohua-form.module").then(
        (m) => m.MohuaFormModule
      ),
  },
  {
    path: "municipal-bonds",
    component: MunicipalityBondsProjectsComponent,
  },
  {
    path: "municipal-budgets",
    component: MunicipalityBudgetComponent,
  },

  { path: "**", redirectTo: "home" },
];
@NgModule({
  imports: [RouterModule.forRoot(appRouter,{
    scrollPositionRestoration: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRouter { }
// export const AppRouter: ModuleWithProviders<RouterModule> =
//   RouterModule.forRoot(appRouter, { relativeLinkResolution: "legacy" });

