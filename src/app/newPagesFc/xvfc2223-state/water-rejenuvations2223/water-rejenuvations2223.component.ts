import { Component, OnInit, TemplateRef, ViewChild } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
  FormArray,
} from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { SweetAlert } from "sweetalert/typings/core";
import { ImagePreviewComponent } from "../../../pages/ulbform/utilisation-report/image-preview/image-preview.component";
import { MapDialogComponent } from "../../../shared/components/map-dialog/map-dialog.component";
import { DataEntryService } from "src/app/dashboard/data-entry/data-entry.service";
import { HttpEventType, JsonpClientBackend } from "@angular/common/http";
import { Router, NavigationStart, Event } from "@angular/router";
import { UserUtility } from "src/app/util/user/user";
import { USER_TYPE } from "src/app/models/user/userType";
import { IUserLoggedInDetails } from "../../../models/login/userLoggedInDetails";
import { ProfileService } from "src/app/users/profile/service/profile.service";
import { WaterRejenuvations2223ServiceService } from "./water-rejenuvations2223-service.service";
import { StateformsService } from "src/app/pages/stateforms/stateforms.service";
import { WaterRejenuvations2223PreviewComponent } from "./water-rejenuvations2223-preview/water-rejenuvations2223-preview.component";
import { StateDashboardService } from "src/app/pages/stateforms/state-dashboard/state-dashboard.service";
import { NewCommonService } from "src/app/shared2223/services/new-common.service";
import { environment } from "src/environments/environment";
const swal: SweetAlert = require("sweetalert");

@Component({
  selector: 'app-water-rejenuvations2223',
  templateUrl: './water-rejenuvations2223.component.html',
  styleUrls: ['./water-rejenuvations2223.component.scss']
})
export class WaterRejenuvations2223Component implements OnInit {
  userLoggedInDetails: IUserLoggedInDetails;
  // loggedInUserType: USER_TYPE;
  projectIndex: any;
  change = '';
  @ViewChild("ipt") ipt: any;
  @ViewChild("clearFiles") clearFiles: any;
  errorMessegeStateAct: any = '';
  stateActFileName;
  stateActUrl = ''
  showStateAct:boolean = false;
  filesToUpload: Array<File> = [];
  filesAlreadyInProcess: number[] = [];
  subscription: any;
  fileUploadTracker: {
    [fileIndex: number]: {
      alias?: string;
      percentage?: number;
      status: "in-process" | "FAILED" | "completed";
    };
  } = {};
  body = {};
  flagg = 0;
  stateId;
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  USER_TYPE = USER_TYPE;
  loggedInUserType = this.loggedInUserDetails.role;
  formDisable = false;
  actionFormDisable = false;
  design_year = "";
  disableAddMore1 = false
  disableAddMore2 = false
  disableAddMore3 = false
  disableUAs = []
  disableActionUAs = []
  toggle: boolean = true
  toggle1: boolean = true
  toggle2: boolean = true
  @ViewChild("templateSave") template;
  routerNavigate = null;
  saveClicked = false;
  showLoader = true;
  data;
  waterRejenuvation: FormGroup;
  maxPhotos = 5;
  photosArray = [];
  errorPhotosArray = [];
  isDraft = null;
  totalStatus = "PENDING";
  errorOnload = false;
  formStatus;
  submitted = false
  UANames = [];
  uasList
  userData = JSON.parse(localStorage.getItem("userData"));
  Year = JSON.parse(localStorage.getItem("Years"));
  uasData = JSON.parse(sessionStorage.getItem("UasList"));
  latLongRegex = "^-?([0-8]?[0-9]|[0-9]0)\\.{1}\\d{1,6}";
  disableUpload: boolean = true
  isPreYear = false;
  preMess = '';
  isLoadingError = true;
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
  wData;
  isDisabled = false;
  errorMsg = "One or more required fields are empty or contains invalid data. Please check your input.";
  clickedSave;
  alertError;
  dialogRef;
  canTakeAction:boolean = false;
  actionError = false;
  actionBtnDis = false;
  actionRes;
  isApiInProgress = true;
  sideMenuItem;
backRouter = '';
nextRouter = '';
completeWaterRejData: any | object;
storageBaseUrl:string = environment?.STORAGE_BASEURL;

  constructor(
    private fb: FormBuilder,
    private waterRejenuvationService: WaterRejenuvations2223ServiceService,
    private dialog: MatDialog,
    private dataEntryService: DataEntryService,
    private _router: Router,
    public _stateformsService: StateformsService,
    private profileService: ProfileService,
    public stateDashboardService: StateDashboardService,
    public newCommonService: NewCommonService,

  ) {
    this.initializeUserType();
    // this.id = sessionStorage.getItem("sessionID");
    this.stateId = this.userData?.state;
    if (!this.stateId) {
      this.stateId = localStorage.getItem("state_id");
    }
    this.getIndicatorLineItem();
    this.navigationCheck();

  }

  ngOnInit() {
    this.sideMenuItem = JSON.parse(localStorage.getItem("leftStateMenuRes"));
    this.setRouter();
    this.design_year = this.Year["2022-23"];
    this.setUaList();
 //   this.checkValidation();


  //  this.getFormData()
  }

