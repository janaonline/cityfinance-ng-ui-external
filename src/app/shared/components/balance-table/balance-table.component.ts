import {
  Component,
  Input,
  OnInit,
  ViewChild,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { ReportHelperService } from "src/app/dashboard/report/report-helper.service";
import { IReportType } from "src/app/models/reportType";
import { ReportService } from "../../../dashboard/report/report.service";
import { GlobalLoaderService } from "../../services/loaders/global-loader.service";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseComponent } from "src/app/util/BaseComponent/base_component";
import { CommonService } from "../../services/common.service";
import { BalanceTableService } from "./balance-table.service";
import { resolve } from "dns";
import { ulbType } from "src/app/dashboard/report/report/ulbTypes";
import { AuthService } from "src/app/auth/auth.service";
import { ExcelService } from "src/app/dashboard/report/excel.service";
import { DialogComponent } from "../dialog/dialog.component";
import { IDialogConfiguration } from "../dialog/models/dialogConfiguration";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BalanceTabledialogComponent } from "./balance-tabledialog/balance-tabledialog.component";
import { ResourcesDashboardService } from '../../../pages/resources-dashboard/resources-dashboard.service'
import { forkJoin } from 'rxjs';
import { Observable } from 'rxjs';
import { NewDashboardService } from "src/app/pages/new-dashbords/new-dashboard.service";
export interface PeriodicElement {
  name: number;
  figures: string;
  weight: number;
  symbol: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { figures: "Liabilities", name: 200000, weight: 1.0079, symbol: 200000 },
  {
    figures: "Reserves & Surplus",
    name: 200000,
    weight: 4.0026,
    symbol: 200000,
  },
  {
    figures: "Grants, Contribution For Specific Purposes",
    name: 200000,
    weight: 6.941,
    symbol: 200000,
  },
  { figures: "Loans", name: 200000, weight: 9.0122, symbol: 200000 },
  {
    figures: "Current Liabilities & Provisions",
    name: 200000,
    weight: 10.811,
    symbol: 200000,
  },
  { figures: "Others", name: 200000, weight: 12.0107, symbol: 200000 },
  {
    figures: "Grants, Contribution For Specific Purposes",
    name: 200000,
    weight: 14.0067,
    symbol: 200000,
  },
  { figures: "others", name: 200000, weight: 15.9994, symbol: 200000 },
];

