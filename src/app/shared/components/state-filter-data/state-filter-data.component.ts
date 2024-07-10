import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { BaseComponent } from "src/app/util/BaseComponent/base_component";
import { ActivatedRoute, Router } from "@angular/router";
import { StateFilterDataService } from "./state-filter-data.service";
import { FormControl } from "@angular/forms";
import { CommonService } from "../../services/common.service";
import { Observable } from "rxjs";
import { GlobalLoaderService } from "src/app/shared/services/loaders/global-loader.service";
import { OwnRevenueService } from "src/app/pages/own-revenue-dashboard/own-revenue.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { stateDashboardSubTabsList } from "./constant";
import Chart from "chart.js";
import { element } from "protractor";
@Component({
  selector: "app-state-filter-data",
  templateUrl: "./state-filter-data.component.html",
  styleUrls: ["./state-filter-data.component.scss"],
})
export class StateFilterDataComponent extends BaseComponent implements OnInit {
  stateId: any;
  revenueId: any;
  stateCode = JSON.parse(localStorage.getItem("ulbList")).data;
  ulbStateMapping = JSON.parse(localStorage.getItem("ulbStateCodeMapping"));

  nationalFilter = new FormControl();

  filteredOptions: Observable<any[]>;
  lastSelectedId: number = 0;
  ActiveButton: any;
  filterName = "revenue";
  tabName: any;
  headOfAccount = "Revenue";
  chartId = `stateSCharts-${Math.random()}`;
  financialYear: string = "";
  stateName: string;
  statesList: any = JSON.parse(localStorage.getItem("stateIdsMap"));
  compareDialogType = 3;
  serviceTab;
  isPerCapita = false;

  serviceTabList: any = [];

  mainChartTitle: string = "";
  multipleChartTitle: string = "";
  thousand:number = 1000;
  defaultMaxPopulation: number = 1200;
  @Input() data;

  @Input() dounghnuChartLabels;

  @Input() stateServiceLabel;

  chartLabels = [];

  scatterData = {
    type: "scatter",
    data: {
      datasets: [
        {
          labels: [],
          rev: [],
          label: "Municipality",
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#1EBFC6",
          backgroundColor: "#1EBFC6",
        },
        {
          labels: [],
          rev: [],
          label: "Municipal Corporation",
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#3E5DB1",
          backgroundColor: "#3E5DB1",
        },
        {
          label: "Town Panchayat",
          labels: [],
          rev: [],
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#F5B742",
          backgroundColor: "#F5B742",
        },
        {
          label: "State Average",
          data: [],
          labels: ["State Average"],
          showLine: true,
          fill: true,
          backgroundColor: "red",
          borderColor: "red",
        },
      ],
    },
  };

