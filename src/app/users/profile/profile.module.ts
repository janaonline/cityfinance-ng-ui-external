import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { NgxPaginationModule } from 'ngx-pagination';

import { SharedModule } from '../../../app/shared/shared.module';
import { CommonProfileComponent } from './common-profile/common-profile.component';
import { MohuaProfileComponent } from './mohua-profile/mohua-profile.component';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { StateProfileComponent } from './state-profile/state-profile.component';
import { ProfileRequestComponent } from './ulb-profile/profile-request/profile-request.component';
import { UlbProfileComponent } from './ulb-profile/ulb-profile.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { GlobalPartModule } from 'src/app/global-part/global-part.module';

@NgModule({
  imports: [
    CommonModule,
    ProfileRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgxPaginationModule,
    MatDialogModule,
    GlobalPartModule
  ],
  declarations: [
    UserProfileComponent,
    ProfileComponent,
    UlbProfileComponent,
    CommonProfileComponent,
    StateProfileComponent,
    MohuaProfileComponent,
    ProfileRequestComponent,
  ],
})
export class ProfileModule {}
