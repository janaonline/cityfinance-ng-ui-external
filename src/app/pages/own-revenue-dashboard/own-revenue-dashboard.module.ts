import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';


import { OwnRevenueDashboardRoutingModule } from './own-revenue-dashboard-routing.module';
import { OwnRevenueDashboardComponent } from './own-revenue-dashboard.component';
import { SharedModule } from '../../shared/shared.module';
import { MatTableModule } from '@angular/material/table';
import { ResourcesDashboardModule } from '../resources-dashboard/resources-dashboard.module';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { GlobalPartModule } from 'src/app/global-part/global-part.module';
@NgModule({
  declarations: [OwnRevenueDashboardComponent],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    OwnRevenueDashboardRoutingModule,
    SharedModule,
    MatTableModule,
    ResourcesDashboardModule,
    HttpClientModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    FormsModule,
    MatAutocompleteModule,
    GlobalPartModule
  ],
})
export class OwnRevenueDashboardModule {}
