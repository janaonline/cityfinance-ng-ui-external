import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ProfileService } from 'src/app/users/profile/service/profile.service';
import { BaseComponent } from 'src/app/util/BaseComponent/base_component';
import { USER_TYPE } from 'src/app/models/user/userType';
import { Location } from '@angular/common';
@Component({
  selector: 'app-fc-home-page',
  templateUrl: './fc-home-page.component.html',
  styleUrls: ['./fc-home-page.component.scss']
})
export class FcHomePageComponent extends BaseComponent implements OnInit {

  constructor(private _router: Router,private _profileService: ProfileService,
    private location: Location) {
    super();
    if(!this.loggedInUserType){
      this._router.navigate(["/fc_grant"]);
    }
    switch (this.loggedInUserType) {
      case USER_TYPE.ULB:
      case USER_TYPE.STATE:
      case USER_TYPE.PMU:
      case USER_TYPE.MoHUA:
      case USER_TYPE.ADMIN:
        this._router.navigate(["/fc-home-page"]);
        break;
        case undefined:
          case null:
            return;
          default:
            this._router.navigate(["/home"]);
            break;
    }
   // this.fetchProfileData({});
  }

 ulbName ='';
 stateName=''
 isULBProfileCompleted: boolean;
 profileData;
 //routerlink2223;
 yearList
  ngOnInit(): void {
     let ulbRecord = JSON.parse(localStorage.getItem('userData'));
     this.ulbName = ulbRecord?.name;
     this.stateName = ulbRecord?.stateName
     console.log(ulbRecord)
     this._profileService.getAccessYears().subscribe((res)=> {
     this.yearList = res['data'];
     console.log('year list data', this.yearList);
     },
     (err)=> {
      console.log(err.message)
     })
  }

  // fetchProfileData(params: {}) {
  //   this._profileService.getUserProfile(params).subscribe((res) => {
  //     this.profileData = res["data"];
  //     console.log('profile data', this.profileData);

  //     this.isULBProfileCompleted = this.profileData?.isVerified2223;
  //     if(this.isULBProfileCompleted){
  //       this.routerlink2223 = "/ulbform2223/overview"
  //     }else{
  //       this.routerlink2223 = "/profile-update";
  //     }
  //   });
  // }
  setId(yearId){
    sessionStorage.setItem("selectedYearId", yearId);
  }
}
