import { CommonModule } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ErrorHandler } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouteReuseStrategy } from "@angular/router";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { CarouselModule } from "ngx-bootstrap/carousel";
import { ModalModule } from "ngx-bootstrap/modal";
import { CustomHttpInterceptor } from "src/app/security/custom-http.interceptor";
import { NgxGoogleAnalyticsModule, NgxGoogleAnalyticsRouterModule } from 'ngx-google-analytics';
import { AngularMaterialModule } from "./angular-material.module";
import { AppComponent } from "./app.component";
import { AppRouter } from "./app.route";
import { AuthService } from "./auth/auth.service";
import { HeatMapComponent } from "./auth/home/heat-map/heat-map.component";
import { HomeComponent } from "./auth/home/home.component";
import { MapSectionComponent } from "./auth/home/map-section/map-section.component";
import { AuthGuard } from "./security/auth-guard.service";
import { DialogComponent } from "./shared/components/dialog/dialog.component";
import { AppCommonModule } from "./shared/modules/app-common/app-common.module";
import { SharedModule } from "./shared/shared.module";
import { CustomRouteReuseStrategy } from "./util/router/reuse-strategy";

import { MatFormFieldModule } from "@angular/material/form-field";

import { UlbNotRegisteredComponent } from "./auth/ulb-not-registered/ulb-not-registered.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { NewHomeComponent } from "./auth/new-home/new-home.component";
import { SlickCarouselModule } from "ngx-slick-carousel";
import { CollapseModule } from "ngx-bootstrap/collapse";
import { MunicipalLawModule } from "./municipal-law/municipal-law.module";
import { ProfileUpdateComponent } from './newPagesFc/profile-update/profile-update.component';
import { NgxPaginationModule } from "ngx-pagination";
import { GlobalErrorHandler } from "./global-error-handler.service";
import { VersionCheckService } from "./version-check.service";
import { environment } from "src/environments/environment";
import { GlobalPartModule } from "./global-part/global-part.module";


@NgModule({
  entryComponents: [DialogComponent],

  imports: [
    AppRouter,
    BrowserModule,
    BrowserAnimationsModule,
    AppCommonModule,
    HttpClientModule,
    ReactiveFormsModule,
    ModalModule.forRoot(),
    ReactiveFormsModule,
    FormsModule,
    // FormControl,
    SharedModule,
    // CfChartsModule,
    AngularMaterialModule,
    CommonModule,
    AngularMultiSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatGridListModule,
    MatSidenavModule,
    MatMenuModule,
    MatListModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    CarouselModule.forRoot(),
    FlexLayoutModule,
    SlickCarouselModule,
    CollapseModule.forRoot(),
    MunicipalLawModule,
    NgxPaginationModule,
    MatFormFieldModule,
    NgxGoogleAnalyticsModule.forRoot(environment.GoogleTagID),
    NgxGoogleAnalyticsRouterModule,
    GlobalPartModule
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  providers: [
    CustomHttpInterceptor,

    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true,
    },
    { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy },
    { provide: ErrorHandler, useClass: GlobalErrorHandler},
    AuthService,
    AuthGuard,
    VersionCheckService,
  ],
  declarations: [
    AppComponent,
    DialogComponent,
    HomeComponent,
    MapSectionComponent,
    HeatMapComponent,
    UlbNotRegisteredComponent,
    NewHomeComponent,
    ProfileUpdateComponent,
    // InrCurrencyPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }

