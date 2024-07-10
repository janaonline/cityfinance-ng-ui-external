import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DashboardService } from "../../services/dashboard/dashboard.service";
import { GlobalLoaderService } from "../../services/loaders/global-loader.service";

@Component({
  selector: "app-slb-charts",
  templateUrl: "./slb-charts.component.html",
  styleUrls: ["./slb-charts.component.scss"],
})
export class SlbChartsComponent implements OnInit, OnChanges {
  yearListDropdown: { year: string; isDataAvailable: boolean; }[] = [];
  typeName: any;
  constructor(
    public dashboardServices: DashboardService,
    public dialog: MatDialog,
    public loaderService: GlobalLoaderService,
    private snackbar: MatSnackBar
  ) { }
  @Input() showYearDropdown: boolean = true;
  isCompare = false;
  slbGaugeCharts = [];
  @Input() data: any;
  @Input() cityId: any;
  aboutSlbCharts = "";
  dialogRef;
  @ViewChild("template") template;
  @Output()
  compareChange = new EventEmitter();
  slbToCompare: boolean = true;

  @Input()
  compareDialogType = 3;
  compareType = "";
  compareByName;
  @Input() year;
  ulbList;
  yearList = [
    "2015-16",
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
    "2021-22",
  ];
  chartLabels = [
    {
      svg: false,
      name: "Benchmark",
      color: "#29CFD6",
    },
    {
      svg: false,
      name: "National avg",
      color: "#FFC80F",
    },
    {
      svg: false,
      name: "ulb",
      color: "#224BD5",
    },
    {
      svg: true,
      name: "ULB performance is better than national avg",
    },
  ];

  yearValueChange(value) {
    console.log("yearValueChange", value);
    this.year = value;
    this.getData();
  }

  ngOnInit(): void {
    this.yearList = this.yearList.reverse();
    console.log("data slb charts", this.data);
  }
  ngOnChanges(changes: SimpleChanges): void {
    console.log("slbChartOnChanges", changes);
    if (changes.data) {
      this.aboutSlbCharts = this.data?.mainContent[0]?.about;
      // this.getData();
    }
    if (changes.cityId) {
      this.ulbList = JSON.parse(localStorage.getItem("ulbMapping"));
    }
    if (changes && changes.year && changes.year.currentValue) {
      this.year = changes.year.currentValue;
      console.log(this.year);
      // this.getData();
    }
    this.getType();
    this.slbYears();
    // this.getData();
  }

  slbYears() {
    this.loaderService.showLoader();
    let queryParams = {
      ulb: this.cityId,
      type: this.typeName,
    };

    this.dashboardServices.slbYears(queryParams).subscribe((res: any) => {
      const years = res.data.sort((a, b) => (b.split("-")[0] - a.split("-")[0]));
      this.year = years.length ? years[0] : '';
      this.yearListDropdown = this.yearList.map(e => {
        return { year: e, isDataAvailable: years.includes(e) };
      });
      this.loaderService.stopLoader();
      this.getData();
    },
      (error) => {
        this.loaderService.stopLoader();
        console.log(error);
      });
  }
  getType() {
    this.typeName = this.data.name;
    switch (this.data.name) {
      case "Storm Water Drainage":
        this.typeName = "storm water";
        break;
      case "Solid Waste Management":
        this.typeName = "solid waste";
        break;
      case "Waste Water Management":
        this.typeName = "sanitation";
        break;
    }
  }
  CompFlag: any = "";
  getData() {
    this.loaderService.showLoader();

    let queryParams = {
      compUlb: this.compareType,
      ulb: this.cityId,
      type: this.typeName,
      year: this.year,
    };

    this.dashboardServices.fetchCitySlbChartData(queryParams).subscribe(
      (res: any) => {
        this.loaderService.stopLoader();
        console.log("city respo", res);
        this.chartLabels = this.chartLabels.map((value) => {
          if (value.name == "ulb") {
            value.name = this.ulbList[this.cityId].name;
          }
          return value;
        });
        if (
          res["data"].length &&
          res["data"][0].hasOwnProperty("compPercentage")
        ) {
          this.chartLabels[0] = {
            svg: false,
            name: this.ulbList[this.compareType].name,
            color: "#04D30C",
          };
        }

        res.data.map((value) => {
          value.value = Math.round(value.value);
          if (value.percentage)
            value.percentage = Number(value.percentage.toFixed(2));
          else value.percentage = 0;
          if (value.value === "NA") {
            value.value = 0;
          }
        });
        this.slbGaugeCharts = res?.data.map((value, Index) => {
          Object.assign(value, { type: 6 });
          Object.assign(value, { chartId: Index + "slb-Charts" + value.type });
          Object.assign(value, {
            ulbName: this.ulbList[this.cityId].name,
            compUlb: this.ulbList[this.compareType]?.name,
          });
          return value;
        });

        this.slbGaugeCharts.forEach((elem) => {
          if (elem.compPercentage) {
            this.CompFlag = true;
          } else {
            this.CompFlag = false;
          }
        });

        this.showSnackBar();
        console.log("slbGaugeCharts", this.slbGaugeCharts, this.CompFlag);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  modalVal: boolean = false;

  openModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "39rem";
    this.dialogRef = this.dialog.open(this.template, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log("result", result);
    });
    this.modalVal = true;
  }

  showSnackBar() {
    if (!this.CompFlag && this.modalVal) {
      this.snackbar.open(`No data found for ${this.compareByName}`, null, {
        duration: 5000,
        verticalPosition: "bottom",
      });
      return;
    }
  }

  closeModal() {
    this.dialogRef.close();
  }

  ownRevenueCompValue(value) {
    this.compareChange.emit(value);
  }

  getCompareCompValues(value) {
    if (Array.isArray(value)) {
      this.compareType = value[0]._id;
      this.compareByName =
        this.ulbList[this.compareType].name.split(" ")[0] + "...";
      this.getData();
      return this.sendValue(value);
    } else this.compareType = value;
    this.compareByName = value;
    this.sendValue();
    this.getData();
  }
  sendValue(ulbs = []) {
    let data = {
      year: this.year.value,
      ulbs: ulbs,
      compareType: this.compareType,
    };
    this.compareChange.emit(data);
  }

  clearAll() {
    this.modalVal = false;
    this.compareByName = "";
    this.compareType = "";
    if (this.chartLabels.length === 4) {
      this.chartLabels[0] = {
        svg: false,
        name: "Benchmark value",
        color: "#29CFD6",
      };
    }

    this.getData();
  }
}
