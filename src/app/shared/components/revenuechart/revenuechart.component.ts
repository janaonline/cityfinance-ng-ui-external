import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChildren,
} from "@angular/core";
import Chart from "chart.js";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { FormControl } from "@angular/forms";
import html2canvas from "html2canvas";
import { GlobalLoaderService } from "../../../../app/shared/services/loaders/global-loader.service";
import { BaseComponent } from "src/app/util/baseComponent";
import { ActivatedRoute, Router } from "@angular/router";
import { ShareDialogComponent } from "../share-dialog/share-dialog.component";
import { CommonService } from "../../services/common.service";
import { StateFilterDataService } from "../state-filter-data/state-filter-data.service";
import { stateDashboardSubTabsList } from "../state-filter-data/constant";
import { RevenuechartService } from "./revenuechart.service";

@Component({
  selector: "app-revenuechart",
  templateUrl: "./revenuechart.component.html",
  styleUrls: ["./revenuechart.component.scss"],
})
export class RevenuechartComponent
  extends BaseComponent
  implements OnInit, AfterViewInit, OnChanges
{
  @Input()
  cityChart: boolean = false;
  @Input()
  stateChart: boolean = false;
  @Input()
  chartDialogues = false;
  @Input()
  chartOptions;
  @Input()
  btnBesideText = false;
  @Input()
  multiChartLabel = [];

  @Input()
  selectedulb: any = "";

  stateId;
  stateName;
  @Input()
  disableFirstYear = true;

  stateMap = JSON.parse(localStorage.getItem("stateIdsMap"));
  @Input() nestedChartFilterOption: any = {
    showFinancialYear: true,
    showResetButton: true,
  };
  href: any;
  cityClass: boolean = false;
  constructor(
    public dialog: MatDialog,
    public _loaderService: GlobalLoaderService,
    public activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private commonService: CommonService,
    private stateFilterDataService: StateFilterDataService,
    private revenuechartService:RevenuechartService
  ) {
    super();
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
    this.href = this.router.url;
    if (this.href.includes("cityId")) {
      this.cityClass = true;
      console.log("cityClass", this.cityClass);
    }
  }

  @Input()
  isPerCapita;

  @ViewChild("template") template;
  @Input()
  chartTitle = "ULB_NAME total revenues vs State ULB_TYPE Average";
  @Input() activeButtonChange:any='' ;
  @Input()
  chartData: any = {
    // type: "bar",
    type: "scatter",
    data: {
      datasets: [
        {
          label: "Municipality",
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#1EBFC6",
          backgroundColor: "#1EBFC6",
        },
        {
          label: "Municipal Corporation",
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#3E5DB1",
          backgroundColor: "#3E5DB1",
        },
        {
          label: "Town Panchayat",
          data: [],
          showLine: false,
          fill: true,
          borderColor: "#F5B742",
          backgroundColor: "#F5B742",
        },
        {
          label: "State Average",
          data: [],
          showLine: true,
          fill: false,
          borderColor: "red",
        },
      ],
    },
  };
  @Input()
  chartId;

  @Input()
  own;

  @Input()
  notFound;
  @Input()
  notFoundMessage = "Please try again with other filter options";
  // options in case of sactter plot
  @Input()
  scatterOption: any = {
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
            labelString: "Population(in Thousands)",
            fontStyle: "bold",
          },

          offset: true,
        },
      ],
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: this.activeButtonChange == 'Revenue Per Capita' ? 'Total Revenue' : 'Total Revenue (In Cr.)',
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
          console.log("tooltipItem", tooltipItem, data);
          var datasetLabel =
            data.datasets[tooltipItem.datasetIndex].label || "Other";
          var label =
            data.datasets[tooltipItem.datasetIndex]["labels"][
              tooltipItem.index
            ];
          // var rev = data.datasets[tooltipItem.datasetIndex]["rev"][tooltipItem.index];
          // var defaultRevValue = data.datasets[tooltipItem.datasetIndex]["rev"]
          //   console.log('datasetLabel', datasetLabel, 'defaultRevValue', defaultRevValue)
          //   console.log('rev', rev)
          // rev = rev ? rev : defaultRevValue ? defaultRevValue : '';
          // return `${datasetLabel}: ${label ? label : ""} ${
          //   rev
          //     ? rev > 10000000
          //       ? `(${(rev / 10000000).toFixed(2)} Cr)`
          //       : `(${rev.toFixed(2)})`
          //     : ""
          // }`;
          return `${datasetLabel}: ${
            label && datasetLabel != label ? label : ""
          } ${
            tooltipItem?.yLabel
              ? tooltipItem?.yLabel > 10000000
                ? `(${Math.round(tooltipItem?.yLabel / 10000000)} Cr)`
                : `(${Math.round(tooltipItem?.yLabel)})`
              : ""
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

  @Input()
  ChartOptions: any = {
    maintainAspectRatio: false,

    responsive: true,
    scales: {
      yAxes: [
        {
          gridLines: {
            offsetGridLines: true,
            display: false,
          },
          scaleLabel: { labelString: "" },
          beginAtZero: true,
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
  };

  @Input()
  headerActions = [
    // {
    //   name: "expand",
    //   svg: "../../../../assets/CIty_detail_dashboard – 3/Icon awesome-expand-arrows-alt.svg",
    // },
    {
      name: "Download",
      svg: "../../../../assets/CIty_detail_dashboard – 3/2867888_download_icon.svg",
    },
    // {
    //   name: "share/embed",
    //   svg: "../../../../assets/CIty_detail_dashboard – 3/Layer 51.svg",
    // },
  ];
  @Input()
  compareDialogType = 1;

  @Output()
  actionClicked = new EventEmitter();
  @Output()
  compareChange = new EventEmitter();

  @Output()
  dounghnuChartLabels = new EventEmitter();
  myChart;
  showMultipleCharts;
  @Input()
  yearList = ["2017-18", "2018-19", "2019-20", "2020-21"];
  @Input()
  mySelectedYears = ["2019-20", "2020-21"];
  @Input()
  year;
  @Input()
  compareType = "";

  @Input()
  state = "";
  staticYearList = [
    "2015-16",
    "2016-17",
    "2017-18",
    "2018-19",
    "2019-20",
    "2020-21",
  ];

  @Input() multipleCharts: boolean = false;

  @Input()
  singleDoughnutChart;

  @Input()
  multipleDoughnutCharts: any;

  widgetMode: boolean = false;
  apiParamData: any;
  ulbList: any;
  @Input() getChartPayload: any = {};
  multiChart: boolean = false;
  scatterData: any;
  iFrameApiPayload: any;
  @Input() sourceDashboardName: string = '';
  percentLabel: string = '';
  @Input() selectedFinancialYear: any;
  @Input() embeddedRoute: string = 'revenuchart';
  defaultMaxPopulation: number = 1200;
  ngOnInit(): void {
    console.log(
      "multiChartLabelsss===>",
      this.multiChartLabel,
      this.singleDoughnutChart,
      this.multipleCharts,
      this.stateChart,
      this.cityChart
    );
    this.stateName = this.stateMap[this.stateId];
    // window.onload = () => {
    //   if (this.multipleCharts) {
    //     this.createMultipleChart();
    //   } else this.createChart();
    // };

    this.activatedRoute.queryParams.subscribe((params) => {
      console.log("param", params);
      this.widgetMode = params?.widgetMode;
      this.apiParamData = params;
      this.commonService.isEmbedModeEnable.next(this.widgetMode);
      // this.decodeIframeUrl(params.data);
    });
  }

  // let legendDiv = document.getElementById('legend')

  // $('#legend').prepend(mybarChart.generateLegend());
  ngAfterViewInit(): void {
    console.log("chartTiltle", this.chartTitle);
    if (this.widgetMode) {
      this.chartTitle = this.apiParamData.hasOwnProperty("chartTitle")
        ? this.apiParamData?.chartTitle
        : "";
      console.log("apiParamData", this.apiParamData);
      if (this.apiParamData.hasOwnProperty("cityId")) {
        this.cityChart = true;
        this.mySelectedYears = this.apiParamData?.mySelectedYears ? this.apiParamData?.mySelectedYears.split(",") : this.mySelectedYears;
        this.getCityChartData();
      } else {
        let stateServiceLabel = this.apiParamData?.stateServiceLabel
          ? JSON.parse(this.apiParamData?.stateServiceLabel)
          : false;
        if (this.apiParamData.chartType == "scatter") {
          if (this.apiParamData.hasOwnProperty("which")) {
            this.getAverageScatterData();
          } else {
            this.getScatterData();
          }
        } else if (this.apiParamData.chartType == "bar") {
          if (stateServiceLabel) {
            this.getServiceLevelBenchmarkBarChartData();
          } else {
            this.getStateRevenue();
          }
          // this.getStateRevenue()
        }
      }
    } else {
      if (this.multipleCharts) {
        console.log("ngAfterViewInit Called", this.multipleCharts);
        this.createMultipleChart();
      } else this.createChart();
    }
  }

  yearValueChange(value) {
    this.year = value;
    this.revenuechartService.setSelectedYear(value)
    this.sendValue();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(this.activeButtonChange == 'Revenue Per Capita' || this.activeButtonChange == 'Own Revenue per Capita' || this.activeButtonChange == 'Capital Expenditure Per Capita'){
      this.scatterOption.scales.yAxes[0].scaleLabel.labelString = 'Total Revenue'
    }
    console.log(this.scatterOption,this.activeButtonChange)
    if (changes.hasOwnProperty("selectedulb")) {
      this.selectedulb = changes.selectedulb.currentValue;
      console.log("selectedulb", this.selectedulb);
    }

    this.stateId = sessionStorage.getItem("row_id");
    this.stateName = this.stateMap[this.stateId];
    console.log("ngOnChanges", changes);
    if (
      changes &&
      changes.getChartPayload &&
      changes.getChartPayload.currentValue
    ) {
      this.getChartPayload = changes.getChartPayload.currentValue;
      // this.iFrameApiPayload = changes.getChartPayload.currentValue;
      // this.openDialog();
    }
    if (changes?.chartData) {
      if (!changes.chartData.firstChange) {
        this.createChart();
      }
    }
    if (changes.mySelectedYears && changes.mySelectedYears.currentValue) {
      //this.year = this.mySelectedYears[0];
      this.revenuechartService.getYear.subscribe((res)=>{
         if(res.length>0){
           this.year = res
         }else{
          let tempYear = this.mySelectedYears
          tempYear.sort(function (a, b) {
            let newA:any = a.split("-")[0];
            let newB:any = b.split("-")[0];
            return newB - newA;
          });
          this.year = tempYear[0];
         } 
      })
      
    }
    console.log("changesmultipleCharts", changes);
    if (changes.multipleCharts && changes.multipleCharts.currentValue) {
      this.multipleCharts = changes.multipleCharts.currentValue;
    }

    console.log(
      "multipleCharts",
      this.multipleCharts,
      "changes",
      changes,
      "firstChange",
      changes.multipleDoughnutCharts?.firstChange
    );
    console.log("multipleDoughnutCharts Data", this.multipleDoughnutCharts);
    console.log("lastMultipleCharts", this.lastMultipleCharts);
    if (!changes.multipleDoughnutCharts?.firstChange && this.multipleCharts) {
      console.log("multipleDoughnutCharts called");
      if (this.lastMultipleCharts.length) {
        this.lastMultipleCharts.forEach((val) => val.destroy());
      }
      setTimeout(() => {
        console.log("calledSetTimeout");
        this.createMultipleChart();
      }, 100);
    }
  }

  createChart() {
    if (this.myChart) {
      this.myChart.destroy();
      console.log("this.myChart", this.myChart);
    }

    if (this.chartData?.type == "scatter") {

      Object.assign(this.chartData, { options: this.scatterOption });
    } else if (this.ChartOptions) {
      Object.assign(this.chartData, { options: this.ChartOptions });
    }

    if (this.chartData?.type == "doughnut") {
      let data = [];
      this.dounghnuChartLabels.emit(this.chartData.data["labels"]);
    }
    //dom is fully loaded, but maybe waiting on images & css files
    console.log("chartId==>", this.chartId, this.chartData, this.cityChart);
    setTimeout(() => {
      // }
      if (this.cityChart && this.chartData.type == "bar") {
        console.log("aaaa", this.chartData.data.labels);

        this.chartData.data.labels.sort(function (a, b) {
          let newA = a.split("-")[0];
          let newB = b.split("-")[0];
          return newA - newB;
        });
        console.log("aaaa b", this.chartData.data.labels);
      }

      console.log("chartId==>1", this.chartId, this.chartData);
      if (this.chartData?.data?.datasets.length) {
        let canvas = <HTMLCanvasElement>document.getElementById(this.chartId);
        if (!canvas) {
          console.error("no Canvas");
          return;
        }
        let ctx = canvas.getContext("2d");
        this.myChart = new Chart(ctx, this.chartData);

        // chartLegendEL.innerHTML = this.myChart.generateLegend();
        // bindChartEvents(myChart, document);

        // let legendDiv = document.getElementById('legend')

        // $('#legend').prepend(mybarChart.generateLegend());
      }
    }, 10);
  }

  lastMultipleCharts = [];

  createMultipleChart() {
    console.log("multipleDoughnutCharts", this.multipleDoughnutCharts);
    let id;
    let newChartData: any = {};
    if (
      this.multipleDoughnutCharts &&
      this.multipleDoughnutCharts?.length > 0
    ) {
      this.multiChartLabel = [];
      for (let index = 0; index < this.multipleDoughnutCharts.length; index++) {
        const element = this.multipleDoughnutCharts[index];
        id = element?.id + index;
        newChartData = element;
        let colors = element.data.datasets[0].backgroundColor;

        if (index == 0 && this.multiChartLabel.length == 0)
          element.data["labels"].forEach((elem, i) => {
            this.multiChartLabel.push({
              text: elem,
              color: colors[i],
            });
          });
        console.log(this.multiChartLabel);
        this.dounghnuChartLabels.emit(this.multiChartLabel);
        if (element?.multipleChartOptions)
          Object.assign(newChartData, {
            options: element?.multipleChartOptions,
          });
        let canvas = <HTMLCanvasElement>document.getElementById(id);
        console.log("canvas", canvas);
        let ctx = canvas.getContext("2d");
        let tempChart = new Chart(ctx, {
          ...newChartData,
          options: {
            ...newChartData.options,
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
                    const textSize = canvas.width / 100;
                    const model =
                      dataset._meta[Object.keys(dataset._meta)[0]].data[i]
                        ._model;

                    const total =
                      dataset._meta[Object.keys(dataset._meta)[0]].total;
                    const midRadius =
                      model.innerRadius +
                      (model.outerRadius - model.innerRadius) / 2;
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
                    var isBGColorDarkOrLight = lightOrDark(
                      model?.backgroundColor
                    );
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
          },
        });
        console.log("newChartData", newChartData);
        this.lastMultipleCharts.push(tempChart);
      }
    }
  }

  actionClick(value) {
    this._loaderService.showLoader();
    console.log(value);
    if (value.name == "Expand" || value.name == "Collapse") {
      this.headerActions.map((innerVal) => {
        if (innerVal.name === value.name) {
          if (value.name == "Expand") innerVal.name = "Collapse";
          else value.name = "Expand";
        }
        this._loaderService.stopLoader();
      });

      this.createChart();
    } else if (value.name == "Download") {
      this.getImage();
      return;
    } else if (value.name == "Share/Embed") {
      console.log("getChartPayload", this.getChartPayload, 'embeddedRoute', this.embeddedRoute);
      this.iFrameApiPayload = this.commonService.createEmbedUrl(
        this.getChartPayload, this.embeddedRoute
      );
      this._loaderService.stopLoader();
      this.openDialog();
    }
    this.actionClicked.emit({ ...value, chartType: this.chartData.type });

    // this._loaderService.stopLoader();
  }

  dialogRef: any;
  openDialog() {
    console.log("openDialog", this.iFrameApiPayload);
    const dialogRef = this.dialog.open(ShareDialogComponent, {
      width: "700px",
      data: {
        iFrameSrc: this.iFrameApiPayload,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
    });
  }
  openModal() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = "39rem";
     this.revenuechartService.getSelectedULBList.subscribe((res:any)=>{this.ulbList = res;})
    this.dialogRef = this.dialog.open(this.template, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log("result", result);
    });
  }

  closeModal() {
    this.dialogRef.close();
  }

  selectedOwnRevenueState: any = [];
  @Input() preSelectedOwnRevenueDbParameter: string = "";
  preSelectedOwnRevenueDbType: boolean = false;
  ownRevenueCompValue(value) {
    console.log("own Revenue Value", value);
    this.preSelectedOwnRevenueDbType = value?.type == "ulb" ? true : false;
    this.selectedOwnRevenueState = value?.list;
    this.preSelectedOwnRevenueDbParameter = value?.param;
    this.compareChange.emit(value);
  }

  getCompareCompValues(value) {
    console.log("neeeeee==>", value);
    if (Array.isArray(value)) {
      this.ulbList = value;
      this.compareType = "ULBs..";
      return this?.sendValue(value);
    } else this.compareType = value;
    // this.sendValue();
  }
  getClearedUlbValue(value) {
    console.log("hhhhhhhh", value);
    this.ulbList = value;
    this.sendValue();
    // if (value == "") {
    //   this.sendValue();
    // }
  }

  sendValue(ulbs = []) {
    this.revenuechartService.getSelectedULBList.subscribe((res)=>{
      if(res.length>0 && (this.compareType=='State' || this.compareType==undefined)){
         this.compareType = "ULBs..";
      }
      this.ulbList = res})
    let newYears = [this.year],
      numYear = 2,
      newValue = this.year;
    while (numYear--) {
      newValue = newValue
        ?.split("-")
        ?.map((value) =>
          !isNaN(Number(value)) ? (value = Number(value) - 1) : value
        )
        .join("-");
      newYears.push(newValue);
    }
    let data = {
      year: newYears,
      ulbs: this.ulbList,
      compareType: this.compareType,
    };
    console.log("emitting Value===>", { data }, this.ulbList);
    this.compareChange.emit(data);
  }
  showLoader = false;

  getImage() {
    let id = "canvasDiv" + this.chartId;
    // let id = this.multipleCharts ? "multiChartId" : `canvasDiv${this.chartId}`;
    // let id = "multiChartId";
    let hideHeaderAction: any = HTMLElement;
    let visibilityHidden: any = HTMLElement;

    /**
     * Declaring a variable called hideHeaderAction and assigning the display-none class to remove the compare dialog and download action
     * and at the end we remove the display-none class
     */
    // if (this.multipleCharts) {
    //   id = "multiChartId";
    // }
    hideHeaderAction = document.querySelectorAll('[id*="hideHeaderAction"]');
    hideHeaderAction.forEach((item) => {
      item.classList.add("display-none");
    });

    /* Adding the class "visibility-show" and "m-2" to all elements with an id that contains
    "visibility-hidden". */
    visibilityHidden = document.querySelectorAll('[class*="visibility-hidden"]');
    if (visibilityHidden) {
      visibilityHidden.forEach((item) => {
        item.classList.add("visibility-show", "m-2");
      });
    }

    console.log('selectedFinancialYear', this.selectedFinancialYear, 'sourceDashboardName', this.sourceDashboardName);

    let downloadChartName: string = '';
    if (Array.isArray(this.selectedFinancialYear)) {
      let financialYear = this.selectedFinancialYear.join(",");
      downloadChartName = this.sourceDashboardName ? `${this.sourceDashboardName}_${financialYear}_Chart` : `Chart ${this.chartId ? this.chartId : ""}`;
    } else {
      downloadChartName = this.sourceDashboardName ? `${this.sourceDashboardName}_${this.selectedFinancialYear}_Chart` : `Chart ${this.chartId ? this.chartId : ""}`;
    }

    let html = document.getElementById(id);;
    html2canvas(html).then((canvas) => {
      let image = canvas
        .toDataURL("image/png")
        .replace("image/png", "image/octet-stream");
      // window.open(image)
      var link = document.createElement("a");
      link.href = image;
      link.download = `${downloadChartName}.png`;
      link.click();

      if (hideHeaderAction) {
        hideHeaderAction.forEach((item) => {
          item.classList.remove("display-none");
        });
      }

      /* Removing the class "visibility-show" and "m-2" from the elements that have the class
      "visibility-hidden". */
      if (visibilityHidden) {
        visibilityHidden.forEach((item) => {
          item.classList.remove("visibility-show", "m-2");
        });
      }

      this._loaderService.stopLoader();
    });
  }

  resetState() {
    this.compareType = "State Average";
    this.revenuechartService.updateUlbList([])
    this.sendValue();
  }

  // iFrame Integration Start
  activeButtonList: any = stateDashboardSubTabsList;

  getTabType() {
    const defaultOption = {
      yAxisLabel: "Count",
      countAccessKey: "count",
      chartAnimation: "defaultBarChartOptions",
    };
    let findTabType = this.activeButtonList.find(
      (tabName) => tabName.name == this.apiParamData?.activeButton
    );
    return findTabType ? findTabType : defaultOption;
  }

  getStateRevenue() {
    const tabType = this.getTabType();
    this._loaderService.showLoader();

    const paramContent: any = {
      tabType: this.apiParamData?.tabType,
      financialYear: this.apiParamData?.financialYear,
      stateId: this.apiParamData?.stateId
        ? this.apiParamData?.stateId
        : this.apiParamData?.state,
      sortBy: this.apiParamData?.sortBy,
      widgetMode: this.widgetMode,
      activeButton: this.apiParamData?.activeButton,
    };

    if (tabType?.isCodeRequired) {
      paramContent["code"] = this.apiParamData?.code;
    }
    console.log("paramContent", paramContent);
    this.stateFilterDataService
      .getStateRevenueForDifferentTabs(paramContent)
      .subscribe(
        (response) => {
          if (response && response["success"]) {
            console.log("getStateRevenue", response);
            if (response["data"] && response["data"].length) {
              for (const data of response["data"]) {
                // data["count"] = this.commonService.changeCountFormat(data?.sum);
                data["count"] = this.commonService.changeCountFormat(
                  data[tabType?.countAccessKey],
                  tabType?.chartAnimation
                );
              }
              this.filterCityRankingChartData(
                response["data"],
                paramContent?.tabType,
                tabType?.yAxisLabel
              );
              // this.filterCityRankingChartData(response['data'], paramContent?.tabType, 'Amount (in Cr.)');
              this._loaderService.stopLoader();
              this.notFound = false;
            } else {
              this.notFound = false;
            }
          } else {
            this.notFound = true;
          }
        },
        (error) => {
          this.notFound = true;
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
    let sortingType: string = 'top';
    if (this.apiParamData?.hasOwnProperty("sortBy")) {
      if (this.apiParamData?.sortBy == 'true') {
        sortingType = 'top';
      } else if (this.apiParamData?.sortBy == 'false') {
        sortingType = 'bottom';
      } else {
        sortingType = this.apiParamData?.sortBy;
      }
    }
    console.log('sortingType', sortingType)
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
    this.chartData = {};
    this.chartData = barData;
    console.log("this.barData", this.chartData);
    this.createChart();
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
    let stateServiceLabel: any;
    if (this.apiParamData.hasOwnProperty("stateServiceLabel")) {
      stateServiceLabel = JSON.parse(this.apiParamData?.stateServiceLabel);
    }
    let animationConfigAccessKey: any = stateServiceLabel
      ? "serviceLevelBenchmarkBarChartOptions"
      : this.getTabType().chartAnimation;
    // let animationConfigAccessKey: any = 'croreBarChartOptions';

    animationConfig = this.stateFilterDataService[animationConfigAccessKey];
    Object.assign(animationConfig);
    this.ChartOptions = animationConfig;
    // let yAxesLabelName = tabType == 'TotalRevenue' ? 'Amount (in Cr.)' : 'Amount (in INR)';
    this.ChartOptions["scales"]["yAxes"][0]["scaleLabel"]["labelString"] =
      yAxisLabel;

    console.log("barChartOptions", this.ChartOptions);
  }

  initializeScatterData() {
    this.scatterData = {
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
    };
  }

  getScatterData() {
    let isPerCapita =
      this.apiParamData.hasOwnProperty("isPerCapita") &&
      this.apiParamData?.isPerCapita != ""
        ? JSON.parse(this.apiParamData?.isPerCapita)
        : false;
    this.multiChart = false;
    this._loaderService.showLoader();
    this.initializeScatterData();
    console.log("getScatterData", this.apiParamData);
    let stateServiceLabel = this.apiParamData?.hasOwnProperty(
      "stateServiceLabel"
    )
      ? JSON.parse(this.apiParamData?.stateServiceLabel)
      : false;
    console.log("parsestateServiceLabel", stateServiceLabel);
    let payload = {
      [stateServiceLabel ? "stateId" : "state"]: this.apiParamData?.stateId
        ? this.apiParamData?.stateId
        : this.apiParamData?.state,
      financialYear: this.apiParamData?.financialYear,
      headOfAccount: stateServiceLabel
        ? undefined
        : this.apiParamData?.headOfAccount,
      filterName: this.apiParamData?.filterName,
      isPerCapita: (this.apiParamData.hasOwnProperty("isPerCapita") && this.apiParamData['isPerCapita'])
        ? JSON.parse(this.apiParamData?.isPerCapita)
        : "",
      compareCategory: this.apiParamData?.compareCategory,
      compareType: stateServiceLabel ? undefined : "",
      // ulb: this.apiParamData?.ulb ? this.apiParamData?.ulb : [],
      ulb: this.apiParamData?.ulb ? this.apiParamData?.ulb.split(",") : [],
      widgetMode: this.widgetMode,
    };
    let apiEndPoint = stateServiceLabel ? "state-slb" : "state-revenue";

    console.log(payload);
    let inputVal: any = {};
    inputVal.stateIds = this.stateId;
    console.log('stateServiceLabel', stateServiceLabel)
    let yAxesLabelName = '';
    this.stateFilterDataService.getScatterdData(payload, apiEndPoint).subscribe(
      (res) => {
        this.notFound = false;
        console.log("response data", res);
        //scatter plots center
        let apiData = res["data"];
        if (!this.apiParamData?.filterName.includes("mix")) {
          this._loaderService.stopLoader();
          let mCorporation: any;
          let tp_data: any;
          let m_data: any;
          let stateData: any;
          this.percentLabel = '';
          if (stateServiceLabel) {
            if (res["data"]["scatterData"]?.unitType == "Percent") {
              this.percentLabel = 'percent';
              yAxesLabelName = `${this.apiParamData?.filterName} (%)`;
            } else {
              yAxesLabelName = res["data"]["scatterData"]?.unitType ? res["data"]["scatterData"]?.unitType : this.apiParamData?.filterName;
            }
            let xLabelName = 'Population(in Thousands)';
            this.setServiceLevelBenchmarkScatteredChartOption(
              xLabelName,
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
            stateData = apiData["stateAvg"] ? apiData["stateAvg"] : 0;
          }

          let stateLevelMaxPopuCount =
            this.stateFilterDataService.getMaximumPopulationCount(
              mCorporation,
              tp_data,
              m_data
            );

          this.scatterData.data.datasets.forEach((el) => {
            let obj = { x: 0, y: 0 };
            if (el.label == "Town Panchayat") {
             console.log('fffffff',tp_data)
              tp_data.forEach((el2, index) => {
                obj = { x: 0, y: 0 };
                obj.x = el2.population;
                obj.y = stateServiceLabel ? Math.round(el2.value) : el2.amount;
                el["labels"].push(el2.ulbName);
                el["rev"].push(
                  stateServiceLabel ? Math.round(el2.value) : el2.amount
                );
                el.data.push(obj);
                obj = { x: 0, y: 0 };
              });
            } else if (el.label == "Municipal Corporation") {
              mCorporation.forEach((el2, index) => {
                obj.x = el2.population;
                obj.y = stateServiceLabel ? Math.round(el2.value) : el2.amount;
                el["labels"].push(el2.ulbName);
                el["rev"].push(
                  stateServiceLabel ? Math.round(el2.value) : el2.amount
                );
                el.data.push(obj);

                obj = { x: 0, y: 0 };
              });
            } else if (el.label == "Municipality") {
              m_data.forEach((el2, index) => {
                obj = { x: 0, y: 0 };
                obj.x = el2.population;
                obj.y = stateServiceLabel ? Math.round(el2.value) : el2.amount;
                el["labels"].push(el2.ulbName);
                el["rev"].push(
                  stateServiceLabel ? Math.round(el2.value) : el2.amount
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
                  x: stateLevelMaxPopuCount ? stateLevelMaxPopuCount : this.defaultMaxPopulation,
                  y: 0,
                },
                // { x: 1200000, y: 0 },
              ];
              obje.forEach((el2) => {
                el2["y"] = stateData;

                el["data"].push(el2);
              });
            }
          });

          console.log(this.scatterData);
          // this.generateRandomId("scatterChartId123");
          this.scatterData = { ...this.scatterData };
          this.chartData = {};
          this.chartData = this.scatterData;
        } //donught charts center
        // else if (this.apiParamData?.filterName.includes("mix")) {
        //   this._loaderService.stopLoader();
        //   console.log("mix Data", res);
        //   let data;
        //   let ulbData;
        //   if (
        //     this.apiParamData?.ulb &&
        //     this.apiParamData.compareType !== "ulbType" &&
        //     this.apiParamData.compareType !== "popType"
        //   ) {
        //     data = res["state"];
        //     ulbData = res["ulb"];
        //     this.multiChart = true;
        //     this.mainDoughnutArr = [{ state: data }, { ulb: ulbData }];
        //   } else {
        //     data = res["data"];
        //     this.mainDoughnutArr = [];
        //     this.multiChart = false;
        //   }

        //   console.log("initial data", data);

        //   // if (data?.length > 0) {
        //   //   this.chartDropdownList = data;
        //   //   this.getStateRevenue();
        //   // }
        //   // console.log("chartDropdownList", this.chartDropdownList);
        //   this.initializeDonughtData();
        //   if (this.apiParamData?.compareType == "") {
        //     if (data.length) {
        //       console.log("mixdata==>", data);
        //       data = data.sort((a, b) => b.code - a.code);
        //       if (data[0].hasOwnProperty("colour"))
        //         this.doughnutData.data.datasets[0].backgroundColor = [];
        //       data.forEach((el) => {
        //         this.doughnutData.data.labels.push(el._id);
        //         this.doughnutData.data.datasets[0].data.push(el.amount);
        //         if (el.colour) {
        //           this.doughnutData.data.datasets[0].backgroundColor.push(
        //             el.colour
        //           );
        //         }
        //       });
        //       console.log(this.doughnutData);

        //       this.doughnutData = { ...this.doughnutData };
        //     }
        //   } else if (this.apiParamData?.compareType == "ulbType") {
        //     console.log("apiData", data);

        //     let mData = data["mData"][0];
        //     let mcData = data["mcData"][0];
        //     let tpData = data["tpData"][0];
        //     let ulbStateData = data["state"];

        //     this.multiChart = true;
        //     this.doughnutDataArr = [
        //       { mData: mData },
        //       { mcData: mcData },
        //       { tpData: tpData },
        //       { ulbStateData: ulbStateData },
        //     ];
        //     if (data["ulb"].length > 0) {
        //       this.doughnutDataArr = [
        //         ...this.doughnutDataArr,
        //         { ulb: data["ulb"] },
        //       ];
        //     }

        //     this.doughnutDataArr = [...this.doughnutDataArr];

        //     console.log("doughnutDataArr", this.doughnutDataArr);
        //   } else if (this.apiParamData?.compareType == "popType") {
        //     let lessThan100k = data["<100k"];
        //     let between100kTo500k = data["100k-500k"];
        //     let between500kTo1m = data["500k-1M"];
        //     let between1mTo4m = data["1m-4m"];
        //     let greaterThan4m = data["4m+"];
        //     let popStateData = data["state"];

        //     this.multiChart = true;
        //     this.doughnutDataArr = [];
        //     this.doughnutDataArr = [
        //       { "<100k": lessThan100k },
        //       { "100k-500k": between100kTo500k },
        //       { "500k-1M": between500kTo1m },
        //       { "1m-4m": between1mTo4m },
        //       { "4m+": greaterThan4m },
        //       { popStateData: popStateData },
        //     ];
        //     if (data["ulb"].length > 0) {
        //       this.doughnutDataArr = [
        //         ...this.doughnutDataArr,
        //         { ulb: data["ulb"] },
        //       ];
        //     }

        //     this.doughnutDataArr = [...this.doughnutDataArr];
        //     console.log("doughnutDataArr", this.doughnutDataArr);
        //   }
        // }
        console.log("done");
        this.createChart();
      },
      (err) => {
        this._loaderService.stopLoader();
        this.notFound = true;
        console.log(err.message);
      }
    );
  }

  serviceLevelBenchmarkScatterOption: any;
  setServiceLevelBenchmarkScatteredChartOption(
    xAxisLabel: string = "Population(in Thousands)",
    yAxisLabel: string = "Total Revenue (in Cr.)"
  ) {
    this.scatterOption = {};
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
              labelString: this.commonService.toTitleCase(xAxisLabel),
              fontStyle: "bold",
            },

            offset: true,
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: `${this.commonService.toTitleCase(yAxisLabel)}`,
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
            console.log("tooltipItem", tooltipItem.index);
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

    this.scatterOption = Object.assign(scatterOption);
  }

  getServiceLevelBenchmarkBarChartData() {
    const barChartPayload = {
      financialYear: this.apiParamData?.financialYear,
      stateId: this.apiParamData?.stateId,
      sortBy: this.apiParamData?.sortBy,
      filterName: this.apiParamData?.filterName,
      // ulb: this.apiParamData?.ulbId,
      widgetMode: this.widgetMode,
      activeButton: this.apiParamData?.activeButton,
    };

    console.log("payload", barChartPayload);

    this.stateFilterDataService
      .getScatterdData(barChartPayload, this.apiParamData?.apiEndPoint)
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
              this.notFound = false;
            } else {
              this.notFound = false;
            }
          } else {
            this.notFound = true;
          }
        },
        (error) => {
          this.notFound = true;
          console.log(error);
        }
      );
  }

  getAverageScatterData() {
    const tabType = this.getTabType();
    this.multiChart = false;
    this._loaderService.showLoader();
    this.initializeScatterData();
    let apiEndPoint = "state-dashboard-averages";
    // let apiEndPoint = this.stateServiceLabel ? 'state-slb' : this.selectedRadioBtnValue ? 'state-dashboard-averages' : 'state-revenue';
    let isPerCapita = this.apiParamData.hasOwnProperty("isPerCapita")
      ? JSON.parse(this.apiParamData?.isPerCapita)
      : "";
    let scatterChartPayload = {
      state: this.apiParamData?.stateId,
      financialYear: this.apiParamData?.financialYear,
      headOfAccount: this.apiParamData?.headOfAccount || "",
      apiEndPoint: apiEndPoint,
      apiMethod: "get",
      which: this.apiParamData?.which || "",
      TabType: this.apiParamData?.TabType || "",
      isPerCapita: isPerCapita || "",
      widgetMode: this.widgetMode,
      filterName: this.apiParamData?.filterName || "",
      compareType: this.apiParamData?.compType || "",
      compareCategory: this.apiParamData?.compareCategory || "",
      // ulb: this.ulbId ? [this.ulbId] : this.ulbArr ? this.ulbArr : "",
      chartType: this.apiParamData?.chartType || "",
    };

    if (this.apiParamData?.which == "nationalAvg") {
      this.scatterData.data.datasets.push(
        this.stateFilterDataService.nationLevelScatterDataSet
      );
    }

    console.log("scatterChartPayload", scatterChartPayload);

    this.stateFilterDataService
      .getAvgScatterdData(scatterChartPayload, apiEndPoint)
      .subscribe((res) => {
        //scatter plots center
        console.log("response data", res);
        if (res && res["success"]) {
          this._loaderService.stopLoader();
          this.notFound = false;

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
            this.apiParamData?.which
          );

          this.createChart();
        }
      });
  }

  // city dashboard data
  getCityChartData() {
    let disableFirstYear = this.apiParamData.hasOwnProperty("disableFirstYear")
      ? JSON.parse(this.apiParamData?.disableFirstYear)
      : false;
    let hideElements = this.apiParamData.hasOwnProperty("hideElements")
      ? JSON.parse(this.apiParamData?.hideElements)
      : false;
    if (this.apiParamData?.headOfAccount == "") {
      this.apiParamData["headOfAccount"] = "Tax";
    }

    let body = {
      ulb: this.apiParamData?.ulb ? this.apiParamData?.ulb.split(",") : [],
      financialYear: this.apiParamData?.financialYear
        ? this.apiParamData?.financialYear.split(",")
        : [],
      headOfAccount: this.apiParamData?.headOfAccount,
      filterName: this.apiParamData?.filterName,
      isPerCapita: this.apiParamData.hasOwnProperty("isPerCapita")
        ? JSON.parse(this.apiParamData?.isPerCapita)
        : false,
      compareType: "State Average",
      widgetMode: this.widgetMode,
    };
    body.filterName = body.filterName?.toLocaleLowerCase().split(" ").join("_");
    if (body.filterName == "total_property_tax_collection")
      body.filterName = "property_tax";

    // let ulbsToCompare = data["ulbs"]?.map((value) => value._id) ?? [];
    // body.ulb = [...ulbsToCompare, this.currentUlb];
    if (this.apiParamData["compareType"]) {
      body.compareType = this.apiParamData["compareType"];
    }
    // this.lastSelectedUlbs = body.ulb;
    // body.financialYear = data["year"] ?? this.mySelectedYears;
    if (this.apiParamData?.selectedTab.includes("Mix")) {
      this.disableFirstYear = false;
      body.financialYear = [body.financialYear[0]];
    } else {
      this.disableFirstYear = true;
    }
    // this.loading = true;
    // if (this.apiCall) {
    //   this.apiCall.unsubscribe();
    // }
    this._loaderService.showLoader();
    this.compareType = body["compareType"];
    this.chartTitle = this.apiParamData?.chartTitle
      ? this.apiParamData?.chartTitle
      : "";

    console.log("getCityChartData called", body);
    let multiPie = JSON.parse(this.apiParamData?.multiPie);
    this.commonService.getChartDataByIndicator(body).subscribe(
      (res) => {
        if (body.filterName.includes("mix")) {
          this.createPieChart(JSON.parse(JSON.stringify(res["data"])), body);
          // this.calculateRevenue(res["data"]);
        } else {
          multiPie = false;
          this.multipleCharts = multiPie;
          console.log(JSON.stringify(res["data"]), body.ulb);
          if (body.ulb.length == 1) this.createBarChart(res);
          else
            this.createDataForUlbs(res["data"]["ulbData"], [
              ...new Set(body.ulb),
            ]);
          /** we are not showing the city dashboard right side info panel in iFrame.*/
          // if (showCagrIn.includes(this.apiParamData?.selectedTab.toLowerCase()))
          //   this.calculateCagr(res["data"], hideElements);
          // if (
          //   showPerCapita.includes(this.apiParamData?.selectedTab.toLowerCase())
          // )
          //   this.calculatePerCapita(res["data"]);
          // if (
          //   this.apiParamData?.selectedTab.toLowerCase() ==
          //   "total surplus/deficit"
          // )
          //   this.calculateCagrOfDeficit(res["data"]);

          this.disableFirstYear = disableFirstYear;
          this.createChart();
        }
        // this.loading = false;
        this._loaderService.stopLoader();
        // this.disableFirstYear = disableFirstYear;
        // this.compareType = this.apiParamData?.compareType;
        // this.multiChartLabel = this.apiParamData?.multiChartLabel;
        // this.multipleDoughnutCharts = this.apiParamData?.multipleDoughnutCharts;
        // this.createChart();
      },
      (error) => {
        this.notFound = true;
        this._loaderService.stopLoader();
      }
    );
  }

  createMultiUlbData(data) {
    let newData = data.reduce((res, value) => {
      if (res.hasOwnProperty(value._id.ulb)) {
        res[value._id.ulb].push(value);
      } else res[value._id.ulb] = [value];
      return res;
    }, {});

    return newData;
  }

  createRevenueData(data) {
    let own = {
      _id: { lineItem: "Own Revenue" },
      amount: 0,
      colour: "#25C7CE",
    };
    let other_receipt = {
      _id: { lineItem: "Other Receipts" },
      amount: 0,
      colour: "#00ff80",
    };
    let assigned_revenues_compensations = {
      _id: { lineItem: "Assigned Revenues Compensation" },
      amount: 0,
      colour: "",
    };
    let grant = {
      _id: { lineItem: "Grants" },
      amount: 0,
      colour: "",
    };
    let interest_incomes = {
      _id: { lineItem: "Interest Income" },
      amount: 0,
      colour: "",
    };
    let newdata = [
      own,
      other_receipt,
      assigned_revenues_compensations,
      grant,
      interest_incomes,
    ];

    data.forEach((value) => {
      if (ownRevenues.includes(value.code)) {
        own.amount += value.amount;
      }
      if (other_receipts.includes(value.code)) {
        other_receipt.amount += value.amount;
        let tempColor = "#00ff80";
        if (value.color == tempColor) {
          other_receipt.colour = value.colour;
        } else {
          other_receipt.colour = tempColor;
        }
      }
      if (assigned_revenues_compensation.includes(value.code)) {
        assigned_revenues_compensations.amount += value.amount;
        assigned_revenues_compensations.colour = value.colour;
      }
      if (grants.includes(value.code)) {
        grant.amount += value.amount;
        grant.colour = value.colour;
      }
      if (interest_income.includes(value.code)) {
        interest_incomes.amount += value.amount;
        interest_incomes.colour = value.colour;
      }
    });
    return newdata;
  }

  calculateRevenueMix(data) {
    let totalRevenue = 0,
      totalRevenueState = 0,
      ownRevenue = 0,
      ownRevenueState = 0;
    for (const key in data) {
      const element = data[key];
      element.forEach((val) => {
        if (val._id.lineItem == "Own Revenue") {
          ownRevenue += val.amount;
          if (key == "compData") ownRevenueState += val.amount;
        }
        totalRevenue += val.amount;
        if (key == "compData") totalRevenueState += val.amount;
      });
    }

    let c = (ownRevenue / totalRevenue) * 100;
    let f = (ownRevenueState / totalRevenueState) * 100;
    let x = c - f;

    // this.CAGR = `Share of Own Revenue to Total Revenue is  ${x.toFixed(2)}% ${
    //   c > f ? "higher" : "lower"
    // } than state average for FY${this.mySelectedYears[0]}
    // (ULB Own Revenue to Total Revenue is  ${c.toFixed(2)}% ;
    // State Average Own Revenue to Total Revenue is  ${f.toFixed(2)}%)`;
    // this.positiveCAGR = c > f;
  }

  createExpenditureMixData(data) {
    let tempArray = [
      { _id: { lineItem: "Other Expenditure" }, amount: 0, colour: "#0FA386" },
    ];
    data.forEach((element) => {
      if (includeInExpenditure.includes(element.code)) {
        tempArray.push(element);
      } else {
        tempArray[0].amount += element.amount;
      }
    });
    return tempArray;
  }

  createMultiUlbChart(data) {
    let ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
    this.multipleDoughnutCharts = [];
    this.multiChartLabel = [];
    for (const key in data) {
      const doughnutChartData = {
        labels: ["Red", "Blue", "Yellow"],
        datasets: [
          {
            label: "My First Dataset",
            data: [],
            backgroundColor: [],
          },
        ],
      };
      this.multiChartLabel = [];
      data[key].forEach((value, index) => {
        doughnutChartData.datasets[0].backgroundColor.push(
          value.colour
        );
        doughnutChartData.datasets[0].data.push(
          value.amount == 0 ? "0.1" : value.amount
        );
        if (key != "compData")
          this.multiChartLabel.push({
            text: value._id.lineItem,
            color: value.colour
          });
        doughnutChartData.datasets[0].label = value._id.lineItem;
      });
      // doughnutChartData.labels = this.multiChartLabel.map(
      //   (value) => value.text
      // );
      this.multiChartLabel = this.multiChartLabel.reduce(
        (res, val) => {
          if (!res.stack.includes(val.text)) {
            res.unique.push(val);
            res.stack.push(val.text);
          }
          return res;
        },
        { stack: [], unique: [] }
      ).unique;
      doughnutChartData.labels = this.multiChartLabel
      let config = {
        type: "doughnut",
        data: doughnutChartData,
      };

      let val = {
        id: `${Math.random()}-multi`,
        ...config,
        multipleChartOptions: {
          legend: {
            display: false,
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var total = dataset.data.reduce(function (
                  previousValue,
                  currentValue
                ) {
                  return Number(previousValue) + Number(currentValue);
                });
                var currentValue = Number(dataset.data[tooltipItem.index]);
                var percentage = Math.round((currentValue / total) * 100);
                return percentage + "%" + data.labels[tooltipItem.index];
              },
            },
          },
        },
        title: ulbMapping[key].name,
      };
      this.multipleDoughnutCharts.push(val);
    }

    this.multipleCharts = true;

    setTimeout(() => {
      this.createMultipleChart();
    }, 500);
  }

  createPieChart(data, body) {
    console.log("createPieChartCalled", data, body);
    let ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
    console.log("ulbMapping", ulbMapping);
    if (this.apiParamData?.compareType == "ULBs..") {
      data = this.createMultiUlbData(data["ulbData"]);
    }
    if (this.apiParamData?.filterName == "revenue_mix") {
      for (const key in data) {
        data[key] = this.createRevenueData(data[key]);
      }
      if (this.apiParamData?.compareType == "ULBs..") {
        // this.resetCAGR();
      } else this.calculateRevenueMix(data);
    }
    if (this.apiParamData?.filterName == "expenditure_mix") {
      for (const key in data) {
        data[key] = this.createExpenditureMixData(data[key]);
      }
      // this.resetCAGR();
    }
    if (this.compareType == "ULBs..") {
      return this.createMultiUlbChart(data);
    }
    let tempChartData = [];
    for (const key in data) {
      const element = data[key];
      let chartData = {
        labels: [],
        datasets: [
          {
            label: "",
            data: [],
            backgroundColor: [],
          },
        ],
      };
      let tempData = {
        id: `${Math.random()}-multi`,
        type: "doughnut",
        data: chartData,
        multipleChartOptions: {
          legend: {
            display: false,
          },
          tooltips: {
            callbacks: {
              label: function (tooltipItem, data) {
                console.log("tooltipItem item", tooltipItem, data);
                var dataset = data.datasets[tooltipItem.datasetIndex];
                var total = dataset.data.reduce(function (
                  previousValue,
                  currentValue
                ) {
                  return Number(previousValue) + Number(currentValue);
                });
                var currentValue = Number(dataset.data[tooltipItem.index]);
                var percentage = Math.round((currentValue / total) * 100);
                var tooltipLabel;
                if (typeof data.labels[tooltipItem.index].text == "object") {
                  tooltipLabel = data.labels[tooltipItem.index].text.name;
                } else {
                  tooltipLabel = data.labels[tooltipItem.index].text;
                }
                // var percentage = ((currentValue / total) * 100).toFixed(2);
                // return percentage + "%" + data.labels[tooltipItem.index].text;
                return percentage + "%" + tooltipLabel;
              },
            },
          },
        },
        title:
          key == "ulbData"
            ? ulbMapping[this.apiParamData?.currentUlb].name
            : key == "compData"
            ? this.apiParamData?.compareType
            : ulbMapping[key].name,
      };
      element.forEach((value, index) => {
        chartData.datasets[0].backgroundColor.push(value.colour);
        chartData.datasets[0].data.push(value.amount);
        chartData.labels.push({
          text: value._id.lineItem,
          color: value.colour,
        });
        chartData.datasets[0].label = value._id.lineItem;
      });
      tempChartData.push(tempData);
    }
    console.log(
      "tempChartData",
      tempChartData,
      tempChartData.map((val) => val.data.labels)
    );
    this.multiChartLabel = [
      ...new Set(...tempChartData.map((val) => val.data.labels)),
    ];
    this.multipleDoughnutCharts = tempChartData;
    let multiPie = this.apiParamData.hasOwnProperty("multiPie")
      ? JSON.parse(this.apiParamData?.multiPie)
      : false;
    // this.multipleCharts = multiPie;
    this.multipleCharts = true;

    setTimeout(() => {
      this.createMultipleChart();
    }, 500);
    // this.createChart();
  }

  createExpenditureData(data) {
    let newData = [];
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      let previousYear = this.getPreviousYear(element._id);
      let previousYearValue = data.find((val) => val._id == previousYear);
      let year1 = previousYearValue,
        year2 = data[index];
      if (!year1) {
        newData.push({
          _id: { financialYear: data[index]._id },
          amount:
            data[index].yearData[0].amount + data[index].yearData[1].amount,
          ulbName: data[index].yearData[index].ulbName,
        });
        continue;
      }

      let amount1 =
          year2.yearData.find((value) => value.code == "410").amount -
          year1.yearData.find((value) => value.code == "410").amount,
        amount2 =
          year2.yearData.find((value) => value.code == "412").amount -
          year1.yearData.find((value) => value.code == "412").amount;
      newData.push({
        _id: { financialYear: year2._id },
        amount: amount1 + amount2,
        ulbName: year1.yearData[0].ulbName,
      });
    }
    return newData;
  }

  otherText: string = "";
  barWidth: any;
  barWidthRender: any;
  createBarChart(res) {
    const isPerCapita = this.apiParamData.hasOwnProperty("isPerCapita")
      ? JSON.parse(this.apiParamData?.isPerCapita)
      : false;
    const hideElements = this.apiParamData.hasOwnProperty("hideElements")
      ? JSON.parse(this.apiParamData?.hideElements)
      : false;
    let ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
    if (this.apiParamData?.selectedTab.includes("Total")) {
      this.otherText = "Weighted Average";
    }
    if (this.apiParamData?.selectedTab.includes("per Capita")) {
      this.otherText = "Simple Average";
    }
    if (this.apiParamData?.selectedTab.toLowerCase() == "revenue expenditure")
      return this.createLineChartForRevenueExpenditure(res["data"]);
    if (
      this.apiParamData?.filterName.includes("capital") &&
      this.apiParamData?.filterName.includes("expenditure")
    ) {
      for (const key in res["data"]) {
        res["data"][key] = this.createExpenditureData(res["data"][key]);
      }
    }
    if (this.apiParamData?.selectedTab == "Total Surplus/Deficit") {
      let DeficitData = res.data;
      let tempObj = {};
      for (let newItem in DeficitData) {
        DeficitData[newItem].map((elem) => {
          let newTemp = [];
          let temp = JSON.parse(JSON.stringify(elem));
          temp.ulbName = temp.ulbName + " Revenue";
          temp.amount = temp.revenue;
          newTemp.push(temp);
          temp = JSON.parse(JSON.stringify(elem));
          temp.ulbName = temp.ulbName + " Expense";
          temp.amount = temp.expense;
          newTemp.push(temp);
          if (tempObj.hasOwnProperty(newItem)) {
            tempObj[newItem].push(...newTemp);
          } else {
            tempObj[newItem] = [...newTemp];
          }
        });
      }
      res.data = tempObj;
    }
    let newData = JSON.parse(JSON.stringify(barChartStatic));
    newData.data.labels = [];
    // for (const key in res["data"]) {
      const element = res["data"]["ulbData"];
      element.map((value) => {
        if (!newData.data.labels.includes(value._id.financialYear)) {
          newData.data.labels.push(value._id.financialYear);
        }
      });
    // }
    newData.data.labels.sort(function (a, b) {
      let newA = a.split("-")[0];
      let newB = b.split("-")[0];
      return newA - newB;
    });

    let temp = {},
      index = 0;
    for (const key in res["data"]) {
      const element = res["data"][key];
      newData.data.labels.map((year) => {
        let dataByYear = element.filter((val) => val._id.financialYear == year);
        if (!dataByYear) {
          dataByYear = {
            ulbName: ulbMapping[this.apiParamData?.currentUlb].name,
            amount: 0,
          };
        }
        dataByYear.forEach((dataByYearVal) => {
          let dataInner = JSON.parse(JSON.stringify(innerDataset));
          // if (
          //   this.apiParamData?.compareType == "National Average" &&
          //   key == "compData"
          // ) {
          //   dataByYearVal.ulbName = "National";
          // }
          // if (
          //   this.apiParamData?.compareType == "ULB Type Average" &&
          //   key == "compData"
          // ) {
          //   dataByYearVal.ulbName =
          //     ulbMapping[this.apiParamData?.currentUlb].type;
          // }
          // if (
          //   this.apiParamData?.compareType == "ULB category Average" &&
          //   key == "compData"
          // ) {
          //   dataByYearVal.ulbName = getPopulationType(
          //     ulbMapping[this.apiParamData?.currentUlb].population
          //   );
          // }

          if (!temp[dataByYearVal.ulbName]) {
            dataInner.backgroundColor = backgroundColor[index];
            dataInner.borderColor = borderColor[index++];
            // dataInner.label = dataByYearVal.ulbName;
            dataInner.label =
              key == "compData"
                ? `${dataByYearVal.ulbName} ${this.otherText}`
                : dataByYearVal.ulbName;
            dataInner.data = [convertToCr(dataByYearVal.amount, isPerCapita)];
            temp[dataByYearVal.ulbName] = dataInner;
          } else {
            dataInner = temp[dataByYearVal.ulbName];
            dataInner.data.push(convertToCr(dataByYearVal.amount, isPerCapita));
            temp[dataByYearVal.ulbName] = dataInner;
            this.barWidth = dataInner.data.length;
            dataInner.data.map((aa) => (this.barWidth = aa.length));
            if (this.barWidth > 5) {
              this.barWidthRender = 68;
            }
          }
        });
      });
    }
    newData.data.datasets = [];
    let newlineDataset = JSON.parse(JSON.stringify(lineDataset));
    newlineDataset.label = `Y-o-Y Growth in ${this.apiParamData?.selectedTab} (%)`;
    newlineDataset.data = [];
    console.log("temp===>", temp);
    for (const key in temp) {
      const element = temp[key];
      if (newlineDataset.data.length == 0) {
        newlineDataset.data = JSON.parse(JSON.stringify(element.data));
      }
      newData.data.datasets.push(element);
    }
    if (!hideElements && !isPerCapita)
      newData.data.datasets.unshift(newlineDataset);
    this.chartData = newData;
    this.barChartStaticOptions.scales.yAxes[0].scaleLabel.labelString = `Amount in ${
      isPerCapita ? "₹" : "Cr"
    }`;
    this.barChartStaticOptions.scales.xAxes[0].barThickness =
      this.barWidthRender;
    this.barChartStaticOptions.tooltips.callbacks.label = this.apiParamData?.selectedTab
    .toLowerCase()
    .includes("surplus")
    ? function (tooltipItem, data) {
        console.log("suplus tooltip ", tooltipItem, data);
        var dataset = data.datasets[tooltipItem.datasetIndex];
        console.log("suplus dataset", dataset);
        // var model = dataset._meta[Object.keys(dataset._meta)[0]].data[tooltipItem.index]._model;
        // console.log('model', model)
        let averageFYSum = 0;
        if (dataset && dataset.type == "line") {
          averageFYSum = Math.round(
            ((dataset.data[tooltipItem.index] -
              dataset.data[tooltipItem.index + 1]) /
              dataset.data[tooltipItem.index]) *
              100
          );
          if (isNaN(averageFYSum)) {
            return `${dataset?.label}: No change`;
          } else {
            return `${dataset?.label}: ${averageFYSum}`;
          }
        } else {
          return `${dataset?.label}: ${tooltipItem.yLabel}`;
        }
      }
    : function (tooltipItem, data) {
        console.log("tooltip", tooltipItem, data);
        var dataset = data.datasets[tooltipItem.datasetIndex];
        console.log("dataset", dataset);
        // var model = dataset._meta[Object.keys(dataset._meta)[0]].data[tooltipItem.index]._model;
        // console.log('model', model)
        let averageFYSum = 0;
        if (dataset && dataset.type == "line") {
          averageFYSum = Math.round(
            ((dataset.data[tooltipItem.index] -
              dataset.data[tooltipItem.index + 1]) /
              dataset.data[tooltipItem.index]) *
              100
          );
          if (isNaN(averageFYSum)) {
            return `${dataset?.label}: No change`;
          } else {
            return `${dataset?.label}: ${averageFYSum}`;
          }
        } else {
          return `${dataset?.label}: ${tooltipItem.yLabel}`;
        }
      };
    console.log("barChart", this.chartData);
    this.ChartOptions = this.barChartStaticOptions;
  }

  barChartStaticOptions = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      yAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: "Amount in Cr.",
          },
          gridLines: {
            offsetGridLines: true,
            display: false,
          },
          ticks: {
            beginAtZero: true,
          },
          afterDataLimits: function (axis) {
            axis.max += 80;
          },
        },
      ],
      xAxes: [
        {
          barThickness: 0,
        },
      ],
    },
    legend: {
      onClick: (e) => e.stopPropagation(),
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
        console.log("animation", animation);
      },
    },
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          console.log("tooltip", tooltipItem, data);
          var dataset = data.datasets[tooltipItem.datasetIndex];
          console.log("dataset", dataset);
          // var model = dataset._meta[Object.keys(dataset._meta)[0]].data[tooltipItem.index]._model;
          // console.log('model', model)
          let averageFYSum = 0;
          if (dataset && dataset.type == "line") {
            averageFYSum = Math.round(
              ((dataset.data[tooltipItem.index] -
                dataset.data[tooltipItem.index + 1]) /
                dataset.data[tooltipItem.index]) *
                100
            );
            if (isNaN(averageFYSum)) {
              return `${dataset?.label}: No change`;
            } else {
              return `${dataset?.label}: ${averageFYSum}`;
            }
          } else {
            return `${dataset?.label}: ${tooltipItem.yLabel}`;
          }
        },
      },
    },
  };

  createDataForUlbs(res, ulbs) {
    const isPerCapita = this.apiParamData.hasOwnProperty("isPerCapita")
      ? JSON.parse(this.apiParamData?.isPerCapita)
      : false;
    let ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
    let obj = {
      type: "bar",
      data: {
        labels: this.mySelectedYears,
        datasets: [
          ...new Set(
            ulbs.map((ulb, i) => {
              let innerObj = {
                label: ulbMapping[ulb].name,
                // label: 'ABCD',
                data: [],
                borderWidth: 1,
                barThickness: 50,
                borderRadius: 8,
                backgroundColor: backgroundColor[i],
                borderColor: borderColor[i],
              };
              this.mySelectedYears.forEach((year) => {
                let foundUlb = res.find(
                  (val) => val._id.financialYear == year && val._id.ulb == ulb
                );
                if (foundUlb)
                  innerObj.data.push(convertToCr(foundUlb.amount, isPerCapita));
                else innerObj.data.push(0);
              });
              return innerObj;
            })
          ),
        ],
      },
    };
    this.chartData = Object.assign({}, obj);
    this.barChartStaticOptions.scales.xAxes[0].barThickness = 50;
    this.ChartOptions = Object.assign({}, this.barChartStaticOptions);
  }

  calculateCagr(data, hideCAGR) {
    let yearData = data.ulbData,
      intialYear = yearData[0].amount,
      finalYear = yearData[yearData.length - 1].amount,
      time = yearData.length;
    //     if (yearData.length > 1 && !hideCAGR) {
    //       let CAGR = (Math.pow(finalYear / intialYear, 1 / time) - 1) * 100;
    //       this.CAGR = `CAGR of ${CAGR.toFixed(2)}% between ${
    //         yearData[0]._id.financialYear +
    //         " and " +
    //         yearData[yearData.length - 1]._id.financialYear
    //       } years (ULB ${this.selectedTab} for FY' ${
    //         yearData[0]._id.financialYear
    //       } is Rs.${convertToCr(yearData[0].amount, this.isPerCapita)} ${
    //         this.isPerCapita ? "" : "Cr"
    //       }.
    // ULB ${this.selectedTab} for FY' ${
    //         yearData[1]._id.financialYear
    //       } is Rs. ${convertToCr(
    //         yearData[yearData.length - 1].amount,
    //         this.isPerCapita
    //       )} ${this.isPerCapita ? "" : "Cr"}.)`;
    //       this.positiveCAGR = CAGR > 0;
    //     } else this.CAGR = "";
  }

  calculatePerCapita(data) {
    let totalState = data.compData.reduce((sum, val) => sum + val.amount, 0);
    let totalUlb = data.ulbData.reduce((sum, val) => sum + val.amount, 0);
    // this.CAGR = `Rs ${(totalState - totalUlb).toFixed(2)} ${
    //   totalUlb > totalState ? "higher" : "lower"
    // } than the state average between FY${
    //   data.ulbData[0]._id.financialYear
    // } and FY${data.ulbData[data.ulbData.length - 1]._id.financialYear}

    // (Avg. ULB ${this.selectedTab} is Rs.${totalUlb.toFixed(2)} ;
    // State Average Total Revenue per capita is Rs.${totalState.toFixed(2)})`;
    // this.positiveCAGR = totalUlb > totalState;
  }

  calculateCagrOfDeficit(res) {
    console.log(res);
    let total = res["ulbData"].reduce((sum, val) => sum + val.amount, 0);
    // this.CAGR = `Rs. ${convertToCr(
    //   total,
    //   this.isPerCapita
    // )} Cr. Total Surplus/Deficit of the FY'${this.mySelectedYears[0]}`;
    // this.positiveCAGR = total > 0;
  }

  createLineChartForRevenueExpenditure(data) {
    let ulbMapping = JSON.parse(localStorage.getItem("ulbMapping"));
    let chartLabels = [];
    let chartData = {
      labels: chartLabels,
      datasets: [
        data["ulbData"].reduce(
          (dataSet, value, index) => {
            dataSet.borderColor = borderColor[0];
            dataSet.backgroundColor = backgroundColor[0];
            dataSet.data.push(
              Math.round((value.revenue / value.expense) * 100)
            );
            chartLabels.push(value._id.financialYear);
            return dataSet;
          },
          {
            label: ulbMapping[this.apiParamData?.currentUlb].name,
            data: [],
            borderColor: "",
            backgroundColor: "",
            fill: false,
          }
        ),
        data["compData"].reduce(
          (dataSet, value, index) => {
            dataSet.borderColor = borderColor[1];
            dataSet.backgroundColor = backgroundColor[1];
            dataSet.data.push(
              Math.round((value.revenue / value.expense) * 100)
            );
            return dataSet;
          },
          {
            label: this.compareType,
            data: [],
            borderColor: "",
            backgroundColor: "",
            fill: false,
          }
        ),
      ],
    };
    const config = {
      type: "line",
      data: chartData,
    };
    this.chartData = config;
    this.chartOptions = {
      scales: {
        yAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: "Own revenue to expenditure revenue ration %",
            },
            gridLines: {
              offsetGridLines: true,
              display: false,
            },
            ticks: {
              // beginAtZero: true,
              steps: 10,
              stepValue: 5,
              // max: 100,
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
      responsive: true,
    };

    this.calculateRevenueExpenditure(data);
  }

  calculateRevenueExpenditure(data) {
    let C, F;
    for (const key in data) {
      const element = data[key];
      let A = element.reduce((sum, val) => sum + val?.revenue, 0);
      let B = element.reduce((sum, val) => sum + val?.expense, 0);
      if (key == "ulbData") C = (A / B) * 100;
      else F = (A / B) * 100;
    }
    // this.CAGR = `Own Revenue to Revenue expenditure is ${C - F}% ${
    //   C > F ? "higher" : "lower"
    // } than state average between FY'${this.mySelectedYears[0]} and FY'${
    //   this.mySelectedYears[this.mySelectedYears.length - 1]
    // }

    // (ULB Own Revenue to Revenue expenditure is ${C}% ;
    // State Own Revenue to Revenue expenditure is ${F}% )`;
  }

  getPreviousYear(year) {
    // year = "2017-16"
    year = year.split("-");
    year = year.map((val) => Number(val - 1));
    year = year.join("-");
    return year;
  }

  resetCompareModal() {
    console.log("resetCompareModal called");
    this.preSelectedOwnRevenueDbType = false;
    this.selectedOwnRevenueState = [];
    this.preSelectedOwnRevenueDbParameter = this.own
      ? "Own Revenue per Capita"
      : "Property Tax per Capita";
    const defaultValue = {
      list: [],
      param: this.own ? "Own Revenue per Capita" : "Property Tax per Capita",
      type: "ulb",
      typeTitle: "ULBs",
      stateId: "State Name",
      ulb: "",
      ulbType: "ULB Type",
      populationCategory: "ULB Population Category",
      financialYear: "2020-21",
      propertyTax: this.own ? false : true,
    };
    this.compareChange.emit(defaultValue);
  }
}

