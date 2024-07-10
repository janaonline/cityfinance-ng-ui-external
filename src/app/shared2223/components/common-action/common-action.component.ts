import { HttpEventType } from '@angular/common/http';
import {
  Component,
  Input,
  EventEmitter,
  Output,
  OnInit,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { DataEntryService } from "src/app/dashboard/data-entry/data-entry.service";
import { IUserLoggedInDetails } from "src/app/models/login/userLoggedInDetails";
import { USER_TYPE } from "src/app/models/user/userType";
import { ProfileService } from "src/app/users/profile/service/profile.service";
import { UserUtility } from "src/app/util/user/user";
import { environment } from 'src/environments/environment';
const swal: SweetAlert = require("sweetalert");
import { SweetAlert } from "sweetalert/typings/core";
@Component({
  selector: "app-common-action",
  templateUrl: "./common-action.component.html",
  styleUrls: ["./common-action.component.scss"],
})
export class CommonActionComponent implements OnInit, OnChanges {
  @Input() item;
  statusForm: FormGroup;
  change = "";
  triggerInput: boolean = false;
  errorMessegeCommonAction: any = "";
  commonActFileName;
  stateActUrl = "";
  showCommonAct: boolean = false;
  filesToUpload: Array<File> = [];
  filesAlreadyInProcess: number[] = [];
  subscription: any;
  approveComment: boolean = false;
  activeButtonApprove: boolean = false;
  activeButtonReturn: boolean = false;
  activeClassApprove: boolean = false;
  activeClassReturn: boolean = false;
  loggedInUserType: USER_TYPE;
  userTypes = USER_TYPE;
  actionData;
  @Input() stateApprove;
  @Input() stateReturn;
  @Input() actionRes;
  @Input() actBtnDis;
  @Input() canTakeAction;
  @Input() actionFor;
  @Input() commonActionError;
  @Input() formNamefiles;
  @Output() actionEventEmit = new EventEmitter<string>();
  fileUploadTracker: {
    [fileIndex: number]: {
      alias?: string;
      percentage?: number;
      status: "in-process" | "FAILED" | "completed";
    };
  } = {};
  userLoggedInDetails: IUserLoggedInDetails;
  finalStatus = "";
  stateStatus = "";
  mohuaStatus = "";
  @Input() formData: any;
  formDataChange;
  sequentialAlert: string = `This ULB is not eligible for approval due to its previous year's unapproved status, 
  allowing only rejection`;
 // canTakeAction;
 storageBaseUrl:string = environment?.STORAGE_BASEURL;

  constructor(
    private dataEntryService: DataEntryService,
    private formBuilder: FormBuilder,
    private profileService: ProfileService
  ) {
    this.initializeLoggedInUserDataFetch();
    this.initializeUserType();
   // console.log("form data for action 111", this.formData);
   // console.log("form data for action res", this.actionRes);


  }
  Years = JSON.parse(localStorage.getItem("Years"));
  userData = JSON.parse(localStorage.getItem("userData"));
  toggle: any;
  mohuaReview = false;
  state_status = '';
  mohua_status = ''
  stateReview = false;
  errorF = false;
  userEvent;
  isPreviewYearApproved:boolean = false;
  ngOnInit(): void {
    console.log(this.stateApprove);
    this.initializeFormm();
    this.valueChange();
    console.log("form data for action", this.formData);
    // this.canTakeAction = sessionStorage.getItem("canTakeAction");
    // console.log('take action.........', this.canTakeAction);
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    this.formDataChange = this.formData;
    this.errorF = this.commonActionError;
    if (this.actionFor == 'ULBForm') {
      this.stateReview = true;
      if (
        this.formData?.status == "APPROVED" &&
        this.formData?.actionTakenByRole == "STATE"
      ) {
        this.finalStatus = "Under Review by MoHUA";
        this.state_status = 'APPROVED';

      } else if (
        this.formData?.status == "REJECTED" &&
        this.formData?.actionTakenByRole == "STATE"
      ) {
        this.finalStatus = "Returned by State";
        this.state_status = 'REJECTED';
      } else if (
        this.formData?.status == "APPROVED" &&
        this.formData?.actionTakenByRole == "MoHUA"
      ) {
        this.finalStatus = "Approved by MoHUA";
        this.mohuaReview = true;
        this.state_status = 'APPROVED';
        this.mohua_status = 'APPROVED';

      }
      else if (
        this.formData?.status == "REJECTED" &&
        this.formData?.actionTakenByRole == "MoHUA"
      ) {
        this.finalStatus = "Returned by MoHUA";
        this.mohuaReview = true;
        this.state_status = 'APPROVED';
        this.mohua_status = 'REJECTED';
      }
    }
    if (this.actionFor == 'StateForm') {
      this.stateReview = false;
      if (
        this.formData?.status == "APPROVED" &&
        this.formData?.actionTakenByRole == "MoHUA"
      ) {
        this.finalStatus = "Approved by MoHUA";
        this.mohuaReview = true;
        // this.state_status = 'APPROVED';
        this.mohua_status = 'APPROVED';

      }
      else if (
        this.formData?.status == "REJECTED" &&
        this.formData?.actionTakenByRole == "MoHUA"
      ) {
        this.finalStatus = "Returned by MoHUA";
        this.mohuaReview = true;
        // this.state_status = 'APPROVED';
        this.mohua_status = 'REJECTED';
      }
    }
    this.isPreviewYearApproved = this.getSequentialStatus(this.formData);
  }
  get f() {
    return this.statusForm.controls;
  }

  valueChange() {
    this.statusForm.valueChanges.subscribe((value) => {
      console.log("value has changed:", value);

      this.actionData = value;
      console.log(this.actionData);
      if (value.status == "APPROVED") {
        this.activeClassApprove = true;
        this.activeClassReturn = false;
      } else if (value.status == "REJECTED") {
        this.activeClassReturn = true;
        this.activeClassApprove = false;
      }
      this.toggle = value;
      console.log(this.toggle);
      this.actionEventEmit.emit(this.statusForm.value);
    });
  }
  initializeFormm() {
    this.statusForm = this.formBuilder.group({
      status: "",
      reason: "",
      document: this.formBuilder.group({
        url: [""],
        name: [""],
      }),
    });
  }

  private initializeLoggedInUserDataFetch() {
    UserUtility.getUserLoggedInData().subscribe((data) => {
      this.userLoggedInDetails = data;
      console.log("hi", data);
    });
  }

  private initializeUserType() {
    this.loggedInUserType = this.profileService.getLoggedInUserType();
    console.log(this.loggedInUserType);
  }
  uploadButtonClicked(formName) {
   // sessionStorage.setItem("changeInPto", "true");
    this.change = "true";
  }

  onChange(event) {
    console.log(event);
    if (event == "APPROVED") {
      this.item = "";
      this.userEvent = event;
      this.approveComment = true;
      this.triggerInput = false;
    } else if (event == "REJECTED") {
      this.userEvent = event;
      this.triggerInput = true;
      this.approveComment = false;
    }
  }

  fileChangeEvent(event, progessType) {
    console.log(progessType);
    let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(event.target.files);
    if(isfileValid == false){
      swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
       return;
    }
    if (progessType == "commonActProgress") {
      if (event.target.files[0].size >= 20000000) {
        this.errorMessegeCommonAction = "File size should be less than 20Mb.";
        this.statusForm.controls.document.reset();
        const error = setTimeout(() => {
          this.showCommonAct = false;
          this.errorMessegeCommonAction = "";
        }, 2000);
        return;
      }
    }
    const fileName = event.target.files[0].name;
    // if (progessType == "commonActProgress") {
    //   this.commonActFileName = event.target.files[0].name;
    //   this.showCommonAct = true;
    // }
    const filesSelected = <Array<File>>event.target["files"];
    this.filesToUpload.push(...this.filterInvalidFilesForUpload(filesSelected));
    this.upload(progessType, fileName);
  }
  clearFile(type: string = "") {
    if (type == "stateAct") {
      this.showCommonAct = false;
      this.commonActFileName = "";
      this.stateActUrl = "";
      this.statusForm.patchValue({
        document: {
          url: "",
          name: "",
        },
      });
      // this.stateFinance.controls.stateNotification['controls'].name.setValidators(Validators.required);
      // this.stateFinance.controls.stateNotification['controls'].name.updateValueAndValidity();
      // console.log(this.stateFinance.controls)
    }
  }
  filterInvalidFilesForUpload(filesSelected: File[]) {
    const validFiles = [];
    for (let i = 0; i < filesSelected.length; i++) {
      const file = filesSelected[i];
      const fileExtension = file.name.split(`.`).pop();
      if (fileExtension === "pdf") {
        validFiles.push(file);
      } else {
        swal("Only PDF File can be Uploaded.");
        return;
      }
    }
    return validFiles;
  }
  async upload(progessType, fileName) {
    // const formData: FormData = new FormData();
    if (progessType == "commonActProgress") {
      this.commonActFileName = fileName;
      this.showCommonAct = true;
    }
    const files: Array<File> = this.filesToUpload;
    this[fileName] = files[0].name;
    console.log(files[0].name);
    let fileExtension = files[0].name.split(".").pop();
    console.log(fileExtension);
    this[progessType] = 10;
    for (let i = 0; i < files.length; i++) {
      if (this.filesAlreadyInProcess.length > i) {
        continue;
      }
      this.filesAlreadyInProcess.push(i);
      await this.uploadFile(files[i], i, progessType, fileName);
    }
  }

  uploadFile(file: File, fileIndex: number, progessType, fileName) {
    return new Promise((resolve, reject) => {
      let id = '';
     let formName = this.formNamefiles;
      // if(this.userData?.role != 'ULB'){
      //   formName = 'annual_accounts';
      //   ulbId = sessionStorage.getItem('ulbCode')
      // }
      if (this.actionFor == 'ULBForm'){
        id = this.userData?.ulbCode;
        if (!id) {
          id = sessionStorage.getItem('ulbCode');
         }
      }else {
        id = this.userData?.stateCode;
        if (!id) {
          id = sessionStorage.getItem("stateCode");
         }
      }
     let folderName = `${this.userData?.role}/2022-23/supporting_douments/${formName}/${id}`
      this.dataEntryService.newGetURLForFileUpload(file.name, file.type, folderName).subscribe(
        (s3Response) => {
          let fileAlias = s3Response["data"][0]["path"];
          this[progessType] = Math.floor(Math.random() * 90) + 10;
          // if(progessType == 'rulesByLawsProgress'){
          //   this[progessType] = Math.floor(Math.random() * 90) + 10;
          // }
          const s3URL = s3Response["data"][0].url;
          this.uploadFileToS3(file, s3URL, fileAlias, fileIndex, progessType);
          resolve("success");
        },
        (err) => {
          if (!this.fileUploadTracker[fileIndex]) {
            this.fileUploadTracker[fileIndex] = {
              status: "FAILED",
            };
            console.log(err);
          } else {
            this.fileUploadTracker[fileIndex].status = "FAILED";
            console.log(err);
          }
        }
      );
    });
  }
  private uploadFileToS3(
    file: File,
    s3URL: string,
    fileAlias: string,
    fileIndex: number,
    progressType: string = ""
  ) {
    this.subscription = this.dataEntryService
      .uploadFileToS3(file, s3URL)
      .subscribe(
        (res) => {
          if (res.type === HttpEventType.Response) {
            this[progressType] = 100;

            if (progressType == "commonActProgress") {
              this.stateActUrl = fileAlias;
              console.log(this.stateActUrl);
              this.statusForm.get("document").patchValue({
                url: fileAlias,
                name: file.name,
              });
           //   sessionStorage.setItem("changeInStateFinance", "true");
              console.log(file);
              console.log(s3URL);
            }
          }
        },
        (err) => {
          this.fileUploadTracker[fileIndex].status = "FAILED";
          console.log(err);
        }
      );
  }

  getSequentialStatus(item) {
    const allowForms = ['dur', '28slb']
     if(item?.prevYearStatusId != 6 && item?.canTakeAction && this.userData?.role == 'MoHUA' && allowForms.includes(this.formNamefiles)){
      return true;
     };
     return false;
    }
}
