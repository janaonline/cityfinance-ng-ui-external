import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from "src/app/shared/shared.module";
import { NationalRoutingModule } from './national-routing.module';
import { TabAboutFilterComponent } from './tab-about-filter/tab-about-filter.component';
import { NationalComponent } from './national.component';
import { NationalSubComponent } from './national-sub/national-sub.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataAvailableComponent } from './data-available/data-available.component';
import { NationalResourcesComponent } from './national-resources/national-resources.component';
import { NationalMapSectionComponent } from './national-map-section/national-map-section.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { SlickCarouselModule } from "ngx-slick-carousel";
import { GlobalPartModule } from 'src/app/global-part/global-part.module';

@NgModule({
  declarations: [
    NationalComponent,
    TabAboutFilterComponent,
    NationalSubComponent,
    DataAvailableComponent,
    NationalResourcesComponent,
    NationalMapSectionComponent
  ],
  imports: [
    CommonModule,
    NationalRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    AngularMultiSelectModule,
    FormsModule,
    SlickCarouselModule,
    GlobalPartModule
  ]
})
export class NationalModule { }
