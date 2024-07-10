import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonServicesService } from "../../fc-shared/service/common-services.service";
import { queryParam } from "src/app/fc-grant-2324-onwards/fc-shared/common-interface";
import { SweetAlert } from "sweetalert/typings/core";
import { ActivatedRoute, Router } from "@angular/router";
const swal: SweetAlert = require("sweetalert");
@Component({
  selector: "app-annual-account",
  templateUrl: "./annual-account.component.html",
  styleUrls: ["./annual-account.component.scss"],
})
export class AnnualAccountComponent implements OnInit {
  @ViewChild("webForm") webForm;

  constructor(
    private commonServices: CommonServicesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.designYearArray = JSON.parse(localStorage.getItem("Years"));
    // this.sideMenuItem = JSON.parse(localStorage.getItem("leftMenuRes"));
    this.getQueryParams();
    this.ulbId = this.userData?.ulb;
    if (!this.ulbId) {
      this.ulbId = localStorage.getItem("ulb_id");
    }
    this.getNextPreUrl();
    
  }
  cf_ulb = true;
  // annual-accounts/get?ulb=5dd006d4ffbcc50cfd92c87c&design_year=606aafc14dff55e6c075d3ec&
  ulbId: string = "";
  userData: object | any;
  designYearArray = [];
  getQuery: queryParam = {
    design_year: null,
    formId: null,
    ulb: null,
  };

  formName: string = "annual_accounts";
  fileFolderName: string = "";
  postData = {};
  questionResponse: any = {
    timestamp: 1621316934,
    success: true,
    message: "Form Questionare!",
    data: [ 
    ],
  };
  endpoints: string = "annual-accounts/get";
  isApiComplete: boolean = false;
  finalSubmitMsg: string = `Are you sure you want to submit this form? Once submitted,
  it will become uneditable and will be sent to State for Review.
   Alternatively, you can save as draft for now and submit it later.`;
  statusId: number = 1;
  isButtonAvail: boolean = true;
  isFormDisable: boolean = false;
  formId: number = null;
  nextPreUrl = {
    nextBtnRouter: "",
    backBtnRouter: "",
  };
  sideMenuItem: object | any;
  leftMenuSubs: any;
  actionPayLoad = [];
  canTakeAction: boolean = false;
  reviewShortKeyArray = [];
  actionResFile = {
    tab_audited:{
      responseFile: {url: '', name :''},
      responseFile_mohua: {url: '', name :''}
    },
    tab_unAudited:{
      responseFile: {url: '', name :''},
      responseFile_mohua: {url: '', name :''}
    }
  };
  selectedYearId:string = "";
  selectedYear:string="";
  ngOnInit(): void {
    this.getQuery = {
      // design_year: this.designYearArray["2023-24"],
       design_year:this.selectedYearId,
       formId: 5,
       ulb: this.ulbId,
     };
    this.leftMenuSubs = this.commonServices.ulbLeftMenuComplete.subscribe(
      (res) => {
        if (res == true) {
          this.getNextPreUrl();
        }
      }
    );
    //this.getActionRes();
    this.isApiComplete = false;
    this.onload();
  }

  get hasUnsavedChanges() {
    return this.webForm?.hasUnsavedChanges;
  }

  onload() {
    this.commonServices.formGetMethod(this.endpoints, this.getQuery).subscribe(
      (res: any) => {
        console.log("res.........", res);
        this.questionResponse.data = res.data;
        this.canTakeAction = res?.data[0]?.canTakeAction;
        //  if(res.data[0] && res.data[0].statusId && (res.data[0].statusId == 3 || res.data[0].statusId == 4)){
        for (let el of res.data[0]?.language[0].question) {
          console.log("qus el el", el);
          if (el && el.statusId && el.statusId != 2) {
            if (el?.reviewShortKey == "tab_audited" && el?.value == 2) {
              el["isReview"] = true;
              el.errorInAction = false;
              this.preparingActionPayload(el);
              this.reviewShortKeyArray.push(el.reviewShortKey);
            } else if (el?.reviewShortKey == "tab_audited" && el?.value == 1) {
              el["isReview"] = false;
            } else if (el?.reviewShortKey == "tab_unAudited" && el?.value == 2) {
              el["isReview"] = true;
              el.errorInAction = false;
              this.preparingActionPayload(el);
              this.reviewShortKeyArray.push(el.reviewShortKey);
            } else if (el?.reviewShortKey == "tab_unAudited" && el?.value == 1) {
              el["isReview"] = false;
            } else if (
              el?.isReview &&
              el?.canTakeAction &&
              el?.reviewShortKey != "tab_unAudited" &&
              el?.reviewShortKey != "tab_audited"
            ) {
              el.errorInAction = false;
              this.preparingActionPayload(el);
              this.reviewShortKeyArray.push(el.reviewShortKey);
            }
          }
        }
        //   }
        console.log("annual accounts", this.actionPayLoad);

        this.formDisable(res?.data[0]);
        console.log("res.........22", this.questionResponse);
        this.questionResponse = {
          ...JSON.parse(JSON.stringify(this.questionResponse)),
        };
        this.isApiComplete = true;
        this.getActionRes();
      },
      (error) => {
        console.log("error", error);
      }
    );
  }
  resData(e) {
    console.log("ResData..................", e);
    let finalData = e?.finalData;
    if (e?.isSaveAsDraft == false) {
      this.alertForFianlSubmit(finalData, e?.isSaveAsDraft);
    } else {
      this.onSave(finalData, e?.isSaveAsDraft);
    }
  }

