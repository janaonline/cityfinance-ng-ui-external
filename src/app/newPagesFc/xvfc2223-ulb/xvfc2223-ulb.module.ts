import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatIconModule } from "@angular/material/icon";
import { Xvfc2223UlbRoutingModule } from "./xvfc2223-ulb-routing.module";
import { Xvfc2223UlbComponent } from "./xvfc2223-ulb.component";
import { OdfComponent } from "./odf/odf.component";
import { Shared2223Module } from "src/app/shared2223/shared2223.module";
import { AnnualAccountsComponent } from "./annual-accounts/annual-accounts.component";
import { GfcComponent } from "./gfc/gfc.component";
import { AnnualPreviewComponent } from "./annual-accounts/annual-preview/annual-preview.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { TooltipModule } from "ngx-bootstrap/tooltip";
import { DetailedUtilizationReportComponent } from "./detailed-utilization-report/detailed-utilization-report.component";
import { Slbs2223Component } from "./slbs2223/slbs2223.component";
import { Gtc2223Component } from "./gtc2223/gtc2223.component";
import { PfmsComponent } from "./pfms/pfms.component";
import {
  NsixDigitDecimaNumberDirective,
  NtwoDigitDecimaNumberDirective,
} from "./decimal.directive";
import { OverviewComponent } from "./overview/overview.component";
import { ResourceComponent } from "./resource/resource.component";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { DurPreviewComponent } from "./detailed-utilization-report/dur-preview/dur-preview.component";
import { CharacterDirective, PatternDirective } from "./pattern.directive";
import { IncompleteProfileComponent } from "src/app/shared/components/ulb/incomplete-profile/incomplete-profile.component";
import { SharedModule } from "src/app/shared/shared.module";
import { PfmsPreviewComponent } from './pfms-preview/pfms-preview.component';
import { PropertyTaxOperationalisationComponent } from "./property-tax-operationalisation/property-tax-operationalisation.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { Slbs28FormComponent } from './slbs28-form/slbs28-form.component';
import { Slbs28FormPreviewComponent } from './slbs28-form/slbs28-form-preview/slbs28-form-preview.component';
import { PropertyTaxOperationalisationPreviewComponent } from './property-tax-operationalisation/property-tax-operationalisation-preview/property-tax-operationalisation-preview.component';
import { Slbs2223PreviewComponent } from './slbs2223/slbs2223-preview/slbs2223-preview.component';
import { GlobalPartModule } from "src/app/global-part/global-part.module";

@NgModule({
  declarations: [
    Xvfc2223UlbComponent,
    OdfComponent,
    AnnualAccountsComponent,
    GfcComponent,
    AnnualPreviewComponent,
    DetailedUtilizationReportComponent,
    Slbs2223Component,
    Gtc2223Component,
    PfmsComponent,
    NtwoDigitDecimaNumberDirective,
    NsixDigitDecimaNumberDirective,
    OverviewComponent,
    ResourceComponent,
    DurPreviewComponent,
    PatternDirective,
    CharacterDirective,
    PfmsPreviewComponent,
    PropertyTaxOperationalisationComponent,
    Slbs28FormComponent,
    Slbs28FormPreviewComponent,
    PropertyTaxOperationalisationPreviewComponent,
    Slbs2223PreviewComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Xvfc2223UlbRoutingModule,
    Shared2223Module,
    MatIconModule,
    MatTooltipModule,
    TooltipModule.forRoot(),
    CarouselModule.forRoot(),
    SharedModule,
    PdfViewerModule,
    GlobalPartModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  exports: [Xvfc2223UlbRoutingModule],
})
export class Xvfc2223UlbModule {}
