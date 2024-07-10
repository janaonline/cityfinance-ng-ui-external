import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { CommonServicesService } from '../../fc-shared/service/common-services.service';
import { queryParam } from 'src/app/fc-grant-2324-onwards/fc-shared/common-interface';

import { SweetAlert } from "sweetalert/typings/core";
const swal: SweetAlert = require("sweetalert");
@Component({
  selector: 'app-common-form',
  templateUrl: './common-form.component.html',
  styleUrls: ['./common-form.component.scss']
})
export class CommonFormComponent implements OnInit, OnDestroy {
  @ViewChild('webForm') webForm;

  constructor(
    private router: Router,
    private commonServices: CommonServicesService,
    private route: ActivatedRoute
  ) {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.designYearArray = JSON.parse(localStorage.getItem("Years"));
    // this.sideMenuItem = JSON.parse(localStorage.getItem("leftMenuRes"));
    this.ulbId = this.userData?.ulb;
    if (!this.ulbId) {
      this.ulbId = localStorage.getItem("ulb_id");
    }
    this.checkRouterForApi();
  //  this.getLeftMenu();
  }
  ulbId = '';
  userData: object | any;
  designYearArray = [];
  getQuery: queryParam = {
    design_year: '606aafc14dff55e6c075d3ec',
    formId: null,
    ulb: null
  };
  endPoints: string = null
  postData = {
  };
  formName: string = '';
  isApiComplete: boolean = false;
  ratingMarksArray = [];
  questionResponse: any = {
    timestamp: 1621316934,
    success: true,
    message: 'Form Questionare!',
    data: [
      {

          _id: '5f4656c92daa9921dc1173aa',
          formId: 2,
          "language": [
            // {
            //   "_id": "63fc56abd4434c05939ac5e9",
            //   "lng": "en",
            //   "question": [
            //     {
            //       "information": "",
            //       "_id": "63fc53dad4434c05939ac50c",
            //       "order": "1",
            //       "modelName": "Rating",
            //       "modelFilter": {
            //         "formName": "odf",
            //         "financialYear": ""
            //       },
            //       "answer_option": [
            //         {
            //           "name": "ODF",
            //           "did": [],
            //           "viewSequence": "1",
            //           "coordinates": [],
            //           "_id": "1"
            //         },
            //         {
            //           "name": "ODF+",
            //           "did": [],
            //           "viewSequence": "2",
            //           "coordinates": [],
            //           "_id": "2"
            //         },
            //         {
            //           "name": "ODF++",
            //           "did": [],
            //           "viewSequence": "3",
            //           "coordinates": [],
            //           "_id": "3"
            //         },
            //         {
            //           "name": "Non ODF",
            //           "did": [],
            //           "viewSequence": "4",
            //           "coordinates": [],
            //           "_id": "4"
            //         },
            //         {
            //           "name": "No Rating",
            //           "did": [],
            //           "viewSequence": "5",
            //           "coordinates": [],
            //           "_id": "5"
            //         }
            //       ],
            //       "title": "Open Defecation Free (ODF) Rating",
            //       "hint": "Single Select",
            //       "resource_urls": [],
            //       "label": "1",
            //       "shortKey": "odfRating",
            //       "viewSequence": "1",
            //       "child": [
            //         {
            //           "type": "11",
            //           "value": "^([1]|[2]|[3]|[4])$",
            //           "order": "3"
            //         },
            //         {
            //           "type": "14",
            //           "value": "^([1]|[2]|[3]|[4])$",
            //           "order": "6"
            //         },
            //         {
            //           "type": "11",
            //           "value": "^([5])$",
            //           "order": "2"
            //         }
            //       ],
            //       "parent": [],
            //       "validation": [
            //         {
            //           "_id": "1",
            //           "error_msg": ""
            //         }
            //       ],
            //       "restrictions": [],
            //       "input_type": "3",
            //       "weightage": [],
            //       "editable": false
            //     },
            //     {
            //       "information": "",
            //       "_id": "63fc5529d4434c05939ac521",
            //       "order": "2",
            //       "answer_option": [],
            //       "title": "Upload Declaration?",
            //       "hint": "Upload PDF",
            //       "resource_urls": [],
            //       "label": "2",
            //       "shortKey": "cert_declaration",
            //       "viewSequence": "2",
            //       "child": [],
            //       "parent": [
            //         {
            //           "value": "^([5])$",
            //           "type": "3",
            //           "order": "1"
            //         }
            //       ],
            //       "min": null,
            //       "max": null,
            //       "minRange": null,
            //       "maxRange": null,
            //       "pattern": "",
            //       "validation": [
            //         {
            //           "error_msg": "",
            //           "_id": "1"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "83",
            //           "value": "application/pdf"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "81",
            //           "value": "5120"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "82",
            //           "value": "1"
            //         }
            //       ],
            //       "restrictions": [],
            //       "input_type": "11",
            //       "editable": false,
            //       "weightage": []
            //     },
            //     {
            //       "information": "",
            //       "_id": "63fc556dd4434c05939ac535",
            //       "order": "3",
            //       "answer_option": [],
            //       "title": "Upload ODF Certificate?",
            //       "hint": "Upload PDF",
            //       "resource_urls": [],
            //       "label": "3",
            //       "shortKey": "cert",
            //       "viewSequence": "3",
            //       "child": [],
            //       "parent": [
            //         {
            //           "value": "^([1]|[2]|[3]|[4])$",
            //           "type": "3",
            //           "order": "1"
            //         }
            //       ],
            //       "min": null,
            //       "max": null,
            //       "minRange": null,
            //       "maxRange": null,
            //       "pattern": "",
            //       "validation": [
            //         {
            //           "error_msg": "",
            //           "_id": "1"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "83",
            //           "value": "application/pdf"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "81",
            //           "value": "5120"
            //         },
            //         {
            //           "error_msg": "",
            //           "_id": "82",
            //           "value": "1"
            //         }
            //       ],
            //       "restrictions": [],
            //       "input_type": "11",
            //       "editable": false,
            //       "weightage": []
            //     },
            //     {
            //       "information": "",
            //       "_id": "6405ee6e2638a6093d1b7123",
            //       "order": "6",
            //       "answer_option": [],
            //       "title": "Certification Issue Date",
            //       "hint": "Date",
            //       "resource_urls": [],
            //       "label": "4",
            //       "shortKey": "certDate",
            //       "viewSequence": "4",
            //       "child": [],
            //       "parent": [
            //         {
            //           "value": "^([1]|[2]|[3]|[4])$",
            //           "type": "3",
            //           "order": "1"
            //         }
            //       ],
            //       "validation": [
            //         {
            //           "error_msg": "",
            //           "_id": "1"
            //         },
            //         {
            //           "_id": "26.4",
            //           "error_msg": "",
            //           "value": "2"
            //         }
            //       ],
            //       "restrictions": [],
            //       "input_type": "14",
            //       "editable": false,
            //       "weightage": []
            //     }
            //   ],
            //   "title": "Open Defecation Free (ODF)",
            //   "buttons": []
            // }
          ],
          groupOrder: 37,
          createDynamicOption: [],
          getDynamicOption: [],
        },
    ],
  };
  statusId: number = 1;
  fileFolderName: string = '';
  finalSubmitMsg: string = `Are you sure you want to submit this form? Once submitted,
  it will become uneditable and will be sent to State for Review.
   Alternatively, you can save as draft for now and submit it later.`
  //  nextBtnUrl:string='../odf';
  //  backBtnUrl:string='#';
   routerSubs:any;
   isButtonAvail : boolean = true;
   isFormDisable: boolean = false;
   canTakeAction:boolean = false; 
   isFormFinalSubmit:boolean = false;
  nextPreUrl = {
    nextBtnRouter: '',
    backBtnRouter: ''
  }
  sideMenuItem: object | any;
  leftMenuSubs:any;
  selectedYearId:string="";
  selectedYear:string = "";
  ngOnInit(): void {
    this.leftMenuSubs = this.commonServices.ulbLeftMenuComplete.subscribe((res) => {
      if (res == true) {
        this.getNextPreUrl(this.formName);
      }
    });
  }

