import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import { Router, NavigationStart, Event } from "@angular/router";
import { WaterSanitationService } from "./water-sanitation.service";
import { WaterSanitationPreviewComponent } from "./water-sanitation-preview/water-sanitation-preview.component";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { UlbformService } from "../ulbform.service";
import { SweetAlert } from "sweetalert/typings/core";
const swal: SweetAlert = require("sweetalert");
import { Subject } from "rxjs";
import { BaseComponent } from "src/app/util/BaseComponent/base_component";
import { USER_TYPE } from "src/app/models/user/userType";
import { IUserLoggedInDetails } from "src/app/models/login/userLoggedInDetails";
import { UserUtility } from "src/app/util/user/user";

@Component({
  selector: "app-water-sanitation",
  templateUrl: "./water-sanitation.component.html",
  styleUrls: ["./water-sanitation.component.scss"],
})
export class WaterSanitationComponent extends BaseComponent implements OnInit {
  dialogRefForNavigation;
  /* This is to keep track of which indexed which file is already either in data processing state
   * or in file Upload state
   */
  errorSet = new Subject<any>();

  isDraft = false;
  MIN_LENGTH = 1;
  MAX_LENGTH = 50;
  MAX_LENGTH_AREA = 200;
  LPCD = 135;
  PERCENTAGE = 100;
  HRS = 24;
  sanitationToolTip;
  waterToolTip;
  isDisabled = false;
  ulbFormStaus = "PENDING";
  ulbFormStatusMoHUA;
  ulbFormRejectR = null;
  finalSubmitUtiStatus;
  takeStateAction;
  compDis;
  actionResW;
  userLoggedInDetails = new UserUtility().getLoggedInUserDetails();
  loggedInUserType;
  userTypes = USER_TYPE;
  ulbId = null;
  lastRoleInMasterForm;
  masterFormStatus;

  constructor(
    private _router: Router,
    private wsService: WaterSanitationService,
    public dialog: MatDialog,
    public _ulbformService: UlbformService
  ) {
    super();
    this.loggedInUserType = this.userLoggedInDetails.role;
    this.finalSubmitUtiStatus = localStorage.getItem("finalSubmitStatus");
    this.takeStateAction = localStorage.getItem("takeStateAction");
    this.compDis = localStorage.getItem("stateActionComDis");
    this.lastRoleInMasterForm = localStorage.getItem("lastRoleInMasterForm");
    this.masterFormStatus = localStorage.getItem("masterFormStatus");
    console.log("finalSubmitStatus", typeof this.finalSubmitUtiStatus);
    switch (this.loggedInUserType) {
      case USER_TYPE.STATE:
      case USER_TYPE.PARTNER:
      case USER_TYPE.MoHUA:
      case USER_TYPE.ADMIN:
        this.isDisabled = true;
    }
    if (
      this.finalSubmitUtiStatus == "true" &&
      this.lastRoleInMasterForm == this.userTypes.ULB
    ) {
      this.isDisabled = true;
    }
    if (
      this.finalSubmitUtiStatus == "true" &&
      this.lastRoleInMasterForm != this.userTypes.ULB &&
      this.masterFormStatus != "REJECTED"
    ) {
      this.isDisabled = true;
    }
    this.errorSet.subscribe((res) => {
      const { keys, value } = res;
      if (value === undefined) {
        this.waterAndSanitation[keys[0]][keys[1]][keys[2]] = null;
        return;
      }
      this.compareValues(keys, value);
    });

    this._router.events.subscribe(async (event: Event) => {
      if (!this.saveClicked) {
        if (event instanceof NavigationStart) {
          if (event.url === "/" || event.url === "/login") {
            sessionStorage.setItem("changeInPlans", "false");
            return;
          }
          const change = sessionStorage.getItem("changeInPlans");
          if (change === "true" && this.routerNavigate === null) {
            this.routerNavigate = event;
            const currentRoute = this._router.routerState;
            this._router.navigateByUrl(currentRoute.snapshot.url, {
              skipLocationChange: true,
            });
            this.openModal(this.template);
          }
        }
      }
    });
  }

  @ViewChild("template") template;
  @ViewChild("template1") template1;
  routerNavigate = null;
  saveClicked = false;

