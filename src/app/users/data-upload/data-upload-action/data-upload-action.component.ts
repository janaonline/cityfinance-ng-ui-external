import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/util/baseComponent';

import { UPLOAD_STATUS } from '../../../util/enums';
import { FinancialDataService } from '../../services/financial-data.service';

@Component({
  selector: "app-data-upload-action",
  templateUrl: "./data-upload-action.component.html",
  styleUrls: ["./data-upload-action.component.scss"],
})
export class DataUploadActionComponent extends BaseComponent implements OnInit {
  fileFormGroupKeys = [
    "balanceSheet",
    "schedulesToBalanceSheet",
    "incomeAndExpenditure",
    "schedulesToIncomeAndExpenditure",
    "trialBalance",
    "auditReport",
  ];
  financialYearDropdown = [
    { id: "2015-16", itemName: "2015-16" },
    { id: "2016-17", itemName: "2016-17" },
    { id: "2018-19", itemName: "2018-19" },
    { id: "2019-20", itemName: "2019-2020" },
  ];
  auditStatusDropdown = [
    {
      id: "audited",
      itemName: "Audited",
    },
    {
      id: "unaudited",
      itemName: "Unaudited",
    },
  ];
  audited = new FormControl({ value: null, disabled: true });
  financialYear = new FormControl({ value: null, disabled: true });

  completenessFormGroup: FormGroup;
  correctnessFormGroup: FormGroup;
  completenessStatus: any = UPLOAD_STATUS.PENDING;
  id: string;
  correctnessStatus: string = UPLOAD_STATUS.PENDING;
  tabIndex = 0;

  constructor(
    public financeDataService: FinancialDataService,
    public location: Location,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    super();
    this.createForms();
  }

  private fetchFinancialYears() {
    this.financeDataService.getFinancialYears().subscribe(
      (result) => {
        if (result["success"]) {
          this.fetchFinancialDataById();
          this.financialYearDropdown = result["data"];
          this.financialYearDropdown = this.financialYearDropdown.map(
            (year) => {
              return {
                id: year["name"],
                itemName: year["name"],
              };
            }
          );
        }
      },
      (error) => this.handlerError(error)
    );
  }

  private handlerError(error: any) {
    const { message } = error;
    this._snackBar.open(message, null, { duration: 6600 });
  }

  createForms() {
    this.completenessFormGroup = this.fb.group({});
    this.correctnessFormGroup = this.fb.group({});
    this.fileFormGroupKeys.forEach((formGroupKey) => {
      this.completenessFormGroup.addControl(
        formGroupKey,
        new FormGroup({
          completeness: new FormControl(),
          message: new FormControl(""),
        })
      );
      this.correctnessFormGroup.addControl(
        formGroupKey,
        new FormGroup({
          correctness: new FormControl(),
          message: new FormControl(""),
        })
      );
    });
  }

  ngOnInit() {
    this.fetchFinancialYears();
  }

  fetchFinancialDataById() {
    this.financeDataService.selectedFinancialRequest = null;
    this.activatedRoute.params.subscribe((value) => {
      const { id } = value;
      this.id = id;
      this.financeDataService
        .fetFinancialData(id)
        .subscribe((response: any) => {
          if (response["success"]) {
            this.financeDataService.selectedFinancialRequest = response.data;
            this.completenessStatus = this.financeDataService.selectedFinancialRequest[
              "completeness"
            ];
            this.correctnessStatus = this.financeDataService.selectedFinancialRequest[
              "correctness"
            ];
            this.updateFormControls(
              this.financeDataService.selectedFinancialRequest
            );
          }
        });
    });
  }

  getFormControl(
    formGroup: FormGroup,
    formGroupName: string,
    formControlName: string
  ) {
    return formGroup.get([formGroupName, formControlName]);
  }

  updateFormControls(data) {
    this.updateTabIndex(data);
    const { financialYear, audited } = data;
    this.setFinancialYear(financialYear);
    this.setAuditStatus(audited);
    this.setFileFormControls();
  }

  setAuditStatus(value: boolean) {
    if (value) {
      this.audited.setValue([this.auditStatusDropdown[0]]);
    } else {
      this.fileFormGroupKeys.splice(this.fileFormGroupKeys.length - 1, 1);
      this.audited.setValue([this.auditStatusDropdown[1]]);
    }
  }

