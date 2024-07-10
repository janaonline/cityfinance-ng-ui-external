import { Component, OnDestroy, OnInit } from "@angular/core";
import { delay } from "rxjs/operators";
import { environment } from "src/environments/environment";

import { IUserLoggedInDetails } from "./models/login/userLoggedInDetails";
import { GlobalLoaderService } from "./shared/services/loaders/global-loader.service";
import { SessionService } from "./shared/services/session/session.service";
import { ProfileService } from "./users/profile/service/profile.service";
import { UserUtility } from "./util/user/user";
import { ConnectionService } from "ng-connection-service";
import { SweetAlert } from "sweetalert/typings/core";
import { CommonService } from "./shared/services/common.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { VersionCheckService } from "./version-check.service";
import { GoogleAnalyticsService } from "ngx-google-analytics";
// const swal: SweetAlert = require("sweetalert");
const swal2 = require("sweetalert2");


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnDestroy, OnInit {
  title = "City Finance";
  googleTagId = environment.GoogleTagID;
  showLoader = false;
  sessionId: string;
  isEmbedModeEnable: boolean = false;
  constructor(
    public globalLoader: GlobalLoaderService,
    private sessionService: SessionService,
    private profileService: ProfileService,
    private connectionService: ConnectionService,
    private commonService: CommonService,
    private matSnackBar: MatSnackBar,
    private versionService: VersionCheckService,
    private gaService: GoogleAnalyticsService
  ) {

    this.versionCheck()

    setInterval(() => {
      this.versionCheck()
    }, 8000);

    this.startSession();
    this.globalLoader
      .observerLoading()
      .pipe(delay(100))
      .subscribe((loadingStatus) => {
        this.showLoader = loadingStatus;
      });

    // this.addCustomScripts();
    // this.connectionService.monitor().subscribe(isConnected => {
    //   if(!isConnected){
    //     swal({
    //       title: "No Internet Connection!",
    //       text: "Please connect to internet",
    //       icon: "warning",
    //     });
    //   }
    // })
    let userData: any = localStorage.getItem("userData");
    if (!userData) return;
    try {
      userData = JSON.parse(userData) as IUserLoggedInDetails;
      this.profileService.getUserProfile({}).subscribe((response) => {
        const name = response["data"]["name"];
        userData["name"] = name;
        new UserUtility().updateUserDataInRealTime(userData);
      });
    } catch (error) { }
  }


  versionCheck() {
    this.versionService.initVersionCheck(environment.versionCheckURL);
  }


  private startSession() {
    this.sessionService.generateSessionID().subscribe((res) => {
      this.sessionId = res["data"]._id;
    });
  }

  ngOnInit(): void {
    //  this.callGenralAert();
    this.commonService.isEmbedModeEnable.subscribe(data => {
      console.log('isEmbedModeEnable', data)
      if (data) {
        this.isEmbedModeEnable = data;
      }
    });
    this.commonService.getAllUlbs().subscribe(
      (res) => {
        localStorage.setItem("ulbList", JSON.stringify(res));
        let ulbStateCodeMapping = {},
          ulbCodeMapping = {},
          stateIdsMap = {},
          ulbMapping = {};
        for (const key in res.data) {
          const element = res.data[key];
          stateIdsMap[element["_id"]] = element.state;
          element.ulbs.map((value) => {
            ulbMapping[value._id] = value;
            ulbStateCodeMapping[value._id] = key;
            ulbCodeMapping[value._id] = value.code;
          });
        }
        localStorage.setItem(
          "ulbStateCodeMapping",
          JSON.stringify(ulbStateCodeMapping)
        );
        localStorage.setItem("ulbCodeMapping", JSON.stringify(ulbCodeMapping));
        localStorage.setItem("stateIdsMap", JSON.stringify(stateIdsMap));
        localStorage.setItem("ulbMapping", JSON.stringify(ulbMapping));
        console.log(res, "ULB LIST");
      },
      (error) => { }
    );
  }
  ngOnDestroy(): void {
    this.sessionService.endSession(this.sessionId).subscribe((res) => { });
  }

  // callGenralAert(){
  //   const defaultMessage = {
  //    title: 'Error', 
  //    text: `Cityfinance.in will be undergoing scheduled maintenance, resulting in a temporary outage for sometime.
  //          <br> <br>For any assistance, please contact our support team at <a href = 'mailto: 15fcgrant@cityfinance.in'>15fcgrant@cityfinance.in</a>`, 
  //    position: 'center',
  //    icon: 'error'
  //  }

  //    this.commonService.getCallMethod('general-alert', {type: 'common'}).subscribe((res: any)=>{
  //     // console.log('genral alert', res);
  //      const message = res?.data?.message;
  //      if(res?.data?.isActive){
  //        this.showAlert(message);
  //      }
  //    },
  //    (error)=>{
  //    //  console.log('genral alert error', error);
  //      this.showAlert(defaultMessage);
  //    }
  //    )
  //  }

  //  showAlert(message){
  //    swal2.fire({
  //      title: `${message?.title}`,
  //      html: `${message?.text}`,
  //      position: `${message?.position}`,
  //      icon:`${message?.icon}`,
  //      showCloseButton: true,

  //    });
  // }
}
