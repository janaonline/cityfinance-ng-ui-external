import { HttpEventType } from "@angular/common/http";
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';
import { DataEntryService } from "src/app/dashboard/data-entry/data-entry.service";
import { SweetAlert } from "sweetalert/typings/core";
import { CommonServicesService } from "../../service/common-services.service";
import { queryParam } from "../../common-interface";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";
const swal: SweetAlert = require("sweetalert");

@Component({
  selector: "app-form-common-action",
  templateUrl: "./form-common-action.component.html",
  styleUrls: ["./form-common-action.component.scss"],
})
export class FormCommonActionComponent implements OnInit, OnChanges {
  constructor(
    private formBuilder: FormBuilder,
    private dataEntryService: DataEntryService,
    private _snackBar: MatSnackBar,
    private commonServices: CommonServicesService,
    private route: ActivatedRoute
  ) {
    this.initializeForm();
    this.formValueChange();
    this.getStatusId();
    this.ulbId = this.userData?.ulb;
    if (!this.ulbId) {
      this.ulbId = localStorage.getItem("ulb_id");
    }
  }
 

  Years = JSON.parse(localStorage.getItem("Years"));
  userData = JSON.parse(localStorage.getItem("userData"));
  
  statusForm: FormGroup;
  @Input() canTakeAction:boolean = false;
  @Input() formName:string = '';
  @Output() formChangeEventEmit = new EventEmitter<boolean>();
  @Input() isButtonAvail:boolean= false;
  @Input() nextPreUrl;
  @Input() formId;
  @Input() isFormFinalSubmit = false;
  @Input() formData : any;
  viewMode:boolean = false;
  actionData: any;
  isActionSubmitted: boolean = false;
  actBtnDis : boolean = false;
  errorInAction:boolean = false;
  responceFile = {
    name: '',
    url: ''
  };
  statusIdForApprove:number = null;
  statusIdForReject:number = null;
  activeClassApprove:boolean = false;
  activeClassReturn:boolean = false;
  formValue:any;
  state_action = {
  }
  mohua_action = {
  }
  finalStatus:string =  '';
  ulbId:string = '';
  getQuery: queryParam = {
    design_year: '',
    formId: null,
    ulb: null
  };
  actionPayload = {};
  uploadFolderName:string='';
  autoRejectInfo:string = `If this year's form is rejected, the next year's forms will be 
  "In Progress" because of their interdependency.`;
  autoReject:boolean = false;
  sequentialAlert: string = `This ULB is not eligible for approval due to its previous year's unapproved status, 
  allowing only rejection`;
  isPreviewYearApproved: boolean = false;
  selectedYearId:string = "";
  selectedYear:string = "";
  ngOnInit(): void {
   this.getQueryParams()
  if(this.actionData) this.setStatusData(this.actionData);
  this.getQuery = {
    design_year: this.selectedYearId,
    formId: this.formId,
    ulb: this.ulbId
  };
 let id = this.userData?.ulbCode;
  if (!id) {
    id = sessionStorage.getItem('ulbCode');
   }
  this.uploadFolderName = `${this.userData?.role}/${this.selectedYear}/supporting_douments/${this.formName}/${id}`;
  this.getActionRes();

  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('formData formData', this.formData);
    if(this.isFormFinalSubmit) this.getActionRes();
    if(this.userData?.role == 'MoHUA' && (this.formId == 4)){
      this.sequentialReview({onlyGet: true});      
    };
    this.isPreviewYearApproved = this.getSequentialStatus(this.formData);
  // if(this.actionData) this.setStatusData(this.actionData);
  }
  initializeForm() {
    this.statusForm = this.formBuilder.group({
     shortKey: "form_level",
      status: "",
      rejectReason: "",
      responseFile: this.formBuilder.group({
        url: [""],
        name: [""],
      }),
    });
  }
  formValueChange() {
    this.statusForm.valueChanges.subscribe((value) => {
      console.log("value has changed:", value);
      this.formValue = value;
      console.log(this.formValue);
      if (value.status == 4 || value.status == 6) {
        this.activeClassApprove = true;
        this.activeClassReturn = false;
        this.errorInAction = false;
      } else if (value.status == 5 || value.status == 7) {
        this.activeClassReturn = true;
        this.activeClassApprove = false;
        this.errorInAction =  !value?.rejectReason ? true : false
      }
    });
  }
  get formControl() {
    return this.statusForm.controls;
  }
  uploadFile(event: { target: HTMLInputElement }, fileType: string,  reset: boolean = false) {
    const maxFileSize = 5;
    const excelFileExtensions = ['xls', 'xlsx'];
    const file: File = event.target.files[0];
    if (!file) return;
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    const fileExtension = file.name.split('.').pop();
    if ((file.size / 1024 / 1024) > maxFileSize) return swal("File Limit Error", `Maximum ${maxFileSize} mb file can be allowed.`, "error");
    if (fileType === 'excel' && !excelFileExtensions.includes(fileExtension)) return swal("Error", "Only Excel File can be Uploaded.", "error");
    if (fileType === 'pdf' && fileExtension !== 'pdf') return swal("Error", "Only PDF File can be Uploaded.", "error");
    this._snackBar.open("Uploaing File...",'', {"duration": 10000});
    this.dataEntryService.newGetURLForFileUpload(file.name, file.type, this.uploadFolderName).subscribe(s3Response => {
      const { url, path } = s3Response.data[0];
      console.log('url..', url)
      console.log('asdfgg', s3Response)
      this.dataEntryService.newUploadFileToS3(file, url).subscribe((res) => {
        if (res.type !== HttpEventType.Response) return;
        this.formControl.responseFile.patchValue({ name: file.name, url: path });
        this.responceFile = { name: file.name, url: path };
        this._snackBar.dismiss();
        console.log('form', this.formControl?.responseFile?.value?.name);
        
      });
    }, 
    (err) => {
        console.log(err);
        this._snackBar.open("Unable to save the file..",'', {"duration": 2000});
        this._snackBar.dismiss();
    });
  }
  removeUploadedFile(){
    this.formControl.responseFile.patchValue({ name: '', url: '' });
    this.responceFile = { name: '', url: ''};
  }

