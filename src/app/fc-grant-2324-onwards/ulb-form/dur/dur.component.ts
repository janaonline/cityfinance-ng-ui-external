import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

const swal: SweetAlert = require("sweetalert");

import { GlobalLoaderService } from 'src/app/shared/services/loaders/global-loader.service';
import { SweetAlert } from 'sweetalert/typings/core';
import { CommonServicesService } from '../../fc-shared/service/common-services.service';

import { DurPreviewComponent } from './dur-preview/dur-preview.component';
import { DurService } from './dur.service';

@Component({
  selector: 'app-dur',
  templateUrl: './dur.component.html',
  styleUrls: ['./dur.component.scss']
})
export class DurComponent implements OnInit, OnDestroy {
  @ViewChild('webForm') webForm;

  successErrorMessage: string;
  isLastDeleted = false;

  isLoaded: boolean = false;
  isProjectLoaded: boolean = true;
  finalSubmitMsg: string = `Are you sure you want to submit this form? Once submitted,
  it will become uneditable and will be sent to State for Review.
   Alternatively, you can save as draft for now and submit it later.`

  userData = JSON.parse(localStorage.getItem("userData"));
  
  questionresponse;
  isButtonAvail : boolean = false;
  // nextRouter:string = '';
  // backRouter:string = '';
  formId:number = 4;
  nextPreUrl = {
    nextBtnRouter: '',
    backBtnRouter: ''
  }
  sideMenuItem: object | any;
  isFormFinalSubmit : boolean = false;
  canTakeAction:boolean = false;
  leftMenuSubs:any;
  statusShow:string = '';
  selectedYearId:string="";
  financialYear:string="";
  selectedYear:string=""
  locationInvalid:boolean = false;
  constructor(
    private dialog: MatDialog,
    private durService: DurService,
    private loaderService: GlobalLoaderService,
    private commonServices: CommonServicesService,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.getNextPreUrl();
  }


  ngOnInit(): void {
    // this.isLoaded = true;
    this.getFinancialYear();
    this.leftMenuSubs = this.commonServices.ulbLeftMenuComplete.subscribe((res) => {
      if (res == true) {
        this.getNextPreUrl();
      }
    });
    this.loadData();
  }

  get design_year() { 
    const yearId = this.route.parent.snapshot.paramMap.get('yearId');
     this.selectedYearId = yearId ? yearId : sessionStorage.getItem("selectedYearId")
    return this.selectedYearId;
  }

  get ulbId() {
    if(this.userData?.role == 'ULB') return this.userData?.ulb;
    return localStorage.getItem("ulb_id");
  }

  get hasUnsavedChanges() {
    return this.webForm?.hasUnsavedChanges;
  }

  loadData(loadProjects = false) {
    this.loaderService.showLoader();
    this.durService.getForm(this.ulbId, this.design_year).subscribe((res: any) => {
      console.log('loadData::', res);
      this.loaderService.stopLoader();
      console.log(res);
      this.isLoaded = false;
      setInterval(() => this.isLoaded = true);
      this.questionresponse = res;
      this.canTakeAction =  res?.data[0]?.canTakeAction;
      this.statusShow = res?.data[0]?.status;
      // this.getActionRes();
      this.formDisable(res?.data[0]);
      if(loadProjects) {
        this.getProjects();
      }
    }, ({ error }) => {
      console.log(error.success)
      this.loaderService.stopLoader();
      if (error?.success == true && error?.message) {
        this.successErrorMessage = error?.message;
      } else {
        swal('Error', error?.message ?? 'Something went wrong', 'error');
      }
    })
  }

  loadInParent(type: string) {
    if (type === 'projects') this.getProjects();
  }

  getProjects(shouldOpenPreview = false) {
    this.loaderService.showLoader();
    this.durService.getProjects(
      this.ulbId,
      this.design_year,
      this.questionresponse?.data[0]?.language[0].isDraft
    ).subscribe((res: any) => {

      this.loaderService.stopLoader();
      if (!res?.data) return;
      this.isProjectLoaded = true;
      const projectDetails = this.webForm.questionData.find(question => question.shortKey == "projectDetails_tableView_addButton");
      if (projectDetails) {
        const questionLength = '' + res.data.length;
        projectDetails.value = questionLength;
        projectDetails.modelValue = questionLength;
        projectDetails.selectedValue = [{ value: questionLength, label: questionLength, textValue: '' }];
        projectDetails.childQuestionData = res.data;
      }
      console.log(res);
      if (shouldOpenPreview) {
        this.onPreview();
      }
    }, ({ error }) => {
      this.loaderService.stopLoader();
      swal('Error', error?.message ?? 'Something went wrong', 'error');
    })
  }

