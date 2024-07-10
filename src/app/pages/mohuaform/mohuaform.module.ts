import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MohuaDashboardComponent } from './mohua-dashboard/mohua-dashboard.component';
import { MohuaformComponent } from './mohuaform.component';
import { MohuaformRoutingModule } from './mohuaform-routing.module'
import { FormsModule } from "@angular/forms";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "src/app/shared/shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { MatDialogModule } from '@angular/material/dialog'
import { PaginationModule } from "ngx-bootstrap/pagination";
import { NgxPaginationModule } from "ngx-pagination";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { AgGridModule } from 'ag-grid-angular';
import { AgGridComponent } from '../../shared/components/ag-grid/ag-grid.component'
import { CustomTooltipComponent } from '../../shared/components/ag-grid/custom-tooltip/custom-tooltip.component'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table'
import { MatPaginatorModule } from '@angular/material/paginator';
import { ReviewUlbComponent } from './review-ulb/review-ulb.component';
import { ReviewStateComponent } from './review-state/review-state.component';
import { GrantTransferMohuaComponent } from './grant-transfer-mohua/grant-transfer-mohua.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
// import { NgCircleProgressModule, CircleProgressOptions } from 'ng-circle-progress';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { GlobalPartModule } from 'src/app/global-part/global-part.module';

@NgModule({
  declarations: [
    MohuaDashboardComponent,
    MohuaformComponent,
    ReviewUlbComponent,
    ReviewStateComponent,
    // GrantTransferMohuaComponent
  ],
  // providers: [CircleProgressOptions],
  imports: [
    CommonModule,
    MohuaformRoutingModule,
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    ReactiveFormsModule,
    MatTooltipModule,
    SharedModule,
    TooltipModule.forRoot(),
    FormsModule,
    CollapseModule.forRoot(),
    PaginationModule.forRoot(),
    NgxPaginationModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    MatCardModule,
    MatSelectModule,
    // NgCircleProgressModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    GlobalPartModule
  ],
  exports: [
   // GrantTransferMohuaComponent
  ]
})
export class MohuaformModule { }
