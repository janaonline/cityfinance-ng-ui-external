import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  OnChanges,
  ViewChild,
  OnDestroy,
  ElementRef,
} from "@angular/core";
import { NewCommonService } from "../../services/new-common.service";
import { CommonService } from "src/app/shared/services/common.service";
import { FormGroup, FormBuilder } from "@angular/forms";
import { USER_TYPE } from "src/app/models/user/userType";
import { JSONUtility } from "src/app/util/jsonUtil";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { TableApproveReturnDialogComponent } from "./table-approve-return-dialog/table-approve-return-dialog.component";
import { State2223Service } from "src/app/newPagesFc/xvfc2223-state/state-services/state2223.service";
import { PageEvent } from '@angular/material/paginator';
import { SweetAlert } from "sweetalert/typings/core";
import { environment } from "src/environments/environment";
import { Subscription } from "rxjs";

const swal: SweetAlert = require("sweetalert");

@Component({
  selector: "app-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit, OnChanges, OnDestroy {
  constructor(
    private commonService: NewCommonService,
    private _commonService: CommonService,
    private _fb: FormBuilder,
    public dialog: MatDialog,
    private stateServices: State2223Service
  ) {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.initializeFilterForm();
    this.initializeListFetchParams();
    this.fetchStateList();
    this.getDesignYear();
    this.dropdownChanges();
    this.yearIdFor2223 = this.years['2022-23'];
    
  }
  userData;
  title = "";
  total = 0;

  max = Math.max;
  data = [];
  listType: USER_TYPE;
  filterForm: FormGroup;
  perPage: '10' | '25' | '50' | '100' | 'all' = '10';
  tableDefaultOptions = {
    itemPerPage: 10,
    currentPage: 1,
    totalCount: null,
  };
  listFetchOption = {
    filter: null,
    sort: null,
    csv: false,
    skip: 0,
    limit: this.tableDefaultOptions.itemPerPage,
  };
  @Input() formId;
  @Input() isUa;
  @Input() designYear;
  @Input() dropdownData;
  @Input() state_id_i;
  @Input() tableName;
  @Input() formBaseUrl:string = '';
  @Input() endPoint:string = '';
  @ViewChild('stickyMenu') menuElement: ElementRef;
 // @HostListener('window:scroll', ['$event'])
  formUrl = "";
  selectedId: any = [];
  checkedStatus;
  ulbType;
  disableEnableCheckbox: boolean;
  statusList;
  newArr: any = [];
  populationType;
  columnNames = [];
  params = {
    design_year: "",
    formId: "",
  };
  formRouterLink;
 // formStateRouterLink;
  isLoader = false;
  formName;
  elementPosition: any;
  // length = 100;
  // pageSize = 10;
  pageSizeOptions: number[] = [];
  pageEvent: PageEvent;
  filterFormValue;
  reviewSubs;
  isApiInProgress;
  reviewEntity = "ULB";
  stateList;
  statesByID;
  pageName = 'Get All Data'
  noHistorydataFound = false
  historyData;
  environment = environment;
  submitCliamStatus:string = '16';
  years: object = JSON.parse(localStorage.getItem("Years"));
  yearIdFor2223: string = '';
  private dataSubscription: Subscription;
  sequentialAlert: string = `This ULB is not eligible for approval due to its previous year's unapproved status, 
  allowing only rejection`;

  ngOnInit(): void {
    this.updatedTableData();
    this.setParams();
    this.tableDefaultOptions.itemPerPage = 10;
    this.params["limit"] = this.tableDefaultOptions.itemPerPage;
  }
  ngAfterViewInit() {
    this.elementPosition = this.menuElement.nativeElement.offsetTop;
  }
  ngOnChanges(changes: SimpleChanges): void {
  //  console.log("formId from Table Component", this.formId);
    this.params["formId"] = this.formId;
    this.params["design_year"] = this.designYear;
    if (this.userData?.role !== "STATE") {
      this.params["state"] = this.state_id_i ? this.state_id_i : null;
    }
    this.initializeListFetchParams();
    let skValue = sessionStorage.getItem('skipValue')
    let sesParams = JSON.parse(sessionStorage.getItem("params"));
   // console.log('default pages', this.tableDefaultOptions);

    if (skValue) {
      this.params = sesParams;
      if (sesParams) {
        this.filterForm.patchValue({
          ulb_name_s: sesParams?.ulbName ? sesParams?.ulbName : '',
          ulb_code_s: sesParams?.ulbCode ? sesParams?.ulbCode : (sesParams?.censusCode ? sesParams?.censusCode : ''),
          ulbType_s: sesParams?.ulbType ? sesParams?.ulbType : '',
          population_type_s: sesParams?.populationType ? sesParams?.populationType : '',
          ua_name_s: sesParams?.UA ? sesParams?.UA : '',
          status_s: sesParams?.status ? sesParams?.status : '',
          filled_1: sesParams?.filled1 ? sesParams?.filled1 : '',
          filled_2: sesParams?.filled2 ? sesParams?.filled2 : '',
          state_name_s: sesParams?.state ? sesParams?.state : ''
        })
      }
      this.params["skip"] = Number(skValue);
      let page = Math.round(Number(skValue) / 10);
      this.tableDefaultOptions.currentPage = ((Number(skValue) / 10) >= page) ? page + 1 : page;
    } else {
    }
    this.dataSubscription?.unsubscribe();
      let formData;
      let after22_23 = false;
      if(this.designYear == this.years["2023-24"] || this.designYear == this.years["2024-25"]){
        after22_23 = true;
        formData = this.dropdownData?.find(({ formId }) => {
          return formId == this.formId;
        });
      }else{
         formData = this.dropdownData?.find(({ _id }) => {
          return _id == this.formId;
        });
        after22_23 = false;
      }
      this.formUrl = formData?.url;
      this.formName = formData?.folderName;
      this.formRouterLink = after22_23 ? `../../../${this.formBaseUrl}/${this.formUrl}` : `../../${this.formBaseUrl}/${this.formUrl}`;
    this.callAPI();
    
    
  }

  handleScroll(event) {
    const threshold = 50;
    if(event.target.offsetHeight + event.target.scrollTop >= (event.target.scrollHeight - threshold)) {
      this.infiniteScroll();
    }
  }
  infiniteScroll() {
    console.log('infinite scroll called');
    if (this.isInfiniteScroll &&
      !this.isLoader &&
      (this.listFetchOption.skip + this.tableDefaultOptions.itemPerPage < this.tableDefaultOptions.totalCount)) {
      const pageNoClick = this.tableDefaultOptions.currentPage + 1;
      this.tableDefaultOptions.currentPage = pageNoClick;
      this.listFetchOption.skip =
        (pageNoClick - 1) * this.tableDefaultOptions.itemPerPage;
      this.searchUsersBy(this.filterForm.value);
    }
  }

  get isInfiniteScroll() {
    return this.perPage == 'all';
  }

  get filterdStateList() {
    return this.stateList.filter(state => !this.isUa || state.isUaWise)
  }

  onPerPageChange() {
    this.tableDefaultOptions.itemPerPage = this.isInfiniteScroll ? 10 : +this.perPage;
    this.setParams();
    if (this.isInfiniteScroll) {
      this.data = [];
    }
    this.filterFormValue = this.filterForm?.value;
    if (this.tableName == 'Review State Forms') {
      this.params["state"] = this.filterForm?.value?.state_name_s;
      this.params["status"] = this.filterForm?.value?.status_s;
    } else {
      this.params["ulbName"] = this.filterForm?.value?.ulb_name_s;
      this.params["ulbCode"] = this.filterForm?.value?.ulb_code_s;
      this.params["censusCode"] = this.filterForm?.value?.ulb_code_s;
      this.params["ulbType"] = this.filterForm?.value?.ulbType_s;
      this.params["UA"] = this.filterForm?.value?.ua_name_s;
      this.params["status"] = this.filterForm?.value?.status_s;
      this.params["filled1"] = this.filterForm?.value?.filled_1;
      this.params["populationType"] = this.filterForm?.value?.population_type_s;
      this.params["filled2"] = this.filterForm?.value?.filled_2 ? this.filterForm?.value?.filled_2 : null;
    }

    this.params["skip"] = 0;
    this.callAPI();
  }

  updatedTableData() {
    this.reviewSubs = this.commonService.reviewStatus.subscribe((result) => {
      console.log("review Status ===>", result);
      if (result) {
        this.callAPI();
        this.selectedId = [];
        return;
      }
    });
  }
  ngOnDestroy() {
    this.reviewSubs?.unsubscribe();
  }
  callAPI() {
    this.isLoader = true;
    this.params.formId = this.formId;
    this.dataSubscription = this.commonService.getReviewForms(this.params, this.endPoint).subscribe(
      (res) => {
        this.isLoader = false;
        this.title = res["title"];
        this.total = res["total"];
        this.columnNames = res["columnNames"];
        this.data = (this.isInfiniteScroll ? [...this.data, ...res["data"]] : res["data"]).map((element) => ({
          ...element,
          isChecked: this.isChecked(element),
        }));
        this.tableDefaultOptions.totalCount = this.total;
        if (this.title == 'Review Grant Application') {
          this.pageSizeOptions = [10, 25, 50, 100, this.total];
        } else {
          this.pageSizeOptions = [5, 10, 20, this.total];
        }

      if(!this.ulbType) this.ulbType = Object.keys(res["ulbType"]).length > 0 ? Object.values(res["ulbType"]): null;
      if(!this.statusList)  this.statusList = Object.keys(res["statusList"]).length > 0 ? Object.values(res["statusList"]) : null;
      if(!this.populationType) this.populationType = Object.keys(res["populationType"]).length > 0 ? Object.values(res["populationType"]) : null;
        // console.log("merged data", this.data);
        sessionStorage.removeItem('skipValue');
        sessionStorage.removeItem('params');
        if(this.isInfiniteScroll && this.listFetchOption.skip == 0) {
          setTimeout(() => {
            const table = document.querySelector('.table-responsive') as HTMLElement;
            if(table) {
              table.style.height = `${table.clientHeight - 20}px`;
            }
          }, 100)
        }
      },
      (err) => {
        swal('Error', `Failed to connect with Server, Please try again!`, 'error');
        this.isLoader = false;
      }
    );
  }
  searchState() {
    this.resetInfinite();
    this.listFetchOption = {
      csv: false,
      filter: this.filterForm ? this.filterForm.value : {},
      sort: null,
      skip: 0,
      limit: this.tableDefaultOptions.itemPerPage,
    };
    this.tableDefaultOptions.currentPage = 1;
    this.filterFormValue = this.filterForm?.value;
    this.params["status"] = this.filterForm?.value?.status_s;
    this.params["state"] = this.filterForm?.value?.state_name_s;
    this.params["skip"] = 0;
    this.dataSubscription?.unsubscribe();
    this.callAPI();
  }

  resetInfinite() {
    this.data = [];
    this.tableDefaultOptions.currentPage = 1;
    this.listFetchOption.skip = 0;
  }

  search() {
    this.resetInfinite();
    this.listFetchOption = {
      csv: false,
      filter: this.filterForm ? this.filterForm.value : {},
      sort: null,
      skip: 0,
      limit: this.tableDefaultOptions.itemPerPage,
    };
    this.tableDefaultOptions.currentPage = 1;
    console.log("value changes", this.filterForm?.value);
    this.filterFormValue = this.filterForm?.value;

    if (this.tableName == 'Review State Forms') {
      this.params["state"] = this.filterForm?.value?.state_name_s;
      this.params["status"] = this.filterForm?.value?.status_s;
    } else {
      this.params["ulbName"] = this.filterForm?.value?.ulb_name_s;
      this.params["ulbCode"] = this.filterForm?.value?.ulb_code_s;
      this.params["censusCode"] = this.filterForm?.value?.ulb_code_s;
      this.params["ulbType"] = this.filterForm?.value?.ulbType_s;
      this.params["UA"] = this.filterForm?.value?.ua_name_s;
      this.params["status"] = this.filterForm?.value?.status_s;
      this.params["filled1"] = this.filterForm?.value?.filled_1;
      this.params["populationType"] = this.filterForm?.value?.population_type_s;
      this.params["filled2"] = this.filterForm?.value?.filled_2 ? this.filterForm?.value?.filled_2 : null;
    }
    this.params["skip"] = 0;
    this.dataSubscription?.unsubscribe();
    this.callAPI();
  }
  isChecked(element: any) {
    // console.log('isChecked =====>', element);
    if (this.title == 'Review Grant Application') {
      let isUlbIdExist = this.selectedId.some((item) => item == element.ulbId);
      return isUlbIdExist;
    } else {
      let isUlbIdExist = this.selectedId.some((item) => item == element.state);
      return isUlbIdExist;
    }
  }
  setPage(pageNoClick: number) {
    console.log(pageNoClick);
    this.tableDefaultOptions.currentPage = pageNoClick;
    this.listFetchOption.skip =
      (pageNoClick - 1) * this.tableDefaultOptions.itemPerPage;
    this.searchUsersBy(this.filterForm.value);
  }
  setPageSizeOptions(setPageSizeOptionsInput: string) {
    console.log('page change', setPageSizeOptionsInput)
    if (setPageSizeOptionsInput) {
      this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
    }
  }
  pageChange(e) {
    console.log('page change', e)
  }
  searchUsersBy(filterForm: {}, skip?: number) {

    console.log({filterForm});
    this.listFetchOption.filter = filterForm;
    this.listFetchOption.skip =
      skip || skip === 0 ? skip : this.listFetchOption.skip;

    this.fetchList({ ...(<any>this.listFetchOption) });
  }

  private fetchList(
    body: {
      filter: { [key: string]: string };
      sort: { [key: string]: number };
      role?: USER_TYPE;
    } = { filter: {}, sort: {} }
  ) {
    this.isApiInProgress = true;
    const util = new JSONUtility();
    body.filter = util.filterEmptyValue(body.filter);

    Object.assign(this.params, body);
    this.callAPI();
  }

  private initializeFilterForm() {
    switch (this.reviewEntity) {
      case USER_TYPE.ULB:
        this.initializeULBFilterForm();
        return;
      case USER_TYPE.STATE:
        this.initializeStateFilterForm();
        return;
    }
  }
  private initializeULBFilterForm() {
    this.filterForm = this._fb.group({
      ulb_name_s: [""],
      state_name_s: [""],
      ulb_code_s: [""],
      ulbType_s: [""],
      population_type_s: [""],
      ua_name_s: [""],
      status_s: [""],
      filled_1: [""],
      filled_2: [""],
    });
  }

  private initializeStateFilterForm() { }

  private initializeListFetchParams() {
    this.listFetchOption = {
      csv: false,
      filter: this.filterForm ? this.filterForm.value : {},
      sort: null,
      skip: 0,
      limit: this.tableDefaultOptions.itemPerPage,
    };
  }

  private fetchStateList() {
    this._commonService.fetchStateList().subscribe((res:any) => {
      console.log('state list', res);
      this.stateList = res;
    });
  }
  selected_checkbox(id, status) {
    console.log(id, status)
    this.checkedStatus = status;
    if (status == true) {
      this.selectedId.push(id);
      this.selectedId = this.selectedId.filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      })
    } else if (status == false) {
      let selectedIndex = this.selectedId.findIndex((item) => item == id);
      if (selectedIndex > -1) {
        this.selectedId.splice(selectedIndex, 1);
      }
    }
    console.log(this.selectedId);
  }
  openDialog(type) {
    sessionStorage.setItem("form_name", this.formName);
    if(type == 'Approve' && this.userData?.role == 'MoHUA'  && this.title == 'Review Grant Application'){
      this.checkPreviousYearStatus(type);
    }else {
      this.openReviewDialogBox(type, false);
    }
   
  }

  download() {
    let csvParams: any = { ...this.params }
    delete csvParams?.limit;
    delete csvParams?.skip;
    delete csvParams?.csv;
    const params = {
      ...csvParams,
      token: this.getToken(),
    };
    const endPoint = this.designYear == this.years["2023-24"] ? this.endPoint : "review" ;
    console.log(params);
    this._commonService.openWindowToDownloadCsv(params, endPoint);
  }
  getDesignYear() {
    let design_year = JSON.parse(localStorage.getItem("Years"));
    return design_year["2022-23"];
  }
  getToken() {
    return JSON.parse(localStorage.getItem("id_token"));
  }

  viewUlbForm(data) {
    console.log("data", data);
    localStorage.setItem("ulb_id", data?.ulbId);
    this.getULBSideBar(data?.ulbId, "ULB", data?.isUA);
    //this.commonService.setFormStatus2223.next(true);
    sessionStorage.setItem("stateName", data?.stateName);
    sessionStorage.setItem("ulbName", data?.ulbName);
    sessionStorage.setItem("ulbCode", data?.ulbCode);
    sessionStorage.setItem("canTakeAction", data?.cantakeAction);
    sessionStorage.setItem("path1", 'Review Grant');
    sessionStorage.setItem("form_id", this.formId);
    sessionStorage.setItem("form_name", this.formName);
    let skipValue: any = this.listFetchOption.skip
    sessionStorage.setItem("skipValue", skipValue);
    sessionStorage.setItem("params", JSON.stringify(this.params));
    sessionStorage.setItem("state_id", data?.state_id);

  }
  viewStateForm(data) {
    console.log("data", data);
    localStorage.setItem("state_id", data?.state);
    this.getStateBar(data?.state, "STATE", "");
    //  this.commonService.setStateFormStatus2223.next(true);
    sessionStorage.setItem("stateName", data?.stateName);
    sessionStorage.setItem("stateCode", data?.stateCode);
    sessionStorage.setItem("form_name", this.formName);
    sessionStorage.setItem("path2", 'Review State Form');
    sessionStorage.setItem("Stateform_id", this.formId);
    sessionStorage.setItem("canTakeAction", data?.cantakeAction);
    let skipValue: any = this.listFetchOption.skip
    sessionStorage.setItem("skipValue", skipValue);
    sessionStorage.setItem("params", JSON.stringify(this.params));
  }
  getStateBar(id, role, isUA) {

    this.commonService.setStateFormStatus2223.next(true);
    this.commonService.getLeftMenu(id, role, isUA).subscribe((res: any) => {
      console.log("left responces..", res);
      localStorage.setItem("leftStateMenuRes", JSON.stringify(res?.data));
      this.commonService.setStateRouter.next(true);
    });
  }
  getULBSideBar(ulbId, role, isUA) {
    if (isUA == "Yes") {
      isUA = true;
    } else {
      isUA = false;
    }
    this.commonService.setFormStatus2223.next(true);
    this.commonService.getLeftMenu(ulbId, role, isUA).subscribe((res: any) => {
      console.log("left responces..", res);
      localStorage.setItem("leftMenuRes", JSON.stringify(res?.data));
      this.commonService.setULBRouter.next(true);
      localStorage.setItem("overViewCard", JSON.stringify(res?.card));
      //  this.leftMenu = res;
    });
  }
  resetFilter() {
    this.filterForm.reset();
    this.initializeULBFilterForm();
    //this.resetInfinite();
    this.data = [];
    this.setParams();
    this.callAPI();
  }
  dropdownChanges() {
    this.stateServices.dpReviewChanges.subscribe((res) => {
      this.resetInfinite();
      console.log("table value changes....", res);
      this.selectedId = [];
      // this.params["skip"] = 0;
      this.tableDefaultOptions.currentPage = 1;
      this.setParams();
      this.filterForm.reset();
    });
  }
  setParams(reset = false) {
    this.params = {
      design_year: this.designYear,
      formId: this.formId,
    };
    this.params["state"] = this.state_id_i ? this.state_id_i : null;

    this.listFetchOption = {
      filter: null,
      sort: null,
      csv: false,
      skip: 0,
      limit: this.tableDefaultOptions.itemPerPage,
    };
    this.tableDefaultOptions.currentPage = 1;
    this.params["limit"] = this.tableDefaultOptions.itemPerPage;
    this.params["skip"] = 0;

  }
  
  getAllData(type) {
    this.params['limit'] = 461;
    this.callAPI();
    if (this.pageName == 'Get All Data') {
      this.pageName = 'Set Pagination';
      this.params['limit'] = this.tableDefaultOptions.itemPerPage;
      this.params['skip'] = 0;
    } else {
      this.pageName = 'Get All Data';
    }

  }
  
  viewHistory(template, formId, ulbId) {
    // if(this.environment?.isProduction) return;
    this.noHistorydataFound = false;
    let queryParam = {
      formId: formId,
      design_year: this.designYear
    }
    if(this.tableName == 'Review State Forms'){
      queryParam["stateId"] = ulbId;
    }else {
      queryParam["ulbId"] = ulbId;
    }
    this.commonService.formGetMethod('common-history', queryParam).subscribe(
      (res) => {
        this.historyData = res['data']
      //  this.historyData.reverse()
        if (!this.historyData.length) {
          this.noHistorydataFound = true;
        }
        this.openStatus(template)
      },
      (err) => {
        console.log(err.message);
        swal('Error', "No history found!", 'error');
      })
  }

  alertClose() {
    this.dialog.closeAll();
  }

  openStatus(template) {
    let dialogRef = this.dialog.open(template, {
      height: "auto",
      width: "750px"
    });
    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }

 keepOriginalOrder = (a, b) => b.key - a.key;

 //for hide and unhide download csv button logic
 getDownloadAvailability() {

  /* formId = 7(grant-tranfer), 11.2(grant-allocation), 12(Project for wss), 13(action-plan), 16(submit-claim-grant) */
  const isReviewStateForms = this.title == 'Review State Forms';
  const isReviewGrantApplication = this.title == 'Review Grant Application';
  const isFormIdIncluded = [7, 11.2, 12, 13, 16].includes(Number(this.formId));
  const isDesignYearMatch = this.designYear == this.years["2022-23"];

  if ((isReviewGrantApplication && this.formId != '3') || (isDesignYearMatch && isReviewStateForms) || (isFormIdIncluded && isReviewStateForms)) {
    return true;
  }
  
  return false;
}