  onPreview() {
    if (!this.isProjectLoaded) return this.getProjects(true);
    const data = this.webForm.questionData;

    const grantPositionWrapper = data?.find(question => question.shortKey == "grantPosition");
    const general = data?.find(question => question.shortKey == "general");
    const waterManagement = data?.find(question => question.shortKey == "waterManagement_tableView");
    const solidWasteManagement = data?.find(question => question.shortKey == "solidWasteManagement_tableView");
    const projectDetails = data?.find(question => question.shortKey == "projectDetails_tableView_addButton");
    const selfDeclaration = data?.find(question => question.shortKey == "selfDec");

    console.log({ tiedGrant: grantPositionWrapper, waterManagement, solidWasteManagement, projectDetails });

    const grantPosition = (grantPositionWrapper.childQuestionData[0] as any[]).reduce((result, child) => {
      result[child.shortKey] = child.value;
      return result;
    }, {});


    const categoryWiseData_wm = (waterManagement.childQuestionData as any[]).map(child => {
      return {
        category_name: child?.[0]?.value,
        grantUtilised: child?.[1]?.value,
        numberOfProjects: child?.[2]?.value,
        totalProjectCost: child?.[3]?.value,
      }
    });

    const categoryWiseData_swm = (solidWasteManagement.childQuestionData as any[]).map(child => {
      return {
        category_name: child?.[0]?.value,
        grantUtilised: child?.[1]?.value,
        numberOfProjects: child?.[2]?.value,
        totalProjectCost: child?.[3]?.value,
      }
    });

    const projects = (projectDetails.childQuestionData as any[]).map(child => {
      const lat = child[4]?.modelValue?.split(',')?.[0];
      const long = child[4]?.modelValue?.split(',')?.[1];
      return {
        name: child?.[0]?.value,
        categoryName: child?.[1]?.selectedValue?.[0]?.label,
        location: {
          lat: lat ? parseFloat(lat).toFixed(6) : "",
          long: long ? parseFloat(long).toFixed(6) : ""
        },
        cost: child[5]?.value,
        expenditure: child[6]?.value,
        dpr_status: child[8]?.selectedValue?.[0]?.label,
        startDate: child[2]?.value,
        completionDate: child[3]?.value,
      }
    });

    // console.log({ tiedGrant, child: tiedGrant.childQuestionData, grantPosition, waterManagement, categoryWiseData_wm });

    let previewData = {
      status: this.statusShow,
      isDraft: true,
      financialYear: this.financial_year,
      designYear: this.design_year,
      grantType: "Tied",
      isProjectLoaded: this.isProjectLoaded,
      grantPosition,
      name: selfDeclaration?.childQuestionData?.[0]?.[0].modelValue,
      designation: selfDeclaration?.childQuestionData?.[0]?.[1]?.modelValue,
      categoryWiseData_wm,
      categoryWiseData_swm,
      projects,
      selectedYear: this.selectedYear
    };
    const dialogRef = this.dialog.open(DurPreviewComponent, {
      data: previewData,
      width: "85vw",
      height: "100%",
      maxHeight: "90vh",
      panelClass: "no-padding-dialog",
    });
    // this.hidden = false;
    dialogRef.afterClosed().subscribe((result) => {
      // console.log(`Dialog result: ${result}`);
      //   this.hidden = true;
    });
  }

  isFormValid(data) {
    this.locationInvalid = false;
    const projectDetails = data?.finalData.find(item => item.shortKey == "projectDetails_tableView_addButton")?.nestedAnswer || [];
    const waterManagement = data?.finalData.find(item => item.shortKey == "waterManagement_tableView")?.nestedAnswer || [];
    const solidWasteManagement = data?.finalData.find(item => item.shortKey == "solidWasteManagement_tableView")?.nestedAnswer || [];
    for (let project of projectDetails) {
      const location = project?.answerNestedData.find(item => item.shortKey == "location");
      const cost = project?.answerNestedData.find(item => item.shortKey == "cost");
      const expenditure = project?.answerNestedData.find(item => item.shortKey == "expenditure");
      if (location.answer?.length == 0 || location.answer[0].value == "" || this.isLocationValid(location.answer[0].value)) {
        this.locationInvalid = true;
        return false;
      }
      if (expenditure.answer[0].value && cost.answer[0].value && (+expenditure.answer[0].value > +cost.answer[0].value)) {
        return false;
      }
    }

    for (let item of waterManagement) {
      const grantUtilised = item?.answerNestedData.find(item => item.shortKey == "wm_grantUtilised");
      const totalProjectCost = item?.answerNestedData.find(item => item.shortKey == "wm_totalProjectCost");
      if (grantUtilised.answer[0].value && totalProjectCost.answer[0].value && 
        (+grantUtilised.answer[0].value > +totalProjectCost.answer[0].value)
      ) {
        console.log('invalid', item);
        return false;
      }
    }

    for (let item of solidWasteManagement) {
      const grantUtilised = item?.answerNestedData.find(item => item.shortKey == "sw_grantUtilised");
      const totalProjectCost = item?.answerNestedData.find(item => item.shortKey == "sw_totalProjectCost");
      if (grantUtilised.answer[0].value && totalProjectCost.answer[0].value && 
        (+grantUtilised.answer[0].value > +totalProjectCost.answer[0].value)
      ) {
        return false;
      }
    }
    return true;
  }