  fileButtonClickHandler(...args) {
    if (args.length === 1) {
      args = args[0];
    }
    let urlObject = this.financeDataService.selectedFinancialRequest;
    args.map((key) => (urlObject = urlObject[key]));
    if (urlObject) {
      if (typeof urlObject === "string") {
        window.open(urlObject);
      }
    }
  }

  radioButtonClickHandler() {}

  completenessClickedHandler() {
    if (this.isApiInProgress) return;
    this.isApiInProgress = true;
    let responseObject = { ...this.completenessFormGroup.getRawValue() };
    if (!this.financeDataService.selectedFinancialRequest.audited) {
      const { auditReport, ...rest } = this.completenessFormGroup.getRawValue();
      responseObject = { ...rest };
    }
    this.financeDataService
      .updateCompletenessStatus(this.id, responseObject)
      .subscribe(
        (result: any) => {
          const { data } = result;
          if (data) {
            if (data.completeness === UPLOAD_STATUS.REJECTED) {
              return this.router.navigate(["/user/xvform/list"]);
            }
          }
          if (result["success"]) {
            this.fetchFinancialDataById();
            // this.router.navigate(['/user/xvform/list']);
          }
          this.isApiInProgress = false;
        },
        (error) => {
          this.isApiInProgress = false;
          console.error(error);
        }
      );
  }

  private updateTabIndex(data) {
    const { completeness } = data;
    if (completeness === UPLOAD_STATUS.APPROVED) {
      this.tabIndex = 1;
    }
  }

  correctnessSubmitHandler() {
    if (this.isApiInProgress) return;
    this.financeDataService
      .updateCorrectnessStatus(this.id, this.correctnessFormGroup.value)
      .subscribe(
        (result) => {
          this.isApiInProgress = false;
          if (result["success"]) {
            this.router.navigate(["/user/xvform/list"]);
          }
        },
        (error) => {
          this.isApiInProgress = false;
          console.error(error);
        }
      );
  }

  private setFinancialYear(financialYear: string) {
    const selectedFinancialYearObject = this.financialYearDropdown.filter(
      (item) => item.id === financialYear
    );
    if (selectedFinancialYearObject) {
      this.financialYear.setValue(selectedFinancialYearObject);
    }
  }

  private setFileFormControls() {
    this.fileFormGroupKeys.forEach((formGroupKey) => {
      const formGroupDataItem = this.financeDataService
        .selectedFinancialRequest[formGroupKey];
      if (formGroupDataItem) {
        const { excelUrl, pdfUrl } = formGroupDataItem;
        const formControls = [
          this.getFormControl(
            this.completenessFormGroup,
            formGroupKey,
            "completeness"
          ),
          this.getFormControl(
            this.correctnessFormGroup,
            formGroupKey,
            "correctness"
          ),
          this.getFormControl(
            this.completenessFormGroup,
            formGroupKey,
            "message"
          ),
          this.getFormControl(
            this.correctnessFormGroup,
            formGroupKey,
            "message"
          ),
        ];
        const keys = ["completeness", "correctness", "message", "message"];
        for (let i = 0; i < formControls.length; i++) {
          const formControl = formControls[i];
          switch (keys[i]) {
            case "completeness":
            case "correctness":
              if (excelUrl || pdfUrl) {
                if (formGroupDataItem[keys[i]] != UPLOAD_STATUS.PENDING) {
                  formControl.setValue(formGroupDataItem[keys[i]]);
                }
                formControl.setValidators(Validators.required);
                formControl.updateValueAndValidity();
                // checking for correctness and completeness only
                if (i < 2) {
                  if (formGroupDataItem[keys[i]] === UPLOAD_STATUS.PENDING) {
                    continue;
                  }
                }
                // if ((i == 0 && formGroupDataItem[keys[i]] === UPLOAD_STATUS.PENDING) || (i == 1) && formGroupDataItem[keys[i]] === UPLOAD_STATUS.PENDING) {
                //   continue;
                // }
              }
              formControl.disable();
              formControl.updateValueAndValidity();
              break;
            case "message":
              formControl.setValue(formGroupDataItem[keys[i]]);
              if (formControls[i - 2].disabled) {
                formControl.disable();
                formControl.updateValueAndValidity();
              }
              break;
          }
        }
      }
    });
  }
}
