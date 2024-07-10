import "@angular/common/locales/global/en-IN";

import { LOCALE_ID, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FiscalRankingRoutingModule } from './fiscal-ranking-routing.module';
import { FiscalHomeComponent } from './fiscal-home/fiscal-home.component';
import { FiscalLoginComponent } from './fiscal-login/fiscal-login.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";

import { MatCardModule } from "@angular/material/card";
//import { UlbFiscalComponent } from './ulb-fiscal/ulb-fiscal.component';
import { SharedModule } from '../shared/shared.module';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { LoaderComponent } from './loader/loader.component';
import { MatRadioModule } from '@angular/material/radio';
import { UlbFisPreviewComponent } from './ulb-fiscal-new/ulb-fis-preview/ulb-fis-preview.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RecaptchaModule } from 'ng-recaptcha';
import { MdePopoverModule } from '@material-extended/mde';
import { DownloadPopupComponent } from './download-popup/download-popup.component';
import { ReviewUlbTableComponent } from './review-ulb-table/review-ulb-table.component';
import { Shared2223Module } from '../shared2223/shared2223.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { UlbFiscalNewComponent } from './ulb-fiscal-new/ulb-fiscal-new.component';
import { TowordPipe } from './pipes/toword.pipe';
import { PercentprogressPipe } from './pipes/percentprogress.pipe';
import { YearInfoPipe } from './pipes/year-info.pipe';
import { DisplayPositionPipe } from './pipes/display-position.pipe';
import { DecimalLimitDirective } from './ulb-fiscal-new/decimal-limit.directive';
import { NoUpDownDirective } from './ulb-fiscal-new/no-up-down.directive';
import { AlreadyUpdatedUrlPipe } from './pipes/already-updated-url.pipe';
import { MapcomponentComponent } from './mapcomponent/mapcomponent.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CommonTableComponent } from './common-table/common-table.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TableRowCalculatorPipe } from './pipes/table-row-calculator.pipe';
import { TrackingHistoryTableComponent } from './review-ulb-table/tracking-history-table/tracking-history-table.component';
import { HomeComponent } from './home/home.component';
import { HeaderComponent } from './home/header/header.component';
import { RankingCategoriesComponent } from './home/ranking-categories/ranking-categories.component';
import { UnionMinistorComponent } from './home/union-ministor/union-ministor.component';
import { FooterComponent } from './home/footer/footer.component';
import { TrainingSessionComponent } from './home/training-session/training-session.component';
import { AssessmentParametersComponent } from './home/assessment-parameters/assessment-parameters.component';
import { FeaturesNBenefitsComponent } from './home/features-n-benefits/features-n-benefits.component';
import { UlbsInIndiaComponent } from './home/ulbs-in-india/ulbs-in-india.component';
import { GuidelinesPopupComponent } from './home/guidelines-popup/guidelines-popup.component';
import { AssessmentParameterComponent } from './assessment-parameter/assessment-parameter.component';
import { AnnualFinancialStatementsComponent } from './annual-financial-statements/annual-financial-statements.component';
import { BreadcrumbComponent } from './breadcrumb/breadcrumb.component';
import { AnnualBudgetsComponent } from './annual-budgets/annual-budgets.component';
import { TopRankingsComponent } from './top-rankings/top-rankings.component';
import { UlbDetailsComponent } from './ulb-details/ulb-details.component';
import { ComparisonComponent } from './ulb-details/comparison/comparison.component';
import { PerformanceFourMComponent } from './ulb-details/performance-four-m/performance-four-m.component';
import { UlbDetailsHeaderComponent } from './ulb-details/ulb-details-header/ulb-details-header.component';
import { UlbDetailsAssessmentParametersComponent } from './ulb-details/ulb-details-assessment-parameters/ulb-details-assessment-parameters.component';
import { ComparisionFiltersComponent } from './ulb-details/comparision-filters/comparision-filters.component';
import { SearchPopupComponent } from './ulb-details/search-popup/search-popup.component';
import { ParticipatingStateComponent } from './participating-state/participating-state.component';
import { ParticipatingUlbsComponent } from './participating-ulbs/participating-ulbs.component';
import { IndiaMapComponent } from './india-map/india-map.component';
import { FileUrlCheckPipe } from './pipes/file-url-check.pipe';
import { VideosPopupComponent } from './home/videos-popup/videos-popup.component';
import { TypeofPipe } from './pipes/typeof.pipe';
import { GlobalPartModule } from "../global-part/global-part.module";

@NgModule({
  declarations: [
    FiscalHomeComponent,
    FiscalLoginComponent,
    // UlbFiscalComponent,
    UlbFiscalNewComponent,
    LoaderComponent,
    UlbFisPreviewComponent,
    DownloadPopupComponent,
    ReviewUlbTableComponent,
    TowordPipe,
    PercentprogressPipe,
    YearInfoPipe,
    DisplayPositionPipe,
    DecimalLimitDirective,
    // NoUpDownDirective,
    AlreadyUpdatedUrlPipe,
    MapcomponentComponent,
    DashboardComponent,
    CommonTableComponent,
    TableRowCalculatorPipe,
    TrackingHistoryTableComponent,
    HomeComponent,
    HeaderComponent,
    RankingCategoriesComponent,
    UnionMinistorComponent,
    FooterComponent,
    TrainingSessionComponent,
    AssessmentParametersComponent,
    FeaturesNBenefitsComponent,
    UlbsInIndiaComponent,
    GuidelinesPopupComponent,
    AssessmentParameterComponent,
    AnnualFinancialStatementsComponent,
    BreadcrumbComponent,
    AnnualBudgetsComponent,
    TopRankingsComponent,
    UlbDetailsComponent,
    ComparisonComponent,
    AssessmentParameterComponent,
    PerformanceFourMComponent,
    UlbDetailsHeaderComponent,
    UlbDetailsAssessmentParametersComponent,
    ComparisionFiltersComponent,
    SearchPopupComponent,
    ParticipatingStateComponent,
    ParticipatingUlbsComponent,
    IndiaMapComponent,
    FileUrlCheckPipe,
    VideosPopupComponent,
    TypeofPipe
  ],
  imports: [
    CommonModule,
    MatStepperModule,
    FormsModule,
    SharedModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatCardModule,
    FiscalRankingRoutingModule,
    MatRadioModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTooltipModule,
    RecaptchaModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MdePopoverModule,
    MatNativeDateModule,
    MatDatepickerModule,
    NgxPaginationModule,
    Shared2223Module,
    AngularMultiSelectModule,
    MatProgressSpinnerModule,
    GlobalPartModule
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false },
    },
    { provide: LOCALE_ID, useValue: "en-IN" }
  ],
  exports: [LoaderComponent]
  // providers: [
  //   {
  //     provide: STEPPER_GLOBAL_OPTIONS,
  //     useValue: { displayDefaultIndicatorType: false }
  //   }
  // ],
  // schemas: [
  //   CUSTOM_ELEMENTS_SCHEMA
  // ],
  // bootstrap: [UlbFiscalComponent],
})
export class FiscalRankingModule { }
