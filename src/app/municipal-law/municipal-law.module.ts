import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { BrowserModule } from "@angular/platform-browser";
import { AgGridModule } from "ag-grid-angular";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { AccordionModule } from "ngx-bootstrap/accordion";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { ModalModule } from "ngx-bootstrap/modal";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { NgxPaginationModule } from "ngx-pagination";

import { AngularMaterialModule } from "../angular-material.module";
import { AuthModule } from "../auth/auth.module";
import { SharedModule } from "../shared/shared.module";
import { MunicipalLawRouter } from "./municipal-law.route";
import { MunicipalLawsComponent } from "./municipal-laws/municipal-laws.component";
import { GlobalPartModule } from "../global-part/global-part.module";

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    MunicipalLawRouter,
    HttpClientModule,
    AgGridModule.withComponents([]),
    AuthModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMultiSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    NgxPaginationModule,
    MatFormFieldModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    AccordionModule.forRoot(),
    CarouselModule.forRoot(),
    SharedModule,
    AngularMaterialModule,
    GlobalPartModule
  ],
  declarations: [MunicipalLawsComponent],
  providers: [],
})
export class MunicipalLawModule {}
