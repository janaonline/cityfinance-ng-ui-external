import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { IDetailedReportResponse } from "src/app/models/detailedReport/detailedReportResponse";

import { IReportType } from "../../../../app/models/reportType";
import { DialogComponent } from "../../../../app/shared/components/dialog/dialog.component";
import { GlobalLoaderService } from "../../../../app/shared/services/loaders/global-loader.service";
import {
  currencryConversionOptions,
  ICurrencryConversion,
} from "../basic/conversionTypes";
import { ExcelService } from "../excel.service";
import { ReportHelperService } from "../report-helper.service";
import { ReportService } from "../report.service";

@Component({
  selector: "app-comparative-ulb",
  templateUrl: "./comparative-ulb.component.html",
  styleUrls: ["./comparative-ulb.component.scss"],
  changeDetection: ChangeDetectionStrategy.Default,
})
export class ComparativeUlbComponent implements OnInit {
  report: any = [];
  reportReq: IReportType;
  years: {
    title: string;
    caption: string;
    population?: number;
    state: string;
    isComparative: boolean;
  }[] = [];

  isProcessed = false;
  response: any = {};
  reportKeys: any = [];
  reqUlb: string;
  reqUlb2: string;
  reqYear: string;
  headerGroup = {
    yearColspan: 2,
    accRowspan: 2,
  };

  currencyConversionList = currencryConversionOptions;

  conversionDropdownConfig = {
    primaryKey: "type",
    singleSelection: true,
    text: "Select conversion",
    enableSearchFilter: false,
    badgeShowLimit: 1,
    labelKey: "name",
    showCheckbox: true,
    classes: "noCrossSymbol",
  };

  currenyConversionForm: FormGroup;

