import { Component, OnInit } from '@angular/core';
import { IUserLoggedInDetails } from "src/app/models/login/userLoggedInDetails";
import { IState } from "src/app/models/state/state";
import { USER_TYPE } from "src/app/models/user/userType";
import { CommonService } from "src/app/shared/services/common.service";
import { NewCommonService } from "src/app/shared2223/services/new-common.service";
import { ProfileService } from "src/app/users/profile/service/profile.service";
import { UserUtility } from "src/app/util/user/user";

@Component({
  selector: "app-xvfc2223-mohua",
  templateUrl: "./xvfc2223-mohua.component.html",
  styleUrls: ["./xvfc2223-mohua.component.scss"],
})
export class Xvfc2223MohuaComponent implements OnInit {
  constructor(
    private newCommonService: NewCommonService,
    private profileService: ProfileService,
    private _commonService: CommonService
  ) {
    this.initializeUserType();
    // this.fetchStateList();
    this.initializeLoggedInUserDataFetch();
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.leftMenu = JSON.parse(localStorage.getItem("MohuaLeftMenu"));
  }
  userData;
  leftMenu;
  states: { [staeId: string]: IState };
  userLoggedInDetails: IUserLoggedInDetails;
  loggedInUserType: USER_TYPE;
  userTypes = USER_TYPE;
  ngOnInit(): void {}

  private initializeUserType() {
    this.loggedInUserType = this.profileService.getLoggedInUserType();
    // console.log(this._router.url);
  }
  private initializeLoggedInUserDataFetch() {
    UserUtility.getUserLoggedInData().subscribe((data) => {
      this.userLoggedInDetails = data;
      console.log("hi", data);
    });
  }
}
