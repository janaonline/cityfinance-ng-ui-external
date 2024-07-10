import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import { WaterRejenuvationService } from "./water-rejenuvation.service";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { SweetAlert } from "sweetalert/typings/core";
import { ImagePreviewComponent } from "../../../pages/ulbform/utilisation-report/image-preview/image-preview.component";
import { MapDialogComponent } from "../../../shared/components/map-dialog/map-dialog.component";
import { DataEntryService } from "src/app/dashboard/data-entry/data-entry.service";
import { HttpEventType, JsonpClientBackend } from "@angular/common/http";
import { Router, NavigationStart, Event } from "@angular/router";
import { WaterRejenuvationPreviewComponent } from "./water-rejenuvation-preview/water-rejenuvation-preview.component";
import { UserUtility } from "src/app/util/user/user";
import { USER_TYPE } from "src/app/models/user/userType";
import { StateformsService } from "../stateforms.service";
import { IUserLoggedInDetails } from "../../../models/login/userLoggedInDetails";
import { ProfileService } from "src/app/users/profile/service/profile.service";
import { stateWiseReportMain } from "src/app/shared/components/home-header/tableHeaders";
import { CommonServicesService } from "src/app/fc-grant-2324-onwards/fc-shared/service/common-services.service";
const swal: SweetAlert = require("sweetalert");
@Component({
  selector: "app-water-rejenuvations",
  templateUrl: "./water-rejenuvation.component.html",
  styleUrls: ["./water-rejenuvation.component.scss"],
})
export class WaterRejenuvationComponent implements OnInit {
  userLoggedInDetails: IUserLoggedInDetails;
  // loggedInUserType: USER_TYPE;
  actionRes;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  USER_TYPE = USER_TYPE;
  loggedInUserType = this.loggedInUserDetails.role;
  constructor(
    private fb: FormBuilder,
    private waterRejenuvationService: WaterRejenuvationService,
    private dialog: MatDialog,
    private dataEntryService: DataEntryService,
    private _router: Router,
    public _stateformsService: StateformsService,
    private profileService: ProfileService,
    private fcCommonService : CommonServicesService
  ) {
    this.initializeUserType();
    this._router.events.subscribe(async (event: Event) => {
      if (!this.saveClicked) {
        if (event instanceof NavigationStart) {
          if (event.url === "/" || event.url === "/login") {
            sessionStorage.setItem("changeInWaterRejenuvation", "false");
            return;
          }
          const change = sessionStorage.getItem("changeInWaterRejenuvation");
          if (change === "true" && this.routerNavigate === null) {
            this.dialog.closeAll();
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

    this.getIndicatorLineItem();
  }
  disableAllForms = false;
  isStateSubmittedForms = "";
  allStatus;
  formDisable = false;
  actionFormDisable = false;
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
  disableUAs = []
  disableActionUAs = []
  backButtonClicked = false;
  async ngOnInit() {
    this.formDisable = sessionStorage.getItem("disableAllForms") == 'true'
    this.actionFormDisable = sessionStorage.getItem("disableAllActionForm") == 'true'
    this._stateformsService.disableAllFormsAfterMoHUAReview.subscribe((disable) => {
      this.actionFormDisable = disable;
      if (disable) {
        sessionStorage.setItem("disableAllActionForm", "true")
      }
    })


    sessionStorage.setItem("changeInWaterRejenuvation", "false");
    this.allStatus = JSON.parse(sessionStorage.getItem("allStatusStateForms"));
    await this.loadData();
    this.initializeReport();
    if (this.loggedInUserType == "MoHUA") {
      this.formDisable = true;
      this.waterRejenuvation['controls']['uaData']['controls'].forEach(el => {
        if (el['controls']['status']['value'] == 'APPROVED') {
          this.disableActionUAs.push(el.value?.ua)
        }
      })
   //   console.log(this.disableActionUAs)

    } else if (this.loggedInUserType == "STATE") {
      if (this.allStatus["latestFinalResponse"]["role"] == "STATE") {
        this.formDisable = true;
      } else if (this.allStatus["latestFinalResponse"]["role"] == "MoHUA") {
      //  console.log(this.waterRejenuvation)
        this.waterRejenuvation['controls']['uaData']['controls'].forEach(el => {

          if (el['controls']['status']['value'] == 'APPROVED') {
          //  console.log(el)
            this.disableUAs.push(el.value?.ua)

            el.disable();
          //  console.log(el['controls'])
            // this.waterRejenuvation['controls']['uaData']['controls'][el]['controls'].disable();
          }
        })
       // console.log(this.disableUAs)
      }
    }
    else if (this.allStatus["latestFinalResponse"]["role"] == "MoHUA") {
      this.actionFormDisable = true;
    }
   // console.log('waterRejuvenation', this.waterRejenuvation)
    if (this.formDisable) {

      this.waterRejenuvation.disable();
    }

    this._stateformsService.disableAllFormsAfterStateFinalSubmit.subscribe(
      (disable) => {
        this.formDisable = disable;
        if (disable) {
          sessionStorage.setItem("disableAllForms", "true")
        }
      }
    );
  }
  indicatorSet(event, index, rowIndex) {
    console.log(event.target.value, rowIndex)
    let indicatorValue = event.target.value

    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
 //   console.log(uaDataAtIndex._id);
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['serviceLevelIndicators']['controls'][rowIndex]['controls']['indicator'].patchValue(indicatorValue)
      }
    }
   // console.log(this.waterRejenuvation)
    // this.checkDiff();
  }
  private initializeUserType() {
    this.loggedInUserType = this.profileService.getLoggedInUserType();
    //console.log(this._router.url);
  }
  @ViewChild("template") template;
  @ViewChild("template1") template1;

  saveBtnText = "NEXT";
  routerNavigate = null;
  saveClicked = false;
  showLoader = true;
  data;
  waterRejenuvation: FormGroup;
  maxPhotos = 5;
  photosArray = [];
  errorPhotosArray = [];
  dialogRefForNavigation;
  isDraft = null;
  totalStatus = "PENDING";
  errorOnload = false;
  formStatus;
  userData = JSON.parse(localStorage.getItem("userData"));
  Year = JSON.parse(localStorage.getItem("Years"));
  uasData = JSON.parse(sessionStorage.getItem("UasList"));

  public initializeReport() {
    let state = this.userData["state"] ?? sessionStorage.getItem("state_id");

    this.waterRejenuvation = this.fb.group({
      state: this.fb.control(state, [Validators.required]),
      design_year: this.fb.control(this.Year["2021-22"], [Validators.required]),
      uaData: this.fb.array(this.getUas()),
      status: this.fb.control(this.totalStatus, []),
      isDraft: this.fb.control(this.isDraft, []),
    });

    this.waterRejenuvation.valueChanges.subscribe((change) => {
      let data = sessionStorage.getItem("waterRejenuvationData");
      let uaData = this.waterRejenuvation.getRawValue().uaData
      if (change.uaData.length != uaData.length) {
        change.uaData = uaData
      }
      change.uaData.forEach((element) => {
        delete element.foldCard;
      });
     // console.log(deepEqual(change, JSON.parse(data)));
    //  console.log(JSON.stringify(change), JSON.stringify(JSON.parse(data)))

      if (!deepEqual(change, JSON.parse(data))) {
        if(this.userData?.role == 'STATE') {
          this.saveBtnText = "SAVE AND NEXT";
          sessionStorage.setItem("changeInWaterRejenuvation", "true");
          this.checkDiff();
        }
      } else {
        this.saveBtnText = "NEXT";
        sessionStorage.setItem("changeInWaterRejenuvation", "false");
      }
    });
    this.waterRejenuvation.statusChanges.subscribe((change) => {
      if (change != "INVALID") {
        this.formStatus = true;
      } else {
        this.formStatus = false;
      }
    });

  }

  get Uas() {
    if (!this.showLoader)
      return this.waterRejenuvation.get("uaData")["controls"] as FormArray;
  }

  getSubControlsWaterBodies(index) {
    return this.f.uaData["controls"][index]["controls"]["waterBodies"][
      "controls"
    ] as FormArray;
  }

  getSubControlsWaterReuse(index) {
    return this.f.uaData["controls"][index]["controls"]["reuseWater"][
      "controls"
    ] as FormArray;
  }
  getSubControlsServiceLevelIndicator(index) {
    return this.f.uaData["controls"][index]["controls"]["serviceLevelIndicators"][
      "controls"
    ] as FormArray;
  }

  get f() {
    return this.waterRejenuvation.controls;
  }
  latLongRegex = "^-?([0-8]?[0-9]|[0-9]0)\\.{1}\\d{1,6}";
  getUas() {
   // console.log("rejen heading...", this.data);
    return this.data.map((data) =>
      this.fb.group({
        ua: data.ua,
        status: data?.status ?? "PENDING",
        rejectReason: data?.rejectReason ?? null,
        waterBodies: this.fb.array(this.getWaterBodies(data.waterBodies)),
        reuseWater: this.fb.array(this.getReuseWater(data.reuseWater)),
        serviceLevelIndicators: this.fb.array(this.getServiceLevelIndicator(data.serviceLevelIndicators)),
        foldCard: false,
      })
    );
  }

  getWaterBodies(dataArray) {
    return dataArray.map((data) =>
      this.fb.group({
        name: this.fb.control(data.name, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        area: this.fb.control(data.area, [
          Validators.required,
          Validators.min(1),
        ]),
        nameOfBody: this.fb.control(data.nameOfBody, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        lat: this.fb.control(data.lat, [
          Validators.required,
          Validators.pattern(this.latLongRegex)
        ]),
        long: this.fb.control(data.long, [
          Validators.required,
          Validators.pattern(this.latLongRegex)

        ]),
        photos: this.fb.array(this.getPhotos(data.photos), [
          Validators.required,
        ]),
        bod: this.fb.control(data.bod, [
          Validators.required,
          Validators.min(1),
        ]),
        cod: this.fb.control(data.cod, [
          Validators.required,
          Validators.min(1),
        ]),
        do: this.fb.control(data.do, [Validators.required, Validators.min(1)]),
        tds: this.fb.control(data.tds, [
          Validators.required,
          Validators.min(1),
        ]),
        turbidity: this.fb.control(data.turbidity, [
          Validators.required,
          Validators.min(1),
        ]),
        bod_expected: this.fb.control(data.bod_expected, [
          Validators.required,
          Validators.min(1),
        ]),
        cod_expected: this.fb.control(data.cod_expected, [
          Validators.required,
          Validators.min(1),
        ]),
        do_expected: this.fb.control(data.do_expected, [Validators.required, Validators.min(1)]),
        tds_expected: this.fb.control(data.tds_expected, [
          Validators.required,
          Validators.min(1),
        ]),
        turbidity_expected: this.fb.control(data.turbidity_expected, [
          Validators.required,
          Validators.min(1),
        ]),
        details: this.fb.control(data.details, [
          Validators.required,
          Validators.maxLength(200),
        ]),
      })
    );
  }

  getPhotos(dataArray) {
    return dataArray.map((data) =>
      this.fb.group({
        url: this.fb.control(data.url, [Validators.required]),
        name: this.fb.control(data.name, [Validators.required]),
      })
    );
  }

  getServiceLevelIndicator(dataArray) {
  //  console.log(dataArray)
    return dataArray.map((data) =>
      this.fb.group({
        name: this.fb.control(data.name, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        component: this.fb.control(data.component, [
          Validators.required,
          // Validators.maxLength(25),
        ]),
        indicator: this.fb.control(data.indicator, [
          Validators.required,

        ]),
        existing: this.fb.control(data.existing, [
          Validators.required,

        ]),
        after: this.fb.control(data.after, [
          Validators.required,
          // Validators.min(1),
        ]),
        cost: this.fb.control(data.cost, [
          Validators.required,
          // Validators.min(1),
        ]),
      })
    );
  }
  getReuseWater(dataArray) {
    return dataArray.map((data) =>
      this.fb.group({
        name: this.fb.control(data.name, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        treatmentPlant: this.fb.control(data.treatmentPlant, [
          Validators.required,
          Validators.maxLength(25),
        ]),
        targetCust: this.fb.control(data.targetCust, [
          Validators.required,
          Validators.maxLength(300),
        ]),
        lat: this.fb.control(data.lat, [
          Validators.required,
          Validators.pattern(this.latLongRegex)
        ]),
        long: this.fb.control(data.long, [
          Validators.required,
          Validators.pattern(this.latLongRegex)
        ]),
        stp: this.fb.control(data.stp, [
          Validators.required,
          Validators.min(1),
        ]),
      })
    );
  }
  actionTakenByRoleOnForm = null
  loadData() {
   // console.log(this.uasData)
    return new Promise((resolve, reject) => {
      let id = sessionStorage.getItem("state_id");
      this.waterRejenuvationService.getData(this.Year["2021-22"], id).subscribe(
        (res) => {
          this.actionTakenByRoleOnForm = res['data']['actionTakenByRole']
          this.errorOnload = true;
          this.data = res["data"]["uaData"];
          this.isDraft = res["data"].isDraft;
          this.totalStatus = res["data"].status;
          this.storeData(res["data"]);
          this.showLoader = false;
        //  console.log("water rej data", this.data);
          resolve("ss");
        },
        (err) => {
          this.showLoader = false;
          this.data = [];

          for (const key in this.uasData) {
            this.data.push({
              ua: key,
              waterBodies: [
                {
                  name: null,
                  area: null,
                  nameOfBody: null,
                  lat: null,
                  long: null,
                  photos: [],
                  bod: null,
                  cod: null,
                  do: null,
                  tds: null,
                  turbidity: null,
                  bod_expected: null,
                  cod_expected: null,
                  do_expected: null,
                  tds_expected: null,
                  turbidity_expected: null,
                  details: null,
                },
                {
                  name: null,
                  area: null,
                  nameOfBody: null,
                  lat: null,
                  long: null,
                  photos: [],
                  bod: null,
                  cod: null,
                  do: null,
                  tds: null,
                  turbidity: null,
                  bod_expected: null,
                  cod_expected: null,
                  do_expected: null,
                  tds_expected: null,
                  turbidity_expected: null,
                  details: null,
                },
                {
                  name: null,
                  area: null,
                  nameOfBody: null,
                  lat: null,
                  long: null,
                  photos: [],
                  bod: null,
                  cod: null,
                  do: null,
                  tds: null,
                  turbidity: null,
                  bod_expected: null,
                  cod_expected: null,
                  do_expected: null,
                  tds_expected: null,
                  turbidity_expected: null,
                  details: null,
                },
              ],
              reuseWater: [
                {
                  name: null,
                  treatmentPlant: null,
                  targetCust: null,
                  lat: null,
                  long: null,
                  stp: null,
                },

              ],
              serviceLevelIndicators: [
                {
                  name: null,
                  component: null,
                  indicator: null,
                  existing: null,
                  after: null,
                  cost: null
                }
              ]

            });
          }
          resolve("ss");
        }
      );
    });
  }

  storeData(data) {
    data.uaData.forEach((element) => {
      delete element._id;
      element.reuseWater.forEach((element) => {
        delete element._id;
      });
      element.waterBodies.forEach((element) => {
        delete element._id;
      });
      element.serviceLevelIndicators.forEach((element) => {
        delete element._id;
      });
    });
    let state_id = sessionStorage.getItem("state_id");
    let toStore = {
      state: data.state,
      design_year: data.design_year,
      uaData: data.uaData,
      status: data.status,
      isDraft: data.isDraft,
    };
    sessionStorage.setItem("waterRejenuvationData", JSON.stringify(toStore));
  }

  disableAddMore1 = false
  disableAddMore2 = false
  addRow1(index) {
    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
   // console.log(uaDataAtIndex._id);
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        if (el['controls']['reuseWater'].length > 9) {
          this.disableAddMore1 = true
          return swal('Maximum 10 Rows can be added.')
        }

      }
    }
   // console.log(this.data)
   // console.log(this.waterRejenuvation['controls']['uaData']['controls'])
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['reuseWater'].patchValue(el['controls']['reuseWater'].push(this.fb.group({
          name: this.fb.control(null, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          treatmentPlant: this.fb.control(null, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          targetCust: this.fb.control(null, [
            Validators.required,
            Validators.maxLength(300),
          ]),
          lat: this.fb.control(null, [
            Validators.required,
            Validators.pattern(this.latLongRegex)
          ]),
          long: this.fb.control(null, [
            Validators.required,
            Validators.pattern(this.latLongRegex)
          ]),
          stp: this.fb.control(null, [
            Validators.required,
            Validators.min(1),
          ]),
        })
        ))



      }

    }



  }
  addRow2(index) {
    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
  //  console.log(uaDataAtIndex._id);
  //  console.log(this.data)
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        if (el['controls']['serviceLevelIndicators'].length > 9) {
          this.disableAddMore2 = true
          return swal('Maximum 10 Rows can be added.')
        }

      }
    }
    console.log(this.waterRejenuvation['controls']['uaData']['controls'])
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['serviceLevelIndicators'].patchValue(el['controls']['serviceLevelIndicators'].push(
          this.fb.group({
            name: this.fb.control(null, [
              Validators.required,
              // Validators.maxLength(25),
            ]),
            component: this.fb.control(null, [
              Validators.required,
              // Validators.maxLength(25),
            ]),
            indicator: this.fb.control(null, [
              Validators.required,

            ]),
            existing: this.fb.control(null, [
              Validators.required,

            ]),
            after: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            cost: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
          })
        ))
      }
    }
  }
  deleteRow1(uaIndex, rowIndex) {
    let uaDataAtIndex = this.uasData[this.Uas[uaIndex].value["ua"]];
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['reuseWater'].removeAt(rowIndex);
      }
    }
  }
  deleteRow2(uaIndex, rowIndex) {
    let uaDataAtIndex = this.uasData[this.Uas[uaIndex].value["ua"]];
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['serviceLevelIndicators'].removeAt(rowIndex);
      }
    }
  }
  submit(fromPrev = null) {
    let draftFlag = 0;
   // console.log(this.loggedInUserType);
    if (this.loggedInUserType === "STATE") {
      this.waterRejenuvation.controls.isDraft.patchValue(!this.formStatus);
      console.log(this.waterRejenuvation.controls);
      if (this.saveBtnText == "NEXT") {
        return this._router.navigate(['stateform/action-plan'])
      }
      if (this.waterRejenuvation.value.isDraft && fromPrev == null) {
        return this.openModal(this.template1);
      }
      this.waterRejenuvationService
        .postData(this.waterRejenuvation.value)
        .subscribe(
          (res) => {
            swal({
              title: "Submitted",
              text: "Record submitted successfully!",
              icon: "success",
            });
            sessionStorage.setItem("changeInWaterRejenuvation", "false");
            let status = JSON.parse(
              sessionStorage.getItem("allStatusStateForms")
            );
            status.steps.waterRejuventation.status = "PENDING";
            status.steps.waterRejuventation.isSubmit =
              !this.waterRejenuvation.value["isDraft"];
            status.actionTakenByRole = "STATE";
            this._stateformsService.allStatusStateForms.next(status);
            if (this.routerNavigate) {
              this._router.navigate([this.routerNavigate.url]);
            } else {
              this._router.navigate(["stateform/action-plan"]);
            }
          },
          (err) => {
            console.log(err);
          }
        );
    } else if (this.loggedInUserType === "MoHUA") {
      let changeHappen = sessionStorage.getItem("changeInWaterRejenuvation");
      if (changeHappen == "false") {
        this._router.navigate(["stateform/action-plan"]);
        return;
      } else {
        if (this.routerNavigate) {
          this.saveStateAction();
          sessionStorage.setItem("changeInWaterRejenuvation", "false")
          if (!this.flagg) {
            this._router.navigate([this.routerNavigate.url]);
          }
          return;
        } else if (this.submitted || this.backButtonClicked) {

          this.body = this.waterRejenuvation.value;
          this.body['uaData'].forEach(el => {
            if (el['status'] != 'APPROVED' && el['status'] != 'REJECTED') {
              draftFlag = 1;
            }
          })
          if (draftFlag) {
            this.body['isDraft'] = true;
            this.openModal(this.template1)
            return;
          }
          this.saveStateAction();
          sessionStorage.setItem("changeInWaterRejenuvation", "false")
          if (!this.flagg) {
            if (this.submitted) {
              this._router.navigate(["stateform/action-plan"]);
              return;
            } else if (this.backButtonClicked) {
              this._router.navigate(["stateform/water-supply"]);
              return;
            }

          }
          return;
        }
        this.saveStateAction();

        if (!this.flagg) {
          sessionStorage.setItem("changeInWaterRejenuvation", "false")
          this._router.navigate(["stateform/action-plan"]);
        }
        return;

      }
    }
  }
  body = {};
  flagg = 0;
  saveStateAction() {
    let flag = 0;
    let draftFlag = 0;
    this.body = this.waterRejenuvation.value;
    this.body['uaData'].forEach(el => {
      if (el.status != 'APPROVED' && el.status != 'REJECTED') {

        draftFlag = 1;
      }

    })
    if (draftFlag) {
      this.body['isDraft'] = true;
    } else {
      this.body['isDraft'] = false;
    }
    console.log('isDraft of Water Rej', this.body['isDraft'])
    console.log("this.body", this.body);
    this.body['uaData'].forEach(el => {
      if (el['status'] == 'REJECTED' && !el.rejectReason) {
        flag = 1;
      }
    })
    if (flag) {
      swal("Providing Reason for Rejection is Mandatory for Rejecting a form.")
      this.flagg = 1;
      return;
    }

    this.waterRejenuvationService.postStateAction(this.body).subscribe(
      (res) => {
        swal("Record submitted successfully!");
        sessionStorage.setItem("changeInWaterRejenuvation", "false");
        let status = JSON.parse(sessionStorage.getItem("allStatusStateForms"));
        status.steps.waterRejuventation.status = this.body["status"];
        status.steps.waterRejuventation.isSubmit = !this.body["isDraft"];
        status.actionTakenByRole = "MoHUA";
        this._stateformsService.allStatusStateForms.next(status);
        // this._router.navigate(["stateform/action-plan"]);
      },
      (error) => {
        swal("An error occured!");
        console.log(error.message);
      }
    );
  }

  foldCard(index) {
    this.Uas[index].controls.foldCard.value =
      !this.Uas[index].controls.foldCard.value;
  }

  checkCard(index) {
    return this.Uas[index].controls.foldCard.value;
  }

  imgPreview(waterIndex, uaIndex) {
    let waterBodies = this.getSubControlsWaterBodies(uaIndex);
    let imgData = waterBodies[waterIndex].controls.photos.value;
    if (imgData.length == 0) {
      return swal("No photos added", "", "warning");
    }
    let dialogRef = this.dialog.open(ImagePreviewComponent, {
      data: imgData,
      height: "400px",
      width: "500px",
      panelClass: "no-padding-dialog",
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  removePhotos(waterIndex, uaIndex) {
    if (this.formDisable) return
    let mess = window.confirm("Do you want delete all photos");
    let control = this.getSubControlsWaterBodies(uaIndex);
    let photoControl = control[waterIndex].controls.photos;
    if (mess) {
      photoControl.clear();
      swal(`All photos deleted`, "successfully", "success");
    }
  }

  openMap(nameIndex, uaIndex, name): void {
    if (this.formDisable) return
    let data;
    if (name == "waterBodies") {
      data = {
        lat: this.getSubControlsWaterBodies(uaIndex)[nameIndex].controls.lat
          .value,
        long: this.getSubControlsWaterBodies(uaIndex)[nameIndex].controls.long
          .value,
      };
    } else {
      data = {
        lat: this.getSubControlsWaterReuse(uaIndex)[nameIndex].controls.lat
          .value,
        long: this.getSubControlsWaterReuse(uaIndex)[nameIndex].controls.long
          .value,
      };
    }
    if (data.lat == null || data.long == null) {
      data = null;
    }
    const dialogRef = this.dialog.open(MapDialogComponent, {
      data: data,
      width: "auto",
      height: "auto",
    });

    dialogRef.afterClosed().subscribe((result) => {
      let temp;
      if (name == "waterBodies") {
        temp = this.getSubControlsWaterBodies(uaIndex);
      } else {
        temp = this.getSubControlsWaterReuse(uaIndex);
      }
      temp[nameIndex].controls.lat.patchValue(result.lat);
      temp[nameIndex].controls.long.patchValue(result.long);
    });
  }

  async onFileChange(event, waterIndex, uaIndex) {
    if (this.formDisable) return
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    this.photosArray = [];
    const files = event.target.files;
    let msg = "Photo uploaded successfully.";
    let title = "Success";
    let status = "success";
    let control = this.getSubControlsWaterBodies(uaIndex);
    let photoControl = control[waterIndex].controls.photos;
    let leftNum = this.checkPhotos(files.length, photoControl);

    if (typeof leftNum === "boolean") {
      swal(
        `Max ${this.maxPhotos} photos are allowed`,
        "Delete saved Photos to Continue.",
        "error"
      );
      return;
    }

    let size = leftNum;
    for (const key in files) {
      if (key == "length") break;
      if (size == 0) {
        msg = `First ${files.length - leftNum} uploaded successfully`;
        title = `Max ${this.maxPhotos} photos are allowed`;
        status = "warning";
        break;
      }
      await this.uploadFile(files[key], files[key].name, files[key].type);
      size--;
    }

    let photo = this.getPhotos(this.photosArray);
    photo.forEach((element) => {
      photoControl.push(element);
    });
    swal(title, msg, status);
  }

  checkPhotos(size, photoControl) {
    let photoControlSize = photoControl.value.length ?? 0;
    if (photoControlSize == this.maxPhotos) return false;
    return this.maxPhotos - photoControlSize;
  }

  uploadFile(file, name, type) {
    return new Promise<void>((resolve, reject) => {
      let folderName = `${this.userData?.role}/2021-22/projects_wss/${this.userData?.stateCode}`
      this.dataEntryService.newGetURLForFileUpload(name, type, folderName).subscribe(
        async (s3Response) => {
          const res = s3Response.data[0];
          await this.uploadFileToS3(file, res["url"], res["path"]);
          this.photosArray.push({ url: res["path"], name });
          resolve();
        },
        (err) => {
        //  console.log(err);
          this.errorPhotosArray.push(file);
        }
      );
    });
  }

  private uploadFileToS3(file: File, s3URL: string, fileAlias: string) {
    return new Promise((resolve, reject) => {
      this.dataEntryService.uploadFileToS3(file, s3URL).subscribe(
        (res) => {
          if (res.type === HttpEventType.Response) {
            resolve("aa")
          }
        },
        (err) => {
          this.errorPhotosArray.push(file);
          console.log(err);
        }
      );
    })
  }

  uaIdToName(index) {
    if (this.uasData) {
      let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
      return uaDataAtIndex.name;
    }
  }

  openModal(template: TemplateRef<any>) {
    // this.dialogRefForNavigation = this.modalService.show(template, { class: "modal-md" });
    const dialogConfig = new MatDialogConfig();
    this.dialogRefForNavigation = this.dialog.open(template, dialogConfig);
    this.dialogRefForNavigation.afterClosed().subscribe((result) => {
      // if (result === undefined) {
      //   if (this.routerNavigate) {
      //     this.routerNavigate = null;
      //   }
      // }
    });
  }

  stay() {
    this.dialog.closeAll();
    if (this.routerNavigate) {
      this.routerNavigate = null;
    }
  }
  submitted = false
  saveButtonClicked() {

    this.submitted = true

    this.submit()


  }
  proceed() {
    this.submitted = false
    this.dialog.closeAll();
    this.submit(true);
  }

  alertClose() {
    this.dialog.closeAll();
    if (this.routerNavigate) {
      this.routerNavigate = null;
    }
  }
  checkDiff() {
    // let change = sessionStorage.getItem("changeInWaterRejenuvation");
    // if (change == "true")
    //   this.waterRejenuvation.controls.isDraft.patchValue(!this.formStatus);

    let data = this.waterRejenuvation.value;
   // console.log('check diff data', data);

    // for (let index = 0; index < data.uaData.length; index++) {
    //   data.uaData[index].name = this.uasData[data.uaData[index].ua].name;
    // }
    let preData = data;
    let allFormData = JSON.parse(sessionStorage.getItem("allFormsPreData"))
   // console.log('in water rej change', allFormData, preData);
    if (allFormData) {
      allFormData[0].waterrejenuvationrecyclings[0] = preData
      this._stateformsService.allFormsPreData.next(allFormData)
    }
  }

  onPreview() {
    let change = sessionStorage.getItem("changeInWaterRejenuvation");
    if (change == "true")
      this.waterRejenuvation.controls.isDraft.patchValue(!this.formStatus);

    let data = this.waterRejenuvation.value;
   // console.log(data);

    for (let index = 0; index < data.uaData.length; index++) {
      data.uaData[index].name = this.uasData[data.uaData[index].ua].name;
    }

    let dialogRef = this.dialog.open(WaterRejenuvationPreviewComponent, {
      data: data,
      height: "80%",
      width: "90%",
      panelClass: "no-padding-dialog",
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  checkErrorState(projectRow, val) {
    if (this.errorOnload) {
      return projectRow.controls[val].invalid;
    }
    return (
      projectRow.controls[val]?.invalid &&
      (projectRow.controls[val].dirty || projectRow.controls[val].touched)
    );
  }
  checkStatus(ev, ua_id) {
   // console.log("mohua action in state", ev, ua_id);
    this.saveBtnText = "SAVE AND NEXT";
    sessionStorage.setItem("changeInWaterRejenuvation", "true");
    console.log("before", this.waterRejenuvation.value);
    let state_id = sessionStorage.getItem("state_id");
    this.waterRejenuvation.value.state = state_id;
    this.waterRejenuvation.value.uaData.forEach((el) => {
      if (el.ua === ua_id) {
        //console.log(ev["status"], el.ua);
        el["status"] = ev["status"];
        el["rejectReason"] = ev["rejectReason"];
      }
    });
    this.waterRejenuvation.value.uaData.forEach((element) => {
      if (element["status"] === "REJECTED") {
        this.waterRejenuvation.value["status"] = "REJECTED";
      } else {
        this.waterRejenuvation.value["status"] = "APPROVED";
      }
    });
   // console.log("after", this.waterRejenuvation.value);
  }

  latLong(value, event, type) {
    let val;
    val = parseInt(value);
    if (isNaN(val)) {
      // event.controls[type].patchValue(0.0);
      return;
    }
    val = value.split(".")
    if (val[1] && val[1].length > 6) {
      val[1] = val[1].slice(0, 6)
    }
    if (val[0].length > 4) {
      val[0] = val[0].slice(0, 4)
    }
    event.controls[type].patchValue(val[0] + (val[1] ? "." + val[1] : ""));
  }
  getIndicatorLineItem(){
    let queryParam = {
      type: 'water supply'
    }
    this.fcCommonService.formGetMethod('indicatorLineItem', queryParam).subscribe((res:any)=>{
    //  console.log('indicatorLineItem', res);
      this.waterIndicators = res?.data;
      
    },
    (error)=>{
      swal("Error", "No indicator found for slb table, please refresh the page", "error")
    }
    )
  //  BASE_URL/indicatorLineItem
  }
}

function deepEqual(x, y) {
  const ok = Object.keys,
    tx = typeof x,
    ty = typeof y;
  return x && y && tx === "object" && tx === ty
    ? ok(x).length === ok(y).length &&
    ok(x).every((key) => deepEqual(x[key], y[key]))
    : x === y;
}