const temp = [
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
  {
    type: "doughnut",
    data: {
      labels: ["Red", "Blue", "Yellow"],
      datasets: [
        {
          label: "My First Dataset",
          data: [300, 50, 100],
          backgroundColor: [
            "rgb(255, 99, 132)",
            "rgb(54, 162, 235)",
            "rgb(255, 205, 86)",
          ],
          hoverOffset: 4,
        },
      ],
    },
  },
];

let showCagrIn = ["total revenue", "total own revenue", "capital expenditure"];
let showPerCapita = [
  "revenue per capita",
  "own revenue per capita",
  "capital expenditure per capita",
];
const includeInExpenditure = ["210", "220", "230", "240", "200"];

const barChartStatic = {
  type: "bar",
  data: {
    labels: ["first", "second"],
    datasets: [
      {
        label: "My First Dataset",
        data: [65, 59, 80, 81, 56, 55, 40],
        borderWidth: 1,
        barThickness: 50,
        borderRadius: 8,
      },
    ],
  },
};

const backgroundColor = [
  "#1EBFC6",
  "#1E44AD",
  "#5203fc",
  "#3C3C3C",
  "rgba(54, 162, 235, 0.2)",
  "rgba(153, 102, 255, 0.2)",
  "rgba(201, 203, 207, 0.2)",
];
const borderColor = [
  "#1EBFC6",
  "#1E44AD",
  "#5203fc",
  "#3C3C3C",
  "rgb(54, 162, 235)",
  "rgb(153, 102, 255)",
  "rgb(201, 203, 207)",
];