  waterAndSanitation = {
    water: {
      name: null,
      component: null,
      serviceLevel: {
        indicator: null,
        existing: null,
        after: null,
      },
      cost: null,
    },
    sanitation: {
      name: null,
      component: null,
      serviceLevel: {
        indicator: null,
        existing: null,
        after: null,
      },
      cost: null,
    },
  };

  errors = {
    water: {
      lengthError: {
        text: false,
        textarea: false,
      },
      apiError: false,
      serviceLvlError: {
        before: false,
        after: false,
      },
      check: null,
    },
    sanitation: {
      lengthError: {
        text: false,
        textarea: false,
      },
      apiError: false,
      serviceLvlError: {
        before: false,
        after: false,
      },
      check: null,
    },
  };

  body = {
    isDraft: this.isDraft,
    plans: null,
    designYear: JSON.parse(localStorage.getItem("Years"))["2021-22"],
    status,
  };

  sanitationIndicators = [
    "Adequacy of Sewage Treatment Capacity",
    "Collection efficiency of Sewerage Network",
    "Coverage of Sewerage Network",
    "Coverage of Toilets",
    "Efficiency in Collection of Sewage Water Charges",
    "Efficiency in redressal of customer complaints",
    "Extent of cost recovery in waste water management",
    "Extent of Reuse and Recycling of Sewage",
    "Quality of Sewage Treatment",
  ];

  waterIndicators = [
    "Continuity of Water supplied",
    "Cost Recovery",
    "Coverage of Water Supply connections",
    "Extent of Metering",
    "Extent of Non-revenue WaterSanitationComponent",
    "Efficiency in Collection of Water Charges",
    "Efficiency in redressal of customer complaints",
    "Per Capita Supply of Water",
    "Quality of Water Supplied",
  ];

  ngOnInit(): void {
    this.ulbId = sessionStorage.getItem("ulb_id");
    this.onLoad();
  }

  onLoad() {
    sessionStorage.setItem("changeInPlans", "false");
    this.wsService.getFiles(this.ulbId).subscribe(
      (res) => {
        let waterSres: any = res;
        this.waterAndSanitation = res["plans"];
        this.body.status = res["status"];
        console.log("water-suply-res", res, this.waterAndSanitation);
        let actRes = {
          st: waterSres?.status,
          rRes: waterSres?.rejectReason,
        };
        if (waterSres?.status != "NA") {
          this.ulbFormStaus =
            waterSres?.status != "" ? waterSres?.status : "PENDING";
          if (waterSres.actionTakenByRole == this.userTypes.STATE) {
            if (
              ((waterSres?.status == "REJECTED" &&
                this.masterFormStatus != "REJECTED") ||
                (waterSres?.status == "APPROVED" &&
                  this.masterFormStatus != "APPROVED")) &&
              this.lastRoleInMasterForm == this.userTypes.ULB
            ) {
              this.ulbFormStaus = "PENDING";
            }
          }
          if (waterSres.actionTakenByRole == this.userTypes.MoHUA) {
            this.ulbFormStaus = "APPROVED";
            if (
              ((waterSres?.status == "REJECTED" &&
                this.masterFormStatus != "REJECTED") ||
                (waterSres?.status == "APPROVED" &&
                  this.masterFormStatus != "APPROVED")) &&
              this.lastRoleInMasterForm == this.userTypes.STATE
            ) {
              this.ulbFormStatusMoHUA = "PENDING";
            }
          }

          if (
            this.lastRoleInMasterForm === USER_TYPE.MoHUA &&
            this.finalSubmitUtiStatus == "true"
          ) {
            this.ulbFormStatusMoHUA = waterSres?.status;
            this.ulbFormStaus = "APPROVED";
          }
          if (
            this.lastRoleInMasterForm === USER_TYPE.STATE &&
            this.finalSubmitUtiStatus == "true" &&
            this.ulbFormStaus == "APPROVED"
          ) {
            this.ulbFormStatusMoHUA = "PENDING";
          }
        }
        this.ulbFormRejectR = waterSres?.rejectReason;
        this.actionResW = actRes;
        sessionStorage.setItem(
          "plansData",
          JSON.stringify(this.waterAndSanitation)
        );
        this.diffCheck();
        this.onLoadDataCheck(this.waterAndSanitation);
        this.isDraft = res["isDraft"];
        if (
          this.ulbFormStaus == "REJECTED" &&
          this.loggedInUserType == USER_TYPE.ULB &&
          this.finalSubmitUtiStatus == "true" &&
          this.lastRoleInMasterForm != USER_TYPE.ULB
        ) {
          this.isDisabled = false;
        }
      },
      (errMes) => {
        console.log(errMes);
        sessionStorage.setItem(
          "plansData",
          JSON.stringify(this.waterAndSanitation)
        );
        this.isDraft = null;
        this.diffCheck();
      }
    );
  }