@Component({
  selector: "app-balance-table",
  templateUrl: "./balance-table.component.html",
  styleUrls: ["./balance-table.component.scss"],
  providers: [ExcelService],
})
export class BalanceTableComponent
  extends BaseComponent
  implements OnInit, OnChanges {
  // stateUlbData = JSON.parse(localStorage.getItem("ulbList"));
  // // stateData: any = this.stateUlbData;
  yearValue: any;
  yearSingleList: any;
  Types = new FormControl();
  // dropYears = new FormControl();
  currency = new FormControl();

  years: any[];
  response: any;
  report: any[];
  reqYear: any;
  selectedCurrency: any;
  selectedItems = [];
  dropdownSettings = {};
  typeList: { id: string; name: string }[] = [
    { id: "1", name: "One" },
    { id: "2", name: "two" },
    { id: "3", name: "three" },
    { id: "4", name: "Four" },
  ];
  yearsList: { id: string; itemName: string }[] = [
    { id: "2020-21", itemName: "2020-21" },
    { id: "2019-20", itemName: "2019-20" },
    { id: "2018-19", itemName: "2018-19" },
    { id: "2017-18", itemName: "2017-18" },
    { id: "2016-17", itemName: "2016-17" },
    { id: "2015-16", itemName: "2015-16" },
  ];
  currencyList: { id: string; value: number; name: string }[] = [
    // { id: "1", value: 10000000, name: "INR Crore" },
    { id: "2", value: 1000, name: "INR Thousand" },
    { id: "3", value: 100000, name: "INR Lakhs" },
  ];

  balanceTableHead: string[] = [
    "*Figures mentioned are in Rs. Crores",
    "2015-2016",
    "2016-2017",
    "2017-2018",
    "2018-2019",
    "2019-2020",
  ];
  displayedColumns: string[] = ["figures", "name", "weight", "symbol"];
  dataSource = ELEMENT_DATA;
  reportReq: IReportType;
  @Input() data: any;
  @Input() cityId: any;
  @Input() cityName: any;
  reportGroup: any;
  isComparative: any = false;
  @ViewChild("template") template;
  dialogRef;
  type: string = "Summary";
  id = null;
  ulbList: any;
  singleState: any;

  balanceInput: any = {};

  singleTableData: any;
  multipleTableData: any;
  compare: Boolean;

  ulbIdval: any[] = [];
  ulbListVal: any[] = [];

  isLoading: any = false;
  showtable: any = false;

  singleUlbList: any;
  ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
  // stateCode = JSON.parse(localStorage.getItem("ulbList")).data;
  // ulbStateMapping = JSON.parse(localStorage.getItem("ulbStateCodeMapping"));
  downLoadArray = [
    {
      tableId: 1,
      name: "City Dasboard Download",
      tableClass: "d_table",
      columns: [
        {
          key: "lineItem",
          display_name: "",
        },
        {
          key: "2015-16",
          display_name: "",
        },
        {
          key: "2016-17",
          display_name: "",
        },
        {
          key: "2017-18",
          display_name: "",
        },
        {
          key: "2018-19",
          display_name: "",
        },
        {
          key: "2019-20",
          display_name: "",
        },
      ],
      rows: [
        {
          lineItem: "Row Pdf",
          "2015-16": "asdfg",
          "2016-17": "dgfghj",
          "2017-18": "",
          "2018-19": "",
          "2019-20": "",
        },
        {
          lineItem: "Row Excel",
          "2015-16": "",
          "2016-17": "xdgcfgvbh",
          "2017-18": "",
          "2018-19": "",
          "2019-20": "",
        },
      ],
    },
  ];
  rawPdfData = [
    {
      imagePdf: `<a style="cursor: pointer"><i class="fa fa-file-pdf-o"></i></a>`,
      imageExcel: `<a style="cursor: pointer"><i class="fa fa-file-excel-o"></i></a>`,
    },
    {
      imagePdf: `<a style="cursor: pointer"><i class="fa fa-file-pdf-o"></i></a>`,
      imageExcel: `<a style="cursor: pointer"><i class="fa fa-file-excel-o"></i></a>`,
    },
    {
      imagePdf: `<a style="cursor: pointer"><i class="fa fa-file-pdf-o"></i></a>`,
      imageExcel: `<a style="cursor: pointer"><i class="fa fa-file-excel-o"></i></a>`,
    },
    {
      imagePdf: `<a style="cursor: pointer"><i class="fa fa-file-pdf-o"></i></a>`,
      imageExcel: `<a style="cursor: pointer"><i class="fa fa-file-excel-o"></i></a>`,
    },
    {
      imagePdf: `<a style="cursor: pointer"><i class="fa fa-file-pdf-o"></i></a>`,
      imageExcel: `<a style="cursor: pointer"><i class="fa fa-file-excel-o"></i></a>`,
    },
  ];
  ulbYears: any = [];
  currentUlbData: any;
  onItemSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    console.log(item);
    console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDeSelectAll(items: any) {
    console.log(items);
  }
  valueType = "absolute";
  defaultDailogConfiuration: IDialogConfiguration = {
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
            `/financial-statement/report/basic`
          );
          this.router.navigate(["/", "login"]);
        },
      },
      cancel: { text: "Cancel" },
    },
  };
  show = false;
  currencyConversionType: any = [
    { name: "INR", type: null },
    { name: "INR Thousands", type: 1000 },
    { name: "INR Lakhs", type: 100000 },
    { name: "INR Crores", type: 10000000 },
  ];
  sheetType = "Summary";
  //notDataFound:boolean = false;
  constructor(
    public newDashboardService: NewDashboardService,
    protected reportService: ReportService,
    public dialog: MatDialog,
    public activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    private _dialog: MatDialog,
    private router: Router,
    protected commonService: CommonService,
    private _resourcesDashboardService: ResourcesDashboardService,
    private _loaderService: GlobalLoaderService,
    private excelService: ExcelService // private commonService: CommonService, // private balanceTabeleService: BalanceTableService,
  ) {
    super();
    this.activatedRoute.queryParams.subscribe((val) => {
      console.log("val", val);
      const { cityId } = val;
      if (cityId) {
        console.log("stid", this.id);
        // this.id = this.cityId;
        this.id = cityId;
        sessionStorage.setItem("row_id", this.id);

        this.setUlbList(cityId);
      } else {
        this.id = sessionStorage.getItem("row_id");
      }
    });
  }
  openModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "39rem";
    this.dialogRef = this.dialog.open(this.template, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log("result", result);
    });
    this.isComparative = true;
  }
  currentUlbFilterData;
  allUlbsFilterData;
  setUlbList(ulbId) {
    this._loaderService.showLoader();
    this.currentUlbData = this.ulbMapping[this.id];
    this.ulbIdval.push(this.id);
    this.ulbListVal.push(this.currentUlbData);
    this.newDashboardService.getYearList(ulbId).subscribe((res: any) => {
      if (res.data) {
        const financialYear = res.data.sort((a, b) => (b.split("-")[0] - a.split("-")[0]));
        this.currentUlbFilterData = { ...this.currentUlbData, ulb: ulbId, financialYear };
        this.ulbYears = financialYear;
        this.yearsList = financialYear.map((e) => { return { id: e, itemName: e } });
      }
      this.compare = false;
      this._loaderService.stopLoader();
      if (!this.currentUlbFilterData || !this.currentUlbFilterData?.financialYear || !this.currentUlbFilterData?.financialYear?.length) {
        //  this.notDataFound = true;
        return;
      }
      this.createDataForBasicComp(this.reportGroup);
      this.show = true;
    },
      (err) => {
        this._loaderService.stopLoader();
        // this.notDataFound = true;
      }
    );
  }
  ulbName

  getUlbName(event) {
    console.log("value in balance table from basic component ", event)
    this.ulbName = event
    this.rawPDFFiles = []
    this.rawExcelFiles = []
    // this.getRawFiles();
  }
  openDialog(data: any, fileType: string) {
    console.log("openDialog", data);
    const dialogRef = this.dialog.open(BalanceTabledialogComponent, {
      data: { reportList: data, fileType: fileType },
      width: "500px",
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed");
    });
  }

  createDataForBasicComp(fromBs, filters?) {
    this._loaderService.showLoader();
    if (!this.currentUlbFilterData) return;
    let temp2;
    if (filters) {
      temp2 = filters;
    } else {
      temp2 = {
        isComparative: false,
        type: this.sheetType,
        years: this.currentUlbFilterData?.financialYear,
        yearList: this.currentUlbFilterData?.financialYear.map((val) => ({
          id: val,
          itemName: val,
        })),
        reportGroup: this.reportGroup,
        ulbList: [this.currentUlbFilterData],
        ulbIds: [this.currentUlbFilterData.ulb],
        valueType: this.valueType,
      };
    }

    if (fromBs == "Balance Sheet") {
      this.reportService.BSDetailed(temp2);
    } else {
      this.reportService.ieDetailed(temp2);

    }

  }

  // newUlbData: any;

  // selectYearValue(event: any) {
  //   this.yearValue = event.value;
  //   console.log("yearValue", this.yearValue);
  //   this.years = this.yearValue.map((ele) => ele.itemName);
  //   this.newUlbData = this.ulbListVal.map((elem) => {
  //     return {
  //       ...elem,
  //       financialYear: [...this.years],
  //       state: elem?.state.name,
  //       stateId: elem?.state._id,
  //       ulb: elem?.ulbType._id,
  //       ulbType: elem?.ulbType.name,
  //     };
  //   });
  //   console.log(this.years);
  // }

  closeModal() {
    this.dialogRef.close();
  }

  ulbVal(val) {
    this.ulbIdval = val;

    console.log("ulbVal", this.ulbIdval);
  }

  ulbValList(val) {
    this.ulbListVal = val;
    console.log("ulbListVal", this.ulbListVal);
  }

  selectedValueYears(val) {
    this.yearValue = val;
    console.log("selected year list", val);
  }

  selectedYea(val) {
    this.years = val;
    this.compare = true;

    console.log(
      "currentUlbFilterData",
      this.currentUlbFilterData,
      this.ulbIdval
    );
    let ulbIdArr = [];
    this.ulbListVal.forEach((el) => {
      ulbIdArr.push(el?._id);
    });
    let filters = {
      isComparative: false,
      type: this.sheetType,
      years: this.years,
      yearList: this.yearValue,
      reportGroup: this.reportGroup,
      ulbList: this.ulbListVal,
      ulbIds: ulbIdArr,
      valueType: this.valueType,
    };
    console.log("filers", filters);
    this._loaderService.showLoader()
    this.createDataForBasicComp(this.reportGroup, filters);
    this._loaderService.stopLoader()
    // setTimeout(() => {
    //   this.invokeHidden();
    // }, 500);
    console.log("selected Value", val);
  }

  searchEnable() {
    if (this.ulbListVal.length && this.yearValue) {
      return false;
    }
    return true;
  }

  // document.getElementById("trigger").click();

  createUpdateTable(cityId = null) {
    if (cityId) this.id = cityId.currentValue;
    // this.balanceInput.ulbList =
    //   this.stateCode[this.ulbStateMapping[this.id]].ulbs;
    // .filter((elem) => {
    //   if (elem?._id === this.id) {
    //     return elem;
    //   }
    // });
    this.balanceInput.ulbIds = [this.id];
    this.getBalanceTableData(this.balanceInput, true);
  }

  ExistingValues() {
    if (this.ulbIdval.indexOf(this.id) === -1) {
      this.ulbIdval.push(this.id);
      this.ulbListVal.push(this.currentUlbData);
    }

  }

  createMultipleUpdateTable() {
    this.ExistingValues();
    this.showtable = true;
    // this.balanceInput.ulbList = this.newUlbData;

    this.balanceInput.ulbList = this.ulbListVal;
    this.balanceInput.ulbIds = this.ulbIdval;
    this.balanceInput.yearList = this.yearValue;
    this.balanceInput.years = this.years;
    console.log("multipleTableData", this.balanceInput);
    this.getBalanceTableData(this.balanceInput);
  }

  getBalanceTableData(inputValue, fromSingle = false) {
    if (this.reportGroup == "Balance Sheet") {
      // this.reportService.BSDetailed(inputValue).subscribe((res) => {
      //   if (fromSingle) this.singleTableData = res.data;
      //   else {
      //     this.multipleTableData = res.data;
      //     console.log("sigleTableData", this.multipleTableData);
      //   }
      //   this.isLoading = true;
      // });
    }
    if (this.reportGroup == "Income & Expenditure Statement") {
      // this.reportService.ieDetailed(inputValue).subscribe((res) => {
      //   if (fromSingle) this.singleTableData = res.data;
      //   else {
      //     this.multipleTableData = res.data;
      //     console.log("sigleTableData", this.multipleTableData);
      //   }
      //   // this.singleTableData = res.data;
      //   console.log("sigleTableData", this.singleTableData);
      //   this.isLoading = true;
      // });
    }
  }

  invokeHidden() {
    document.getElementById("getMultipleChants").click();
  }

  ngOnInit() {
    console.log("disableDropDown", this.disableDropDown);
    this.selectedItems = [];

    this.dropdownSettings = {
      singleSelection: false,
      text: "Select Conversion  ",
      selectAllText: "Select All",
      unSelectAllText: "UnSelect All",
      enableSearchFilter: false,
      classes: "myclass custom-class",
    };
    // this.getRawFiles()
  }
  rawPDFFiles = []
  rawExcelFiles = []
  // TODO: check and remove the function
  getRawFiles() {

    // let category
    // if (this.reportGroup == "Balance Sheet") {
    //   category = "balance"
    // } else if (this.reportGroup == "Income & Expenditure Statement") {
    //   category = "income"
    // }

    // let year = ["2015-16", "2016-17", "2017-18", "2018-19", "2019-20", "2020-21"]
    // const calls = [];
    // this.currentUlbFilterData.financialYear.forEach(element => {
    //   calls.push(this._resourcesDashboardService.getDataSets(element, "pdf", category, "", this.ulbName, ""));
    // });
    // forkJoin(calls).subscribe(responses => {
    //   // console.log(responses)
    //   responses.forEach(el => {

    //     this.rawPDFFiles.push(el['data'][0] ?? { fileUrl: "N/A" })

    //   })
    //   console.log("raw pdfs", this.rawPDFFiles)

    // });
    // const calls1 = []
    // this.currentUlbFilterData.financialYear.forEach(element => {
    //   calls1.push(this._resourcesDashboardService.getDataSets(element, "excel", category, "", this.ulbName, ""));
    // });
    // forkJoin(calls1).subscribe(responses => {
    //   // console.log(responses)
    //   responses.forEach(el => {
    //     this.rawExcelFiles.push(el['data'][0] ?? { fileUrl: "N/A" })
    //   })
    //   console.log("raw excels", this.rawExcelFiles)
    // });
    // for(let el of year){

    //   this._resourcesDashboardService.getDataSets(el, "pdf", category, "", this.ulbName, "").subscribe(res => {
    //     if(res['data'].length)
    //     this.rawPDFFiles.push(res['data'][0]);
    //   })
    //   this._resourcesDashboardService.getDataSets(el, "excel", category, "", this.ulbName, "").subscribe(res=> {
    //     if(res['data'].length)
    //     this.rawExcelFiles.push(res['data'][0]);
    //   })
    // }
    // console.log(this.rawPDFFiles, this.rawExcelFiles)

  }
  download() {
    const isUserLoggedIn = this._authService.loggedIn();
    if (!isUserLoggedIn) {
      const dailogboxx = this._dialog.open(DialogComponent, {
        data: this.defaultDailogConfiuration,
        width: "28vw",
      });
      return;
    }
    const reportTable = document.querySelector("table").outerHTML;
    const title = this.reportReq + " " + this.reportGroup;
    // let currencyConversionName =
    //   this.currenyConversionForm.value.type &&
    //   this.currenyConversionForm.value.type[0] &&
    //   this.currenyConversionForm.value.type[0].type
    //     ? this.currenyConversionForm.value.type[0].name
    //     : null;
    // if (currencyConversionName) {
    //   currencyConversionName =
    //     document.getElementById("currencyWarning").textContent;
    // }
    // if (this.reportReq.valueType === "per_capita") {
    //   currencyConversionName = " NOTE: Values are in Per Capita format";
    // }
    this.excelService.transformTableToExcelData(title, reportTable, "IE", null);

    this.reportService.addLogByToken("Income-Expenditure");
  }

  ngOnChanges(changes: SimpleChanges): void {

    // this.invokeHidden();
    console.log("balance table", changes, this.data);

    this._loaderService.showLoader();
    this.reportGroup = this.data.name == "Balance Sheet" ? this.data.name : "Income & Expenditure Statement";
    this.resetCompare();

    this.balanceInput.isComparative = this.isComparative;
    this.balanceInput.type = this.type;
    this.balanceInput.reportGroup = this.reportGroup;
    this.balanceInput.valueType = "absolute";
    if (this.years) {
      if (this.data.name) {
        this.createMultipleUpdateTable();
        console.log("Multple Changes", changes);
      }
    } else {
      if (!changes.cityId?.firstChange || this.data.name) {
        this.createUpdateTable(changes.cityId);
      }
    }
    this._loaderService.stopLoader();
    // if (changes && changes.cityId) {
    //   this.ExistingValues();
    // }
  }
  resetCompare() {
    this.compare = false;
    this.valueType = "absolute";
    this.sheetType = "Summary";
    this._loaderService.showLoader()
    this.createDataForBasicComp(this.reportGroup);
    this._loaderService.stopLoader()
    this.ulbListVal = [];
    this.ulbIdval = [];
    this.yearValue = [];
    this.years = [];
  }

  disableDropDown: boolean = false;

  valueTypeChange(event, type) {
    console.log(event.value, "change in value type", this.years);
    this.valueType = event.value;

    if (this.years.length > 0) {
      this.createMultipleUpdateTable();
      this.selectedYea(this.years);
    } else {
      this._loaderService.showLoader()
      this.createDataForBasicComp(this.reportGroup);
      this._loaderService.stopLoader()
    }
    if (this.valueType == "per_capita") {
      this.disableDropDown = true;
    } else {
      this.disableDropDown = false;
    }
  }
  valueTypeR = "Summary";
  valueTypeReport(event, type) {
    console.log("radio btn", event, type);
    this.sheetType = event?.value;
    this.valueTypeR = event?.value;
    this._loaderService.showLoader()
    if (this.years.length > 0) {
      this.createMultipleUpdateTable();
      this.selectedYea(this.years);
    } else {
      this.createDataForBasicComp(this.reportGroup);
    }
    this._loaderService.stopLoader()
  }

  selectCurrencyValue: any;
  onSelectingConversionType(event: any) {
    let selectedType = this.currencyConversionType.find(
      (item) => item?.type == event.target.value
    );
    const defaultConversionType = { name: "INR", type: null };
    this.selectCurrencyValue = event.target.value ? event.target.value : null;
    this.reportService.selectedConversionType.next(
      selectedType ? selectedType : defaultConversionType
    );
  }

  allReports: any = [];
  getReport_pastYears(year) {
    let category
    if (this.reportGroup == "Balance Sheet") {
      category = "balance"
    } else if (this.reportGroup == "Income & Expenditure Statement") {
      category = "income"
    }
    this._resourcesDashboardService.getDataSets(year, "pdf", category, "", this.ulbName, "").subscribe(res => {
      console.log(res['data'])
      if (res['data'].length == 0) {
        this.openDialog(res["data"], "notFound");
      } else {

        window.open(res['data'][0]['fileUrl'])
      }
    })
  }
  getReport(selectedYear: string, fileType: string) {
    const yearSplit = Number(selectedYear.split('-')[0]);
    if (yearSplit < 2019) {
      this.getReport_pastYears(selectedYear);
      return
    }
    this._loaderService.showLoader();
    this.reportService.getReports(this.id, selectedYear).subscribe(
      (res) => {
        this._loaderService.stopLoader();
        let type = 'notFound';
        if (res && res["success"]) {
          console.log("getReports", res);
          this.allReports = res["data"];
          type = res["data"][fileType].length ? fileType : 'notFound';
        }
        this.openDialog(res["data"], type);
      },
      (error) => {
        this._loaderService.stopLoader();
        console.log(error);
      }
    );
  }
}