getStatusAvailability(){
  const isReviewStateForms = this.title == 'Review State Forms';
  const isFormIdIncluded = ['14', '16', '62c552c52954384b44b3c386', '62c554932954384b44b3c39e'].includes((this.formId));
  if ((isFormIdIncluded && isReviewStateForms)) {
    return false;
  }
  
  return true;
}
/* 
  this method return condition for approval or rejection for a ULB from MOHUA. 
*/
getSequentialStatus(item) {
const eligibleFormForSeq = ['dur', '28slb'];

 if(item?.prevYearStatusId != 6 && item?.cantakeAction && this.userData?.role == 'MoHUA' && eligibleFormForSeq.includes(this.formName)){
  return true;
 };

 return false;
}
/* 
  checking previous status based on selection and adding a key for approval and rejection.
*/
checkPreviousYearStatus(type){
 // console.log('this.data, this.data', this.data);
  let isAlertActive: boolean = false;
  for(let item of this.data) {
   item["preYearSeqStatus"] = this.getSequentialStatus(item);
   if(item["preYearSeqStatus"] && item?.isChecked){
    isAlertActive = true;
   }
  }

  if(isAlertActive){
    swal(
      "Confirmation !",
     `Some ULBs were not approved by MoHUA in the previous year, so they are auto-deselected.
      Only ULBs with the previous year's status 'Approved by MoHUA' can be approved.
      
      Would you like to proceed with this action?`,
      "warning",
      {
        buttons: {
          Submit: {
            text: "Yes",
            value: "yes",
          },
          Cancel: {
            text: "Cancel",
            value: "no",
          },
        },
      }
    ).then((value) => {
      switch (value) {
        case "yes":
          this.openReviewDialogBox(type, true);
          break;
        case "no":
          break;
      }
    });
  }else{
    this.openReviewDialogBox(type, false);
  }

 
  
}
/* 1.deselect checkboxes based on there previous year status 
   2.Open popup for comments and document upload for approval and rejection.
*/
openReviewDialogBox(type, processType?){
  if(processType) {
    for(let elem of this.data){
      if(elem?.preYearSeqStatus){
        elem["isChecked"] = false;
        let selectedIndex = this.selectedId.findIndex((id) => id == elem?._id);
        if (selectedIndex > -1) {
          this.selectedId.splice(selectedIndex, 1);
        }
      }
    }
  }
 // console.log('this.selectedId this.selectedId', this.selectedId);
  if(!this.selectedId?.length){
    swal('Alert!', "Selected ULBs are not allowed for approval.", "error");
    return;
  }
  const dialogdata = {
    selectedId: this.selectedId,
    type: type,
    formId: this.formId,
    tableName: this.title,
    designYear : this.designYear,
    reviewType: this.designYear == this.years["2023-24"] ? 'new_review' : 'old_review',
    processType: processType
  };
  const dialogRef = this.dialog.open(TableApproveReturnDialogComponent, {
    data: dialogdata,
    width: "50vw",
    height: "auto",
    panelClass: "no-padding-dialog",
  });
  dialogRef.afterClosed().subscribe((result) => {
    console.log("result", result);
  });
}


}