  currencyTypeInUser: ICurrencryConversion["type"];
  isApiInProgress = false;
  constructor(
    private reportService: ReportService,
    private excelService: ExcelService,
    private reportHelper: ReportHelperService,
    private _loaderService: GlobalLoaderService,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _dialog: MatDialog,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  private initializeCurrencyConversion(reportCriteria: IReportType) {
    this.currencyTypeInUser =
      reportCriteria && reportCriteria.valueType === "absolute"
        ? this.reportService.currencryConversionInUse.type
        : this.currencyConversionList[0].type;
  }

  private initializeForm(reportCriteria: IReportType) {
    this.currenyConversionForm = this._formBuilder.group({
      type: [
        [
          reportCriteria && reportCriteria.valueType === "absolute"
            ? this.reportService.currencryConversionInUse
            : this.currencyConversionList[0],
        ],
      ],
    });
  }

  ngOnInit() {
    this.reportService.getNewReportRequest().subscribe((reportCriteria) => {
      console.log("reportCriteria==>", reportCriteria);
      this.initializeCurrencyConversion(reportCriteria);
      this.isApiInProgress = false;
      this.initializeForm(reportCriteria);
      this._loaderService.showLoader();
      this.reportReq = reportCriteria;
      this.currencyTypeInUser =
        reportCriteria.valueType === "absolute"
          ? this.currencyTypeInUser
          : this.currencyConversionList[0].type;
      this.reportService.reportResponse.subscribe(
        (res) => {

          this._loaderService.stopLoader();
          if (res) {
            this.years = [];
            this.response = res;

            if (this.reportReq.reportGroup == "Balance Sheet") {

              this.report = this.reportHelper.getBSReportLookup();
            } else {
              this.report = this.reportHelper.getIEReportLookup();
            }
            this.reqYear = this.reportReq.years[0];
            if (this.reportReq.ulbList.length > 1) {
              this.years = [];
              this.transformYears_UlbVSUlb();
            } else {
              this.years = [];
              this.transformYears_YrVSYr();
            }
            this.transformResult(<any>res);
            this.headerGroup.yearColspan =
              this.years.length / this.reportReq.years.length;
          } else {
            this.isProcessed = true;
            this.reportKeys = [];
          }
          this._loaderService.stopLoader();
          this.isProcessed = true;
          this.setDataNotAvailable();
          this.changeDetector.detectChanges();
         // console.log('om pppp22', this.isApiInProgress)
          setTimeout(()=>{
            this._loaderService.stopLoader();
            this.isApiInProgress = true;
            }, 3000)
        },
        (error)=> {
          console.log(error);
          this.isApiInProgress = true;
        },
        () => {
         console.log('om pppp', this.isApiInProgress)
          this._loaderService.stopLoader();
          this.isApiInProgress = true;
        }
      );
    });

    this.reportService.selectedConversionType.subscribe(selectedConversionType => {
      // console.log('selectedConversionType', selectedConversionType);
      this.onSelectingConversionType(selectedConversionType);
    });
  }

  /**
   *
   * IMPORTANT
   * you may be wondering why here we are manually setting value on currenyConversionForm on null value?
   * It is so because currently, angular multi-select dropdown does not provide any option
   * to limit the minimum selection to 1. User can deselect all the values. But we have to provide
   * a way to keep 1 value selected. This can be achieved by setting the value
   * of the form control linked to it. Thus, we are doing so.
   */
  onSelectingConversionType(type: ICurrencryConversion | null) {
    if (!type) {
      this.currenyConversionForm.controls["type"].setValue([
        this.reportService.currencryConversionInUse,
      ]);
      return;
    }
    this.reportService.currencryConversionInUse = type;
    this.currencyTypeInUser = type.type;
  }

  // { "code": 110, "head_of_account": "Revenue", "line_item": "Tax Revenue", "CG004_2015-16": 85497781, "CG004_2016-17": 109442436, "CG005_2015-16": 1015636583, "CG005_2016-17": 1788137186, "CG004_2015-16_2016-17": "28.01", "CG005_2015-16_2016-17": "76.06" }
  transformYears_YrVSYr() {
    // this.years.push({title: this.reportReq.ulbList[0].code, caption: this.reportReq.ulbList[0].name, isComparative: false });
    // this.years.push({title: this.reportReq.ulbList[1].code, caption: this.reportReq.ulbList[1].name, isComparative: false });
    // this.years.push({title: 'difference', caption: '%', isComparative: true });

    for (let i = 0; i < this.reportReq.ulbList.length; i++) {
      const ulb = this.reportReq.ulbList[i];
      // if(this.report[item.code] && item.ulb_code && item.budget.length > 0){
      for (let j = 0; j < this.reportReq.years.length; j++) {
        const key = ulb.code + "_" + this.reportReq.years[j];
        this.years.push({
          title: key,
          caption: ulb.name,
          state: ulb.state,
          isComparative: false,
          population: 11111111,
        });

        if (j > 0 && this.reportReq.isComparative) {
          const comparativeKey =
            ulb.code +
            "_" +
            this.reportReq.years[j - 1] +
            "_" +
            this.reportReq.years[j];
          this.years.push({
            title: comparativeKey,
            caption: "%",
            state: "Comparision",
            isComparative: true,
            population: 222222,
          });
        }
      }
    }
  }

  transformYears_UlbVSUlb() {
    for (let i = 0; i < this.reportReq.years.length; i++) {
      const year = this.reportReq.years[i];
      for (let j = 0; j < this.reportReq.ulbList.length; j++) {
        const ulb1 = this.reportReq.ulbList[0];
        const ulb2 = this.reportReq.ulbList[j];
        // if(this.report[item.code] && item.ulb_code && item.budget.length > 0){
        const key = ulb2.code + "_" + year;
        this.years.push({
          title: key,
          caption: ulb2.name,
          state: ulb2.state,
          isComparative: false,
          population: ulb2.population,
        });

        if (j > 0 && this.reportReq.isComparative) {
          const comparativeKey = ulb1.code + "_" + ulb2.code + "_" + year;
          this.years.push({
            title: comparativeKey,
            caption: "%",
            state: "Comparision",
            isComparative: true,
            population: +this.calculateDiff(ulb1.population, ulb2.population),
          });
        }
      }
      // }
    }
  }

  transformResult(result: IDetailedReportResponse["data"]) {
    for (let i = 0; i < result.length; i++) {
      const item = result[i];
      if (this.report[item.code] && item.ulb_code && item.budget.length > 0) {
        for (let j = 0; j < item.budget.length; j++) {
          const key = item.ulb_code + "_" + item.budget[j].year;
          if (
            this.report[item.code][key] === undefined ||
            this.report[item.code][key] === null
          ) {
            this.report[item.code][key] =
              this.reportReq.valueType === "absolute"
                ? item.budget[j].amount
                : item.budget[j].amount / item.population;
          }
        }
      }
    }

    // this.transformToReportFormat(this.report);
    this.populateCalcFields(this.report, this.years);
  }

  /**
   *
   * @param result
   * @param years
   */
  populateCalcFields(
    result,
    years: {
      title: string;
      caption: string;
      population?: number;
      state: string;
      isComparative: boolean;
      [key: string]: any;
    }[]
  ) {
    let calcFields = [];
    if (
      this.reportReq.reportGroup == "Balance Sheet" &&
      this.reportReq.type.indexOf("Summary") > -1
    ) {
      // BS Summary
      this.reportKeys = this.reportHelper.getBSSummaryReportMasterKeys();
      calcFields = this.reportHelper.getBSSummaryCalcFields();
    } else if (this.reportReq.reportGroup == "Balance Sheet") {
      // BS Detailed
      this.reportKeys = this.reportHelper.getBSReportMasterKeys();
      calcFields = this.reportHelper.getBSCalcFields();
    } else if (this.reportReq.type.indexOf("Summary") > -1) {
      // IE Summary
      this.reportKeys = this.reportHelper.getIESummaryMasterKeys();
      calcFields = this.reportHelper.getIESummaryCalcFields();
    } else {
      // IE Detailed
      this.reportKeys = this.reportHelper.getIEReportMasterKeys();
      calcFields = this.reportHelper.getIECalcFields();
    }

    for (let i = 0; i < calcFields.length; i++) {
      const keyName = calcFields[i].keyName;
      result[keyName] = { line_item: calcFields[i].title, isBold: true };
      if (calcFields[i].code) {
        result[keyName]["code"] = calcFields[i].code;
        result[keyName].isBold = false;
      }
      if (calcFields[i].isCalc) {
        for (let j = 0; j < years.length; j++) {
          let sum = 0;

          const addFields = calcFields[i].addFields;
          const subtractFields = calcFields[i].subtractFields;

          /** loop through each result line item and add values for specific year */
          if (addFields) {
            for (let k = 0; k < addFields.length; k++) {
              // console.log(
              //   addFields[k],
              //   years[j]["title"],
              //   result[addFields[k]][years[j]["title"]]
              // );

              if (
                result[addFields[k]] &&
                result[addFields[k]][years[j]["title"]]
              ) {
                // if amount available for specified year then add them
                sum = sum + parseFloat(result[addFields[k]][years[j]["title"]]);
              }

              if (
                calcFields[i].delFields &&
                calcFields[i].delFields.indexOf(result[addFields[k]]) > -1
              ) {
                // if the line item comes under delete fields then delete them
                delete result[addFields[k]];
              }
            }
          }

          if (subtractFields && subtractFields.length > 0) {
            if (
              result[subtractFields[0]] &&
              result[subtractFields[0]][years[j]["title"]]
            ) {
              sum = sum - result[subtractFields[0]][years[j]["title"]];
            }
          }

          result[keyName][years[j]["title"]] = sum;
        }
      }
    }

    // if (this.reportReq.ulbList.length > 1) {
    //   this.transformToReportFormat_UlbVSUlb(this.report);
    // } else {
    //   this.transformToReportFormat_YrVSYr(this.report);
    // }
  }

  setDataNotAvailable() {
    this.years.forEach((year) => {
      if (year.caption === "%") {
        return;
      }

      const canSetDataNotAvaliable = this.reportKeys.every(
        (key) => !this.report[key][year.title]
      );
      if (canSetDataNotAvaliable) {
        this.reportKeys.forEach((key) => {
          const original = { ...this.report[key] };
          original[year.title] = null;
          if (!original["allNullYear"]) {
            original["allNullYear"] = { [year.title]: true };
          } else {
            original["allNullYear"][year.title] = true;
          }
          this.report[key] = { ...original };
        });
      }
    });
  }

  canSetDataNotAvailable(years) {}

  /** Comparision will be done between years of each ULB
   * Expectation:
   *    1. atleast 1 ulb
   *    2. atleast 2 years
   * @param result
   *
   * @output
   */
  transformToReportFormat_UlbVSUlb(result: any[]) {
    if (!result) {
      return false;
    }

    const resultKeys = Object.keys(result);
    for (let i = 0; i < resultKeys.length; i++) {
      if (["Debt", "Tax"].indexOf(result[resultKeys[i]].head_of_account) > -1) {
        // ignore Debt and Tax account types
        continue;
      }

      const item = result[resultKeys[i]];

      for (let j = 1; j < this.reportReq.ulbList.length; j++) {
        const ulb1 = this.reportReq.ulbList[0];
        const ulb2 = this.reportReq.ulbList[j];

        for (let k = 0; k < this.reportReq.years.length; k++) {
          const keyCode =
            ulb1.code + "_" + ulb2.code + "_" + this.reportReq.years[k];

          const ulbN1 = ulb1.code + "_" + this.reportReq.years[k];
          const ulbN2 = ulb2.code + "_" + this.reportReq.years[k];
          if (item[ulbN1] === undefined) {
            item[ulbN1] = 0;
          }
          if (item[ulbN2] === undefined) {
            item[ulbN2] = 0;
          }

          item[keyCode] = this.calculateDiff(item[ulbN1], item[ulbN2]);
        }
      }
    }

    // this.populateCalcFields(this.report, this.years);
    this.isProcessed = true;
  }

  /** Comparision will be done between years of each ULB
   * Expectation:
   *    1. atleast 1 ulb
   *    2. atleast 2 years
   * @param result
   *
   * @output
   */
  transformToReportFormat_YrVSYr(result: any[]) {
    if (!result) {
      return false;
    }

    const resultKeys = Object.keys(result);
    for (let i = 0; i < resultKeys.length; i++) {
      if (["Debt", "Tax"].indexOf(result[resultKeys[i]].head_of_account) > -1) {
        // ignore Debt and Tax account types
        continue;
      }

      const item = result[resultKeys[i]];

      for (let j = 0; j < this.reportReq.ulbList.length; j++) {
        const ulb = this.reportReq.ulbList[j];

        for (let k = 1; k < this.reportReq.years.length; k++) {
          const keyCode =
            ulb.code +
            "_" +
            this.reportReq.years[k - 1] +
            "_" +
            this.reportReq.years[k];

          const ulbN1 = ulb.code + "_" + this.reportReq.years[k - 1];
          const ulbN2 = ulb.code + "_" + this.reportReq.years[k];

          item[keyCode] = this.calculateDiff(item[ulbN1], item[ulbN2]);
        }
      }
    }

    // this.populateCalcFields(this.report, this.years);
    this.isProcessed = true;
  }

  calculateDiff(a: number, b: number) {
    if (a && b) {
      return (((b - a) / a) * 100).toFixed(2);
    } else {
      return 0;
    }
  }

  routerTo() {
    const ulbs: string[] = this.reportReq.ulbIds;
    const years: string[] = this.reportReq.years;
    const query = `ulbs=${ulbs.toString()}&year=${years.toString()}&backRoute=${
      window.location.pathname
    }`;

    const isUserLoggedIn = this._authService.loggedIn();
    console.log(isUserLoggedIn);
    if (!isUserLoggedIn) {
      const dailogboxx = this._dialog.open(DialogComponent, {
        data: {
          message:
            "<p class='text-center'>You need to be Login to download the data.</p>",
          buttons: {
            signup: {
              text: "Signup",
              callback: () => {
                this.router.navigate(["register/user"]);
              },
            },
            confirm: {
              text: "Proceed to Login",
              callback: () => {
                sessionStorage.setItem(
                  "postLoginNavigation",
                  `/data-tracker?${query}`
                );
                this.router.navigate(["/", "login"],{ queryParams: { user: 'USER' } } );
              },
            },
            cancel: { text: "Cancel" },
          },
        },
        width: "28vw",
      });
      return;
    }

    this.router.navigate(["/data-tracker"], {
      queryParams: {
        ulb: ulbs.toString(),
        year: years.toString(),
        backRoute: window.location.pathname,
      },
    });
  }

  download() {
    const reportTable = document.querySelector("table").outerHTML;
    let title = this.reportReq.type + " " + this.reportReq.reportGroup;
    if (this.reportReq.valueType === "per_capita") {
      title += " (Per Capita) ";
    }
    let currencyConversionName =
      this.currenyConversionForm.value.type &&
      this.currenyConversionForm.value.type[0] &&
      this.currenyConversionForm.value.type[0].type
        ? this.currenyConversionForm.value.type[0].name
        : null;
    if (currencyConversionName) {
      currencyConversionName =
        document.getElementById("currencyWarning").textContent;
    }
    if (this.reportReq.valueType === "per_capita") {
      currencyConversionName = " NOTE: Values are in Per Capita format";
    }

    this.excelService.transformTableToExcelData(title, reportTable, "IE", {
      currencyConversionName,
    });

    this.reportService.addLogByToken("Income-Expenditure");
  }

  ngOnDestroy() {
    this._loaderService.stopLoader();
  }
}
