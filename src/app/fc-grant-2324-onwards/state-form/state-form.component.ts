import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonServicesService } from '../fc-shared/service/common-services.service';
import { UserUtility } from 'src/app/util/user/user';
import { ProfileService } from 'src/app/users/profile/service/profile.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { USER_TYPE } from 'src/app/models/user/userType';
import { IUserLoggedInDetails } from 'src/app/models/login/userLoggedInDetails';
import { IState } from 'src/app/models/state/state';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.scss']
})
export class StateFormComponent implements OnInit {

  constructor(
    private router: Router,
    private commonServices : CommonServicesService,
    private profileService: ProfileService,
    private _commonService: CommonService,
    private route: ActivatedRoute,
  ) {
    this.initializeUserType();
    this.fetchStateList();
    this.initializeLoggedInUserDataFetch();
    this.loggedInUserType = this.loggedInUserDetails.role;
    if (!this.loggedInUserType) {
      this.router.navigate(["/login"]);
    }
    this.userData = JSON.parse(localStorage.getItem("userData"));
    if (this.userData?.role != 'MoHUA' && this.userData?.role != 'STATE' && this.userData?.role != 'ADMIN') {
      this.router.navigate(["/fc-home-page"]);
    }
  //  this.leftMenu = JSON.parse(localStorage.getItem("leftMenuState"));
    this.stateName = this.userData?.stateName;
    this.stateId = this.userData?.state;
    if (!this.stateId) {
      this.stateId = localStorage.getItem("state_id");
      this.stateName = sessionStorage.getItem("stateName");
    };
    this.designYearArray = JSON.parse(localStorage.getItem("Years"));
   // this.getLeftMenu();
   this.getQueryParams();
    this.statusSubs = this.commonServices.setFormStatusState.subscribe((res) => {
      if (res == true) {
        console.log("form status 2223", res);
        this.getLeftMenu();
      }
    });
  
    
  }
  leftMenu = {};
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  states: { [staeId: string]: IState };
  userLoggedInDetails: IUserLoggedInDetails;
  loggedInUserType: USER_TYPE;
  userTypes = USER_TYPE;
  userData:any;
  stateName:string;
  stateId:string;
  designYearArray:any;
  statusSubs:any;
  //isApiComplete:boolean =false;
  stateFormId:string = '';
  path:string = '';
  isLeftMenu:boolean = false;
  selectedYearId: string = ""
  selectedYear:string = "";
  ngOnInit(): void {
   // this.leftMenu = JSON.parse(localStorage.getItem("leftMenuULB"));
   this.stateFormId = sessionStorage.getItem("Stateform_id");
   this.path = sessionStorage.getItem("path2");
  }

  getLeftMenu() {
    this.isLeftMenu = false;
    let queryParam = {
      role: 'STATE',
      year: this.selectedYearId,
      _id: this.stateId
    }
    this.commonServices.formGetMethod("menu", queryParam).subscribe((res: any) => {
      console.log("left responces..", res);
      this.leftMenu = res?.data;
      localStorage.setItem("leftMenuState", JSON.stringify(res?.data));
      this.commonServices.stateLeftMenuComplete.next(true);
     // this.isApiComplete = true;
      this.isLeftMenu = true;
    },
    (error)=>{
      this.isLeftMenu = false;
      console.log('left menu responces', error)
    }
    );
  }
  ngOnDestroy() {
    this.statusSubs.unsubscribe();
  }

  private initializeUserType() {
    this.loggedInUserType = this.profileService.getLoggedInUserType();
    // console.log(this._router.url);
  }
  private initializeLoggedInUserDataFetch() {
    UserUtility.getUserLoggedInData().subscribe((data) => {
      this.userLoggedInDetails = data;
      //console.log("hi", data);
    });
  }
  private fetchStateList() {
    this._commonService.fetchStateList().subscribe((res) => {
      this.states = {};
      res.forEach((state) => (this.states[state._id] = state));
      localStorage.setItem('state_name', this.states[this.userLoggedInDetails["state"]]?.name)
      localStorage.setItem('state_code', this.states[this.userLoggedInDetails["state"]]?.code)
    });
  }

  backStatePage() {
    if (this.loggedInUserType !== this.userTypes.STATE) {
      this.router.navigate([`mohua-form/${this.selectedYearId}/review-state-form`], { queryParams: { formId: this.stateFormId } });
    }
  }

  getQueryParams() {
    this.route.params.subscribe(params => {
     const yearId = params['yearId']; // get the 'id' query parameter
     this.selectedYearId = yearId ? yearId : sessionStorage.getItem("selectedYearId");
     this.getLeftMenu(); 
     this.selectedYear = this.commonServices.getYearName(this.selectedYearId);
  });
}

}