  get hasUnsavedChanges() {
    return this.webForm?.hasUnsavedChanges;
  }
  checkRouterForApi() {
    this.getQueryParams();
    this.getQuery = {
      design_year: this.selectedYearId,
      formId: null,
      ulb: this.ulbId
    };
    this.routerSubs = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const urlArray = event.url.split("/");
        this.isApiComplete = false;
        this.questionResponse.data[0] = [];
        if (urlArray.includes("odf")) {
          this.handleUrlForForm('odf');
        } else if (urlArray.includes("gfc")) {
          this.handleUrlForForm('gfc');
        }
      }
      this.fileFolderName = `${this.userData?.role}/${this.selectedYear}/${this.formName}/${this.userData?.ulbCode}`;
    });
  }
  handleUrlForForm(formName: string) {
    this.endPoints = 'gfc-odf-form-collection';
    this.getQuery.isGfc = formName === 'gfc';
    this.formName = formName;
    this.getNextPreUrl(formName);
    this.getScoring(formName, this.getQuery.design_year);
  }
  callGetApi(endPoints: string, queryParams: {}) {
    this.commonServices.formGetMethod(endPoints, queryParams).subscribe((res: any) => {
      console.log('res.........', res);
      this.questionResponse.data = res.data; 
      this.canTakeAction =  res?.data[0]?.canTakeAction;
      // this.getActionRes();
      this.formDisable(res?.data[0]);
      console.log('res.........', this.questionResponse);
      this.questionResponse = {
        ...JSON.parse(JSON.stringify(this.questionResponse))
      }

      this.isApiComplete = true;
      this.routerSubs.unsubscribe();
    },
      (error) => {
        console.log('error', error);
      })
  }

  resData(e) {
    console.log('ResData..................', e);
    let finalData = e?.finalData;
    if (e?.isSaveAsDraft == false) {
      this.alertForFinalSubmit(finalData, e?.isSaveAsDraft)
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
      "design_year": this.selectedYearId,
      "ulb": this.ulbId,
      "isGfc": this.getQuery.isGfc,
      "isDraft": draft,
      "status": this.statusId,
      data: finalData
    }
    this.commonServices.formPostMethod(this.postData, this.endPoints).subscribe((res) => {
      this.webForm.hasUnsavedChanges = false;
      swal("Saved", `Data saved ${draft ? 'as draft' : ''} successfully`, "success");
      this.commonServices.setFormStatusUlb.next(true);
      this.isFormFinalSubmit = true;
        this.isApiComplete = false;
       // this.callGetApi(this.endPoints, this.getQuery);
        console.log(res);
    },
      (error) => {
        console.log('post error', error);
        swal('Error', error?.message ?? 'Something went wrong', 'error');
      }
    )
  }

  getScoring(formName, designYear) {
    this.commonServices.getScoring(formName, designYear).subscribe((res: any) => {
      console.log('scoring.........', res);
      this.ratingMarksArray = res?.data;
    })
  }
 
  alertForFinalSubmit(finalData, draft) {
    swal(
      "Confirmation !",
      `${this.finalSubmitMsg}`,
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


 formDisable(res){
    if(!res) return;
    this.isButtonAvail = this.commonServices.formDisable(res, this.userData);
    this.isFormDisable = !this.isButtonAvail;
 }


nextPreBtn(e) {
  let url = e?.type == 'pre' ? this.nextPreUrl?.backBtnRouter : this.nextPreUrl?.nextBtnRouter
  this.router.navigate([`/ulb-form/${this.selectedYearId}/${url.split('/')[1]}`]);
}
actionFormChangeDetect(res){
  if(res == true){
    this.commonServices.setFormStatusUlb.next(true);
    this.callGetApi(this.endPoints, this.getQuery);
  }
}

getNextPreUrl(form){
  this.sideMenuItem = JSON.parse(localStorage.getItem("leftMenuULB"));
  for (const key in this.sideMenuItem) {
    this.sideMenuItem[key].forEach((ele) => {
      if (ele?.folderName == form) {
        this.nextPreUrl = {nextBtnRouter : ele?.nextUrl, backBtnRouter : ele?.prevUrl}
        this.getQuery.formId = ele?.formId;
        this.callGetApi(this.endPoints, this.getQuery);
      }
    });
  }
}
// for getting design year and key(like: 2024-25) from route
getQueryParams() {
  const yearId = this.route.parent.snapshot.paramMap.get('yearId');
   this.selectedYearId = yearId ? yearId : sessionStorage.getItem("selectedYearId");
   this.selectedYear = this.commonServices.getYearName(this.selectedYearId);
}
ngOnDestroy() {
  this.leftMenuSubs.unsubscribe();
  this.routerSubs.unsubscribe();
}
}
