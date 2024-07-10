import { I } from "@angular/cdk/keycodes";
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  TemplateRef,
  HostListener,
  AfterContentInit,
  AfterViewInit,
} from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
// import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import * as fileSaver from "file-saver";

import Chart from "chart.js";
import { FilterModelBoxComponent } from "../resources-dashboard/filter-model-box/filter-model-box.component";
import { OwnRevenueService } from "./own-revenue.service";
import { CommonService } from "src/app/shared/services/common.service";
import { GlobalLoaderService } from "../../../app/shared/services/loaders/global-loader.service";
import { ActivatedRoute } from "@angular/router";
@Component({
  selector: "app-own-revenue-dashboard",
  templateUrl: "./own-revenue-dashboard.component.html",
  styleUrls: ["./own-revenue-dashboard.component.scss"],
})
export class OwnRevenueDashboardComponent implements OnInit {
  barChartCmpBtn = true;
  displayDoughnut: boolean = true;
  displayButtons: boolean = false;
  ownTab = true;
  proTab = false;
  barChartTitle = "";
  dataAvailable = 0;
  lastBarChartValue;
  compareDialogType = 2;
  preSelectedOwnRevenueDbParameter: string = "Own Revenue per Capita";
  deSelectStateObject = {_id: 'State Name'};

  dropdownSettings = {
    singleSelection: true,
    text: "State Name",
    enableSearchFilter: true,
    labelKey: "name",
    primaryKey: "_id",
    showCheckbox: false,
    classes: "filter-component",
  };

  state = new FormControl();
  // propertyTaxVal: boolean = false;
  changeTab(type) {
    this._loaderService.showLoader();
    if (type == "own") {
      this.preSelectedOwnRevenueDbParameter = "Own Revenue per Capita";
      this.displayDoughnut = true;
      this.displayButtons = false;
      this.ownTab = true;
      this.proTab = false;
      // this.propertyTaxVal = false;

      this.filterGroup.controls.propertyTax.setValue("");
    }
    if (type == "pro") {
      this.preSelectedOwnRevenueDbParameter = "Property Tax per Capita";
      this.displayDoughnut = false;
      this.displayButtons = true;
      this.ownTab = false;
      this.proTab = true;
      this.tempDataHolder = {
        param: "Property Tax per Capita",
        type: "ULBs",
      };
      this.filterGroup.controls.propertyTax.setValue(true);
    }
    this.allCalls();
  }

  isLoading: any = false;

  @ViewChild("ownRevenueFiltersPopup")
  private ownRevenueFiltersPopup: TemplateRef<any>;
  sticky: boolean = false;
  ToggleString: string = "";
  showButton: boolean = true;
  @HostListener("window:scroll", ["$event"])
  doSomething(event) {
    // console.debug("Scroll Event", document.body.scrollTop);
    // see András Szepesházi's comment below
    // console.log("Scroll Event", window.pageYOffset);
    if (window.pageYOffset > 354) {
      this.sticky = true;
    } else {
      this.sticky = false;
    }
  }
  close() {
    this.ToggleString = "";
    this.showButton = true;
  }
  open() {
    this.ToggleString =
      "the year YY. Data is not available for AA, BB and CC Municipal Corporation. For more details, download thecomplete set of ULBs for which the data is available for the year YY.";
    this.showButton = false;
  }

  // Dummy data for table
  columnAttribute = [
    { id: 1, title: "ULB Population Category" },
    { id: 2, title: "Weighted Average Own Revenue (In Rs. Crores)" },
    { id: 3, title: "Median Own Revenue per Capita (₹)" },
    {
      id: 4,
      title: "Weighted Average Own Revenues to Revenue Expenditure(%)",
    },
    {
      id: 5,
      title: "Cities where Own Revenues meet Revenue Expenditure(%)",
    },
  ];

  columnAttributeProperty = [
    { id: 1, title: "ULB Population Category" },
    {
      id: 2,
      title: "Weighted Average Property Tax Revenue Collections (In Crore Rs.)",
    },
    { id: 3, title: "Median Property Tax Revenue per Capita" },
    {
      id: 4,
      title:
        "Weighted Average Property Tax Revenue as percentage of Own Revenue",
    },
  ];

  users = [
    {
      id: 1,
      name: "4 Million+",
      averageRevenue: "0",
      median: "0",
      meetsRevenue: "0",
      avgRevenueMeet: "0",
    },
    {
      id: 2,
      name: "1 Million - 4 Million",
      averageRevenue: "0",
      median: "0",
      meetsRevenue: "0",
      avgRevenueMeet: "0",
    },
    {
      id: 3,
      name: "500 Thousand - 1 Million",
      averageRevenue: "0",
      median: "0",
      meetsRevenue: "0",
      avgRevenueMeet: "0",
    },
    {
      id: 4,
      name: "100 Thousand-500 Thousand",
      averageRevenue: "0",
      median: "0",
      meetsRevenue: "0",
      avgRevenueMeet: "0",
    },
    {
      id: 5,
      name: "<100 Thousand",
      averageRevenue: "0",
      median: "0",
      meetsRevenue: "0",
      avgRevenueMeet: "0",
    },
  ];

