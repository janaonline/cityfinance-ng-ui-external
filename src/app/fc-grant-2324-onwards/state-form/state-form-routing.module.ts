import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { State2223Guard } from 'src/app/shared2223/common-gaurds/state/state2223.guard';
import { DashbordComponent } from './dashbord/dashbord.component';
import { GtcComponent } from './gtc/gtc.component';
import { ReviewUlbTableComponent } from './review-ulb-table/review-ulb-table.component';
import { StateFormComponent } from './state-form.component';
import { ProjectsWssComponent } from './projects-wss/projects-wss.component';
import { ProjectsWaterRejComponent } from './projects-water-rej/projects-water-rej.component';
import { ActionPlanSliComponent } from './action-plan-sli/action-plan-sli.component';
import { StateFinanceCnComponent } from './state-finance-cn/state-finance-cn.component';
import { SubmitClaimsGrantsComponent } from './submit-claims-grants/submit-claims-grants.component';
import { EditUlbComponent } from './edit-ulb-table/edit-ulb.component';
import { IndicatorsWssComponent } from './indicators-wss/indicators-wss.component';
import { GrantAllocationUlbsComponent } from './grant-allocation-ulbs/grant-allocation-ulbs.component';
import { ConfirmationGuard } from '../guards/confirmation.guard';
import { PropertyTaxFloorRateComponent } from './property-tax-floor-rate/property-tax-floor-rate.component';
import { StateResourceManagerComponent } from '../mohua-form/state-resource-manager/state-resource-manager.component';
import { StateResourcesComponent } from './state-resources/state-resources.component';

const routes: Routes = [
  {
    path: ":yearId",
    component: StateFormComponent,
   canActivate: [State2223Guard],
    children: [
      {
        path: "dashboard",
        component: DashbordComponent,
      },
      {
        path: "review-ulb-form",
        component: ReviewUlbTableComponent,
      },
      {
        path: "gtCertificate",
        component: GtcComponent,
        canDeactivate: [ConfirmationGuard],
      },
      {
        path: "water-rejenuvation-new",
        component: ProjectsWssComponent,
      },
      {
        path: "action-plan",
        component: ActionPlanSliComponent,
        // canDeactivate: [ConfirmationGuard],
      },
      {
        path: "fc-formation",
        component: StateFinanceCnComponent,
      },
      {
        path: "grant-claims",
        component: SubmitClaimsGrantsComponent,
      },
      {
        path: "edit-ulb-profile",
        component: EditUlbComponent,
      },
      {
        path: "water-supply",
        component: IndicatorsWssComponent,
      },
      {
        path: "grant-allocation",
        component: GrantAllocationUlbsComponent,
      },
      {
        path: "water-rejenuvation",
        component: ProjectsWaterRejComponent,
       // canDeactivate: [ConfirmationGuard],
      },
      {
        path: "property-tax",
        component: PropertyTaxFloorRateComponent,
      },
      {
        path: "state-resources",
        component: StateResourcesComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StateFormRoutingModule { }
