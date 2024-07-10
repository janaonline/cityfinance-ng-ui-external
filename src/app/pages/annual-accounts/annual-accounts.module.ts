import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AnnualAccountsRoutingModule } from "./annual-accounts-routing.module";
import { AnnualAccountsCreateComponent } from "./annual-accounts-create/annual-accounts-create.component";
// import { AnnualAccountsViewComponent } from "./annual-accounts-view/annual-accounts-view.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { NgxPaginationModule } from "ngx-pagination";
import { MatIconModule } from "@angular/material/icon";
import { DateFormatPipe } from "./dateTimePipe"
import { MatDialogModule } from '@angular/material/dialog'
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from "src/app/shared/shared.module";
import { GlobalPartModule } from "src/app/global-part/global-part.module";
@NgModule({
  imports: [
    CommonModule,
    AnnualAccountsRoutingModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatSortModule,
    NgxPaginationModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    GlobalPartModule
  ],
  declarations: [AnnualAccountsCreateComponent, DateFormatPipe],
  exports: [AnnualAccountsCreateComponent],
})
export class AnnualAccountsModule { }