  doughnutChartId = `ownRevenue-doughnutChart`;
  barChartId = `ownRevenue-barChart`;

  doughnutChartData = {
    type: "doughnut",
    data: {
      labels: [],
      datasets: [
        {
          data: [],
          backgroundColor: [
            "#76d12c",
            "#ed8e3b",
            "#15c3eb",
            "#eb15e3",
            "#e6e21c",
            "#fc3d83",
          ],
          fill: false,
        },
      ],
    },
  };
  doughnutChartOptions = {
    maintainAspectRatio: false,
    cutoutPercentage: 50,
    responsive: true,

    legend: {
      position: "bottom",
      labels: {
        usePointStyle: true,
        pointStyle: "rect",
        padding: 25,
        boxWidth: 20,
        boxHeight: 23,
        fontSize: 13,
        // generateLabels: function (chart) {
        //   console.log("generateLabels", chart);
        //   const datasets = chart.data.datasets;
        //   console.log("datasets", datasets);
        //   console.log("chart.labels", chart.data.labels);
        //   let total = chart.data.datasets[0].data.reduce((sum, val) => {
        //     return sum + val;
        //   }, 0);
        //   console.log("total", total);
        //   // datasets[0].data.map((item, i) => console.log('item', item, 'i====>', i, 'divide', (item / total) * 100 + 0.5));
        //   // var percentage = Math.floor((data / total) * 100 + 0.5);
        //   // return datasets[0].data.map((data, i) => ({
        //   //   text: `${chart.data.labels[i]}: ${ (((data / total) * 100 + 0.5) < 1) ? ((data / total) * 100 + 0.5).toFixed(1) : Math.floor((data / total) * 100 + 0.5)}%`,
        //   //   fillStyle: datasets[0].backgroundColor[i],
        //   // }));
        //   return datasets[0].data.map((data, i) => ({
        //     text: `${chart.data.labels[i]}: ${Math.floor(
        //       (data / total) * 100 + 0.5
        //     )}%`,
        //     fillStyle: datasets[0].backgroundColor[i],
        //   }));
        // },
      },
      onClick: (e) => e.stopPropagation(),
    },

    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          var dataset = data.datasets[tooltipItem.datasetIndex];
          var model =
            dataset._meta[Object.keys(dataset._meta)[0]].data[tooltipItem.index]
              ._model;
          var total = dataset.data.reduce(function (
            previousValue,
            currentValue,
            currentIndex,
            array
          ) {
            return previousValue + currentValue;
          });
          var currentValue = dataset.data[tooltipItem.index];
          console.log("currentValue", currentValue);
          // var percentage = (((data / total) * 100 + 0.5) < 1) ? ((data / total) * 100 + 0.5).toFixed(1) : Math.floor((currentValue / total) * 100 + 0.5);
          var percentage = Math.floor((currentValue / total) * 100 + 0.5);
          console.log("percentage", percentage);
          // return percentage + "%";
          return `${model?.label}: ${percentage}%`;
        },
      },
    },

    animation: {
      duration: 500,
      easing: "easeOutQuart",
      onComplete() {
        const thisCtx = this.chart.ctx;
        thisCtx.font = Chart.helpers.fontString(
          Chart.defaults.global.defaultFontFamily,
          "normal",
          Chart.defaults.global.defaultFontFamily
        );
        thisCtx.textAlign = "center";
        thisCtx.textBaseline = "bottom";
        this.data.datasets.forEach((dataset, index) => {
          for (let i = 0; i < dataset.data.length; i += 1) {
            const textSize = 12;
            const model =
              dataset._meta[Object.keys(dataset._meta)[0]].data[i]._model;

            const total = dataset._meta[Object.keys(dataset._meta)[0]].total;
            const midRadius =
              model.innerRadius + (model.outerRadius - model.innerRadius) / 2;
            const startAngle = model.startAngle;
            const endAngle = model.endAngle;
            const midAngle = startAngle + (endAngle - startAngle) / 2;

            const x = midRadius * Math.cos(midAngle);
            const y = midRadius * Math.sin(midAngle);

            /* Calculating the area of the doughnut sector. */
            let angle = endAngle - startAngle;
            let doughnutSectorArea =
              (angle / 2) *
              (model.outerRadius - model.innerRadius) *
              (model.outerRadius + model.innerRadius);

            /* Checking if the doughnutSectorArea is greater than 1200. If it is, it sets the fillStyle to white.
          If it is not, it sets the fillStyle to black. Darker text color for lighter background*/
            // thisCtx.fillStyle = doughnutSectorArea > 1200 ? '#fff' : '#000';
            var isBGColorDarkOrLight = lightOrDark(model?.backgroundColor);
            thisCtx.fillStyle = isBGColorDarkOrLight
              ? isBGColorDarkOrLight == "light"
                ? "#000000"
                : "#ffffff"
              : "#000000";
            var fontSize = 14;
            var fontStyle = "normal";
            var fontFamily = "sans-serif";
            thisCtx.font = Chart.helpers.fontString(
              fontSize,
              fontStyle,
              fontFamily
            );

            const percent = `${String(
              Math.round((dataset.data[i] / total) * 100)
            )}%`;
            /* if need to add the percentage with absolute value uncomment the below line. */
            // thisCtx.fillText(model.label, model.x + x, model.y + y);
            // thisCtx.fillText(dataset.data[i] + percent, model.x + x,
            //   model.y + y + (textSize * 1.3));

            if (dataset.data[i] != 0 && doughnutSectorArea > 1200) {
              thisCtx.fillText(
                percent,
                model.x + x,
                model.y + y + textSize * 1.3
              );
            }
          }
        });
      },
    },
  };
  doughnutChartTitle =
    "The following pie chart provides the split of the contribution of own revenue streams to own revenue.";

  barChartData = barChart;
  barChartStatic;
  barChartStaticOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Amount in INR",
          },
          gridLines: {
            offsetGridLines: true,
            display: false,
          },
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
    legend: {
      position: "bottom",
      labels: {
        padding: 35,
        boxWidth: 24,
        boxHeight: 18,
      },
    },
    animation: {
      onComplete: function (animation) {
        var chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.fillStyle = "#6E7281";
        ctx.font = Chart.helpers.fontString(
          Chart.defaults.global.defaultFontSize,
          Chart.defaults.global.defaultFontStyle,
          Chart.defaults.global.defaultFontFamily
        );
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";

        this.data.datasets.forEach(function (dataset, i) {
          var meta = chartInstance.controller.getDatasetMeta(i);
          if (meta.type == "line") return true;
          meta.data.forEach(function (bar, index) {
            var data = dataset.data[index];
            console.log("chartOption Data", data);

            ctx.fillText("₹ " + data, bar._model.x, bar._model.y - 5);
          });
        });
        console.log(animation, "animation");
      },
    },
  };

  allUlbData = JSON.parse(localStorage.getItem("ulbList")).data;
  stateIds = JSON.parse(localStorage.getItem("stateIdsMap"));
  filteredOptions;
  loadData() {
    this.filterGroup?.controls?.ulb?.valueChanges.subscribe((value) => {
      if (value?.length >= 1) {
        this.getUlbForAutoComplete(value);
      } else {
        let emptyArr: any = [];
        this.filteredOptions = emptyArr;
        return null;
      }
    });
  }

  get stateList() {
    return Object.entries(this.stateIds).map(([_id, name]) => ({_id, name}))
  }
  getUlbForAutoComplete(value, autoSelectUlb = false) {
    const stateId = this.filterGroup?.controls?.stateId?.value;
    console.log("stateId", stateId);
    this._commonServices
      .postGlobalSearchData(
        value,
        "ulb",
        stateId && stateId != "State Name" ? stateId : ""
      )
      .subscribe((res: any) => {
        console.log(res?.data, "getUlbForAutoComplete");
        let emptyArr: any = [];
        this.filteredOptions = emptyArr;
        if (res?.data.length > 0) {
          this.filteredOptions = res?.data;
          if (autoSelectUlb) {
            this.filterData("ulb", res["data"][0]);
          }
          //this.noDataFound = false;
        } else {
          let emptyArr: any = [];
          this.filteredOptions = emptyArr;
          // this.noDataFound = true;
          console.log("no data found");
        }
      });
  }

  filterGroup = new FormGroup({
    stateId: new FormControl("State Name"),
    ulb: new FormControl(""),
    ulbType: new FormControl("ULB Type"),
    populationCategory: new FormControl("ULB Population Category"),
    financialYear: new FormControl("2020-21"),
    propertyTax: new FormControl(""),
  });

  ulbList = [];
  ulbTypeList = [];
  populationCategoryList = [
    "ULB Population Category",
    "4 Million+",
    "1 Million - 4 Million",
    "500 Thousand - 1 Million",
    "100 Thousand - 500 Thousand",
    "<100 Thousand",
  ];

  yearList = ["2018-19", "2019-20", "2020-21", "2021-22"];
  //Table Data Ends

  @Input()
  cardData = [
    revenueCollection,
    revenuePerCapita,
    revenuePercentage,
    revenueExpenditure,
  ];

  body: any;
  financialYear: any;
  sourceDashboardName: string = 'Own Revenue Performance';
  constructor(
    private ownRevenueService: OwnRevenueService,
    private dialog: MatDialog,
    public _loaderService: GlobalLoaderService,
    public _commonServices: CommonService,
    private _activatedRoute: ActivatedRoute
  ) {
    this.isLoading = true;
    console.log("loader", this.isLoading);
    // if(this.isLoading)(document.activeElement as HTMLElement).blur();
    this._activatedRoute.queryParams.subscribe((param) => {
      this.cityName = param.cityName;
    });
  }
  cityName;
  ngOnInit(): void {
    this.loadData();

    window.scrollTo(0, 0);
    this.getYearList();
    this.createDataForFilter();
    this.getBarChartData();
    // this.barChartTitle = "Compare states/ULBs on various financial indicators";

    if (this.cityName) {
      this.filterGroup.controls.ulb.setValue(this.cityName);
      this.getUlbForAutoComplete(this.cityName, true);
    } else {
      this.allCalls();
      this.halfDoughnutChart();
      // window.onload = () => {
      //   this.createBarChart();
      // };
    }
  }

  filterData(param, val) {
    console.log("filter form", this.filterGroup);
    if (param == "ulb") {
      console.log(val);
      let pop;
      if (val?.population > 4000000) {
        pop = "4 Million+";
      } else if (val?.population < 4000000 && val?.population > 1000000) {
        pop = "1 Million - 4 Million";
      } else if (val?.population < 1000000 && val?.population > 500000) {
        pop = "500 Thousand - 1 Million";
      } else if (val?.population < 500000 && val?.population > 100000) {
        pop = "100 Thousand - 500 Thousand";
      } else if (val?.population < 100000) {
        pop = "<100 Thousand";
      }
      this.filterGroup.patchValue({
        stateId: val?.state?._id,
        ulbType: val?.ulbType?._id,
        populationCategory: pop,
      });
    } else if (param == "state") {
      this.filterGroup.patchValue({
        ulb: "",
        ulbType: "ULB Type",
        populationCategory: "ULB Population Category",
      });
    } else if (param == "ulbType") {
      this.filterGroup.patchValue({
        ulb: "",
        stateId: "State Name",
        populationCategory: "ULB Population Category",
      });
    } else if (param == "popCat") {
      this.filterGroup.patchValue({
        ulb: "",
        stateId: "State Name",
        ulbType: "ULB Type",
      });
    } else if (param == "year") {

      // this.filterGroup.patchValue({
      //   ulb: ""
      // })
    }
    this.allCalls();
  }

  allCalls() {
    console.log("this.filterGroup.value", this.filterGroup.value);
    this.getPieChartData();
    this.cardsData();
    this.tableData();
    this.getAvailableData();
    this.getYearList();
    this.getBarChartData();
  }

  getYearList() {
    this.body = {
      ...this.filterGroup.value,
      propertyTax: !this.ownTab,
    };

    this.ownRevenueService.getYearList(this.body).subscribe(
      (res) => {
        // this._loaderService.stopLoader()
        let data = res["data"];
        this.yearList = [];
        data.forEach((el) => {
          this.yearList.push(el._id);
        });
      },
      (err) => {
        console.log("error", err);
      }
    );
  }
  clearFilter() {
    this.filterGroup.patchValue({
      stateId: "State Name",
      ulb: "",
      ulbType: "ULB Type",
      populationCategory: "ULB Population Category",
      // financialYear: "2020-21",
      financialYear: this.yearList?.length ? this.yearList[0] : "2020-21",
    });
    this.allCalls();
  }
  pieChartLoading = true;
  chartDataNotFound = false;
  pieChartColor = [
    "#76d12c",
    "#ed8e3b",
    "#15c3eb",
    "#eb15e3",
    "#e6e21c",
    "#fc3d83",
    "#11BC46",
    "#456EDE",
    "#224CC0",
    "#000000",
    "#DAE2FD",
    "#626262",
    "#FFC093",
    "#304D89"
  ];
  getPieChartData() {
    this.pieChartLoading = true;
    let temp = {
      type: "doughnut",
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            fill: false,
          },
        ],
      },
    };
    this.ownRevenueService
      .getPieChartData(this.filterGroup.getRawValue())
      .subscribe(
        (res) => {
          if (res["data"][0]["amount"] == null && !res["data"][1]) {
            this.chartDataNotFound = true;
            this.pieChartLoading = false;
            return;
          }
          res["data"].map((value, index) => {
            this.chartDataNotFound = false;
            temp.data.labels.push(value?._id["revenueName"]);
            temp.data.datasets[0].data.push(value?.amount);
            temp.data.datasets[0].backgroundColor.push(value?.colour ? value?.colour : this.pieChartColor[index % this.pieChartColor.length]);
            this.isLoading = false;
            this.pieChartLoading = false;
          });
          this.doughnutChartData = temp;
        },
        (err) => {
          this.pieChartLoading = false;
          this.isLoading = false;
        }
      );
  }
  myBarChart;
  createBarChart() {
    if (this.myBarChart) {
      this.myBarChart.destroy();
    }
    //dom is fully loaded, but maybe waiting on images & css files
    window.onload = function () {
      const canvas = <HTMLCanvasElement>(
        document.getElementById("ownRevenue-barChart")
      );
      const ctx = canvas.getContext("2d");
      let data: any = this.barChartData;
      this.myBarChart = new Chart(ctx, {
        type: "bar",
        data: data,
      });
    };
    this.barChartStatic = this.barChartStaticOptions;
  }

  createDataForFilter() {
    for (const key in this.allUlbData) {
      const element = this.allUlbData[key];
      element.ulbs.map((value) => {
        this.ulbList.push(value);
      });
    }

    this.ownRevenueService.getULBTypeList().subscribe(
      (res) => {
        console.log(res, "getULBTypeList");
        this.ulbTypeList = res["data"];
      },
      (error) => {}
    );
  }

  defaultFilterStage: boolean = false;
  mobileFilterData: any;
  openFilter() {
    const dialogRef = this.dialog.open(FilterModelBoxComponent, {
      width: "100%",
      height: "100%",
      data: {
        ulbTypeList: this.ulbTypeList,
        populationCategoryList: this.populationCategoryList,
        yearList: this.yearList,
        preSelectedValue: { ...this.mobileFilterData, ...this.tempDataHolder },
        defaultStage: this.defaultFilterStage,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log("The dialog was closed", result);
      if (result && result.filterForm) {
        this.defaultFilterStage = result?.defaultStage;
        this.mobileFilterData = result?.filterForm;
        this.patchFormData(result?.filterForm);
      }
    });
  }

  patchFormData(formData: any) {
    console.log("patchValue", formData);
    this.filterGroup.patchValue({
      stateId: formData && formData?.stateId,
      ulb: formData && formData?.ulb,
      ulbType: formData && formData?.ulbType,
      populationCategory: formData && formData?.populationCategory,
      financialYear: formData && formData?.financialYear,
    });
    this.allCalls();
  }

  notFoundNames = [];
  dataAvailLoading = false;
  availValue = 0;
  getAvailableData() {
    this.dataAvailLoading = true;
    this.body = {
      ...this.filterGroup.value,
      propertyTax: !this.ownTab,
    };

    this.dataAvailable = 0;
    this.availValue = 0;
    this.ownRevenueService.displayDataAvailable(this.body).subscribe(
      (res) => {
        this.dataAvailLoading = false;
        // res["data"].percent = parseFloat(res["data"].percent.toFixed(0));
        // this.availValue = res["data"]?.percent;
        let percentage =
          res["data"] && res["data"].percent
            ? Math.round(res["data"].percent)
            : 0;
        res["actualPercent"] = res["data"].percent;
        res["data"].percent = percentage;
        this.financialYear = res;
        this.availValue = percentage;
        this.halfDoughnutChart();

        this.notFoundNames = res["data"]?.names;
        console.log("ordResponse", res);
      },
      (err) => {
        this.dataAvailLoading = false;
        console.log("error", err);
      }
    );
  }
  tempDataHolder = {
    param: "Own Revenue per Capita",
    type: "ULBs",
  };
  barChartCompValues(value) {
    console.log("barChartCompValues", value);
    this.tempDataHolder = value;
    this.getBarChartData(value);
  }
  barChartNotFound = false;
  getBarChartData(
    bodyD = {
      list: [],
      param: this.proTab ? "Property Tax per Capita" : "Own Revenue per Capita",
      type: "state",
    }
  ) {
    this.barChartData = barChart;
    this._loaderService.showLoader();
    this.body = {
      ...this.filterGroup.value,
      propertyTax: !this.ownTab,
    };
    Object.assign(bodyD, this.body);
    this.lastBarChartValue = bodyD;
    let labelStr = "";
    console.log("body", bodyD);
    this.barChartTitle = `Compare states/ULBs on ${bodyD?.param}`;
    this.ownRevenueService.displayBarChartData(bodyD).subscribe(
      (res) => {
        if (res && res["success"] && res["data"]) {
          console.log(res["data"])
          this._loaderService.stopLoader();
          this.barChartNotFound = false;
          let tempData = {
            type: "bar",
            data: {
              labels: [],
              datasets: [
                {
                  label: bodyD.param,
                  data: [],
                  borderRadius: 15,
                  borderWidth: 1,
                  backgroundColor: [
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(51, 96, 219, 1)",
                    "rgba(79, 223, 76, 1)",
                  ],
                },
              ],
            },
            options: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 35,
                  boxWidth: 24,
                  boxHeight: 18,
                },
              },
              interaction: {
                mode: "nearest",
              },
              scales: {
                xAxes: [
                  {
                    maxBarThickness: 60,
                    gridLines: {
                      color: "rgba(0, 0, 0, 0)",
                    },
                  },
                ],
                yAxes: [
                  {
                    scaleLabel: {
                      display: true,
                      labelString: "Amount in Cr.",
                    },
                    gridLines: {
                      offsetGridLines: true,
                      color: "rgba(0, 0, 0, 0)",
                    },
                    ticks: {
                      beginAtZero: true,
                    },
                    afterDataLimits: function (axis) {
                      axis.max += 99;
                    },
                  },
                ],
              },
              animation: {
                onComplete: function (animation) {
                  var chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                  ctx.fillStyle = "#6E7281";
                  ctx.font = Chart.helpers.fontString(
                    Chart.defaults.global.defaultFontSize,
                    Chart.defaults.global.defaultFontStyle,
                    Chart.defaults.global.defaultFontFamily
                  );
                  ctx.textAlign = "center";
                  ctx.textBaseline = "bottom";

                  this.data.datasets.forEach(function (dataset, i) {
                    var meta = chartInstance.controller.getDatasetMeta(i);
                    if (meta.type == "line") return true;
                    meta.data.forEach(function (bar, index) {
                      var data = dataset.data[index];
                      console.log("chartOption Data", data);

                      ctx.fillText("₹ " + data, bar._model.x, bar._model.y - 5);
                    });
                  });
                  console.log(animation, "animation");
                },
              },
            },
          };
          tempData.options.scales.yAxes[0].scaleLabel.display = true;
          tempData.options.scales.yAxes[0].scaleLabel.labelString =
            "Amount in INR";
          console.log("this.tempDataHolder", this.tempDataHolder);
          if (this.tempDataHolder) {
            if (
              this.tempDataHolder["param"] == "Own Revenue" ||
              this.tempDataHolder["param"] == "Property Tax"
            ) {
              tempData.options.scales.yAxes[0].scaleLabel.labelString =
                "Amount in Cr.";
            } else {
              tempData.options.scales.yAxes[0].scaleLabel.labelString =
                "Amount in INR";
            }
          }
          let denom = bodyD?.param.toLowerCase().includes('per capita') ? 1 : 10000000
          res["data"].map((value) => {
            tempData.data.labels.push(value.name);

            if (
              this.tempDataHolder.hasOwnProperty("list") &&
              this.tempDataHolder["list"]?.length
            ) {
              tempData.data.datasets[0].data.push(
                Number(Math.round(value.amount / denom))
              );
            } else {
              tempData.data.datasets[0].data.push(
                Number(Math.round(value.amount))
              );
            }
          });
          console.log(tempData);
          this.barChartData = tempData;
        } else {
          this.barChartNotFound = true;
          this._loaderService.stopLoader();
        }
      },
      (err) => {
        this._loaderService.stopLoader();
        this.barChartNotFound = true;
      }
    );
  }

  myChart: any;
  halfDoughnutChart() {
    if (this.myChart) {
      this.myChart.destroy();
    }

    this.dataAvailable = this.availValue;

    const canvas = <HTMLCanvasElement>document.getElementById("myChart1");
    const ctx = canvas.getContext("2d");
    this.myChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Data available", "Data not available"],
        datasets: [
          {
            label: "Availability",
            borderWidth: 0,
            data: [this.dataAvailable, 100 - this.dataAvailable],
            backgroundColor: ["rgba(51, 96, 219, 1)", "rgba(218, 226, 253, 1)"],
          },
        ],
      },
      options: {
        rotation: 1 * Math.PI,
        circumference: 1 * Math.PI,
        legend: {
          display: false,
        },
        cutoutPercentage: 75,
      },
    });
  }
  cardsDataLoading = true;
  cardsData() {
    this.cardsDataLoading = true;
    let body = {
      ...this.filterGroup.value,
      property: this.proTab,
    };
    this.ownRevenueService.getCardsData(body).subscribe(
      (res) => {
        this._loaderService.stopLoader();
        this.cardsDataLoading = false;
        console.log(res);
        if (this.ownTab) {
          this.ownTabCardsFormant(res["data"]);
        } else {
          this.proTabCardsFormat(res["data"]);
        }
      },
      (err) => {
        this._loaderService.stopLoader();
        this.cardsDataLoading = false;
        console.log(err);
      }
    );
  }

  ownTabCardsFormant(data) {
    let yearInData = Object.keys(data);
    let revenueCollectionCopy = deepCopy(revenueCollection),
      revenuePerCapitaCopy = deepCopy(revenuePerCapita),
      revenueExpenditureCopy = deepCopy(revenueExpenditure),
      revenuePercentageCopy = deepCopy(revenuePercentage),
      value = data[this.filterGroup.value.financialYear];
console.log("card value", value);

revenueCollectionCopy.isLoading = this.cardsDataLoading;
revenuePerCapitaCopy.isLoading = this.cardsDataLoading;
revenueExpenditureCopy.isLoading = this.cardsDataLoading;
revenuePercentageCopy.isLoading = this.cardsDataLoading;
revenueCollectionCopy.title = valueConvert(value?.totalRevenue) ?? 0;
revenuePerCapitaCopy.title = "₹ " + value?.perCapita.toFixed(0) ?? 0;
revenuePercentageCopy.title = (value?.percentage.toFixed(0) ?? "0") + " %";
revenueExpenditureCopy.title = value?.totalUlbMeetExpense ?? 0;

    if (yearInData[1]) {
      let oldYearValue =
        data[
          this.filterGroup.value.financialYear
            .split("-")
            .map((value) => Number(value) - 1)
            .join("-")
        ];

      let t = this.compareValues(oldYearValue.totalRevenue, value.totalRevenue);
      revenueCollectionCopy.percentage = t.num.toFixed(0);
      revenueCollectionCopy.svg = t.inc ? upArrow : downArrow;
      revenueCollectionCopy.color = t.inc ? green : red;

      t = this.compareValues(oldYearValue.perCapita, value.perCapita);
      revenuePerCapitaCopy.percentage = t.num.toFixed(0);
      revenuePerCapitaCopy.svg = t.inc ? upArrow : downArrow;
      revenuePerCapitaCopy.color = t.inc ? green : red;

      t = this.compareValues(oldYearValue.percentage, value.percentage);
      revenuePercentageCopy.percentage = t.num.toFixed(0);
      revenuePercentageCopy.svg = t.inc ? upArrow : downArrow;
      revenuePercentageCopy.color = t.inc ? green : red;

      t = this.compareValues(
        oldYearValue.totalUlbMeetExpense,
        value.totalUlbMeetExpense
      );
      revenueExpenditureCopy.percentage = t.num.toFixed(0);
      revenueExpenditureCopy.svg = t.inc ? upArrow : downArrow;
      revenueExpenditureCopy.color = t.inc ? green : red;
      revenueExpenditureCopy.percentage =
        oldYearValue.totalUlbMeetExpense == 0 ? "0" : t.num.toFixed(0);
      // if(oldYearValue?.totalUlbMeetExpense == 0){
      //   revenueExpenditureCopy.percentage = '0'
      // }
    }

    this.cardData = [
      revenueCollectionCopy,
      revenuePerCapitaCopy,
      revenuePercentageCopy,
      revenueExpenditureCopy,
    ];
  }

  compareValues(oldValue, newValue, inc = true) {
    inc = newValue >= oldValue;

    return { num: ((newValue - oldValue) / oldValue) * 100, inc };
  }

  proTabCardsFormat(data) {
    let value = data[this.filterGroup.value.financialYear];
    console.log("card value per", value);
    let cards = deepCopy(porpertyCards);
    cards[0].title = valueConvert(value.totalProperty) ?? 0;
    cards[1].title =
      "₹ " + (value.totalProperty / value.population).toFixed(0) ?? 0;
    // cards[2].title =
    //   (
    //     (value.totalProperty / (value.totalRevenue - value.totalProperty)) *
    //     100
    //   ).toFixed(0) + "%";
    cards[2].title = (value?.percentage.toFixed(0) ?? "0") + " %";
    let yearInData = Object.keys(data);
    if (yearInData[1]) {
      let oldYearValue =
        data[
          this.filterGroup.value.financialYear
            .split("-")
            .map((value) => Number(value) - 1)
            .join("-")
        ];

      let t = this.compareValues(
        oldYearValue.totalProperty,
        value.totalProperty
      );
      cards[0].percentage = t.num.toFixed(0);
      cards[0].svg = t.inc ? upArrow : downArrow;
      cards[0].color = t.inc ? green : red;

      t = this.compareValues(
        oldYearValue.totalProperty / oldYearValue.population,
        value.totalProperty / value.population
      );
      cards[1].percentage = t.num.toFixed(0);
      cards[1].svg = t.inc ? upArrow : downArrow;
      cards[1].color = t.inc ? green : red;

      t["num"] =
        (value.totalProperty / (value.totalRevenue - value.totalProperty)) *
          100 -
        (oldYearValue.totalProperty /
          (oldYearValue.totalRevenue - oldYearValue.totalProperty)) *
          100;

      let newr =
        (value.totalProperty / (value.totalRevenue - value.totalProperty)) *
        100;
      let old =
        (oldYearValue.totalProperty /
          (oldYearValue.totalRevenue - oldYearValue.totalProperty)) *
        100;
      t["inc"] = newr >= old;
      cards[2].percentage = t.num.toFixed(0);
      cards[2].svg = t.inc ? upArrow : downArrow;
      cards[2].color = t.inc ? green : red;
    }

    this.cardData = cards;
  }
  tableDataLoading = true;
  columnAttribut;
  tableData() {
    this._loaderService.showLoader();
    this.tableDataLoading = true;
    this.ownRevenueService.getTableData(this.filterGroup.value).subscribe(
      (res) => {
        this.tableDataLoading = false;
        if (this.proTab) this.columnAttribut = this.columnAttributeProperty;
        else this.columnAttribut = this.columnAttribute;
        this.users = this.users.map((value) => {
          this._loaderService.stopLoader();
          let data = res["data"][value.name];
          if (this.ownTab) {
            value.meetsRevenue = numCheck(data.numOfUlbMeetRevenue);
            if (data.totalExpense > 0) {
              value.avgRevenueMeet = numCheck(data.percentage);
            } else {
              value.avgRevenueMeet = "0";
            }
            if (data.totalRevenue > 0) {
              value.averageRevenue = numCheck(data.totalRevenue);
            } else {
              value.averageRevenue = "0";
            }
            if (data.population > 0) {
              value.median = numCheck(data.median);
            } else {
              value.median = "0";
            }
          } else {
            value.averageRevenue = data.totalRevenue;
            // value.averageRevenue = data.totalProperty.toFixed(0);
            if (data.population > 0) {
              value.median = data.median.toFixed(0);
              // value.median = (data.totalProperty / data.population).toFixed(2);
            } else {
              value.median = "0";
            }
            if (data.totalRevenue > 0) {
              value.avgRevenueMeet = data.percentage.toFixed(0);
            } else {
              value.avgRevenueMeet = "0";
            }
            delete value.meetsRevenue;
          }
          return value;
        });
      },
      (error) => {
        this.tableDataLoading = false;
      }
    );
  }

  headerActions = [
    {
      name: "Download",
      svg: "../../../../assets/CIty_detail_dashboard – 3/2867888_download_icon.svg",
    },
    // {
    //   name: "Share/Embed",
    //   svg: "../../../../assets/CIty_detail_dashboard – 3/Layer 51.svg",
    // },
  ];

  onStateChange(state) {
    console.log(state);
    this.filterGroup.patchValue({ stateId: state._id })
    this.filterData('state', '')
  }

  downloadCSV(from) {
    this._loaderService.showLoader();
    if (from == "topPerformance") {
      let body = {
        csv: true,
        ...this.lastBarChartValue,
      };
      this.ownRevenueService.displayBarChartData(body).subscribe(
        (res: any) => {
          if (res) {
            this._loaderService.stopLoader();
          }
          console.log("topPerformance-res", res);
          let blob: any = new Blob([res], {
            type: "text/json; charset=utf-8",
          });
          const url = window.URL.createObjectURL(blob);

          fileSaver.saveAs(blob, "dataAvaliable.xlsx");
        },
        (err) => {
          console.log("error", err);
          this._loaderService.stopLoader();
        }
      );
    } else {
      let body = {
        csv: true,
        ...this.filterGroup.value,
      };

      this.ownRevenueService.displayDataAvailable(body).subscribe(
        (res: any) => {
          console.log("data-availability-res", res);
          if (res) {
            this._loaderService.stopLoader();
          }
          let blob: any = new Blob([res], {
            type: "text/json; charset=utf-8",
          });
          const url = window.URL.createObjectURL(blob);

          fileSaver.saveAs(blob, "dataAvaliable.xlsx");
        },
        (error) => {
          console.log("error", error);
          this._loaderService.stopLoader();
        }
      );
    }
  }
}