const lineDataset = {
  type: "line",
  label: "Y-o-Y Comparison",
  data: [],
  fill: false,
  borderColor: "#F56184",
};

const innerDataset = {
  label: "My First Dataset",
  data: [65, 59, 80, 81, 56, 55, 40],
  borderWidth: 1,
  barThickness: 50,
  borderRadius: 8,
};

function convertToCr(value, isPerCapita) {
  if (isPerCapita) return Math.round(value);
  if (value == 0) return 0;
  value /= 10000000;
  return Math.round(value);
}

const ownRevenues = ["110", "130", "140", "150", "180"];
const assigned_revenues_compensation = ["120"];
const grants = ["160"];
const interest_income = ["171"];
const other_receipts = ["170", "100"];
const pieBackGroundColor = [
  "#25C7CE",
  "#FF608B",
  "#1E44AD",
  "#585FFF",
  "#FFD72E",
  "#22A2FF",
];
function getPopulationType(population) {
  if (population < 100000) {
    return "<100 Thousand";
  } else if (100000 < population && population < 500000) {
    return "100 Thousand - 500 Thousand";
  } else if (500000 < population && population < 1000000) {
    return "500 Thousand - 1 Million";
  } else if (1000000 < population && population < 4000000) {
    return "1 Million - 4 Million";
  } else {
    return "4 Million+";
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