  doughnutData = {
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
          hoverOffset: 2,
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
        fontSize: 15,
        // generateLabels: function (chart) {
        //   console.log("generateLabels", chart);
        //   const datasets = chart.data.datasets;
        //   console.log("datasets", datasets);
        //   console.log("chart.labels", chart.data.labels);
        //   let total = chart.data.datasets[0].data.reduce((sum, val) => {
        //     return sum + val;
        //   }, 0);
        //   console.log("total", total);
        //   // var percentage = Math.floor((data / total) * 100 + 0.5);
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
          var total = dataset.data.reduce(function (
            previousValue,
            currentValue,
            currentIndex,
            array
          ) {
            return previousValue + currentValue;
          });
          var currentValue = dataset.data[tooltipItem.index];
          var percentage = Math.floor((currentValue / total) * 100 + 0.5);
          return percentage + "%";
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
  barData: any;

  bottomBarData = {
    type: "bar",
    data: {
      labels: [
        "Nasik",
        "Mumbai",
        "Pune",
        "Nagpur",
        "Aurangabad",
        "Solapur",
        "Amravati",
        "Navi Mumbai",
        "Nagpur",
        "Thane",
      ],
      datasets: [
        {
          // label: "City Ranking",
          label: "Cities",
          data: [13, 20, 30, 40, 50, 60, 70, 80, 90, 100],
          backgroundColor: [
            "#1E44AD",
            "#224CC0",
            "#2553D3",
            "#3360DB",
            "#456EDE",
            "#587DE1",
            "#6A8BE5",
            "#86A2ED",
            "#93AAEA",
            "#A8BCF0",
          ],
          borderColor: ["#1E44AD"],
          borderWidth: 1,
        },
      ],
    },
  };

  BarGraphValue = true;

  headerActions = [
    {
      name: "Download",
      svg: "../../../../assets/CIty_detail_dashboard – 3/2867888_download_icon.svg",
    },
    {
      name: "Share/Embed",
      svg: "../../../../assets/CIty_detail_dashboard – 3/Layer 51.svg",
    },
  ];

  checkBoxArray = [
    { value: "nationalAvg", title: "National Avg", isDisabled: false },
    { value: "ulbTypeAvg", title: "ULB Type Avg", isDisabled: false },
    {
      value: "populationAvg",
      title: "Population Category Avg",
      isDisabled: false,
    },
  ];

  stateUlbsPopulation: any = {
    tableHeading: [],
    tableDataSource: [],
  };

  barChartOptions: any;
  barChartNotFound: boolean = false;
  chartDropdownList: any;
  chartDropdownValue: any;
  chartTitle: string = "Compare ULBs on various financial indicators .";
  selectedServiceLevelBenchmark: any;
  nestedChartFilterOption: any = {
    showFinancialYear: false,
    showResetButton: false,
  };

  currentActiveTab: string = "";
  mainTab: string = "";
  @Input() selectedStateId: any;
  sourceDashboardName: string = 'State Dashboard';
  @Input() showYearDropdown: boolean = true;
  @Input() selectedYear: any;
  constructor(
    public activatedRoute: ActivatedRoute,
    public stateFilterDataService: StateFilterDataService,
    private _commonServices: CommonService,
    public _loaderService: GlobalLoaderService,
    private ownRevenueService: OwnRevenueService,
    private snackbar: MatSnackBar,
    private router: Router
  ) {
    super();

    this.yearList = sessionStorage.getItem("financialYearList")
      ? JSON.parse(sessionStorage.getItem("financialYearList"))
      : [];
    this.financialYear = this.yearList[0];

    this.getYears();

    console.log("sessionFY", this.yearList);
    if (window.location.pathname == '/dashboard/slb') {
      this.sourceDashboardName = 'Service Level Benchmark Performance';
    }
    this.activatedRoute.queryParams.subscribe((val) => {
      console.log("val", val);
      const { stateId } = val;
      if (stateId) {
        console.log("stid", this.stateId);
        this.stateId = stateId;
        sessionStorage.setItem("row_id", this.stateId);
      } else {
        this.stateId = sessionStorage.getItem("row_id");
      }
    });
  }

  showBarGraph() {
    this.BarGraphValue = true;
    console.log("this.BarGraphValue", this.BarGraphValue);
    if (this.stateServiceLabel) {
      this.getServiceLevelBenchmarkBarChartData();
    } else {
      this.getStateRevenue();
    }
  }

  showBottomGraph() {
    this.BarGraphValue = false;
    if (this.stateServiceLabel) {
      this.getServiceLevelBenchmarkBarChartData();
    } else {
      this.getStateRevenue();
    }
  }
  percentLabel: string = "";
  radioButtonValue: string = "";
  selectedRadioBtnValue: any;
  getCheckBoxValue(event: any) {
    console.log("checked Value", event);
    if (event && event.target && event.target.value) {
      this.selectedRadioBtnValue = event.target.value;
      this.radioButtonValue = event.target.value;
      // for (const item of this.checkBoxArray) {
      //   if (item.value != event.target.value) {
      //     item["isDisabled"] = true;
      //   }
      // }
      // this.getScatterData();
      this.getAverageScatterData();
    }
    this.createDynamicChartTitle(this.currentActiveTab);
  }

  reset(isReset: boolean = false) {
    this.compType = "";
    this.ulbArr = [];
    this.checkBoxArray = [
      { value: "", title: "Select an Option", isDisabled: true },
      { value: "nationalAvg", title: "National Avg", isDisabled: false },
      { value: "ulbTypeAvg", title: "ULB Type Avg", isDisabled: false },
      {
        value: "populationAvg",
        title: "Population Category Avg",
        isDisabled: false,
      },
    ];
    this.chartDropdownValue = "";
    this.nationalFilter.patchValue("");
    let emptyArr: any = [];
    this.filteredOptions = emptyArr;
    this.ulbId = "";
    // this.multiChart = false;
    this.selectedRadioBtnValue = "";
    this.radioButtonValue = "";
    // this.getYears();
    this.financialYear = this.yearList[0];
    if (isReset) {
      this.getScatterData();
      if (this.stateServiceLabel) {
        this.selectedServiceLevelBenchmark = this.serviceTabList[0];
        this.filterName = this.selectedServiceLevelBenchmark;
        this.getServiceLevelBenchmarkBarChartData();
      } else {
        this.getStateRevenue();
      }
    }

    this.createDynamicChartTitle(this.ActiveButton);
  }

  yearList: any;

  getYears() {
    if (this.stateServiceLabel) {
      this.stateFilterDataService.getYearListSLB().subscribe(
        (res) => {
          this.yearList = res["data"];
          this.financialYear = this.yearList[0];
        },
        (err) => {
          console.log(err.message);
        }
      );
    } else {
      /**
       * below api was previously used but now new api is used to get the data of state wise FYs
       */
      // let body = {};
      // this.ownRevenueService.getYearList(body).subscribe((res) => {
      //   console.log("yearsResponse", res);
      //   this.yearList = res["data"];
      //   // this.financialYear = this.yearList[0];
      //   console.log("this.yearList", this.yearList);
      // });
      this.yearList = sessionStorage.getItem("financialYearList")
        ? JSON.parse(sessionStorage.getItem("financialYearList"))
        : [];
      console.log("sessionFY", this.yearList);
      if (this.yearList?.length) {
        this.financialYear = this.yearList[0];
        console.log("financial Year", this.financialYear);
      } else {
        const paramContent: any = {
          state: this.stateId,
        };
        this._commonServices.getStateWiseFYs(paramContent).subscribe(
          (res: any) => {
            if (res && res.success) {
              this.yearList =
                res["data"] && res["data"]["FYs"] && res["data"]["FYs"].length
                  ? res["data"]["FYs"]
                  : [];
              sessionStorage.setItem(
                "financialYearList",
                JSON.stringify(this.yearList)
              );
              this.financialYear = this.yearList[0];
              console.log("financial Year", this.financialYear);
              this.changeActiveBtn(0);
            }
          },
          (err) => {
            console.log(err.message);
          }
        );
        // this.showSnackbarMessage('No Financial year data found');
        // return false;
      }
    }
  }

  getDropDownValue() {
    console.log("serviceTabList", this.serviceTabList);
    this.stateFilterDataService
      .getServiceDropDown(this.serviceTab)
      .subscribe((res: any) => {
        console.log("service dropdown data", res);
        this.serviceTabList = res?.data?.names;
        this.filterName = this.serviceTabList[0];
        this.getScatterData();
        this.getServiceLevelBenchmarkBarChartData();
        // this.getStateUlbsPopulation();
      });
  }

  initializeScatterData() {
    this.scatterData = Object.assign({
      type: "scatter",
      data: {
        datasets: [
          {
            labels: [],
            rev: [],
            label: "Municipality",
            data: [],
            showLine: false,
            fill: true,
            borderColor: "#1EBFC6",
            backgroundColor: "#1EBFC6",
          },
          {
            labels: [],
            rev: [],
            label: "Municipal Corporation",
            data: [],
            showLine: false,
            fill: true,
            borderColor: "#3E5DB1",
            backgroundColor: "#3E5DB1",
          },
          {
            label: "Town Panchayat",
            labels: [],
            rev: [],
            data: [],
            showLine: false,
            fill: true,
            borderColor: "#F5B742",
            backgroundColor: "#F5B742",
          },
          {
            label: "State Average",
            data: [],
            rev: [],
            labels: ["State Average"],
            showLine: true,
            fill: false,
            backgroundColor: "red",
            borderColor: "red",
          },
        ],
      },
    });
  }

  initializeDonughtData() {
    this.doughnutData = Object.assign({
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
            hoverOffset: 2,
          },
        ],
      },
    });
  }

  compType: any;
  multiChart = false;
  doughnutDataArr = [];
  scatterChartPayload: any = {};
  stateAvgVal = 0;
  mainDoughnutArr = [];
  getScatterData() {
    this.createDynamicChartTitle(this.currentActiveTab);
    this.multiChart = false;
    this._loaderService.showLoader();
    this.initializeScatterData();
    let apiEndPoint = this.stateServiceLabel ? "state-slb" : "state-revenue";
    // let apiEndPoint = this.stateServiceLabel ? 'state-slb' : this.selectedRadioBtnValue ? 'state-dashboard-averages' : 'state-revenue';
    // this.stateId = sessionStorage.getItem("row_id")
    //   ? sessionStorage.getItem("row_id")
    //   : this.stateId;
    this.scatterChartPayload = {
      [this.stateServiceLabel ? "stateId" : "state"]: this.stateId,
      financialYear: this.financialYear ? this.financialYear : "",
      headOfAccount: this.stateServiceLabel ? undefined : this.headOfAccount,
      filterName: this.filterName ? this.filterName : "",
      isPerCapita: this.isPerCapita ? this.isPerCapita : "",
      compareType: this.compType ? this.compType : "",
      compareCategory: this.selectedRadioBtnValue
        ? this.selectedRadioBtnValue
        : "",
      ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
      chartType: !this.filterName?.includes("mix") ? "scatter" : "doughnut",
      apiEndPoint: apiEndPoint,
      apiMethod: "post",
      stateServiceLabel: this.stateServiceLabel,
      sortBy: "",
      // "which": this.selectedRadioBtnValue ? this.selectedRadioBtnValue : '',
      chartTitle: this.compType ? this.multipleChartTitle : this.mainChartTitle ? this.mainChartTitle : "",
    };

    console.log("scatterChartPayload", this.scatterChartPayload);
    let inputVal: any = {};
    inputVal.stateIds = this.stateId;
    this.stateFilterDataService
      .getScatterdData(this.scatterChartPayload, apiEndPoint)
      .subscribe(
        (res) => {
          this.notfound = false;
          console.log("response data", res);
          console.log("activeButtonStateDashboard", this.ActiveButton);
          //scatter plots center
          let apiData = res["data"];
          if (!this.filterName.includes("mix")) {
            this._loaderService.stopLoader();
            let mCorporation: any;
            let tp_data: any;
            let m_data: any;
            let stateData: any;
            let yAxesLabelName = '';
            this.percentLabel = '';
            if (this.stateServiceLabel) {
              if (res["data"]["scatterData"]?.unitType == "Percent") {
                this.percentLabel = 'percent';
                yAxesLabelName = `${this.filterName} (%)`;
              } else {
                yAxesLabelName = res["data"]["scatterData"]?.unitType ? res["data"]["scatterData"]?.unitType : this.filterName;
              }
              let cLabel = 'Population(in Thousands)'
              this.setServiceLevelBenchmarkScatteredChartOption(
                cLabel,
                yAxesLabelName
              );
              m_data =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["m_data"];
              mCorporation =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["mc_data"];
              tp_data =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["tp_data"];
              // stateData = res['data'] && res['data']['scatterData'] && res['data']['scatterData']["stateAvg"][0]["average"];
              stateData =
                res["data"] &&
                res["data"]["scatterData"] &&
                res["data"]["scatterData"]["stateAvg"] &&
                res["data"]["scatterData"]["stateAvg"][0] &&
                res["data"]["scatterData"]["stateAvg"][0]["average"];
              // let natData = res["natAvg"][0]["average"];
            } else {
              mCorporation = apiData["mCorporation"];
              tp_data = apiData["townPanchayat"];
              m_data = apiData["municipality"];
              // let natData = apiData["natAvg"][0]["average"];
              this.stateAvgVal = apiData["stateAvg"]
                ? apiData["stateAvg"]
                : this.stateAvgVal;
              stateData = this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? convertToCr(this.stateAvgVal) : this.stateAvgVal;
            }

            let stateLevelMaxPopuCount =
              this.stateFilterDataService.getMaximumPopulationCount(
                mCorporation,
                tp_data,
                m_data
              );
            // let   stateLevelMaxPopuCount = 30;
            console.log("stateLevelMaxPopuCount", stateLevelMaxPopuCount);
            this.scatterData.data.datasets.forEach((el) => {
              let obj = { x: 0, y: 0 };
              if (el.label == "Town Panchayat") {
                obj = { x: 0, y: 0 };
                tp_data.forEach((el2, index) => {
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);
                  console.log('sasasasasaasa', el)
                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "Municipal Corporation") {
                mCorporation.forEach((el2, index) => {
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);

                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "Municipality") {
                m_data.forEach((el2, index) => {
                  obj = { x: 0, y: 0 };
                  obj.x = +(el2.population) / this.thousand;
                  obj.y = this.stateServiceLabel
                    ? Math.round(el2.value)
                    : // ? el2.value.toFixed(2)
                    this.ActiveButton == 'Total Revenue' || this.ActiveButton == 'Total Own Revenue' || this.ActiveButton == 'Total Surplus/Deficit' || this.ActiveButton == 'Capital Expenditure' ? convertToCr(el2.amount) : el2.amount;
                  el["labels"].push(el2.ulbName);
                  el["rev"].push(
                    this.stateServiceLabel ? Math.round(el2.value) : el2.amount
                  );
                  el.data.push(obj);
                  obj = { x: 0, y: 0 };
                });
              } else if (el.label == "National Average") {
                // el["data"]["y"] = natData;
              } else if (el.label == "State Average") {
                let obje = [
                  { x: 0, y: 0 },
                  {
                    x: stateLevelMaxPopuCount
                      ? stateLevelMaxPopuCount
                      : this.defaultMaxPopulation,
                    y: 0,
                  },
                ];
                obje.forEach((el2) => {
                  el2["y"] = stateData;
                  // el2['y'] = 70 // for testing

                  el["data"].push(el2);
                });
              }
            });
            console.log("scatterData", this.scatterData);
            this.generateRandomId("scatterChartId123");
            this.scatterData = { ...this.scatterData };
          } //donught charts center
          else if (this.filterName.includes("mix")) {
            this._loaderService.stopLoader();
            console.log("mix Data", res);
            let data;
            let ulbData;
            if (
              this.ulbId &&
              this.scatterChartPayload.compareType !== "ulbType" &&
              this.scatterChartPayload.compareType !== "popType"
            ) {
              data = res["state"];
              ulbData = res["ulb"];
              this.multiChart = true;
              this.mainDoughnutArr = [{ state: data }, { ulb: ulbData }];
            } else {
              data = res["data"];
              this.mainDoughnutArr = [];
              this.multiChart = false;
            }

            console.log("initial data", data);

            if (data?.length > 0) {
              this.chartDropdownList = data;
              this.getStateRevenue();
            }
            console.log("chartDropdownList", this.chartDropdownList);
            this.initializeDonughtData();
            if (this.scatterChartPayload.compareType == "") {
              if (data.length) {
                console.log("mixdata==>", data);
                data = data.sort((a, b) => b.code - a.code);
                if (data[0].hasOwnProperty("colour"))
                  this.doughnutData.data.datasets[0].backgroundColor = [];
                data.forEach((el) => {
                  this.doughnutData.data.labels.push(el._id);
                  this.doughnutData.data.datasets[0].data.push(el.amount);
                  if (el.colour) {
                    this.doughnutData.data.datasets[0].backgroundColor.push(
                      el.colour
                    );
                  }
                });
                console.log(this.doughnutData);

                this.doughnutData = { ...this.doughnutData };
              }
            } else if (this.scatterChartPayload.compareType == "ulbType") {
              console.log("apiData", data);

              let mData = data["mData"][0];
              let mcData = data["mcData"][0];
              let tpData = data["tpData"][0];
              let ulbStateData = data["state"];

              this.multiChart = true;
              this.doughnutDataArr = [
                { mData: mData },
                { mcData: mcData },
                { tpData: tpData },
                { ulbStateData: ulbStateData },
              ];
              if (data["ulb"].length > 0) {
                this.doughnutDataArr = [
                  ...this.doughnutDataArr,
                  { ulb: data["ulb"] },
                ];
              }

              this.doughnutDataArr = [...this.doughnutDataArr];

              console.log("doughnutDataArr", this.doughnutDataArr);
            } else if (this.scatterChartPayload.compareType == "popType") {
              let lessThan100k = data["<100k"];
              let between100kTo500k = data["100k-500k"];
              let between500kTo1m = data["500k-1M"];
              let between1mTo4m = data["1m-4m"];
              let greaterThan4m = data["4m+"];
              let popStateData = data["state"];

              this.multiChart = true;
              this.doughnutDataArr = [];
              this.doughnutDataArr = [
                { "<100k": lessThan100k },
                { "100k-500k": between100kTo500k },
                { "500k-1M": between500kTo1m },
                { "1m-4m": between1mTo4m },
                { "4m+": greaterThan4m },
                { popStateData: popStateData },
              ];
              if (data["ulb"].length > 0) {
                this.doughnutDataArr = [
                  ...this.doughnutDataArr,
                  { ulb: data["ulb"] },
                ];
              }

              this.doughnutDataArr = [...this.doughnutDataArr];
              console.log("doughnutDataArr", this.doughnutDataArr);
            }
          }
        },
        (err) => {
          this._loaderService.stopLoader();
          this.notfound = true;
          console.log(err.message);
        }
      );
  }

  generateRandomId(name) {
    let number = Math.floor(Math.random() * 100);
    let newId = number + name;
    return newId;
  }

  getSelectedFinancialYear(event) {
    this.financialYear = event.target.value;
    console.log("state financial year", this.financialYear);
    if (this.selectedRadioBtnValue) {
      this.initializeScatterData();
      this.getAverageScatterData();
    } else {
      this.getScatterData();
    }
    // this.getScatterData();
    if (this.stateServiceLabel) {
      this.getServiceLevelBenchmarkBarChartData();
    } else {
      this.getStateRevenue();
    }
  }

  getServiceLevelBenchmark(event: any) {
    console.log("getServiceLevelBenchmark", event.target.value);
    if (event && event.target && event.target.value) {
      this.selectedServiceLevelBenchmark = event.target.value;
      this.filterName = this.selectedServiceLevelBenchmark;
      this.getScatterData();
      this.getServiceLevelBenchmarkBarChartData();
    }
  }

  ulbArr = [];
  filterChangeInChart(value) {
    this.ulbArr = [];
    // this.mySelectedYears = value.year;
    // this.getChartData(value);
    console.log("filterChangeInChart", value);
    if (value.ulbs) {
      value.ulbs.forEach((el) => {
        this.ulbArr.push(el._id);
      });
    }
    this.getScatterData();
  }

  getCompType(mixType: string) {
    console.log("getCompType", mixType, this.compType);
    // this.compType = e;
    // if (e) this.getScatterData();

    this.compType = mixType && mixType == "default" ? "" : mixType;
    if (mixType) this.getScatterData();
  }

  createDynamicChartTitle(activeButton) {
    console.log("filterName", this.filterName);
    this.stateName = this.statesList[this.stateId];
    this.mainChartTitle = '';
    this.multipleChartTitle = '';
    let dropDownValue;
    if (this.radioButtonValue) {
      dropDownValue = `and ${this.radioButtonValue}`;
    } else {
      dropDownValue = "";
    }
    if (this.stateName && activeButton) {
      this.mainChartTitle = `${activeButton} of all ULBs in ${this.stateName} vs State ${dropDownValue}`;
      this.multipleChartTitle = `The following pie chart provides the split of the contribution various ${activeButton} .`;
    }

    // if (this.stateServiceLabel) {
    //   this.mainChartTitle = `${this.BarGraphValue ? "Top" : "Bottom"} 10 performing ULBs on value in ${this.stateName}`;
    // }

  }
  changeAlertTab:any;
  changeActiveBtn(i) {
    this.reset();
    this.ulbArr = [];
    this.ulbId = "";
    this.compType = "";
    this.nationalFilter.patchValue("");
    console.log(
      this.data.btnLabels[i],
      this.data,
      "activeBTN",
      this.financialYear
    );
    this.ActiveButton = this.data.btnLabels[i];
    console.log('this.ActiveButton', this.ActiveButton)
    this.changeAlertTab = this.ActiveButton
    this.currentActiveTab = this.data.btnLabels[i];
    this.createDynamicChartTitle(this.currentActiveTab);
    this.lastSelectedId = i;

    this.isPerCapita = this.data.btnLabels[i]
      ?.toLocaleLowerCase()
      .split(" ")
      .join("")
      .includes("percapita");
    let newName = this.data.btnLabels[i]?.toLocaleLowerCase();
    console.log("btnLabels", this.data.btnLabels, "index", i);
    console.log("newName", newName, "ActiveButton", this.ActiveButton);
    if (newName?.includes("mix")) {
      this.filterName = this.data?.btnLabels[i]?.toLocaleLowerCase();
    } else if (newName == "revenue expenditure") {
      this.filterName = newName;
    } else if (newName?.includes("revenue") && !newName?.includes("own")) {
      this.filterName = "revenue";
    } else if (newName?.includes("own") && newName?.includes("revenue")) {
      this.filterName = newName;
    } else {
      this.filterName = this.data.btnLabels[i]?.toLocaleLowerCase();
    }

    if (this.stateServiceLabel) {
      this.getDropDownValue();
    } else {
      this.getScatterData();
      /* Checking if the ActiveButton array does not include the string 'Mix' then it will call the
        getStateRevenue() function because for Mix type chart we are calling getStateRevenue() function
        when we get the value for dropdown from getScatterData() api.
      */
      !this.ActiveButton.includes("Mix") ? this.getStateRevenue() : "";
    }
    // this.getScatterData();
    // this.getStateRevenue();
  }

  getRevenueId() {
    this.stateFilterDataService
      .getRevID()
      .subscribe((res) => console.log("revenue ==>", res));
  }

  reloadComponent(selectedStateId: any) {
    console.log("reloadComponent", selectedStateId);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigateByUrl(`/dashboard/state?stateId=${selectedStateId}`);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(
      "stateFilterDataChanges",
      changes,
      this.data,
      this.stateServiceLabel
    );
    if (!this.widgetMode) {

    /* These 2 @Input are used for slb dashboard */
    if (changes.hasOwnProperty("showYearDropdown") && changes.showYearDropdown.currentValue) {
      this.showYearDropdown = changes.showYearDropdown.currentValue;
    }
    if ((changes.hasOwnProperty("selectedYear")) && (changes.selectedYear.currentValue) && (!changes.selectedYear.firstChange)) {
      this.financialYear = changes.selectedYear.currentValue;
      console.log('this.financialYear', this.financialYear);
      this.callStandaLoneSlbDashboardApis();
      return;
    }
    /* These 2 @Input are used for slb dashboard end */
    if (
      changes.hasOwnProperty("selectedStateId") &&
      changes.selectedStateId.currentValue &&
      !changes?.selectedStateId?.firstChange
    ) {
      console.log(
        "selectedStateId",
        changes.selectedStateId.currentValue,
        "this.stateServiceLabel",
        this.stateServiceLabel
      );
      this.stateId = "";
      this.stateId = changes.selectedStateId.currentValue;
      console.log("updatedStateId", this.stateId);
      this.reloadComponent(this.stateId);
      // this.getScatterData();
      // if (this.stateServiceLabel) {
      //   this.getServiceLevelBenchmarkBarChartData();
      // } else {
      //   this.getStateRevenue();
      // }
    }
    this.stateServiceLabel = false;
    if (changes.data) {
      console.log("dounghnuChartLabels", this.dounghnuChartLabels);
      this.tabName = this.data.name.toLocaleLowerCase();
      this.data = {
        ...this.data["mainContent"][0],
        filterName: this.data.name,
      };
      // if (!changes.data.firstChange) this.changeActiveBtn(0);
      this.setHeadOfAccount();
    }

    if ((changes && changes.stateServiceLabel) || changes.data) {
      // this.reset();
      if (changes.stateServiceLabel) {
        this.stateFilterDataService.getYearListSLB().subscribe(
          (res) => {
            this.yearList = res["data"];
          },
          (err) => {
            console.log(err.message);
          }
        );
      }

      console.log("this.data.filterName", this.data.filterName);
      this.currentActiveTab = this.data.filterName;
      // this.createDynamicChartTitle(this.currentActiveTab);
      if (this.data.filterName == "Water Supply") {
        this.serviceTab = "water supply";
        this.stateServiceLabel = true;
      } else if (this.data.filterName == "Waste Water Management") {
        this.serviceTab = "sanitation";
        this.stateServiceLabel = true;
      } else if (this.data.filterName == "Solid Waste Management") {
        this.serviceTab = "solid waste";
        this.stateServiceLabel = true;
      } else if (this.data.filterName == "Storm Water Drainage") {
        this.serviceTab = "storm water";
        this.stateServiceLabel = true;
      }

      console.log("serviceTab", this.serviceTab?.toLocaleLowerCase());
      // this.getDropDownValue();
      this.changeActiveBtn(0);
    }

  }
  }

  setHeadOfAccount() {
    let name = this.data["filterName"]?.toLocaleLowerCase().split(" ");
    this.headOfAccount = name.includes("revenue")
      ? "Revenue"
      : name.includes("expenditure")
      ? "Expense"
      : name.includes("surplus")
      ? "Expense"
      : "Tax";
  }

  notfound = true;

  widgetMode: boolean = false;
  apiParamData: any;
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log("param", params);
      this.widgetMode = params?.widgetMode ? JSON.parse(params?.widgetMode) : false;
      this.apiParamData = params;
      this._commonServices.isEmbedModeEnable.next(this.widgetMode);
    });
    console.log('widgetMode', this.widgetMode);
    if (this.widgetMode) {
      this.getStateMixChartData();
    } else {
      this.ulbArr = [];
      if (this.statesList) {
        this.stateName = this.statesList[this.stateId];
      }
      console.log("this.innertabData", this.data);

      this.getRevenueId();
      // this.changeActiveBtn(0);

      this.getStateUlbsPopulation();
      // this.getStateRevenue();

      this.stateFilterDataService.selectedStateFromSlbDashboard.subscribe(
        (data) => {
          console.log("selectedStateFromSlbDashboard", data);
          if (data?.isNotFirstChange && data?.stateId) {
            this.stateId = "";
            this.stateId = data?.stateId;
            this.getScatterData();
            if (this.stateServiceLabel) {
              this.getServiceLevelBenchmarkBarChartData();
            } else {
              this.getStateRevenue();
            }
          }
        }
      );
    }

    // this.ulbArr = [];
    // if (this.statesList) {
    //   this.stateName = this.statesList[this.stateId];
    // }
    // console.log("this.innertabData", this.data);

    this.nationalFilter.valueChanges.subscribe((value) => {
      if (value?.length >= 1) {
        this._commonServices
          .postGlobalSearchData(value, "ulb", this.stateId)
          .subscribe((res: any) => {
            console.log(res?.data);
            let emptyArr: any = [];
            this.filteredOptions = emptyArr;
            if (res?.data.length > 0) {
              this.filteredOptions = res?.data;
              //this.noDataFound = false;
            } else {
              let emptyArr: any = [];
              this.filteredOptions = emptyArr;
              // this.noDataFound = true;
              console.log("no data found");
            }
          });
      } else {
        return null;
      }
    });

    // this.getRevenueId();
    // // this.changeActiveBtn(0);

    // this.getStateUlbsPopulation();
    // // this.getStateRevenue();

    // this.stateFilterDataService.selectedStateFromSlbDashboard.subscribe(
    //   (data) => {
    //     console.log("selectedStateFromSlbDashboard", data);
    //     if (data?.isNotFirstChange && data?.stateId) {
    //       this.stateId = "";
    //       this.stateId = data?.stateId;
    //       this.getScatterData();
    //       if (this.stateServiceLabel) {
    //         this.getServiceLevelBenchmarkBarChartData();
    //       } else {
    //         this.getStateRevenue();
    //       }
    //     }
    //   }
    // );
  }

  ulbId: any;
  getUlbData(event) {
    console.log(event);
    this.ulbId = event._id;
    // this.getScatterData();
    if (this.selectedRadioBtnValue) {
      this.initializeScatterData();
      this.getAverageScatterData();
    } else {
      this.getScatterData();
    }
    // if (this.stateServiceLabel) {
    //   this.getServiceLevelBenchmarkBarChartData();
    // }
  }

  labels(data) {
    this.chartLabels = data;
    console.log(this.chartLabels);
  }

  getChartDropdownValue(event: any) {
    console.log("getChartDropdownValue", event);
    this.chartDropdownValue = event && event.target && event.target.value;
    this.getStateRevenue();
  }

  getStateUlbsPopulation() {
    const paramContent: any = {
      stateId: this.stateId,
    };
    this.stateFilterDataService
      .getStateUlbsGroupedByPopulation(paramContent)
      .subscribe(
        (response) => {
          if (response && response["success"]) {
            console.log("getStateUlbsGroupedByPopulation", response);
            if (response && response["data"] && response["data"]?.length) {
              this.stateUlbsPopulation.tableHeading = Object.keys(
                response["data"][0]
              );
              this.stateUlbsPopulation.tableDataSource = response["data"][0];
            }
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  activeButtonList: any = stateDashboardSubTabsList;

  getTabType() {
    const defaultOption = {
      yAxisLabel: "Count",
      countAccessKey: "count",
      chartAnimation: "defaultBarChartOptions",
    };
    let findTabType = this.activeButtonList.find(
      (tabName) => tabName.name == this.ActiveButton
    );
    return findTabType ? findTabType : defaultOption;
  }

  barChartPayload: any = {};
  getStateRevenue() {
    console.log("getStateRevenueCalled");
    const tabType = this.getTabType();
    this.barChartPayload = {};
    this.barChartPayload = {
      // "tabType": this.ActiveButton?.split(' ').join(''),
      tabType: tabType ? tabType?.code : "",
      financialYear: this.financialYear,
      stateId: this.stateId,
      sortBy: this.BarGraphValue ? "top" : "bottom",
      chartType: "bar",
      apiEndPoint: "state-revenue-tabs",
      apiMethod: "get",
      activeButton: this.ActiveButton,
      chartTitle: "",
    };

    if (tabType?.isCodeRequired) {
      this.barChartPayload["code"] = this.chartDropdownValue
        ? this.chartDropdownValue
        : this.chartDropdownList[0].code;
    }
    console.log("dasdasdas", tabType);
    console.log("paramContent", this.barChartPayload);
    this.stateFilterDataService
      .getStateRevenueForDifferentTabs(this.barChartPayload)
      .subscribe(
        (response) => {
          if (response && response["success"]) {
            console.log(
              "getStateRevenue",
              response,
              this.barData,
              tabType?.countAccessKey
            );

            // this.barData = this.barData?.data?.sort((a, b) => b.sum - a.sum);
            // console.log("this.barData", this.barData);
            if (response["data"] && response["data"].length) {
              for (const data of response["data"]) {
                data["count"] = this._commonServices.changeCountFormat(
                  data[tabType?.countAccessKey],
                  tabType?.chartAnimation
                );
              }
              this.filterCityRankingChartData(
                response["data"],
                this.barChartPayload?.tabType,
                tabType?.yAxisLabel
              );
              this.barChartNotFound = false;
            } else {
              this.barChartNotFound = false;
            }
          } else {
            this.barChartNotFound = true;
          }
        },
        (error) => {
          this.barChartNotFound = true;
          console.log(error);
        }
      );
  }

  sortData(sort: string = "top", data: any) {
    let item = data.sort((a: any, b: any) => {
      return sort == "bottom" ? a?.count - b?.count : b?.count - a?.count;
    });
    return item;
  }

  filterCityRankingChartData(
    responseData: any,
    tabType: string,
    yAxisLabel: string
  ) {
    let sortingType = this.BarGraphValue ? "top" : "bottom";
    responseData = this.sortData(sortingType, responseData);
    console.log("filterCityRankingChartData", responseData, tabType);
    let barData = {
      type: "bar",
      data: {
        labels: responseData.map((item: { ulbName: any }) => item.ulbName),
        datasets: [
          {
            // label: "City Ranking",
            label: "Cities",
            displayLabel: false,
            data: this.getChartData(responseData, tabType, yAxisLabel),
            backgroundColor: [
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
              "#1E44AD",
            ],
            borderColor: ["#1E44AD"],
            borderWidth: 1,
          },
        ],
      },
    };
    this.barData = {};
    this.barData = barData;
    console.log("this.barData", this.barData);
  }

  getChartData(responseData: any, tabType: string, yAxisLabel: string) {
    this.setChartAnimation(tabType, yAxisLabel);
    let mappedCountList = responseData.map(
      (item: { count: any }) => item.count
    );
    return mappedCountList;
  }

  setChartAnimation(tabType: string, yAxisLabel: string) {
    let animationConfig: any;
    console.log("this.getTabType", this.getTabType());
    let animationConfigAccessKey: any = this.stateServiceLabel
      ? "serviceLevelBenchmarkBarChartOptions"
      : this.getTabType().chartAnimation;
    animationConfig = this.stateFilterDataService[animationConfigAccessKey];
    Object.assign(animationConfig);
    this.barChartOptions = animationConfig;
    // let yAxesLabelName = tabType == 'TotalRevenue' ? 'Amount (in Cr.)' : 'Amount (in INR)';
    this.barChartOptions["scales"]["yAxes"][0]["scaleLabel"]["labelString"] =
      yAxisLabel;

    console.log("barChartOptions", this.barChartOptions);
  }

  showSnackbarMessage(message: string) {
    this.snackbar.open(message, null, {
      duration: 5000,
      verticalPosition: "bottom",
    });
  }

  serviceLevelBenchmarkScatterOption: any;
  setServiceLevelBenchmarkScatteredChartOption(
    xAxisLabel: string = "Population(in Thousands)",
    yAxisLabel: string = "Total Revenue (in Cr.)"
  ) {
    let tooltipValue = "";
    if (this.percentLabel == "percent") {
      tooltipValue = "%";
    }
    let scatterOption = {
      legend: {
        itemStyle: {
          cursor: "default",
        },
        labels: {
          padding: 20,
          color: "#000000",
          usePointStyle: true,
          pointStyle: "circle",
        },
        position: "bottom",
        onHover: function (event, legendItem) {
          event.target.style.cursor = "pointer";
        },
        onClick: function (e, legendItem) {
          var index = legendItem.datasetIndex;
          var ci = this.chart;
          var alreadyHidden =
            ci.getDatasetMeta(index).hidden === null
              ? false
              : ci.getDatasetMeta(index).hidden;

          ci.data.datasets.forEach(function (e, i) {
            var meta = ci.getDatasetMeta(i);

            if (i !== index) {
              if (!alreadyHidden) {
                meta.hidden = meta.hidden === null ? !meta.hidden : null;
              } else if (meta.hidden === null) {
                meta.hidden = true;
              }
            } else if (i === index) {
              meta.hidden = null;
            }
          });

          ci.update();
        },
      },
      elements: {
        point: {
          radius: 7,
        },
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: this._commonServices.toTitleCase(xAxisLabel),
              fontStyle: "bold",
            },

            offset: true,
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: `${this._commonServices.toTitleCase(yAxisLabel)}`,
              fontStyle: "bold",
            },
            gridLines: {
              offsetGridLines: true,
              display: false,
            },

            offset: true,
          },
        ],
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            console.log("tooltipItem", tooltipItem, tooltipValue);
            console.log("data.datasets", data);
            var datasetLabel =
              data.datasets[tooltipItem.datasetIndex].label || "Other";
            var label =
              data.datasets[tooltipItem.datasetIndex]["labels"][
                tooltipItem.index
              ];
            console.log("tooltipItem", data.datasets[tooltipItem.datasetIndex]);
            var rev =
              data.datasets[tooltipItem.datasetIndex]["rev"][tooltipItem.index];

            // return datasetLabel + ": " + label + " " + `(${rev} %)`;
            return `${datasetLabel}: ${
              label && datasetLabel != label ? label : ""
            } ${
              tooltipItem?.yLabel
                ? `(${tooltipItem?.yLabel} ${tooltipValue})`
                : `(${tooltipItem?.yLabel})`
            }`;
          },
        },
      },
      legendCallback: function (chart) {
        var text = [];
        text.push('<ul class="' + this.chartId + '-legend">');
        for (var i = 0; i < chart.data.datasets.length; i++) {
          text.push(
            '<li><div class="legendValue"><span style="background-color:' +
              chart.data.datasets[i].backgroundColor +
              '">&nbsp;&nbsp;&nbsp;&nbsp;</span>'
          );

          if (chart.data.datasets[i].label) {
            text.push(
              '<span class="label">' + chart.data.datasets[i].label + "</span>"
            );
          }

          text.push('</div></li><div class="clear"></div>');
        }

        text.push("</ul>");

        return text.join("");
      },
    };

    this.serviceLevelBenchmarkScatterOption = Object.assign(scatterOption);
  }

  getServiceLevelBenchmarkBarChartData() {
    this.chartTitle = `${this.BarGraphValue ? "Top" : "Bottom"} 10 performing ULBs on ${this._commonServices.toTitleCase(this.filterName)} in ${this.stateName}`;
    let apiEndPoint = "state-slb";
    this.barChartPayload = {};
    this.barChartPayload = {
      financialYear: this.financialYear ? this.financialYear : "",
      stateId: this.stateId,
      sortBy: this.BarGraphValue ? "top10" : "bottom10",
      filterName: this.filterName ? this.filterName : "",
      // ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
      apiEndPoint: apiEndPoint,
      apiMethod: "get",
      chartType: "bar",
      stateServiceLabel: this.stateServiceLabel,
      activeButton: this.ActiveButton,
      chartTitle: this.chartTitle,
    };

    console.log("payload", this.barChartPayload);

    this.stateFilterDataService
      .getScatterdData(this.barChartPayload, apiEndPoint)
      .subscribe(
        (response) => {
          if (response && response["success"] && response["data"]) {
            console.log("getStateRevenue", response);
            if (
              response["data"]["scatterData"] &&
              response["data"]["scatterData"]["tenData"] &&
              response["data"]["scatterData"]["tenData"].length
            ) {
              let chartData = response["data"]["scatterData"]["tenData"];
              for (const data of chartData) {
                data["count"] = data?.value;
              }
              this.filterCityRankingChartData(chartData, "", "Percentage");
              this.barChartNotFound = false;
            } else {
              this.barChartNotFound = true;
            }
          } else {
            this.barChartNotFound = true;
          }
        },
        (error) => {
          this.barChartNotFound = true;
          console.log(error);
        }
      );
  }

  returnChartPayload: any = "";
  getClickedAction(event: any) {
    console.log("getClickedAction", event);
    return;
    let apiRequestData: any;
    switch (event?.chartType) {
      case "bar":
        if (this.stateServiceLabel) {
          apiRequestData = {
            financialYear: this.financialYear,
            stateId: this.stateId,
            sortBy: this.BarGraphValue ? "top10" : "bottom10",
            filterName: this.filterName,
            ulb: this.ulbId,
            apiEndPoint: "state-slb",
            apiMethod: "get",
            chartType: event?.chartType,
            stateServiceLabel: this.stateServiceLabel,
          };
          console.log("if apiRequestData", apiRequestData);
        } else {
          const tabType = this.getTabType();
          apiRequestData = {
            tabType: tabType ? tabType?.code : "",
            financialYear: this.financialYear,
            stateId: this.stateId,
            sortBy: this.BarGraphValue ? "top" : "bottom",
            apiEndPoint: "state-revenue-tabs",
            apiMethod: "get",
            chartType: event?.chartType,
          };
          if (tabType?.isCodeRequired) {
            apiRequestData["code"] = this.chartDropdownValue
              ? this.chartDropdownValue
              : this.chartDropdownList[0].code;
          }
        }
        break;
      case "scatter":
        apiRequestData = {
          stateId: this.stateId,
          financialYear: this.financialYear,
          headOfAccount: this.headOfAccount ? this.headOfAccount : "",
          filterName: this.filterName,
          isPerCapita: this.isPerCapita,
          compareType: "",
          compareCategory: this.selectedRadioBtnValue
            ? this.selectedRadioBtnValue
            : "",
          ulb: this.ulbId ? this.ulbId : "",
          apiEndPoint: this.stateServiceLabel ? "state-slb" : "state-revenue",
          apiMethod: "post",
          chartType: event?.chartType,
          stateServiceLabel: this.stateServiceLabel,
        };
        console.log(event?.chartType, apiRequestData);
        break;
      case "pie":
      case "doughnut":
        break;
      default:
        break;
    }
    this.returnChartPayload =
      this._commonServices.createEmbedUrl(apiRequestData);
    // return this.returnChartPayload = JSON.parse(JSON.stringify(apiRequestData));
  }

  getAverageScatterData() {
    const tabType = this.getTabType();
    this.multiChart = false;
    this._loaderService.showLoader();

    // this.initializeScatterData();
    let apiEndPoint = "state-dashboard-averages";

    this.scatterChartPayload = {
      state: this.stateId,
      financialYear: this.financialYear ? this.financialYear : "",
      headOfAccount: this.stateServiceLabel ? undefined : this.headOfAccount,
      filterName: this.filterName ? this.filterName : "",
      isPerCapita: this.isPerCapita ? this.isPerCapita : "",
      compareType: this.compType ? this.compType : "",
      compareCategory: this.selectedRadioBtnValue
        ? this.selectedRadioBtnValue
        : "",
      ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
      chartType: !this.filterName.includes("mix") ? "scatter" : "doughnut",
      apiEndPoint: apiEndPoint,
      apiMethod: "post",
      stateServiceLabel: this.stateServiceLabel,
      sortBy: "",
      chartTitle: "",
      which: this.selectedRadioBtnValue ? this.selectedRadioBtnValue : "",
      TabType: tabType ? tabType?.code : "",
    };

    if (this.selectedRadioBtnValue == "nationalAvg") {
      this.scatterData.data.datasets.push(
        this.stateFilterDataService.nationLevelScatterDataSet
      );
    }
    console.log("scatterChartPayload", this.scatterChartPayload);

    this.stateFilterDataService
      .getAvgScatterdData(this.scatterChartPayload, apiEndPoint)
      .subscribe(
        (res) => {
          this.notfound = false;
          console.log("response data", res);
          //scatter plots center

          if (!this.filterName.includes("mix")) {
            this._loaderService.stopLoader();
            this.notfound = false;
            // if (this.selectedRadioBtnValue == "populationAvg") {
            //   this.scatterData = this.stateFilterDataService.populationWiseScatterData(res['data']);
            //   console.log(this.scatterData);
            // } else {
            let scatterChartObj: any = {
              // cluster of ULBs under these 3 categories
              mCorporation:
                res["data"] && res["data"]["mCorporation"]
                  ? res["data"]["mCorporation"]
                  : [],
              municipality:
                res["data"] && res["data"]["municipality"]
                  ? res["data"]["municipality"]
                  : [],
              townPanchayat:
                res["data"] && res["data"]["townPanchayat"]
                  ? res["data"]["townPanchayat"]
                  : [],
              // average of ULBs, state, national
              mCorporationAvg:
                res["data"] && res["data"]["Municipal Corporation"]
                  ? parseFloat(res["data"]["Municipal Corporation"])
                  : 0,
              municipalityAvg:
                res["data"] && res["data"]["Municipality"]
                  ? parseFloat(res["data"]["Municipality"])
                  : 0,
              townPanchayatAvg:
                res["data"] && res["data"]["Town Panchayat"]
                  ? parseFloat(res["data"]["Town Panchayat"])
                  : 0,
              stateAvg:
                res["data"] && res["data"]["stateAvg"]
                  ? parseFloat(res["data"]["stateAvg"])
                  : 0,
              nationalAvg:
                res["data"] && res["data"]["national"]
                  ? parseFloat(res["data"]["national"])
                  : 0,
              // average of population under these categories
              lessThan100k:
                res["data"] && res["data"]["< 100 Thousand"]
                  ? parseFloat(res["data"]["< 100 Thousand"])
                  : 0,
              bwt100kTo500k:
                res["data"] && res["data"]["100 Thousand - 500 Thousand"]
                  ? parseFloat(res["data"]["100 Thousand - 500 Thousand"])
                  : 0,
              bwt500kTo1m:
                res["data"] && res["data"]["500 Thousand - 1 Million"]
                  ? parseFloat(res["data"]["500 Thousand - 1 Million"])
                  : 0,
              bwt1mTo4m:
                res["data"] && res["data"]["1 Million - 4 Million"]
                  ? parseFloat(res["data"]["1 Million - 4 Million"])
                  : 0,
              greaterThan4m:
                res["data"] && res["data"]["4 Million+"]
                  ? parseFloat(res["data"]["4 Million+"])
                  : 0,
            };
            scatterChartObj["stateLevelMaxPopuCount"] =
              this.stateFilterDataService.getMaximumPopulationCount(
                scatterChartObj?.mCorporation,
                scatterChartObj?.townPanchayat,
                scatterChartObj?.municipality
              );

            this.scatterData = this.stateFilterDataService.plotScatterChart(
              scatterChartObj,
              this.selectedRadioBtnValue
            );

            console.log(this.scatterData);
            this.generateRandomId("scatterChartId123");
            // }
          }
        },
        (err) => {
          this._loaderService.stopLoader();
          this.notfound = true;
          console.log(err.message);
        }
      );
  }

  downloadCsvFile() {
    console.log("downloadCsvFile", this.barChartPayload);
    // let prepareParam = new URLSearchParams(this.barChartPayload).toString();
    // console.log('prepareParam', prepareParam);
    this._commonServices.openWindowToDownloadCsv(
      this.barChartPayload,
      this.barChartPayload?.apiEndPoint,
      this.stateServiceLabel
    );
  }

  callStandaLoneSlbDashboardApis() {
    this.getScatterData();
    this.getServiceLevelBenchmarkBarChartData();
  }

  getStateMixChartData() {
    this.mainChartTitle = this.apiParamData?.chartTitle ?? '';
    this.multipleChartTitle = this.apiParamData?.chartTitle ?? '';
    let isPerCapita = this.apiParamData.hasOwnProperty("isPerCapita") && this.apiParamData?.isPerCapita != ""
        ? JSON.parse(this.apiParamData?.isPerCapita)
        : false;

    this.multiChart = false;
    this._loaderService.showLoader();
    this.initializeScatterData();
    console.log("apiParamData", this.apiParamData);
    let stateServiceLabel = this.apiParamData?.hasOwnProperty("stateServiceLabel") ? JSON.parse(this.apiParamData?.stateServiceLabel) : false;
    this.stateServiceLabel = stateServiceLabel;
    console.log("stateServiceLabel", stateServiceLabel, 'this.stateServiceLabel', this.stateServiceLabel);
    let payload = {
      [stateServiceLabel ? "stateId" : "state"]: this.apiParamData?.stateId ? this.apiParamData?.stateId : this.apiParamData?.state,
      financialYear: this.apiParamData?.financialYear,
      headOfAccount: stateServiceLabel ? undefined : this.apiParamData?.headOfAccount,
      filterName: this.apiParamData?.filterName,
      isPerCapita: (this.apiParamData.hasOwnProperty("isPerCapita") && this.apiParamData['isPerCapita']) ? JSON.parse(this.apiParamData?.isPerCapita) : "",
      compareCategory: this.apiParamData?.compareCategory,
      compareType: this.apiParamData?.compareType ? this.apiParamData?.compareType : "",
      ulb: this.apiParamData?.ulb ? this.apiParamData?.ulb.split(",") : [],
      widgetMode: this.widgetMode,
    };
    let apiEndPoint = stateServiceLabel ? "state-slb" : "state-revenue";
    console.log('apiEndPoint', apiEndPoint, 'payload', payload);
    let yAxesLabelName = '';

    this.stateFilterDataService
      .getScatterdData(payload, apiEndPoint)
      .subscribe(
        (res) => {
          this.notfound = false;
          console.log("response data", res);
          //scatter plots center
          let apiData = res["data"];
          if (this.apiParamData?.filterName.includes("mix")) {
            this._loaderService.stopLoader();
            console.log("mix Data", res);
            let data;
            let ulbData;
            if (
              this.apiParamData?.ulb &&
              this.apiParamData?.compareType !== "ulbType" &&
              this.apiParamData?.compareType !== "popType"
            ) {
              data = res["state"];
              ulbData = res["ulb"];
              this.multiChart = true;
              this.mainDoughnutArr = [{ state: data }, { ulb: ulbData }];
            } else {
              data = res["data"];
              this.mainDoughnutArr = [];
              this.multiChart = false;
            }

            console.log("initial data", data);

            // if (data?.length > 0) {
            //   this.chartDropdownList = data;
            //   this.getStateRevenue();
            // }
            // console.log("chartDropdownList", this.chartDropdownList);
            this.initializeDonughtData();
            if (this.apiParamData?.compareType == "") {
              if (data.length) {
                console.log("mixdata==>", data);
                data = data.sort((a, b) => b.code - a.code);
                if (data[0].hasOwnProperty("colour"))
                  this.doughnutData.data.datasets[0].backgroundColor = [];
                data.forEach((el) => {
                  this.doughnutData.data.labels.push(el._id);
                  this.doughnutData.data.datasets[0].data.push(el.amount);
                  if (el.colour) {
                    this.doughnutData.data.datasets[0].backgroundColor.push(
                      el.colour
                    );
                  }
                });
                console.log(this.doughnutData);

                this.doughnutData = { ...this.doughnutData };
              }
            } else if (this.apiParamData?.compareType == "ulbType") {
              console.log("apiData", data);

              let mData = data["mData"][0];
              let mcData = data["mcData"][0];
              let tpData = data["tpData"][0];
              let ulbStateData = data["state"];

              this.multiChart = true;
              this.doughnutDataArr = [
                { mData: mData },
                { mcData: mcData },
                { tpData: tpData },
                { ulbStateData: ulbStateData },
              ];
              if (data["ulb"].length > 0) {
                this.doughnutDataArr = [
                  ...this.doughnutDataArr,
                  { ulb: data["ulb"] },
                ];
              }

              this.doughnutDataArr = [...this.doughnutDataArr];

              console.log("doughnutDataArr", this.doughnutDataArr);
            } else if (this.apiParamData?.compareType == "popType") {
              let lessThan100k = data["<100k"];
              let between100kTo500k = data["100k-500k"];
              let between500kTo1m = data["500k-1M"];
              let between1mTo4m = data["1m-4m"];
              let greaterThan4m = data["4m+"];
              let popStateData = data["state"];

              this.multiChart = true;
              this.doughnutDataArr = [];
              this.doughnutDataArr = [
                { "<100k": lessThan100k },
                { "100k-500k": between100kTo500k },
                { "500k-1M": between500kTo1m },
                { "1m-4m": between1mTo4m },
                { "4m+": greaterThan4m },
                { popStateData: popStateData },
              ];
              if (data["ulb"].length > 0) {
                this.doughnutDataArr = [
                  ...this.doughnutDataArr,
                  { ulb: data["ulb"] },
                ];
              }

              this.doughnutDataArr = [...this.doughnutDataArr];
              console.log("doughnutDataArr", this.doughnutDataArr);
            }
          }
        },
        (err) => {
          this._loaderService.stopLoader();
          this.notfound = true;
          console.log(err.message);
        }
      );
  }
}

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
function convertToCr(value) {
  if (value == 0) return 0;
  value /= 10000000;
  return Math.round(value);
}