  getStatusId(){
     if(this.userData?.role == 'STATE'){
       this.statusIdForApprove = 4;
       this.statusIdForReject = 5;
     }else if(this.userData?.role == 'MoHUA'){
       this.statusIdForApprove = 6;
       this.statusIdForReject = 7;
     }
  }
  
  setStatusData(data){
    this.finalStatus = '';
    let ulbRes = data.find(el => el.actionTakenByRole === "ULB");
    if(ulbRes && ulbRes?.statusId == 3) this.finalStatus = ulbRes?.status ? ulbRes?.status : '';
    let stateRes = data.find(el => el.actionTakenByRole === "STATE");
    if(stateRes) this.finalStatus = stateRes?.status ? stateRes?.status : '';
    this.state_action = {
      status: stateRes?.status,
      rejectReason:stateRes?.rejectReason,
      responceFile: {
        name: stateRes?.responseFile?.name,
        url: stateRes?.responseFile?.url
      }
    }
    let mohuaRes = data.find(el => el.actionTakenByRole === "MoHUA");
    if(mohuaRes) this.finalStatus = mohuaRes?.status ? mohuaRes?.status : (stateRes?.status ? stateRes?.status : '');
    this.mohua_action = {
      status: mohuaRes?.status,
      rejectReason:mohuaRes?.rejectReason,
      responceFile: {
        name: mohuaRes?.responseFile?.name,
        url: mohuaRes?.responseFile?.url
      }
    }
  }

  saveAction(){
    console.log('...this.statusForm.value', this.statusForm.value);
    this.isActionSubmitted = true;
    this.actionPayload = {
      "form_level": 1,
      "design_year" : this.Years["2023-24"],
      "formId": this.formId,
      "ulbs": [
          this.ulbId
      ],
      "responses": [
       this.statusForm.value
      ],
      "multi": true,
      "shortKeys": [
          "form_level"
      ]
    }
    if(!this.statusForm.value?.status){
      swal('Error', "Status is mandatory", "error");
      return
    }
    if(this.errorInAction){
      swal('Error', "Reject reason is mandatory", "error");
      return
    }
    let confirmMessage = this.autoReject ? this.autoRejectInfo : '';
    swal("Confirmation !", `${confirmMessage} 
    Are you sure you want to submit this action?`, "warning", {
      buttons: {
        Submit: {
          text: "Submit",
          value: "submit",
        },
        Cancel: {
          text: "Cancel",
          value: "cancel",
        },
      },
    }).then((value) => {
      switch (value) {
        case "submit":
          this.finalSubmitAction();
          break;
        case "cancel":
          break;
      }
    });
  }
  finalSubmitAction(){
    this.commonServices.formPostMethod(this.actionPayload, 'common-action/masterAction').subscribe((res:any)=>{
      console.log('ressssss action', res);
      this.actBtnDis = true;
      this.isActionSubmitted = false;
      this.formChangeEventEmit.emit(true);
      this.getActionRes();
      //temp commented for Production
      // if(environment?.isProduction === false){
        if((this.formId == 4) &&
        (this.statusForm?.value?.status == 7) && 
        this.userData?.role == 'MoHUA'){
          this.sequentialReview({onlyGet: false})
        // } 
      }
     
      swal('Saved', "Action submitted successfully", "success");
    },
    (error)=>{
      console.log('ressssss action', error);
      this.formChangeEventEmit.emit(false);
      this.isActionSubmitted = false;
      swal('Error', error?.message ?? 'Something went wrong', 'error');
    }
    )
  }

  getActionRes(){
    this.commonServices.formPostMethod(this.getQuery, 'common-action/getMasterAction').subscribe((res:any)=>{
      console.log('action get res', res);
      this.setStatusData(res?.data);
      this.actionData = res?.data;
      if(!this.actionData && !this.actionData.length ){
        this.viewMode = false;
      }else if( this.actionData[0]?.statusId == 1 || this.actionData[0]?.statusId == 2 || this.actionData[0]?.statusId == false){
        this.viewMode = false;
      }else{
        this.viewMode = true;
      }
  
    },
    (err)=>{
      console.log('err action get');

    })
  }

  sequentialReview(data) {
    let body = {
      ulbs: [this.ulbId],
      design_year: this.selectedYearId,
      status: "REJECTED",
      formId: this.formId,
      multi: false,
      "getReview": data?.onlyGet
      
    };
    this.commonServices.formPostMethod(body, 'common-action/sequentialReview').subscribe(
      (res:any) => {
        console.log("Sequential review", res);
        if(data?.onlyGet && this.autoReject == false) this.autoReject = res?.data?.autoReject;
      },
      (error) => {
       // swal("Error", "Sequential review field.", "error");
      }
    );
  }

  getSequentialStatus(item) {
    
    const allowForms = ['dur', '28slb']
     if(item?.prevYearStatusId != 6 && item?.canTakeAction && this.userData?.role == 'MoHUA' && allowForms.includes(this.formName)){
      return true;
     };
     return false;
    }


    getQueryParams() {
        const yearId = this.route.parent.snapshot.paramMap.get('yearId');
        this.selectedYearId = yearId ? yearId : sessionStorage.getItem("selectedYearId");
        this.selectedYear = this.commonServices.getYearName(this.selectedYearId);
    }
}
