import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { SharedModule } from 'src/app/shared/shared.module';

import { PasswordRoutingModule } from './account-reactivate-routing.module';
import { AccountReactivateComponent } from './account-reactivate.component';
import { GlobalPartModule } from 'src/app/global-part/global-part.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PasswordRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    SharedModule,
    GlobalPartModule
  ],
  declarations: [AccountReactivateComponent],
})
export class AccountReactivateModule {}
