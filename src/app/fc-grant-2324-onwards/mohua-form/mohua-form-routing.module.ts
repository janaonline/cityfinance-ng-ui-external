import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Mohua2223Guard } from 'src/app/shared2223/common-gaurds/mohua/mohua2223.guard';
import { MohuaFormComponent } from './mohua-form.component';
import { ReviewUlbTableComponent } from './review-ulb-table/review-ulb-table.component';
import { ReviewStateFormComponent } from './review-state-form/review-state-form.component';
import { StateResourceManagerComponent } from './state-resource-manager/state-resource-manager.component';
import { UrbanReformsIvComponent } from './urban-reforms-iv/urban-reforms-iv.component';
import { DocumentsComponent } from './urban-reforms-iv/documents/documents.component';

const routes: Routes = [
  {
    path: ":yearId",
    component: MohuaFormComponent,
    canActivate: [Mohua2223Guard],
    children: [
      // {
      //   path: "dashboard",
      //   component: DashbordComponent,
      // },
      {
        path: "review-ulb-form",
        component: ReviewUlbTableComponent,
      },
      {
        path: "review-state-form",
        component: ReviewStateFormComponent,
      },
      {
        path: 'state-resource-manager',
        component: StateResourceManagerComponent,
      }, 
      {
        path: 'urban-reforms-iv',
        component: UrbanReformsIvComponent,
      }, 
      {
        path: 'urban-reforms-iv/:stateId',
        component: DocumentsComponent,
      }, 
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MohuaFormRoutingModule { }