  indicatorSet(event, index, rowIndex) {
    console.log(event.target.value, rowIndex)
    let indicatorValue = event.target.value

    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
    console.log(uaDataAtIndex._id);
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['serviceLevelIndicators']['controls'][rowIndex]['controls']['indicator'].patchValue(indicatorValue)
      }
    }
    console.log(this.waterRejenuvation)
    // this.checkDiff();
  }
  private initializeUserType() {
    this.loggedInUserType = this.profileService.getLoggedInUserType();
    console.log('loggedInUserType', this.loggedInUserType);
  }

  public initializeReport() {
    this.waterRejenuvation = this.fb.group({
      state: this.fb.control(this.stateId, [Validators.required]),
      design_year: this.fb.control(this.Year["2022-23"], [Validators.required]),
      uaData: this.fb.array(this.getUas()),
      status: this.fb.control(this.totalStatus, []),
   //   isDraft: this.fb.control(this.isDraft, []),
      declaration: this.fb.group({
        url: ['', Validators.required],
        name: ['', Validators.required]
      }),
    });

    this.patchSimValue();
    if (this.isDraft == false) {
      this.waterRejenuvation.disable();
      this.isDisabled = true;
      this.disableAddMore1 = true;
      this.disableAddMore2 = true;
      this.disableAddMore3 = true;
    }
   this.changesDetection();
    //this.disablePreviousInput();
    console.log('form init...', this.waterRejenuvation);


  }
  patchSimValue() {
    this.waterRejenuvation?.controls?.declaration.patchValue({
      url: this.wData?.declaration?.url,
      name: this.wData?.declaration?.name,
    })
  }
  changesDetection() {
    this.waterRejenuvation.valueChanges.subscribe((change) => {
      sessionStorage.setItem("changeInWaterRejenuvation2223", "true");
      let data = sessionStorage.getItem("waterRejenuvationData");
      let uaData = this.waterRejenuvation.getRawValue().uaData
      if (change.uaData.length != uaData.length) {
        change.uaData = uaData;
      }
      change.uaData.forEach((element) => {
        delete element.foldCard;
      });
      // console.log(deepEqual(change, JSON.parse(data)));
      // console.log(JSON.stringify(change), JSON.stringify(JSON.parse(data)))
      if (!deepEqual(change, JSON.parse(data))) {
      //  sessionStorage.setItem("changeInWaterRejenuvation2223", "true");
        // this.checkDiff();
      } else {
      //  sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
      }
    });
    setTimeout(()=>{
      sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
    },100)

    this.uasData = JSON.parse(sessionStorage.getItem("UasList"));
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

  getUas() {
    console.log("rejen heading...", this.data);
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

  setUaList(){
    this.stateDashboardService.getCardData(this.stateId).subscribe(
      (res) => {
        let newList = {};
        res["data"]["uaList"].forEach((element) => {
          this.UANames.push(element.name)
          newList[element._id] = element;
        });
        sessionStorage.setItem("UasList", JSON.stringify(newList));
        this.uasList = Object.values(JSON.parse(sessionStorage.getItem("UasList")))
        this.uasData = JSON.parse(sessionStorage.getItem("UasList"));
        this.loadData();

      },
      (err) => {
        console.log(err);
      }
    );
  }

  getWaterBodies(dataArray) {
    console.log('dataArray dataArray', dataArray);
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
        dprPreparation: this.fb.control((data?.dprPreparation ? data?.dprPreparation : ""), [
          Validators.required,
          // Validators.min(1),
        ]),
        dprCompletion: this.fb.control((data?.dprCompletion ? data?.dprCompletion : ""), [
          // Validators.required,
          // Validators.min(1),
        ]),
        workCompletion: this.fb.control((data?.workCompletion ? data?.workCompletion : ""), [
          //Validators.required,

        ]),
        isDisable: this.fb.control(data?.isDisable, [
         // Validators.required,
          // Validators.min(1),
        ]),
      })
    );
  }

  getPhotos(dataArray) {
    return dataArray?.map((data) =>
      this.fb.group({
        url: this.fb.control(data?.url, [Validators.required]),
        name: this.fb.control(data?.name, [Validators.required]),
      })
    );
  }

  getServiceLevelIndicator(dataArray) {
    console.log(dataArray)
    return dataArray?.map((data) =>
      this.fb.group({
        name: this.fb.control(data.name, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        component: this.fb.control(data.component, [
          Validators.required,
          Validators.maxLength(200),
        ]),
        indicator: this.fb.control(data.indicator, [
          Validators.required,

        ]),
        existing: this.fb.control(data.existing, [
          Validators.required,

        ]),
        after: this.fb.control(data.after, [
          Validators.required,
          Validators.min(1),
        ]),
        cost: this.fb.control(data.cost, [
          Validators.required,
          Validators.min(1),
        ]),
        dprPreparation: this.fb.control((data?.dprPreparation ? data?.dprPreparation : ""), [
          Validators.required,
          // Validators.min(1),
        ]),
        dprCompletion: this.fb.control((data?.dprCompletion ? data?.dprCompletion : ""), [
        //  Validators.required,
          // Validators.min(1),
        ]),
        workCompletion: this.fb.control((data?.workCompletion ? data?.workCompletion : ""), [
         // Validators.required,
          // Validators.min(1),
        ]),
        isDisable: this.fb.control(data?.isDisable, [
          Validators.required,
          // Validators.min(1),
        ]),

      })

    );
  }
  getReuseWater(dataArray) {
    return dataArray?.map((data) =>
      this.fb.group({
        name: this.fb.control(data.name, [
          Validators.required,
          Validators.maxLength(50),
        ]),
        treatmentPlant: this.fb.control(data.treatmentPlant, [
          Validators.required,
          Validators.maxLength(50),
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
        dprPreparation: this.fb.control((data?.dprPreparation ? data?.dprPreparation : ""), [
          Validators.required,
          // Validators.min(1),
        ]),
        dprCompletion: this.fb.control((data?.dprCompletion ? data?.dprCompletion : ""), [
         // Validators.required,
          // Validators.min(1),
        ]),
        workCompletion: this.fb.control((data?.workCompletion ? data?.workCompletion : ""), [
         // Validators.required,
          // Validators.min(1),
        ]),
        isDisable: this.fb.control(data?.isDisable, [
          Validators.required,
          // Validators.min(1),
        ]),
      })

    );
  }
  // enableFieldForMohua(){
  //   let uaDataAtIndex = this.projectIndex
  //   for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

  //     if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
  //       el['controls']['reuseWater'].patchValue(el['controls']['reuseWater'].push(this.fb.group({
  //         name: this.fb.control(null, [
  //           Validators.required,
  //           Validators.maxLength(25),
  //         ]),
  //         treatmentPlant: this.fb.control(null, [
  //           Validators.required,
  //           Validators.maxLength(25),
  //         ]),
  //         targetCust: this.fb.control(null, [
  //           Validators.required,
  //           Validators.maxLength(300),
  //         ]),
  //         lat: this.fb.control(null, [
  //           Validators.required,
  //           Validators.pattern(this.latLongRegex)
  //         ]),
  //         long: this.fb.control(null, [
  //           Validators.required,
  //           Validators.pattern(this.latLongRegex)
  //         ]),
  //         stp: this.fb.control(null, [
  //           Validators.required,
  //           Validators.min(1),
  //         ]),
  //         dprCompletion: this.fb.control(null, [
  //           Validators.required,
  //           // Validators.min(1),
  //         ]),
  //         workCompletion: this.fb.control(null, [
  //           Validators.required,
  //           // Validators.min(1),
  //         ]),
  //         disable: false
  //       })
  //       ))
  //     }
  //   }
  // }

  loadData() {
    console.log('ggggggg', this.uasData)
    this.isLoadingError = true;
    this.isApiInProgress = true;
    this.waterRejenuvationService.getData(this.Year["2022-23"], this.stateId).subscribe(
      (res) => {
        this.errorOnload = true;
        this.isPreYear = true;
        this.isApiInProgress = false;
        this.completeWaterRejData = res["data"];
        this.data = res["data"]["uaData"];
        this.wData = res["data"];
        if (this.wData?.declaration?.url && this.wData?.declaration?.name) {
          this.showStateAct = true;
          this.stateActFileName = this.wData?.declaration?.name;
          this.stateActUrl = this.wData?.declaration?.url;
        }
        this.isDraft = res["data"].isDraft;
        this.totalStatus = res["data"].status;
        this.storeData(res["data"]);
        this.showLoader = false;
        console.log("water rej data", this.data);
        this.initializeReport();
        this.setSkipLogic(this.data);
        this.isLoadingError = false;
        // resolve("ss");
      },
      (err) => {
        this.showLoader = false;
        // this.data = [];
        this.isApiInProgress = false;
        this.preMess = err?.error?.message;
        this.isPreYear = false;
        this.isLoadingError = true;
        // for (const key in this.uasData) {
        //   this.data.push({
        //     ua: key,
        //     waterBodies: [
        //       {
        //         name: null,
        //         area: null,
        //         nameOfBody: null,
        //         lat: null,
        //         long: null,
        //         photos: [],
        //         bod: null,
        //         cod: null,
        //         do: null,
        //         tds: null,
        //         turbidity: null,
        //         bod_expected: null,
        //         cod_expected: null,
        //         do_expected: null,
        //         tds_expected: null,
        //         turbidity_expected: null,
        //         details: null,
        //         dprCompletion: null,
        //         workCompletion: null
        //       },
        //       {
        //         name: null,
        //         area: null,
        //         nameOfBody: null,
        //         lat: null,
        //         long: null,
        //         photos: [],
        //         bod: null,
        //         cod: null,
        //         do: null,
        //         tds: null,
        //         turbidity: null,
        //         bod_expected: null,
        //         cod_expected: null,
        //         do_expected: null,
        //         tds_expected: null,
        //         turbidity_expected: null,
        //         details: null,
        //         dprCompletion: null,
        //         workCompletion: null
        //       },
        //       {
        //         name: null,
        //         area: null,
        //         nameOfBody: null,
        //         lat: null,
        //         long: null,
        //         photos: [],
        //         bod: null,
        //         cod: null,
        //         do: null,
        //         tds: null,
        //         turbidity: null,
        //         bod_expected: null,
        //         cod_expected: null,
        //         do_expected: null,
        //         tds_expected: null,
        //         turbidity_expected: null,
        //         details: null,
        //         dprCompletion: null,
        //         workCompletion: null
        //       },
        //     ],
        //     reuseWater: [
        //       {
        //         name: null,
        //         treatmentPlant: null,
        //         targetCust: null,
        //         lat: null,
        //         long: null,
        //         stp: null,
        //         dprCompletion: null,
        //         workCompletion: null
        //       },

        //     ],
        //     serviceLevelIndicators: [
        //       {
        //         name: null,
        //         component: null,
        //         indicator: null,
        //         existing: null,
        //         after: null,
        //         cost: null,
        //         dprCompletion: null,
        //         workCompletion: null
        //       }
        //     ]

        //   });
        // }

      }
    );
    // return new Promise((resolve, reject) => {

    // });
  }
  setSkipLogic(data){
    for(let i=0; i < data.length; i++){
      let uaItem = this.data[i];
      let len = uaItem?.waterBodies?.length;
      for(let j = 0; j< len; j++) {
        let dprVal = uaItem?.waterBodies[j]?.dprPreparation;
        this.onChange(dprVal, j, 'waterB', i)
        if(dprVal == 'Yes'){
          let comVal = uaItem?.waterBodies[j]?.dprCompletion
          this.onChange(comVal, j, 'waterBCom', i)
        }
      }
      let lenRej = uaItem?.reuseWater?.length;
      for(let j = 0; j < lenRej; j++) {
        let dprVal = uaItem?.reuseWater[j]?.dprPreparation;
        this.onChange(dprVal, j, 'rWater', i)
        if(dprVal == 'Yes'){
          let comVal = uaItem?.reuseWater[j]?.dprCompletion;
          this.onChange(comVal, j, 'rWaterCom', i)
        }
      }
      let lenSev = uaItem?.reuseWater?.length;
      for(let j = 0; j< lenSev; j++) {
        let dprVal = uaItem?.serviceLevelIndicators[j]?.dprPreparation;
        this.onChange(dprVal, j, 'sWater', i)
        if(dprVal == 'Yes'){
          let comVal = uaItem?.serviceLevelIndicators[j]?.dprCompletion;
          this.onChange(comVal, j, 'sWaterCom', i)
        }
      }
    }

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
    let toStore = {
      state: data.state,
      design_year: data.design_year,
      uaData: data.uaData,
      status: data.status,
      isDraft: data.isDraft,
    };
    sessionStorage.setItem("waterRejenuvationData", JSON.stringify(toStore));
  }
  getDisableRow(pRow) {
    //  console.log('prow...', pRow);
    return pRow?.value?.isDisable;
    // return false
  }
  addRow2(index) {
    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
    this.projectIndex = uaDataAtIndex
    console.log('22222222222222222222', uaDataAtIndex._id);
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        if (el['controls']['reuseWater'].length > 9) {
          this.disableAddMore1 = true;
          return swal('Maximum 10 Rows can be added.')
        }
      }
    }
    console.log(this.data)
    console.log(this.waterRejenuvation['controls']['uaData']['controls'])
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['reuseWater'].push(this.fb.group({
          name: this.fb.control({ value: null, disabled: false }, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          treatmentPlant: this.fb.control({ value: null, disabled: false }, [
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
          dprPreparation: this.fb.control('', [
            Validators.required,
            // Validators.min(1),
          ]),
          dprCompletion: this.fb.control('', [
           // Validators.required,
            // Validators.min(1),
          ]),
          workCompletion: this.fb.control('', [
           // Validators.required,
            // Validators.min(1),
          ]),
          isDisable: this.fb.control(false, [
            Validators.required,
            // Validators.min(1),
          ]),
        })
        )
      }
    }
  }
  addRow3(index) {
    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
    console.log(uaDataAtIndex._id);
    console.log(this.data)
    console.log('1111111', uaDataAtIndex._id);
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
        el['controls']['serviceLevelIndicators'].push(
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
            dprPreparation: this.fb.control('', [
              Validators.required,
              // Validators.min(1),
            ]),
            dprCompletion: this.fb.control('', [
            //  Validators.required,
              // Validators.min(1),
            ]),
            workCompletion: this.fb.control('', [
            //  Validators.required,
              // Validators.min(1),
            ]),
            isDisable: this.fb.control(false, [
              Validators.required,
              // Validators.min(1),
            ]),
          })
        )
      }
    }
  }
  addRow1(index) {
    console.log('aaaa da', this.data)
    console.log('aaaa da 22321', this.waterRejenuvation)
    let uaDataAtIndex = this.uasData[this.Uas[index].value["ua"]];
    console.log(uaDataAtIndex._id);
    console.log('333333333333', uaDataAtIndex._id);
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        if (el['controls']['waterBodies'].length > 9) {
          this.disableAddMore3 = true;
          return swal('Maximum 10 Rows can be added.')
        }

      }
    }
    console.log(this.waterRejenuvation['controls']['uaData']['controls'])
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {
      if (el['controls']['ua']['value'] == uaDataAtIndex._id && el['controls']['waterBodies']) {
        console.log('aaa el el', el['controls']['waterBodies']);
        el['controls']['waterBodies'].push(
          this.fb.group({
            name: this.fb.control({ value: null, disabled: false }, [
              Validators.required,
              Validators.maxLength(25),
            ]),
            nameOfBody: this.fb.control({ value: null, disabled: false }, [
              Validators.required,
              Validators.maxLength(25),
            ]),
            area: this.fb.control(null, [
              Validators.required,

            ]),
            photos: this.fb.array([], [
              Validators.required,
            ]),
            lat: this.fb.control(null, [
              Validators.required,
              Validators.pattern(this.latLongRegex)
            ]),
            long: this.fb.control(null, [
              Validators.required,
              Validators.pattern(this.latLongRegex)
            ]),
            bod: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            bod_expected: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            cod: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            cod_expected: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            do: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            do_expected: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            tds: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            tds_expected: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            turbidity: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            turbidity_expected: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            details: this.fb.control(null, [
              Validators.required,
              // Validators.min(1),
            ]),
            dprPreparation: this.fb.control('', [
              Validators.required,
              // Validators.min(1),
            ]),
            dprCompletion: this.fb.control('', [
              Validators.required,
              // Validators.min(1),
            ]),
            workCompletion: this.fb.control('', [
             // Validators.required,
              // Validators.min(1),
            ]),
            isDisable: this.fb.control(false, [
              Validators.required,
              // Validators.min(1),
            ]),
          })
        )
      }
    }
    console.log('aa data', this.waterRejenuvation);

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
  deleteRow3(uaIndex, rowIndex) {
    let uaDataAtIndex = this.uasData[this.Uas[uaIndex].value["ua"]];
    for (let el of this.waterRejenuvation['controls']['uaData']['controls']) {

      if (el['controls']['ua']['value'] == uaDataAtIndex._id) {
        el['controls']['waterBodies'].removeAt(rowIndex);
        if (el['controls']['waterBodies'].length < 10) {
          this.disableAddMore3 = false
        }
      }
    }

  }
   onChange(val, pIndex, type, uaIndex) {
    console.log('radio', val, pIndex, type, uaIndex)
    if (type == 'waterB') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.waterBodies?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.dprCompletion.setValidators(Validators.required);
        formSelector?.dprCompletion.updateValueAndValidity();
      } else {
        formSelector?.dprCompletion.reset();
        formSelector?.workCompletion.reset();
        formSelector?.dprCompletion.clearValidators();
        formSelector?.dprCompletion.updateValueAndValidity();
        formSelector?.workCompletion.clearValidators();
        formSelector?.workCompletion.updateValueAndValidity();
      }
    }
    if (type == 'waterBCom') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.waterBodies?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.workCompletion.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);
        formSelector?.workCompletion.updateValueAndValidity();
      } else {
        formSelector?.workCompletion.reset();
        formSelector?.workCompletion.clearValidators();;
        formSelector?.workCompletion.updateValueAndValidity();

      }
    }

    if (type == 'rWater') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.reuseWater?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.dprCompletion.setValidators(Validators.required);
        formSelector?.dprCompletion.updateValueAndValidity();
      }else {
        formSelector?.dprCompletion.reset();
        formSelector?.workCompletion.reset();
        formSelector?.dprCompletion.clearValidators();;
        formSelector?.dprCompletion.updateValueAndValidity();
        formSelector?.workCompletion.clearValidators();;
        formSelector?.workCompletion.updateValueAndValidity();
      }
    }
    if (type == 'rWaterCom') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.reuseWater?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.workCompletion.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);;
        formSelector?.workCompletion.updateValueAndValidity();
      }else {
        formSelector?.workCompletion.reset();
        formSelector?.workCompletion.clearValidators();;
        formSelector?.workCompletion.updateValueAndValidity();
      }
    }
    if (type == 'sWater') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.serviceLevelIndicators?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.dprCompletion.setValidators(Validators.required);
        formSelector?.dprCompletion.updateValueAndValidity();
      } else {
        formSelector?.dprCompletion.reset();
        formSelector?.workCompletion.reset();
        formSelector?.dprCompletion.clearValidators();;
        formSelector?.dprCompletion.updateValueAndValidity();
        formSelector?.workCompletion.clearValidators();;
        formSelector?.workCompletion.updateValueAndValidity();
      }
    }
    if (type == 'sWaterCom') {
      let formSelector = this.waterRejenuvation.get("uaData").get(`${uaIndex}`)["controls"]?.serviceLevelIndicators?.controls[pIndex]?.controls;
      if (val == 'Yes') {
        formSelector?.workCompletion.setValidators([Validators.required, Validators.min(0), Validators.max(100)]);;
        formSelector?.workCompletion.updateValueAndValidity();
      } else {
        formSelector?.workCompletion.reset();
        formSelector?.workCompletion.clearValidators();;
        formSelector?.workCompletion.updateValueAndValidity();
      }
    }
    console.log('formvalue after selesadasdasctse', this.waterRejenuvation)
   }
  submit() {
    console.log(this.loggedInUserType);
  //  this.checkValidation();
    console.log('form status..........', this.waterRejenuvation);
    if (this.waterRejenuvation?.status == "INVALID") {
      swal("Missing Data !", `${this.errorMsg}`, "error");
      return;
    } else {
      swal(
        "Confirmation !",
        `Are you sure you want to submit this form? Once submitted,
         it will become uneditable and will be sent to MoHUA for Review.
          Alternatively, you can save as draft for now and submit it later.`,
        "warning",
        {
          buttons: {
            Submit: {
              text: "Submit",
              value: "submit",
            },
            Draft: {
              text: "Save as Draft",
              value: "draft",
            },
            Cancel: {
              text: "Cancel",
              value: "cancel",
            },
          },
        }
      ).then((value) => {
        switch (value) {
          case "submit":
            this.finalSubmit();
            break;
          case "draft":
            this.onDraft();
            break;
          case "cancel":
            break;
        }
      });
    }

  }

  finalSubmit() {
    let postBody = { ...this.waterRejenuvation.value, isDraft: false }
    if (this.loggedInUserType === "STATE") {
      // this.waterRejenuvation.controls.isDraft.patchValue(false);
      console.log(this.waterRejenuvation.controls);
      this.waterRejenuvationService
        .postWaterRejeData(postBody)
        .subscribe(
          (res: any) => {
            if (res && res.status) {
              console.log('latest post data water rej --->', res)
              swal({
                title: "Submitted",
                text: res?.message,
                icon: "success",
              });
              // this.getFormData();
              this.waterRejenuvation.disable();
              this.isDisabled = true;
              this.newCommonService.setStateFormStatus2223.next(true);
              sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
            } else {
              swal("Error", res?.message ? res?.message : "Error", "error");
            }
          },
          (err) => {
            swal("Error", "Error", "error");
          }
        );
    }
  }
  // saveStateAction() {
  //   let flag = 0;
  //   let draftFlag = 0;
  //   this.body = this.waterRejenuvation.value;
  //   this.body['uaData'].forEach(el => {
  //     if (el.status != 'APPROVED' && el.status != 'REJECTED') {
  //       draftFlag = 1;
  //     }

  //   })
  //   if (draftFlag) {
  //     this.body['isDraft'] = true;
  //   } else {
  //     this.body['isDraft'] = false;
  //   }
  //   console.log('isDraft of Water Rej', this.body['isDraft'])
  //   console.log("this.body", this.body);
  //   this.body['uaData'].forEach(el => {
  //     if (el['status'] == 'REJECTED' && !el.rejectReason) {
  //       flag = 1;
  //     }
  //   })
  //   if (flag) {
  //     swal("Providing Reason for Rejection is Mandatory for Rejecting a form.")
  //     this.flagg = 1;
  //     return;
  //   }

  //   this.waterRejenuvationService.postStateAction(this.body).subscribe(
  //     (res) => {
  //       swal("Record submitted successfully!");
  //       sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
  //       let status = JSON.parse(sessionStorage.getItem("allStatusStateForms"));
  //       status.steps.waterRejuventation.status = this.body["status"];
  //       status.steps.waterRejuventation.isSubmit = !this.body["isDraft"];
  //       status.actionTakenByRole = "MoHUA";
  //       this._stateformsService.allStatusStateForms.next(status);
  //       // this._router.navigate(["stateform/action-plan"]);
  //     },
  //     (error) => {
  //       swal("An error occured!");
  //       console.log(error.message);
  //     }
  //   );
  // }

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
  disablePreviousInput() {

    console.log('water form.....', this.waterRejenuvation);
    console.log('data....', this.data);
    let dataArray = this.data[0];
    for (let i = 0; i < dataArray?.waterBodies?.length; i++) {
      let data = dataArray?.waterBodies[i];
      if (data?.isDisable == false) {
        this.fb.group({
          name: this.fb.control(data.name, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          area: this.fb.control(data.area, [
            Validators.required,
            Validators.min(1),
          ]),
          nameOfBody: this.fb.control(data.nameOfBody, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          lat: this.fb.control(data.lat, [
            Validators.required,
            Validators.pattern(this.latLongRegex)
          ]),
          long: this.fb.control(data.long, [
            Validators.required,
            Validators.pattern(this.latLongRegex)

          ]),
          photos: this.fb.array(this.getPhotos(data.photos ? data.photos : []), [
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
          turbidity_expected: this.fb.control(data?.turbidity_expected, [
            Validators.required,
            Validators.min(1),
          ]),
          details: this.fb.control(data?.details, [
            Validators.required,
            Validators.maxLength(200),
          ]),
          dprCompletion: this.fb.control(data?.dprCompletion, [
            Validators.required,
            // Validators.min(1),
          ]),
          workCompletion: this.fb.control(data?.workCompletion, [
            Validators.required,
            // Validators.min(1),
          ]),
          isDisable: this.fb.control(data?.isDisable, [
            Validators.required,
            // Validators.min(1),
          ]),
        })
      } else {
        this.fb.group({
          name: this.fb.control({ value: data.name, disabled: true }, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          area: this.fb.control(data.area, [
            Validators.required,
            Validators.min(1),
          ]),
          nameOfBody: this.fb.control({ value: data?.nameOfBody, disabled: true }, [
            Validators.required,
            Validators.maxLength(25),
          ]),
          lat: this.fb.control({ value: data?.lat, disabled: true }, [
            Validators.required,
            Validators.pattern(this.latLongRegex)
          ]),
          long: this.fb.control({ value: data?.long, disabled: true }, [
            Validators.required,
            Validators.pattern(this.latLongRegex)

          ]),
          photos: this.fb.array(this.getPhotos(data.photos ? data.photos : []), [
            Validators.required,
          ]),
          bod: this.fb.control({ value: data?.bod, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          cod: this.fb.control({ value: data?.cod, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          do: this.fb.control({ value: data?.do, disabled: true }, [Validators.required, Validators.min(1)]),
          tds: this.fb.control({ value: data?.tds, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          turbidity: this.fb.control({ value: data?.turbidity, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          bod_expected: this.fb.control({ value: data?.bod_expected, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          cod_expected: this.fb.control({ value: data?.cod_expected, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          do_expected: this.fb.control({ value: data?.do_expected, disabled: true }, [Validators.required, Validators.min(1)]),
          tds_expected: this.fb.control({ value: data?.tds_expected, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          turbidity_expected: this.fb.control({ value: data?.turbidity_expected, disabled: true }, [
            Validators.required,
            Validators.min(1),
          ]),
          details: this.fb.control({ value: data?.details, disabled: true }, [
            Validators.required,
            Validators.maxLength(200),
          ]),
          dprCompletion: this.fb.control({ value: data?.dprCompletion, disabled: true }, [
            Validators.required,
            // Validators.min(1),
          ]),
          workCompletion: this.fb.control({ value: data?.workCompletion, disabled: true }, [
            Validators.required,
            // Validators.min(1),
          ]),
          isDisable: this.fb.control(data?.isDisable, [
            Validators.required,
            // Validators.min(1),
          ]),
        })
      }
    }
  }
  async onFileChange(event, waterIndex, uaIndex) {
    console.log('pic uplaod', event);
    if (this.formDisable) return
    this.photosArray = [];
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    let file = event.target.files[0];
    let fileExtension = file.name.split(".").pop();
    if(fileExtension != 'png' && fileExtension != 'jpg' && fileExtension != 'jpeg'){
      swal('Error', 'Please select "PNG" or "JPG", or "JPEG" type file', 'error')
      return
    }
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
      let folderName = `${this.userData?.role}/2022-23/projects_wss/${this.userData?.stateCode}`
      this.dataEntryService.newGetURLForFileUpload(name, type, folderName).subscribe(
        async (s3Response) => {
          const res = s3Response.data[0];
          await this.uploadFileToS3(file, res["url"], res["path"]);
          this.photosArray.push({ url: res["path"], name });
          resolve();
        },
        (err) => {
          console.log(err);
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



  async stay() {
    await this.dialogRef.close();
    this.dialog.closeAll();
    if (this.routerNavigate) {
      this.routerNavigate = null;
    }
  }
  async proceed() {
    this.dialogRef.close();
    this.dialog.closeAll();
    if (this.routerNavigate) {
      await this.onDraft();
      this._router.navigate([this.routerNavigate.url]);
      return;
    }
    await this.onDraft();
    return this._router.navigate(["stateform2223/water-rejenuvation"]);
  }
  async discard() {
    sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
    await this.dialogRef.close(true);
    if (this.routerNavigate) {
      this._router.navigate([this.routerNavigate.url]);
      return;
    }
  }
  onDraft() {
    console.log(this.design_year);
    let postBody = { ...this.waterRejenuvation.value, isDraft: true }
    console.log('post body', postBody);
      this.waterRejenuvationService
        .postWaterRejeData(postBody)
        .subscribe(
          (res:any) => {
            if (res && res.status) {
              console.log('latest post data water rej --->', res)
              // this.getFormData();
            swal({
              title: "Saved as draft",
              text: res?.message,
              icon: "success",
            });
            sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
              this.newCommonService.setStateFormStatus2223.next(true);
            } else {
              swal("Error", res?.message ? res?.message : "Error", "error");
            }
          },
          (err) => {
            swal("Error", "Error", "error");
          }
        );

  }

  alertClose() {
    this.stay();
  }
  saveButtonClicked() {
    this.submitted = true
    this.submit();
  }

  navigationCheck() {
    if (!this.clickedSave) {
      this._router.events.subscribe((event) => {
        if (event instanceof NavigationStart) {
          let changeInForm;
          this.alertError = "You have some unsaved changes on this page. Do you wish to save your data as draft?";
          changeInForm = sessionStorage.getItem("changeInWaterRejenuvation2223");
          // const changeInAnnual = sessionStorage.getItem("changeInAnnualAcc");
          if (event.url === "/" || event.url === "/login") {
            sessionStorage.setItem("changeInWaterRejenuvation2223", "false");
            return;
          }
          if (changeInForm === "true" && this.routerNavigate === null) {
            const currentRoute = this._router.routerState;
            this._router.navigateByUrl(currentRoute.snapshot.url, {
              skipLocationChange: true,
            });
            this.routerNavigate = event;
            this.dialog.closeAll();
            this.openDialog(this.template);
          }
        }
      });
    }
  }

  openDialog(template) {
    if (template == undefined) return;
    const dialogConfig = new MatDialogConfig();
    this.dialogRef = this.dialog.open(template, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log("result", result);
      // if (result === undefined) {
      //   if (this.routerNavigate) {
      //     // this.routerNavigate = null;
      //   }
      // }
    });
  }
  onPreview() {
    let change = sessionStorage.getItem("changeInWaterRejenuvation2223");
    if (change == "true")
      this.waterRejenuvation?.controls?.isDraft?.patchValue(!this.formStatus);
    let data = this.waterRejenuvation?.value;
    console.log(data);
    for (let index = 0; index < data?.uaData?.length; index++) {
      data.uaData[index].name = this.uasData[data?.uaData[index].ua]?.name;
    }
    data = {...data, previewYear: '2022-23', waterIndicators : this.waterIndicators}
    let dialogRef = this.dialog.open(WaterRejenuvations2223PreviewComponent, {
      data: data,
      height: "80%",
      width: "90%",
      panelClass: "no-padding-dialog",
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }

  checkErrorState(projectRow, val) {
    if (this.errorOnload) {
      return projectRow.controls[val]?.invalid;
    }
    return (
      projectRow.controls[val]?.invalid &&
      (projectRow.controls[val].dirty || projectRow.controls[val].touched)
    );
  }
  checkStatus(ev, ua_id) {
    console.log("mohua action in state", ev, ua_id);
    sessionStorage.setItem("changeInWaterRejenuvation2223", "true");
    console.log("before", this.waterRejenuvation.value);
    this.waterRejenuvation.value.state = this.stateId;
    this.waterRejenuvation.value.uaData.forEach((el) => {
      if (el.ua === ua_id) {
        console.log(ev["status"], el.ua);
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
    console.log("after", this.waterRejenuvation.value);
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

  uploadButtonClicked(formName) {
    // sessionStorage.setItem("changeInWaterRejenuvation2223", "true")
    // this.change = "true";
  }

  fileChangeEvent(event, progessType) {
    console.log(progessType)
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    if(progessType == 'stateActProgress'){
      if (((event.target.files[0]?.size) / 1048576) >= 5.1) {
        this.ipt.nativeElement.value = "";
        this.errorMessegeStateAct = 'File size should be less than 5Mb.'
        // this.stateFinance.controls.stateNotification.reset();
        const error = setTimeout(() => {
          this.showStateAct = false
          this.errorMessegeStateAct = ''
        }, 4000);
        return;
      }
    }
    const fileName = event.target.files[0].name;
      if (progessType == 'stateActProgress') {
        this.stateActFileName = event.target.files[0].name;
        this.showStateAct = true;
      }
      const filesSelected = <Array<File>>event.target["files"];
      this.filesToUpload.push(...this.filterInvalidFilesForUpload(filesSelected));
      this.upload(progessType, fileName);
      sessionStorage.setItem("changeInWaterRejenuvation2223", "true")
      this.change = "true"

  }
  clearFile(type: string = '') {
    if(type == 'stateAct'){
    this.ipt.nativeElement.value = "";
      this.showStateAct = false;
      this.stateActFileName = ''
      this.waterRejenuvation.patchValue({
        declaration:{
          url:'',
          name: ''
       }
      });
      this.waterRejenuvation.controls.declaration['controls'].name.setValidators(Validators.required);
      this.waterRejenuvation.controls.declaration['controls'].name.updateValueAndValidity();
      // console.log(this.stateFinance.controls)
    }
    sessionStorage.setItem("changeInWaterRejenuvation2223", "true");
  }
  filterInvalidFilesForUpload(filesSelected: File[]) {
    const validFiles = [];
    for (let i = 0; i < filesSelected.length; i++) {
      const file = filesSelected[i];
      const fileExtension = file.name.split(`.`).pop();
      if (fileExtension === "pdf") {
        validFiles.push(file);
      } else {
        this.showStateAct = false
        swal("Only PDF File can be Uploaded.")
        return;
      }
    }
    return validFiles;
  }
  async upload(progessType, fileName) {
    const formData: FormData = new FormData();
    const files: Array<File> = this.filesToUpload;
    this[fileName] = files[0].name;
    console.log(files[0].name)
    let fileExtension = files[0].name.split('.').pop();
    console.log(fileExtension)
    this[progessType] = 10;
    sessionStorage.setItem("changeInWaterRejenuvation2223", "true")
    this.change = "true";
    for (let i = 0; i < files.length; i++) {
      if (this.filesAlreadyInProcess.length > i) {
        continue;
      }
      this.filesAlreadyInProcess.push(i);
      await this.uploadFiles(files[i], i, progessType, fileName);
    }
  }

  uploadFiles(file: File, fileIndex: number, progessType, fileName) {
    return new Promise((resolve, reject) => {
      let folderName = `${this.userData?.role}/2022-23/projects_wss/${this.userData?.stateCode}`
      this.dataEntryService.newGetURLForFileUpload(file.name, file.type, folderName).subscribe(
        (s3Response) => {
          let fileAlias = s3Response["data"][0]["path"];
          this[progessType] = Math.floor(Math.random() * 90) + 10;
          // if(progessType == 'rulesByLawsProgress'){
          //   this[progessType] = Math.floor(Math.random() * 90) + 10;
          // }
          const s3URL = s3Response["data"][0].url;
          this.uploadFilesToS3(
            file,
            s3URL,
            fileAlias,
            fileIndex,
            progessType
          );
          resolve("success")
        },
        (err) => {
          if (!this.fileUploadTracker[fileIndex]) {
            this.fileUploadTracker[fileIndex] = {
              status: "FAILED",
            };
            console.log(err)
          } else {
            this.fileUploadTracker[fileIndex].status = "FAILED";
            console.log(err)
          }
        }
      );
    })
  }
  private uploadFilesToS3(
    file: File,
    s3URL: string,
    fileAlias: string,
    fileIndex: number,
    progressType: string = ''
  ) {
    this.subscription = this.dataEntryService
      .uploadFileToS3(file, s3URL)
      .subscribe(
        (res) => {
          if (res.type === HttpEventType.Response) {
            this[progressType] = 100;

            if (progressType == 'stateActProgress') {
              this.stateActUrl = fileAlias;
              console.log(this.stateActUrl)
              this.waterRejenuvation.get('declaration').patchValue({
                url: fileAlias,
                name: file.name
              })
              sessionStorage.setItem("changeInWaterRejenuvation2223", "true");
              console.log(file)
              console.log(s3URL)
            }
          }
        },
        (err) => {
          this.fileUploadTracker[fileIndex].status = "FAILED";
          console.log(err);
        }
      );
  }
  // saveAction() {

  // }
  actionData(e, pIndex) {
    console.log('state action...water rej', e, pIndex)
    console.log('this.data', this.data);
    // if (e?.status == "APPROVED" || e?.status == "REJECTED") {
    //   this.actionError = false;
    // }
    this.data["uaData"][pIndex]["status"] = e?.status;
    this.data["uaData"][pIndex]["rejectReason"] = e?.rejectReason;
  }
  setRouter() {
    for (const key in this.sideMenuItem) {
      this.sideMenuItem[key].forEach((element) => {
        if (element?.url == "water-rejenuvation") {
          this.nextRouter = element?.nextUrl;
          this.backRouter = element?.prevUrl;
         // this.formId = element?._id;

        }
      });
    }
  }
warningForAmount(val){
  if(val < 10){
    swal('Alert !', `Project progress does not meet with conditions from operations guidelines para 9.2
     but ULB can still submit.`, 'warning');
  }
}

getIndicatorLineItem(){
  let queryParam = {
    type: 'water supply'
  }
  this.newCommonService.formGetMethod('indicatorLineItem', queryParam).subscribe((res:any)=>{
    console.log('indicatorLineItem', res);
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


