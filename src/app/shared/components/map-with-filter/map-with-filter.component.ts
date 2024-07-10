import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { FeatureCollection, Geometry } from "geojson";
import { data } from "jquery";
import * as L from "leaflet";
import { ILeafletStateClickEvent } from "src/app/shared/components/re-useable-heat-map/models/leafletStateClickEvent";
import { ReUseableHeatMapComponent } from "src/app/shared/components/re-useable-heat-map/re-useable-heat-map.component";
import { IStateULBCovered } from "src/app/shared/models/stateUlbConvered";
import { ULBWithMapData } from "src/app/shared/models/ulbsForMapResponse";
import { CommonService } from "src/app/shared/services/common.service";
import { GeographicalService } from "src/app/shared/services/geographical/geographical.service";
import { MapUtil } from "src/app/util/map/mapUtil";
import { IMapCreationConfig } from "src/app/util/map/models/mapCreationConfig";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
@Component({
  selector: "app-map-with-filter",
  templateUrl: "./map-with-filter.component.html",
  styleUrls: ["./map-with-filter.component.scss"],
})
export class MapWithFilterComponent
  extends ReUseableHeatMapComponent
  implements OnInit, OnDestroy
{
  yearSelected = [];
  selectedState = "India";
  selectedStateCode = "";
  selectedDistrictCode = "";
  stateList = [];
  ulbList = [];
  dropdownSettings = {
    singleSelection: true,
    text: "India",
    enableSearchFilter: true,
    labelKey: "ST_NM",
    primaryKey: "ST_CODE",
    showCheckbox: false,
  };
  selectedItems = [];
  constructor(
    protected _commonService: CommonService,
    protected _snackbar: MatSnackBar,
    protected _geoService: GeographicalService,
    protected _activateRoute: ActivatedRoute,
    private router: Router
  ) {
    super(_commonService, _snackbar, _geoService, _activateRoute);
    this.ngOnChanges({
      yearSelected: {
        currentValue: ["2016-17"],
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true,
      },
    });
  }

  @Input()
  mapConfig = {
    code: {
      state: "",
      city: "",
    },
    showStateList: false,
    showDistrictList: false,
    stateMapContainerHeight: "23rem",
    nationalZoomOnMobile: 3.9, // will fit map in container
    nationalZoomOnWeb: 3.9, // will fit map in container
    stateZoomOnMobile: 4, // will fit map in container
    stateZoomOnWeb: 4, // will fit map in container
    stateBlockHeight: "23.5rem", // will fit map in container
  };

  layerMap = {};
  districtMarkerMap = {};
  districtList = {};
  loaderStyle = loaderStyle;
  stateUlbData = JSON.parse(localStorage.getItem("ulbList"));
  ulb = new FormControl();
  noDataFound = false;
  @Output()
  changeInStateOrCity = new EventEmitter();
  filteredOptions: Observable<any[]>;
  ngOnInit(): void {}
  callAPI(event) {
    this._commonService
      .postGlobalSearchData(
        event.target.value,
        "ulb",
        this.mapConfig.code.state
      )
      .subscribe((res: any) => {
        console.log(res?.data);
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
          console.log("no data found");
        }
      });
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
    if (this.stateList.length == 0)
      this.stateList = geoData.features.map((value: any) => {
        Object.assign(this.layerMap, { [value.properties.ST_CODE]: null });
        return value.properties;
      });
      this.stateList = this._commonService.sortDataSource(this.stateList, 'ST_NM');
      console.log('stateList', this.stateList)

    this.isProcessingCompleted.emit(false);
    let zoom;
    if (window.innerWidth > 1050) zoom = this.mapConfig.nationalZoomOnWeb;
    else zoom = this.mapConfig.nationalZoomOnMobile;
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

    // this.createLegendsForNationalLevelMap();
    this.createControls(this.nationalLevelMap);

    this.initializeNationalLevelMapLayer(this.stateLayers);

    let stateToAutoSelect: IStateULBCovered;
    let layerToAutoSelect;
    if (this.queryParams.state) {
      const stateFound = this.stateData.find(
        (state) => state._id === this.queryParams.state
      );
      if (stateFound) stateToAutoSelect = stateFound;
    }

    this.stateLayers.eachLayer((layer: any) => {
      if (layer?.feature?.properties?.ST_CODE)
        this.layerMap[layer.feature.properties.ST_CODE] = layer;
      if (stateToAutoSelect) {
        if (MapUtil.getStateName(layer) === stateToAutoSelect.name) {
          layerToAutoSelect = { sourceTarget: layer };
        }
      }
      (layer as any).bringToBack();
      (layer as any).on({
        mouseover: () => this.createTooltip(layer, this.stateLayers),
        click: (args: ILeafletStateClickEvent) =>
          this.onStateLayerClick(args, false),
        mouseout: () => (this.mouseHoverOnState = null),
      });
    });
    if (layerToAutoSelect && !this.isMapOnMiniMapMode) {
      this.onStateLayerClick(layerToAutoSelect);
    }
    // this.hideMapLegends();
    if (this.isMapOnMiniMapMode) {
      // this.hideMapLegends();
      this.showStateLayerOnlyFor(
        this.nationalLevelMap,
        this.currentStateInView
      );
    }
    this.isProcessingCompleted.emit(true);

    //Open Direct District or State
    if (this.mapConfig.code) {
      let type = this.layerMap[this.mapConfig.code.state];
      if (type) {
        this.selectedStateCode = this.mapConfig.code.state;
        this.updateSelectedState();
        type.fireEvent("click");
      }
      setTimeout(() => {
        this.selectedDistrictCode = this.mapConfig.code.city;
        type = this.districtMarkerMap[this.mapConfig.code.city];
        if (type) type.fireEvent("click");
      }, 10);
    }
  }
  postBody;
  checkType(searchValue) {
    let type = searchValue?.type;
    if (type == "ulb") {
      this.postBody = {
        type: searchValue.type,
        ulb: searchValue._id,
      };
    }
    if (type == "state") {
      this.postBody = {
        type: searchValue.type,
        state: searchValue._id,
      };
    }
    if (type == "searchKeyword") {
      this.postBody = {
        type: searchValue.type,
        searchKeyword: searchValue._id,
      };
    }
  }
  dashboardNav(option) {
    console.log("option", option);
    this.checkType(option);
    this._commonService.postRecentSearchValue(this.postBody).subscribe(
      (res) => {
        console.log("serach res", res);
      },
      (error) => {
        console.log(error);
      }
    );
    console.log("option", option);
    if (option?.type == "state") {
      this.router.navigateByUrl(`/dashboard/state?stateId=${option._id}`);
    }
    if (option?.type == "ulb") {
      this.router.navigateByUrl(`/dashboard/city?cityId=${option._id}`);
    }
  }

  showMapLegends() {
    console.warn("show legends hidden");
  }

  clearDistrictMapContainer() {
    // const height = this.mapConfig.stateBlockHeight;
    // initially height = 23rem;
    const height = this.userUtil.isUserOnMobile() ? `100%` : "inherit";
    console.log("clearDistrictMapContainer Called", this.currentStateInView);
    document.getElementById("districtMapContainer").innerHTML = `
      <div
    id="districtMapId"
    class="col-sm-12"
    style="background-color: #f1f8ff; background-image: url('../../../../assets/Layer\ 1.png');
    display: inline-block; width: 100%;height: ${height};"
  >
  </div>`;
  }

  createMarker(options) {
    let id = this.router.url.split("=")[1];
    let newObject = options.filter((elem) => {
      if (elem._id == id) {
        return elem;
      }
    });
    let marker = this.districtMarkerMap[newObject[0]?.code];
    console.log('createMarker', options, 'newObject', newObject, 'marker', marker)
    if (marker) marker.fireEvent("click");
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
    if (this.districtMap) {
      return;
    }
    this.clearDistrictMapContainer();

    setTimeout(() => {
      let zoom;
      if (window.innerWidth > 1050) zoom = this.mapConfig.stateZoomOnMobile;
      else zoom = this.mapConfig.stateZoomOnWeb;

      const districtMap = L.map("districtMapId", {
        scrollWheelZoom: false,
        fadeAnimation: true,
        zoom,
        minZoom: zoom,
        maxZoom: zoom + 2,
        zoomControl: false,
        keyboard: true,
        attributionControl: true,
        doubleClickZoom: false,
        dragging: false,
        tap: true,
      }).setView([options.center.lat + 3, options.center.lng + 3], 4);
      districtMap.scrollWheelZoom.disable();
      const districtLayer = L.geoJSON(districtGeoJSON, {
        style: this.newDashboardstateColorStyle,
      }).addTo(districtMap);

      if (districtLayer) {
        districtMap.fitBounds(districtLayer.getBounds());
      }
      this.districtMap = districtMap;

      this.districtList = {};
      console.log("options", options.dataPoints);
      // setTimeout(() => {
      //   this.createMarker(options.dataPoints);
      // }, 100);
      options.dataPoints.forEach((dataPoint: any) => {
        this.districtList[dataPoint.code] = dataPoint.name;
        /* Creating a popup without a close button.
         * available option are {closeOnClick: false, closeButton: true, autoClose: true }
         * if you know other option too please add into this object for future reference
         */
        var popup = L.popup({ closeButton: false, autoClose: true }).setContent(
          `${this._commonService.createCityTooltip(dataPoint)}`
        );
        const marker = this.createDistrictMarker({
          ...dataPoint,
          icon: this.blueIcon,
        })
          .addTo(districtMap)
          .bindPopup(popup);

        /* Adding a mouseover and mouseout event to the marker. */
        marker.on({
          mouseover: () => {
            this.mouseHoveredOnULB = dataPoint;
            marker.openPopup();
          },
        });
        marker.on({
          mouseout: () => {
            this.mouseHoveredOnULB = null;
            marker.closePopup();
          },
        });
        // marker.on("mouseover", () => (this.mouseHoveredOnULB = dataPoint));
        // marker.on("mouseout", () => (this.mouseHoveredOnULB = null));
        marker.on("click", (values: any) => {
          console.log("clicked values", values, this.mapConfig?.code?.state);
          let city;
          if (values["latlng"])
            city = this.stateUlbData?.data[
              this.mapConfig?.code?.state
            ].ulbs?.find((value) => {
              console.log("innerValue", value);
              this.router.navigateByUrl(`/dashboard/city?cityId=${value?._id}`);
              return (
                +value.location.lat === values["latlng"].lat &&
                +value.location.lng === values["latlng"].lng
              );
            });
          if (city) this.selectedDistrictCode = city?.code;
          this.onDistrictMarkerClick(values, marker);
        });
        this.districtMarkerMap[dataPoint?.code] = marker;
      });
    }, 0.5);

    setTimeout(() => {
      this.createMarker(options?.dataPoints);
    }, 100);
  }

  reloadComponent(selectedStateId: any) {
    let currentUrl = this.router.url;
    console.log("currentUrl", currentUrl);
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    let currentURL = `/dashboard/state?stateId=${selectedStateId}`;
    // this.router.navigate([currentURL]);
    this.router.navigateByUrl(`/dashboard/state?stateId=${selectedStateId}`);
  }

  stateOption(event) {
    console.log("stateOption(", event);
    if(!event.ST_CODE) return;

    /**
     * Reloading the component. uncomment the below code and call the reloadComponent() function
     * and comment old code
     */
    // if (event) {
    //   let selectedStateCode = JSON.parse(event.target.value).ST_CODE;
    //   let selectedStateId = this.stateUlbData.data[selectedStateCode]._id
    //   this.reloadComponent(selectedStateId);
    // }

    let selectedStateCode = event.ST_CODE;
    let selectedStateId = this.stateUlbData.data[selectedStateCode]._id;
    this.updateSelectedState();
    sessionStorage.setItem('row_id', selectedStateId);
    this.router.navigateByUrl(`/dashboard/state?stateId=${selectedStateId}`);

    this.changeInStateOrCity.emit({
      value: event,
      fromState: true,
    });
    console.log(event.target.value, "test");
    let layer = this.layerMap[event.ST_CODE];
    if (layer) layer.fireEvent("click");
  }

  updateSelectedState() {
    const selectedState = this.stateList.find(state => state?.ST_CODE == this.selectedStateCode)
    if(selectedState) {
      this.selectedItems = [selectedState];
    }
  }

  districtOption(event) {
    console.log("new event", { event });
    let district = JSON.parse(event.value);
    this.changeInStateOrCity.emit({ value: district, fromState: false });
    let marker = this.districtMarkerMap[district.key];
    if (marker) marker.fireEvent("click");
  }
  // selectState(state) {
  //   console.log("state name", state);
  //   this.selectedState = state;
  // }
  // selectCity(city) {
  //   console.log("city name", city);
  // }

  ngOnDestroy(): void {
    // let mapReferenceList = ['nationalLevelMap', 'districtMap'];
    // for (const item of mapReferenceList) {
    //   MapUtil.destroy(this[item]);
    // };
  }
}

const loaderStyle = {
  "backgorund-color": "#F1F8FF",
};