  onLoadDataCheck(data) {
    for (const key in data) {
      for (const key1 in data[key]) {
        console.log(key1, data[key][key1]);
        if (key1 === "serviceLevel") {
          for (const key2 in data[key][key1]) {
            console.log(key2, data[key][key1][key2]);
            let value = data[key][key1][key2];
            let keys = [`${key}`, `${key1}`, `${key2}`];
            this.errorSet.next({ value, keys });
          }
        } else {
          let value = data[key][key1];
          if (key1 == "cost") {
            continue;
          }
          let type = key1 == "name" ? "text" : "textarea";
          this.checkValidation(type, value?.length, [`${key}`, `${key1}`]);
        }
      }
    }
  }

  onPreview() {
    this.testForDraft();

    let prevData = {
      water: this.waterAndSanitation.water,
      sanitation: this.waterAndSanitation.sanitation,
      isDraft: this.body.isDraft,
    };
    console.log(prevData);

    const dialogRef = this.dialog.open(WaterSanitationPreviewComponent, {
      data: prevData,
      maxHeight: "95vh",
      height: "fit-content",
      width: "85vw",
      panelClass: "no-padding-dialog",
    });
    // this.hidden = false;
    dialogRef.afterClosed().subscribe((result) => {
      // console.log(`Dialog result: ${result}`);
      //   this.hidden = true;
    });
  }

  openModal(template: TemplateRef<any>) {
    // this.dialogRefForNavigation = this.modalService.show(template, { class: "modal-md" });
    const dialogConfig = new MatDialogConfig();
    this.dialogRefForNavigation = this.dialog.open(template, dialogConfig);
    this.dialogRefForNavigation.afterClosed().subscribe((result) => {
      if (result === undefined) {
        if (this.routerNavigate) {
          this.routerNavigate = null;
        }
      }
    });
  }

  stay() {
    this.dialogRefForNavigation.close(true);
    if (this.routerNavigate) {
      this.routerNavigate = null;
    }
  }

  proceed() {
    this.dialogRefForNavigation.close(true);
    this.saveForm();
  }

  alertClose() {
    this.dialogRefForNavigation.close(true);
    if (this.routerNavigate) {
      this.routerNavigate = null;
    }
  }

  saveForm(template = null) {
    this.body.plans = this.waterAndSanitation;
    if (this.ulbId == null) {
      this.testForDraft();
      if (!this.body.isDraft || template === null) {
        this.postsDataCall(this.body);
        sessionStorage.setItem("changeInPlans", "false");
      } else {
        this.openModal(template);
      }
    } else {
      this.stateActionSave(this.body);
    }
  }

  postsDataCall(body) {
    return new Promise((resolve, reject) => {
      this.wsService.sendRequest(body).subscribe(
        async (res) => {
          const status = JSON.parse(sessionStorage.getItem("allStatus"));
          status.plans.isSubmit = res["isCompleted"];
          this._ulbformService.allStatus.next(status);
          swal("Record submitted successfully!");
          if (this.routerNavigate) {
            this._router.navigate([this.routerNavigate.url]);
          }
          resolve("success");
        },
        (error) => {
          resolve(error);
          console.log(error);
        }
      );
    });
  }

  onKey(e, path) {
    console.log(e);
    const type = e.target?.type;
    const value = e.target?.value ? e.target.value : e.value;
    let keys = path.split(".");

    if (type) this.checkValidation(type, value?.length, keys);
    if (keys.length == 2) {
      this.waterAndSanitation[keys[0]][keys[1]] = value;
    } else {
      if (keys[2] != "indicator") {
        this.waterAndSanitation[keys[0]][keys[1]][keys[2]] = Number(value);
      } else this.waterAndSanitation[keys[0]][keys[1]][keys[2]] = value;
      this.errorSet.next({ value, keys });
    }

    this.diffCheck();
  }