function valueConvert(value) {
  return "₹ " + (value / 10000000).toFixed(0) + " Cr";
}

function numCheck(value) {
  if (isNaN(value)) return "0";
  return value.toFixed(0);
}

function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

const revenueCollection = {
  type: "5",
  title: "0 Cr",
  isLoading: true,
  subTitle: "Own Revenue Collections",
  svg: "../../../assets/resources-das/north_east_green_24dp.svg",
  percentage: "0%",
  color: "#22C667",
};

const revenuePerCapita = {
  type: "5",
  title: "0 Cr",
  isLoading: true,
  subTitle: "Own Revenue Per Capita",
  svg: "../../../assets/resources-das/north_east_green_24dp.svg",
  percentage: "0%",
  color: "#22C667",
};

const revenueExpenditure = {
  type: "5",
  title: "0",
  isLoading: true,
  subTitle: "Cities Where Own Revenue Meet Revenue Expenditure",
  svg: "../../../assets/resources-das/south_west_red_24dp.svg",
  percentage: "0%",
  color: "#E64E4E",
};

const revenuePercentage = {
  type: "5",
  title: "0%",
  isLoading: true,
  subTitle: "Own Revenue As A Percentage Of Revenue Expenditure",
  svg: "../../../assets/resources-das/north_east_green_24dp.svg",
  percentage: "0%",
  color: "#22C667",
};