  onSave(finalData, draft) {
    if (draft == false) {
      this.statusId = 3;
    } else {
      this.statusId = 2;
    }
    this.postData = {
      design_year: this.selectedYearId,
      ulb: this.ulbId,
      isDraft: draft,
      formId: this.formId,
      status: this.statusId,
      data: finalData,
    };

    this.commonServices
      .formPostMethod(this.postData, "annual-accounts/create")
      .subscribe(
        (res) => {
          this.webForm.hasUnsavedChanges = false;
          this.commonServices.setFormStatusUlb.next(true);
          this.isApiComplete = false;
          this.resetActionFile();
          this.onload();
          swal(
            "Saved",
            `Data saved ${draft ? "as draft" : ""} successfully`,
            "success"
          );
          console.log(res);
        },
        (error) => {
          console.log("post error", error);
          swal('Error', error?.message ?? 'Something went wrong', 'error');
        }
      );
  }
  alertForFianlSubmit(finalData, draft) {
    swal("Confirmation !", `${this.finalSubmitMsg}`, "warning", {
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
    }).then((value) => {
      switch (value) {
        case "submit":
          this.onSave(finalData, false);
          break;
        case "draft":
          this.onSave(finalData, true);
          break;
        case "cancel":
          break;
      }
    });
  }

  getActionRes() {
    this.isApiComplete = false;
    this.commonServices
      .formPostMethod(this.getQuery, "common-action/getMasterAction")
      .subscribe(
        (res: any) => {
          console.log("action get res annual", res);
          this.isApiComplete = true;
          if(res?.data["STATE"]){
            for (let el of res.data["STATE"]) {
              if ((el.shortKey == "tab_audited" || el.shortKey == "audited.bal_sheet") && el?.responseFile?.url) {
                  this.actionResFile["tab_audited"]['responseFile'] = el.responseFile;
              }
              if ((el.shortKey == "tab_unAudited" || el.shortKey == "unAudited.bal_sheet") && el?.responseFile?.url) {
                  this.actionResFile["tab_unAudited"]["responseFile"] = el.responseFile;
                }
            }
          }
          if(res?.data["MoHUA"]){
            for (let el of res.data["MoHUA"]) {
              if ( (el.shortKey == "tab_audited" || el.shortKey == "audited.bal_sheet") && el?.responseFile?.url) {
                  this.actionResFile["tab_audited"]["responseFile_mohua"] = el.responseFile;
              }
              if ((el.shortKey == "tab_unAudited" || el.shortKey == "unAudited.bal_sheet") && el?.responseFile?.url) {
                  this.actionResFile["tab_unAudited"]["responseFile_mohua"] = el.responseFile;
              }
            }
          }
         
          console.log("action get res annual 123", this.actionResFile);
        },
        (err) => {
          console.log("err action get");
          this.isApiComplete = true;
        }
      );
  }
  formDisable(res) {
    if(!res) return;
    this.isButtonAvail = this.commonServices.formDisable(res, this.userData);
    this.isFormDisable = !this.isButtonAvail;
  }
  saveAction(data) {
    if (data == true) {
      this.commonServices.setFormStatusUlb.next(true);
      this.onload();
    }
    console.log("action data", data);
  }

  getNextPreUrl() {
    this.sideMenuItem = JSON.parse(localStorage.getItem("leftMenuULB"));
    for (const key in this.sideMenuItem) {
      this.sideMenuItem[key].forEach((ele) => {
        if (ele?.folderName == "annual_accounts") {
          this.nextPreUrl = {
            nextBtnRouter: ele?.nextUrl,
            backBtnRouter: ele?.prevUrl,
          };
          this.formId = ele?.formId;
        }
      });
    }
  }
  nextPreBtn(e) {
    let url =
      e?.type == "pre" ? this.nextPreUrl?.backBtnRouter : this.nextPreUrl?.nextBtnRouter;
    // added year id in route
      this.router.navigate([`/ulb-form/${this.selectedYearId}/${url.split('/')[1]}`]);
   // this.router.navigate([`/ulb-form/${url.split("/")[1]}`]);
  }
  ngOnDestroy(): void {
    this.leftMenuSubs.unsubscribe();
  }

  preparingActionPayload(question) {
    let actionObj = {
      shortKey: question?.reviewShortKey,
      status: "",
      rejectReason: "",
      responseFile: {
        url: "",
        name: "",
      },
    };

    this.actionPayLoad.push(actionObj);
  }
  resetActionFile(){
    this.actionResFile = {
      tab_audited:{
        responseFile: {url: '', name :''},
        responseFile_mohua: {url: '', name :''}
      },
      tab_unAudited:{
        responseFile: {url: '', name :''},
        responseFile_mohua: {url: '', name :''}
      }
    };
  }

  getQueryParams() {
     const yearId = this.route.parent.snapshot.paramMap.get('yearId'); // get the 'id' query parameter
     this.selectedYearId = yearId ? yearId : sessionStorage.getItem("selectedYearId");
     this.selectedYear = this.commonServices.getYearName(this.selectedYearId);
     this.fileFolderName = `${this.userData?.role}/${this.selectedYear}/${this.formName}/${this.userData?.ulbCode}`;
  }
}
