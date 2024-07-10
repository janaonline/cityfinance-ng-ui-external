import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MohuaFormRoutingModule } from './mohua-form-routing.module';
import { MohuaFormComponent } from './mohua-form.component';
import { ReviewUlbTableComponent } from './review-ulb-table/review-ulb-table.component';
import { DashbordComponent } from './dashbord/dashbord.component';
import { FcSharedModule } from '../fc-shared/fc-shared.module';
import { Shared2223Module } from 'src/app/shared2223/shared2223.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReviewStateFormComponent } from './review-state-form/review-state-form.component';
import { StateResourceManagerComponent } from './state-resource-manager/state-resource-manager.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { AddResourceComponent } from './state-resource-manager/add-resource/add-resource.component';
import { MatIconModule } from '@angular/material/icon';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SharedModule } from 'src/app/shared/shared.module';
import { GlobalPartModule } from 'src/app/global-part/global-part.module';
import { UrbanReformsIvComponent } from './urban-reforms-iv/urban-reforms-iv.component';
import { DocumentsComponent } from './urban-reforms-iv/documents/documents.component';


@NgModule({
  declarations: [MohuaFormComponent, ReviewUlbTableComponent, DashbordComponent, ReviewStateFormComponent, StateResourceManagerComponent, AddResourceComponent, UrbanReformsIvComponent, DocumentsComponent],
  imports: [
    CommonModule,
    MohuaFormRoutingModule,
    FcSharedModule,
    SharedModule,
    Shared2223Module,
    ReactiveFormsModule,
    MatIconModule,
    FormsModule,
    PdfViewerModule,
    AngularMultiSelectModule,
    MatPaginatorModule,
    GlobalPartModule
  ]
})
export class MohuaFormModule { }