  async onSubmit(data) {

    let isDraft = data.isSaveAsDraft;
    if(isDraft) this.finalSubmit(data, isDraft);
    if (isDraft == false) {
      const selfDeclarationChecked = data?.finalData.find(item => item?.shortKey === "declaration" && item.answer?.[0].value == '1')?.answer?.[0].value;
      if (selfDeclarationChecked != '1') return swal('Error', 'Please check self declaration', 'error');
      const grantPositionData = data?.finalData?.find(obj => obj.shortKey === "grantPosition");
      const expDuringYrObj = grantPositionData?.nestedAnswer[0]?.answerNestedData?.find(el=>el.shortKey === "grantPosition___expDuringYr");
      
     if((expDuringYrObj?.answer[0]?.value == 0)){
       swal("Error", "The total expenditure incurred during the year cannot be 0", "error");
       return;
     }
     const projectDetails = data?.finalData.find(item => item.shortKey == "projectDetails_tableView_addButton")?.nestedAnswer || [];
     if(projectDetails?.length == 0){
        swal("Error", "Number of projects can not be 0", "error");
        return;
     } 
     // if = validation check for all input,
     // else = confirmation popup then final submit, draft, cancel functionality.
     console.log("this.isFormValid(data)", this.isFormValid(data))
     if (!this.isFormValid(data)) {
      let errMsg = this.locationInvalid ? "Please fill the lat/long or correct the lat/long values" : 'Please fill valid values in form';
      return swal('Error', `${errMsg}`, 'error')
    }else{
      const userAction = await swal(
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
      );
      if (userAction == 'draft') {
        isDraft = true;
        this.finalSubmit(data, isDraft)
      }
      if (userAction == 'cancel') return;
      if(userAction == 'submit') this.finalSubmit(data, isDraft)
    }
  
    };

    
    
  }
  finalSubmit(data, isDraft){
    this.loaderService.showLoader();
    this.durService.postForm({
      isDraft: isDraft,
      status: isDraft ? 2 : 3,
      isProjectLoaded: this.isLastDeleted || this.isProjectLoaded,
      financialYear: this.financial_year,
      designYear: this.design_year,
      ulb: this.ulbId,
      formId: 4,
      data: data.finalData,
    }).subscribe(res => {
      this.webForm.hasUnsavedChanges = false;
      this.loaderService.stopLoader();
      this.commonServices.setFormStatusUlb.next(true);
      this.isFormFinalSubmit = true;
      if(!isDraft) {
        this.loadData(true);
        
      }
      swal('Saved', isDraft ? "Data save as draft successfully!" : "Data saved successfully!", 'success');
      console.log('data send');
    }, ({ error }) => {
      this.loaderService.stopLoader();
      if (Array.isArray(error?.message)) {
        error.message = error.message.join('\n\n');
      }
      swal('Error', error?.message ?? 'Something went wrong', 'error');
      console.log('error occured');
    })
  }
  nextPreBtn(e) {
    let url = e?.type == 'pre' ? this.nextPreUrl?.backBtnRouter : this.nextPreUrl?.nextBtnRouter
    //added year Id in route
    this.router.navigate([`/ulb-form/${this.selectedYearId}/${url.split('/')[1]}`]);
    //this.router.navigate([`/ulb-form/${url.split('/')[1]}`]);
  }
  updateInParent(item) {
    Object.entries(item).forEach(([key, value]) => {
      this[key] = value;
      this.isLastDeleted = true;
      console.log(this.isLastDeleted);
    });
  }
  actionFormChangeDetect(res){
    if(res == true){
      this.commonServices.setFormStatusUlb.next(true);
      this.loadData(true);
    }
  }

  getNextPreUrl(){
    this.sideMenuItem = JSON.parse(localStorage.getItem("leftMenuULB"));
    for (const key in this.sideMenuItem) {
      this.sideMenuItem[key].forEach((ele) => {
        if (ele?.folderName == "dur") {
          this.nextPreUrl = {nextBtnRouter : ele?.nextUrl, backBtnRouter : ele?.prevUrl}
          this.formId = ele?.formId ?? 4;
        }
      });
    }
  }
  formDisable(res){
    if(!res) return;
  //  let resR = { ...res, statusId: 6} for testing only
    this.isButtonAvail = this.commonServices.formDisable(res, this.userData);
    console.log(this.isButtonAvail, 'this.isButtonAvail');
    
 }

 //f
 getFinancialYear(){
  this.selectedYear = this.commonServices.getYearName(this.design_year);
  const [startYear, endYear] = this.selectedYear.split("-").map(Number);
  this.financialYear = `${startYear - 1}-${endYear - 1}`;
  
 }
 get financial_year() {
  const years = JSON.parse(localStorage.getItem("Years"));
  return years?.[`${this.financialYear}`];
}

 ngOnDestroy(): void {
  this.leftMenuSubs.unsubscribe();
}

 isLocationValid(location: string): boolean {
  // Split the location string by comma
  const values: string[] = location.split(',');

  // Iterate through each value for checking error
  for (const val of values) {
      try {
          if (!val || parseFloat(val.trim()) === 0) {
              return true;
          }
      } catch (error) {
        swal("Error", `${error?.message}`, "error")
          continue;
      }
  }

  // If no error found, return false
  return false;
}
  
}