  checkValidation(type, length, path) {
    console.log(type, length, path);
    if (type === "text") {
      if (length > this.MAX_LENGTH)
        this.errors[path[0]].lengthError.text = true;
      else this.errors[path[0]].lengthError.text = false;
    }
    if (type === "textarea") {
      if (length > this.MAX_LENGTH_AREA)
        this.errors[path[0]].lengthError.textarea = true;
      else this.errors[path[0]].lengthError.textarea = false;
    }
  }

  compareValues(path, value) {
    if (path[2] == "indicator") {
      switch (value) {
        case "Per Capita Supply of Water":
          this.errors[path[0]].check = this.LPCD;
          break;
        case "Continuity of Water supplied":
          this.errors[path[0]].check = this.HRS;
          break;
        default:
          this.errors[path[0]].check = this.PERCENTAGE;
          break;
      }
    }
    if (this.waterAndSanitation[path[0]].serviceLevel.indicator) {
      let val1 = this.waterAndSanitation[path[0]].serviceLevel.existing;
      let val2 = this.waterAndSanitation[path[0]].serviceLevel.after;
      let type = this.errors[path[0]].check;

      if (val1 > type) {
        this.errors[path[0]].serviceLvlError.before = true;
      } else {
        this.errors[path[0]].serviceLvlError.before = false;
      }
      if (val2 > type) {
        this.errors[path[0]].serviceLvlError.after = true;
      } else {
        this.errors[path[0]].serviceLvlError.after = false;
      }
    }
    this.sanitationToolTip = `Value at max ${this.errors.sanitation.check}`;
    this.waterToolTip = `Value at max ${this.errors.water.check}`;
  }

  diffCheck() {
    if (
      JSON.stringify(this.waterAndSanitation) !=
      sessionStorage.getItem("plansData")
    ) {
      sessionStorage.setItem("changeInPlans", "true");
      let allFormData = JSON.parse(sessionStorage.getItem("allFormsData"));
      if (allFormData) {
        let changes = this.body;
        changes.plans = this.waterAndSanitation;
        allFormData.plansData[0] = changes;
        this._ulbformService.allFormsData.next(allFormData);
      }
    } else {
      sessionStorage.setItem("changeInPlans", "false");
    }
  }

  testForDraft(dataFromPrev = null) {
    const data = dataFromPrev ?? this.waterAndSanitation;
    for (const key in data) {
      for (const key1 in data[key]) {
        if (key1 === "serviceLevel") {
          for (const key2 in data[key][key1]) {
            if (
              data[key][key1][key2] === undefined ||
              data[key][key1][key2] === null
            ) {
              this.body.isDraft = true;
              return;
            }
          }
        } else {
          if (data[key][key1] === undefined || data[key][key1] === null) {
            this.body.isDraft = true;
            return;
          }
        }
      }
    }

    const error = this.errors;
    for (const key in error) {
      if (error.hasOwnProperty(key)) {
        for (const key1 in error[key]) {
          if (key1 == "check") {
            continue;
          }
          if (error[key].hasOwnProperty(key1)) {
            for (const key2 in error[key][key1]) {
              if (error[key][key1][key2] != false) {
                this.body.isDraft = true;
                return;
              }
            }
          } else if (error[key][key1] != false) {
            this.body.isDraft = true;
            return;
          }
        }
      }
    }
    this.body.isDraft = false;
  }
  checkStatus(ev) {
    console.log("actionValues", ev);
    this.ulbFormStaus = ev.status;
    this.ulbFormRejectR = ev.rejectReason;
  }
  errMessage = "";
  stateActionSave(body) {
    body.isDraft = false;
    body.ulb = this.ulbId;
    body.status = this.ulbFormStaus;
    body.rejectReason = this.ulbFormRejectR;
    if((this.ulbFormRejectR == null || this.ulbFormRejectR == undefined) && this.ulbFormStaus == "REJECTED"){
      swal('Providing Reason for Rejection is Mandatory for Rejecting a Form');
    }else {
      this.wsService.stateActionPost(body).subscribe(
        (res) => {
          swal("Record submitted successfully!");
          const status = JSON.parse(sessionStorage.getItem("allStatus"));
          status.plans.status = body.status;
          this._ulbformService.allStatus.next(status);
        },
        (error) => {
          swal("An error occured!");
          this.errMessage = error.message;
          console.log(this.errMessage);
        }
      );
    }

  }
}
