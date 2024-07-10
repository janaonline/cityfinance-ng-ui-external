import { Component, NgZone, Input, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { FeatureCollection, Geometry } from "geojson";
import * as L from "leaflet";
import { IState } from "src/app/models/state/state";
import { ILeafletStateClickEvent } from "src/app/shared/components/re-useable-heat-map/models/leafletStateClickEvent";
import { ReUseableHeatMapComponent } from "src/app/shared/components/re-useable-heat-map/re-useable-heat-map.component";
import { IStateULBCovered } from "src/app/shared/models/stateUlbConvered";
import { ULBWithMapData } from "src/app/shared/models/ulbsForMapResponse";
import { AssetsService } from "src/app/shared/services/assets/assets.service";
import { CommonService } from "src/app/shared/services/common.service";
import { GeographicalService } from "src/app/shared/services/geographical/geographical.service";
import { MapUtil } from "src/app/util/map/mapUtil";
import { IMapCreationConfig } from "src/app/util/map/models/mapCreationConfig";
import { ICreditRatingData } from "src/app/models/creditRating/creditRatingResponse";
const districtJson = require("../../../../assets/jsonFile/state_boundries.json");
import { GlobalLoaderService } from "src/app/shared/services/loaders/global-loader.service";
import { Observable, Subscription } from "rxjs";
import { AuthService } from "../../auth.service";

@Component({
  selector: "app-dashboard-map-section",
  templateUrl: "./dashboard-map-section.component.html",
  styleUrls: ["./dashboard-map-section.component.scss"],
})
export class DashboardMapSectionComponent
  extends ReUseableHeatMapComponent
  implements OnInit, OnDestroy
{
  myForm: FormGroup;
  stateUlbData = JSON.parse(localStorage.getItem("ulbList"));
  selectedDistrictCode;
  selectedStateCode;
  @Input()
  mapConfig = {
    code: {
      state: "",
      city: "",
    },
    showStateList: false,
    showDistrictList: false,
    stateMapContainerHeight: "23rem",
    nationalZoomOnMobile: 4, // will fit map in container
    nationalZoomOnWeb: 4.4, // will fit map in container
    stateZoomOnMobile: 4, // will fit map in container
    stateZoomOnWeb: 4, // will fit map in container
    stateBlockHeight: "23.5rem", // will fit map in container
  };
  yearSelected = [];
  selected_state = "India";
  stateselected: IState;
  creditRating: { [stateName: string]: number; total?: number } = {};
  stateList: IState[];
  statesLayer: L.GeoJSON<any>;
  cityData = [];
  cityName = "";
  dropdownSettings = {
    singleSelection: true,
    text: "India",
    enableSearchFilter: true,
    labelKey: "name",
    primaryKey: "_id",
    showCheckbox: false,
    classes: "homepage-stateList custom-class",
  };
  districtMarkerMap = {};

  national: any = { _id: null, name: "India" };
  actStateVl: boolean = true;

  filteredOptions: Observable<any[]>;
  constructor(
    protected _commonService: CommonService,
    protected _snackbar: MatSnackBar,
    protected _geoService: GeographicalService,
    protected _activateRoute: ActivatedRoute,
    private fb: FormBuilder,
    private _ngZone: NgZone,
    private assetService: AssetsService,
    private router: Router,
    private authService: AuthService
  ) {
    super(_commonService, _snackbar, _geoService, _activateRoute);
    setTimeout(() => {
      this.ngOnChanges({
        yearSelected: {
          currentValue: ["2016-17"],
          previousValue: null,
          firstChange: true,
          isFirstChange: () => true,
        },
      });
    }, 1000);
    this.initializeform();
    this.fetchStateList();
    this.fetchDataForVisualization();
    // this.fetchDataForVisualization();
    this.fetchCreditRatingTotalCount();
    this.fetchBondIssueAmout();
    this.fetchMinMaxFinancialYears();
  }
  dataForVisualization: {
    financialStatements?: number;
    totalMunicipalBonds?: number;
    totalULB?: number;
    coveredUlbCount?: number;
    ulbDataCount?:any;
    loading: boolean;
  } = { loading: true };
  previousStateLayer: ILeafletStateClickEvent["sourceTarget"] | L.Layer = null;
  totalUsersVisit: number;

  absCreditInfo = {};
  isLoading: boolean = true;
  cid: string;
  creditRatingList: any[];
  globalFormControl = new FormControl();

  // Including A
  creditRatingAboveA;

  // Including BBB-
  creditRatingAboveBBB_Minus;

  bondIssueAmount: number;
  isBondIssueAmountInProgress = false;

  financialYearTexts: {
    min: string;
    max: string;
  };
  StyleForSelectedState = {
    weight: 2,
    color: "black",
    fillOpacity: 1,
  };
  defaultStateLayerColorOption = {
    fillColor: "#efefef",
    weight: 1,
    opacity: 1,
    color: "#403f3f",
    fillOpacity: 1,
  };
  date: any;
  districtMap: L.Map;
  highestYear:any;
  highestDataAvailability:any;
  dataAvailTooltip='';
  private homePageSubscription: Subscription;
  ngOnDestroy(): void {
    this.homePageSubscription?.unsubscribe();
    // let mapReferenceList = ['districtMap'];
    // for (const item of mapReferenceList) {
    //   MapUtil.destroy(this[item]);
    // };
  }
  ngOnInit(): void {
    this.clearDistrictMapContainer();

    this._commonService.state_name_data.subscribe((res) => {
      //console.log('sub....', res, res.name);
      this.onSelectingStateFromDropDown(res);
      this.updateDropdownStateSelection(res);
    });

    this.authService.getLastUpdated().subscribe((res) => {
      this.date = res["data"];
    });
  }
  noDataFound = true;
  callAPI(event) {
    this._commonService
      .postGlobalSearchData(event.target.value, "ulb", this.selectedStateCode)
      .subscribe((res: any) => {
        let emptyArr: any = [];
        this.filteredOptions = emptyArr;
        if (res?.data.length > 0) {
          this.filteredOptions = res?.data;
          this.noDataFound = false;
        } else {
          let emptyArr: any = [];
          this.filteredOptions = emptyArr;
          this.noDataFound = true;
          let noDataFoundObj = {
            name: "",
            id: "",
            type: "",
          };
        }
      });
  }

  private initializeform() {
    this.myForm = this.fb.group({
      stateId: [""],
    });
  }
  private fetchMinMaxFinancialYears() {
    this._commonService.getFinancialYearBasedOnData().subscribe((res) => {
      this.financialYearTexts = {
        min: res.data[0],
        max: res.data[res.data.length - 1].slice(2),
      };
    });
  }
  stateDim = false;
  stateLevelData() {
    this.stateDim = false;
  }
  cityInfo;
  cityLevelData() {
    this.stateDim = true;
  }

  dashboardNav(option) {
    this.selectCity(option);
  }
  createNationalLevelMap(
    geoData: FeatureCollection<
      Geometry,
      {
        [name: string]: any;
      }
    >,
    containerId: string
  ) {
    this.isLoading = true;
    this.isProcessingCompleted.emit(false);
    let zoom;
    if (window.innerWidth > 1050) zoom = this.mapConfig.nationalZoomOnWeb;
    else zoom = this.mapConfig.nationalZoomOnMobile;
    // let vw = Math.max(document.documentElement.clientWidth);
    // vw = (vw - 1366) / 1366;
    // let zoom = 4 + vw;
    // if (this.userUtil.isUserOnMobile()) {
    //   zoom = 3.5 + (window.devicePixelRatio - 2) / 10;
    //   if (window.innerHeight < 600) zoom = 3.6;
    //   const valueOf1vh = this.calculateVH(1);
    //   if (valueOf1vh < 5) zoom = 3;
    //   else if (valueOf1vh < 7) zoom = zoom - 0.2;
    //   // return zoom;
    // }

    const configuration: IMapCreationConfig = {
      containerId,
      geoData,
      options: {
        zoom,
        maxZoom: zoom,
        minZoom: zoom,
        attributionControl: false,
        doubleClickZoom: false,
        dragging: false,
        tap: false,
      },
    };
    let map: L.Map;

    ({ stateLayers: this.stateLayers, map } =
      MapUtil.createDefaultNationalMap(configuration));

    this.nationalLevelMap = map;

    this.createLegendsForNationalLevelMap();
    this.createControls(this.nationalLevelMap);

    this.initializeNationalLevelMapLayer(this.stateLayers);

    // Prepare to auto select state from query Params.
    let stateToAutoSelect: IStateULBCovered;
    let layerToAutoSelect;
    if (this.queryParams.state) {
      const stateFound = this.stateData.find(
        (state) => state._id === this.queryParams.state
      );
      if (stateFound) stateToAutoSelect = stateFound;
    }

    this.stateLayers.eachLayer((layer) => {
      if (stateToAutoSelect) {
        if (MapUtil.getStateName(layer) === stateToAutoSelect.name) {
          layerToAutoSelect = { sourceTarget: layer };
        }
      }
      (layer as any).bringToBack();
      (layer as any).on({
        mouseover: () => this.createTooltip(layer, this.stateLayers),
        click: (args: ILeafletStateClickEvent) => {
          this.selectedStateCode = args.sourceTarget.feature.properties.ST_CODE;
          this.onStateLayerClick(args, true, false);
        },
        mouseout: () => (this.mouseHoverOnState = null),
      });
    });

    /**
     * @description If the map is already on mini mode, then it means the state is already selected, and its state map
     * is in the view.
     */

    if (layerToAutoSelect && !this.isMapOnMiniMapMode) {
      this.onStateLayerClick(layerToAutoSelect);
      this.isLoading = false;
    }
    this.hideMapLegends();

    if (this.isMapOnMiniMapMode) {
      this.hideMapLegends();
      this.showStateLayerOnlyFor(
        this.nationalLevelMap,
        this.currentStateInView
      );
    }

    this.isProcessingCompleted.emit(true);
  }

  showMapLegends() {
    console.warn("show legends hidden");
  }

  clearDistrictMapContainer() {
    if (this.districtMap) {
      this.districtMap.off();
      this.districtMap.remove();
    }
    // const height = this.userUtil.isUserOnMobile() ? `100%` : "80vh";
    const height = this.userUtil.isUserOnMobile() ? `100%` : "inherit";
    // const height = `100%`;
    let element = document.getElementById("districtMapContainer");
    document.getElementById("districtMapContainer").innerHTML = `
      <div
    id="districtMapId"
    class="col-sm-12"
    style="background-color: #F8F9FF; background-image: url('../../../../assets/Layer\ 1.png');
    display: inline-block; width: 100%;height: ${height};"
  >
  </div>`;
  }

  createDistrictMap(
    districtGeoJSON,
    options: {
      center: ILeafletStateClickEvent["latlng"];
      dataPoints: {
        lat: string;
        lng: string;
        name: string;
        area: number;
        population: number;
        auditStatus: ULBWithMapData["auditStatus"];
      }[];
    }
  ) {
    console.log("json", districtGeoJSON);
    if (this.districtMap) {
      return;
    }
    this.clearDistrictMapContainer();

    setTimeout(() => {
      let vw = Math.max(document.documentElement.clientWidth);
      vw = (vw - 1366) / 1366;
      let zoom = 5.5 + vw;
      if (this.userUtil.isUserOnMobile()) {
        zoom = 5.5;
      }

      zoom = 5.5;

      const districtMap = L.map("districtMapId", {
        scrollWheelZoom: false,
        fadeAnimation: true,
        minZoom: zoom,
        maxZoom: zoom + 2,
        // maxZoom: zoom,
        zoomControl: false,
        keyboard: true,
        attributionControl: true,
        doubleClickZoom: false,
        dragging: false,
        tap: true,
      }).setView([options.center.lat, options.center.lng], 4);
      // districtMap.touchZoom.disable();
      // districtMap.doubleClickZoom.disable();
      districtMap.scrollWheelZoom.disable();
      // districtMap.boxZoom.disable();
      // districtMap.keyboard.disable();
      // districtMap.dragging.disable();

      const districtLayer = L.geoJSON(districtGeoJSON, {
        style: this.newDashboardstateColorStyle,
      }).addTo(districtMap);

      if (districtLayer) {
        districtMap.fitBounds(districtLayer.getBounds());
      }
      this.districtMap = districtMap;

      options.dataPoints.forEach((dataPoint: any) => {
        /* Creating a popup without a close button.
        * available option are {closeOnClick: false, closeButton: true, autoClose: true }
        * if you know other option too please add into this object for future reference
        */
        var popup = L.popup({closeButton: false, autoClose: true }).setContent(`${this._commonService.createCityTooltip(dataPoint)}`);
        const marker = this.createDistrictMarker({
          ...dataPoint,
          icon: this.blueIcon,
        }).addTo(districtMap)
        .bindPopup(popup);

        /* Adding a mouseover and mouseout event to the marker. */
        marker.on({ mouseover: () => {
            this.mouseHoveredOnULB = dataPoint;
            marker.openPopup();
          }
        });
        marker.on({ mouseout: () => {
            this.mouseHoveredOnULB = null;
            marker.closePopup();
          }
        });

        /* Setting the mouseHoveredOnULB property of the component to the dataPoint object. */
        // marker.on("mouseover", () => (this.mouseHoveredOnULB = dataPoint));
        // marker.on("mouseout", () => (this.mouseHoveredOnULB = null));
        marker.on("click", (values) => {
          let city;
          if (values["latlng"])
            city = this.stateUlbData.data[this.selectedStateCode].ulbs.find(
              (value) =>
                +value.location.lat === values["latlng"].lat &&
                +value.location.lng === values["latlng"].lng
            );
          if (city) {
            this.selectedDistrictCode = city.code;
            this.selectCity(city.code, false);
          }
          this.onDistrictMarkerClick(<L.LeafletMouseEvent>values, marker);
        });
        this.districtMarkerMap[dataPoint.code] = marker;
      });
    }, 0.5);

  }

  selectCity(city, fireEvent = true) {
    let filterCity = this.cityData.find((e) => {
      return e.code == city;
    });
    this.cityName = filterCity.name;
    this.stateDim = true;
    this.cid = filterCity._id;
    console.log("cityId", this.cid, filterCity, this.districtMarkerMap); //CityId after selecting a city from dropdown
    if (fireEvent) this.districtMarkerMap[filterCity.code].fireEvent("click");
    console.log("city name", city, filterCity);
    this.authService.getCityData(this.cid).subscribe((res) => {
      this.cityInfo = res["data"];
    });
    // this.onSelectingULBFromDropdown(city);
  }
  viewDashboard() {
    let searchValue = this.stateList.find(
      (e) => e?.name.toLowerCase() == this.selected_state.toLowerCase()
    );
    this.router.navigateByUrl(`/dashboard/state?stateId=${searchValue?._id}`);
  }
  viewCityDashboard() {
    this.router.navigateByUrl(`/dashboard/city?cityId=${this.cid}`);
  }
  private fetchBondIssueAmout(stateId?: string) {
    this.isBondIssueAmountInProgress = true;
    this._commonService.getBondIssuerItemAmount(stateId).subscribe((res) => {
      try {
        this.bondIssueAmount = Math.round(res["data"][0]["totalAmount"]);
      } catch (error) {
        this.bondIssueAmount = 0;
      }
      this.isBondIssueAmountInProgress = false;
    });
  }
  onSelectingStateFromDropDown(state: any | null) {
    console.log({ state });
    if (this.districtMap) {
      MapUtil.destroy(this.districtMap);
    }
    this.selectedStateCode = state.code;
    this.cityName = "";
    this.cid = undefined;
    this.stateDim = false;
    this._commonService
      .getUlbByState(state ? state?.code : null)
      .subscribe((res) => {
        let ulbsData: any = res;
        this.cityData = ulbsData?.data?.ulbs;
        console.log("AllCity", this.cityData);
      });
    this.selected_state = state ? state?.name : "India";
    /* Updating the dropdown state selection. */
    this.showCreditInfoByState(this.selected_state);
    if (state._id == null) this.updateDropdownStateSelection(state);
    if (this.selected_state === "India" && this.isMapOnMiniMapMode) {
      const element = document.getElementById(this.createdDomMinId);
      element.style.display = "block";

      this.resetMapToNationalLevel();
      this.initializeNationalLevelMapLayer(this.stateLayers);
    }
    this.stateselected = state;
    this.fetchDataForVisualization(state ? state._id : null);
    this.fetchBondIssueAmout(
      this.stateselected ? this.stateselected._id : null
    );
    this.selectStateOnMap(state);
  }

  private selectStateOnMap(state?: IState) {
    if (this.previousStateLayer) {
      this.resetStateLayer(this.previousStateLayer);
      this.previousStateLayer = null;
    }
    if (!state) {
      return;
    }
    this.stateLayers?.eachLayer((layer) => {
      const layerName = MapUtil.getStateName(layer);
      if (layerName !== state.name) {
        return;
      }
      this.previousStateLayer = layer;
      this.higlightClickedState(layer);
    });
  }

  private higlightClickedState(stateLayer) {
    let currentUrl = window.location.pathname;
    let obj: any = {
      containerPoint: {},
      latlng: {
        // lat: 23.48789594497792,
        // lng: 78.2647891998273
      },
      layerPoint: {},
      originalEvent: {},
      sourceTarget: stateLayer,
      target: stateLayer,
      type: "click",
    };
    if (currentUrl == "/home") {
      this.onStateLayerClick(obj);

      stateLayer.setStyle({
        fillColor: "#3E5DB1",
        fillOpacity: 1,
      });
    }
    // stateLayer.setStyle(this.StyleForSelectedState);
    // if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    //   stateLayer.bringToFront();
    // }
  }
  private resetStateLayer(layer) {
    layer.setStyle({
      color: this.defaultStateLayerColorOption.color,
      weight: this.defaultStateLayerColorOption.weight,
    });
    layer.closeTooltip();
  }

  private fetchStateList() {
    this._commonService.fetchStateList().subscribe((res) => {
      // this.stateList = [{ _id: null, name: "India" }].concat(res);
      this.stateList = this._commonService.sortDataSource(res, 'name');
      this.stateList = [{ _id: null, name: "India" }].concat(this.stateList);
      console.log('stateList', this.stateList)
    });
  }

  private fetchDataForVisualization(stateId?: string) {
    this.dataForVisualization.loading = true;
    this.homePageSubscription?.unsubscribe();
    this.homePageSubscription = this._commonService.fetchDataForHomepageMap(stateId).subscribe((res) => {
      this.setDefaultAbsCreditInfo();

      this.showCreditInfoByState(
        this.stateselected ? this.stateselected.name : ""
      );
      this.dataForVisualization = { ...res, loading: false };
      this.highestYear = null;
      this.highestDataAvailability = null;
      if (this.dataForVisualization?.ulbDataCount?.length > 0) {
        // +yearA.split("-")[0] - +yearB.split("-")[0]
        // this.dataForVisualization.ulbDataCount = this.dataForVisualization?.ulbDataCount?.sort((a, b) => parseFloat(b.ulbs) - parseFloat(a.ulbs));
        this.dataForVisualization.ulbDataCount = this.dataForVisualization?.ulbDataCount?.sort((a, b) => +a?.year.split("-")[0] - +b?.year.split("-")[0]);
        const ublsArray = this.dataForVisualization?.ulbDataCount;
        let highestData = -1;
        for (const item of ublsArray) {
          if (item.ulbs > highestData) {
            highestData = item?.ulbs;
            this.highestYear = item?.year;
          }
      }
      this.highestDataAvailability = ((+highestData / +this.dataForVisualization?.totalULB) * 100).toFixed(0);
       // this.highestYear = this.dataForVisualization?.ulbDataCount[0]?.year;
       // this.highestDataAvailability = ((this.dataForVisualization?.ulbDataCount[0]?.ulbs / this.dataForVisualization?.totalULB) * 100).toFixed(0);
      }
      this.dataAvailTooltip = '';
      this.dataForVisualization?.ulbDataCount?.forEach(element => {
        this.dataAvailTooltip = this.dataAvailTooltip + `${element.year} : ${element.ulbs} \n `
      });
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.animateValues(1);
        });
      });
    });
  }
  setDefaultAbsCreditInfo() {
    this.absCreditInfo = {
      title: "",
      ulbs: 0,
      creditRatingUlbs: 0,
      ratings: {
        "AAA+": 0,
        AAA: 0,
        "AAA-": 0,
        "AA+": 0,
        AA: 0,
        "AA-": 0,
        "A+": 0,
        A: 0,
        "A-": 0,
        "BBB+": 0,
        BBB: 0,
        "BBB-": 0,
        BB: 0,
        "BB+": 0,
        "BB-": 0,
        "B+": 0,
        B: 0,
        "B-": 0,
        "C+": 0,
        C: 0,
        "C-": 0,
        "D+": 0,
        D: 0,
        "D-": 0,
      },
    };
  }
  public animateValues = (startiongValue?: number) => {
    const speed = 1000;
    const interval = this.isMapAtNationalLevel() ? 5 : 1;

    const animateValues = document.querySelectorAll(
      "[data-animate-value]"
    ) as any as Array<HTMLElement>;

    animateValues.forEach((element: HTMLElement) => {
      const target = +element.getAttribute("data-animate-value");

      const currentValue = +element.innerText;
      if (startiongValue !== null && startiongValue !== undefined) {
        element.innerText = `0`;
        this._ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            setTimeout(this.animateValues, interval);
          });
        });
        return;
      }
      if (currentValue >= target) {
        return;
      }

      let incrementor = +Number(target / speed);
      incrementor = incrementor === 0 ? target : incrementor;

      // NOTE Need to re do it.
      incrementor = 2;
      if (currentValue < target) {
        const newValue = +Number(currentValue + incrementor).toFixed(1);
        element.innerText = `${newValue > target ? target : newValue}`;
        this._ngZone.runOutsideAngular(() => {
          setTimeout(() => {
            setTimeout(this.animateValues, interval);
          });
        });
      } else {
        element.innerText = `${target}`;
      }
    });
  };
  showCreditInfoByState(stateName = "") {
    console.log({ stateName });
    const ulbList = [];
    if (stateName && stateName != "India") {
      for (let i = 0; i < this.creditRatingList?.length; i++) {
        const ulb = this.creditRatingList[i];

        if (ulb.state.toLowerCase() == stateName.toLowerCase()) {
          ulbList.push(ulb["ulb"]);
          const rating = ulb.creditrating.trim();
          this.calculateRatings(this.absCreditInfo, rating);
        }
      }
    } else {
      for (let i = 0; i < this.creditRatingList?.length; i++) {
        const ulb = this.creditRatingList[i];
        ulbList.push(ulb["ulb"]);
        const rating = ulb.creditrating.trim();
        this.calculateRatings(this.absCreditInfo, rating);
      }
    }
    this.creditRatingAboveA =
      this.absCreditInfo["ratings"]["A"] +
      this.absCreditInfo["ratings"]["A+"] +
      this.absCreditInfo["ratings"]["AA"] +
      this.absCreditInfo["ratings"]["AA+"] +
      this.absCreditInfo["ratings"]["AA-"] +
      this.absCreditInfo["ratings"]["AAA"] +
      this.absCreditInfo["ratings"]["AAA+"] +
      this.absCreditInfo["ratings"]["AAA-"];

    this.creditRatingAboveBBB_Minus =
      this.creditRatingAboveA +
      this.absCreditInfo["ratings"]["A-"] +
      this.absCreditInfo["ratings"]["BBB"] +
      this.absCreditInfo["ratings"]["BBB+"] +
      this.absCreditInfo["ratings"]["BBB-"];

    this.absCreditInfo["title"] = stateName || "India";
    this.absCreditInfo["ulbs"] = ulbList;

    console.log(
      "this.creditRatingAboveA",
      this.creditRatingAboveA,
      this.creditRatingAboveBBB_Minus
    );
  }

  calculateRatings(dataObject, ratingValue) {
    if (!dataObject["ratings"][ratingValue]) {
      dataObject["ratings"][ratingValue] = 0;
    }
    dataObject["ratings"][ratingValue] = dataObject["ratings"][ratingValue] + 1;
    dataObject["creditRatingUlbs"] = dataObject["creditRatingUlbs"] + 1;
    return dataObject;
  }
  private isMapAtNationalLevel() {
    return this.stateSelected ? false : true;
  }
  private updateDropdownStateSelection(state: IState) {
    this.stateselected = state;
    this.myForm.controls.stateId.setValue(state ? [{ ...state }] : []);
  }
  private fetchCreditRatingTotalCount() {
    this.assetService
      .fetchCreditRatingReport()
      .subscribe((res) => this.computeStatesTotalRatings(res));
  }
  private computeStatesTotalRatings(res: ICreditRatingData[]) {
    this.creditRatingList = res;

    const computedData = { total: 0, India: 0 };
    res.forEach((data) => {
      if (computedData[data.state] || computedData[data.state] === 0) {
        computedData[data.state] += 1;
      } else {
        computedData[data.state] = 1;
      }
      computedData.total += 1;
      computedData["India"] += 1;
    });

    this.creditRating = computedData;
  }
  openStateDashboard(event) {
    this.router.navigateByUrl(
      `/dashboard/state?stateCode=${this.selectedStateCode}`
    );
  }
}