function openOwnRevenuePopup() {
  throw new Error("Function not implemented.");
}

let barChart = {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        borderRadius: 15,
        borderWidth: 1,
        backgroundColor: [
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(51, 96, 219, 1)",
          "rgba(168, 188, 240, 1)",
        ],
      },
    ],
  },
};

const porpertyCards = [
  {
    type: "5",
    title: "0",
    subTitle: "Property Tax Revenue",
    svg: "../../../assets/resources-das/north_east_green_24dp.svg",
    percentage: "0%",
    color: "#22C667",
  },
  {
    type: "5",
    title: "0",
    subTitle: "Property Tax Revenue Per Capita",
    svg: "../../../assets/resources-das/north_east_green_24dp.svg",
    percentage: "0%",
    color: "#22C667",
  },
  {
    type: "5",
    title: "0",
    subTitle: "Property Tax To Own Revenue Percentage",
    svg: "../../../assets/resources-das/north_east_green_24dp.svg",
    percentage: "0%",
    color: "#22C667",
  },
];

const green = "#22C667";
const red = "#E64E4E";
const upArrow = "../../../assets/resources-das/north_east_green_24dp.svg";
const downArrow = "../../../assets/resources-das/south_west_red_24dp.svg";

// let entries = Object.entries(data);
// console.log('entries', JSON.parse(JSON.stringify(entries)));

// let sorted = entries.sort((a, b) => a[1].localeCompare(b[1]));
// console.log('sorted', JSON.parse(JSON.stringify(sorted)));

// let sortedObj = JSON.parse(JSON.stringify(Object.fromEntries(sorted)))
// console.log('sortedObj', sortedObj);

function lightOrDark(color) {
  // Variables for red, green, blue values
  var r, g, b, hsp;

  // Check the format of the color, HEX or RGB?
  if (color.match(/^rgb/)) {
    // If RGB --> store the red, green, blue values in separate variables
    color = color.match(
      /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/
    );

    r = color[1];
    g = color[2];
    b = color[3];
  } else {
    // If hex --> Convert it to RGB: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, "$&$&"));

    r = color >> 16;
    g = (color >> 8) & 255;
    b = color & 255;
  }

  // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
  hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

  // Using the HSP value, determine whether the color is light or dark
  if (hsp > 127.5) {
    return "light";
  } else {
    return "dark";
  }
}
