import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatInput } from '@angular/material/input';
import { Router } from '@angular/router';
import { DropdownSettings } from 'angular2-multiselect-dropdown/lib/multiselect.interface';
import { BsModalService } from 'ngx-bootstrap/modal';
import { merge, Observable } from 'rxjs';
import { debounceTime, filter, tap } from 'rxjs/operators';
import { IULBResponse } from 'src/app/models/IULBResponse';
import { IULB } from 'src/app/models/ulb';
import { JSONUtility } from 'src/app/util/jsonUtil';

import { AuthService } from '../../../../app/auth/auth.service';
import { DialogComponent } from '../../../../app/shared/components/dialog/dialog.component';
import { GlobalLoaderService } from '../../../../app/shared/services/loaders/global-loader.service';
import { CommonService } from '../../../shared/services/common.service';
import { IBasicLedgerData, LedgerState, LedgerULB, TSearchedULB } from '../models/basicLedgerData.interface';
import { ReportService } from '../report.service';
import { ReportComponent } from '../report/report.component';
import { ulbType } from '../report/ulbTypes';

@Component({
  selector: "app-report",
  templateUrl: "./financial-statement.component.html",
  styleUrls: ["./financial-statement.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialStatementComponent extends ReportComponent
  implements OnInit, OnDestroy {
  constructor(
    protected formBuilder: FormBuilder,
    protected _loaderService: GlobalLoaderService,
    protected commonService: CommonService,
    protected modalService: BsModalService,
    protected reportService: ReportService,
    protected router: Router,
    protected _dialog: MatDialog,
    protected authService: AuthService,
    private changeDetector: ChangeDetectorRef
  ) {
    super(
      formBuilder,
      _loaderService,
      commonService,
      modalService,
      reportService,
      router,
      _dialog,
      authService
    );
  }
  multiSelectStates: Partial<DropdownSettings> = {
    primaryKey: "_id",
    singleSelection: false,
    text: "Select ULBs",
    enableSearchFilter: true,
    labelKey: "name",
    showCheckbox: true,
    noDataLabel: "No Data available",
    groupBy: "state",
    badgeShowLimit: 1,
  };

  NeworiginalUlbList: IBasicLedgerData["data"];

  filteredULBList: IBasicLedgerData["data"];

  ulbListForDropdown: IULBResponse["data"]["ss"]["ulbs"];

  ulbListForPopup: IBasicLedgerData["data"][0]["ulbList"];

  tempData = [];

  /**
   * @description These are the years that are common to all selected ULBs
   */
  commonYears: string[];

  /**
   * @description Flag to denote whether the year is update after selecting ulbs.
   * It set to False if a new ulb is selected or removed, and set to true
   * when the year list is processed.
   */
  yearListUpdate = false;

  filterForm: FormGroup;
  ulbSearchControl: FormControl;
  baseUlbSearchControl: FormControl;
  stateSelectToFilterULB = new FormControl();

  formInvalidMessage: string;
  showReport = false;
  shiftFormToLeft = false;

  newULBTypes: ulbType[] = [
    ulbType.municipalCorporation,
    ulbType.municipality,
    ulbType.townPanchayat,
  ];

  isULBSearchingInProgress = false;

  @ViewChild("autoCompleteInput", { static: false })
  autoCompleteInput: MatInput;

  jsonUtil = new JSONUtility();
  @ViewChild("widgetsContent") widgetsContent: ElementRef;

  showArrow = true;

  allFinancialYears: {
    value: string;
    isSelectable: boolean;
    selected: boolean;
  }[];

  /**
   * @description These are the ULBs which are filtered by Year Selection.
   * Only these ulbs must be show in Comparision dropdown.
   */
  ulbListForComparision: LedgerState[];
  paginatedULBListForComparison: LedgerState[];

  showULBsForComparision = false;

  homePageSubscription: Observable<any>;

  /**
   * @description Configuration used for scroll pagination for Search ULB.
   */
  fisrtAutoCompleteConfig = {
    currentStateIndex: 1,
    isVisible: false,
    canLoadMore: true,
  };

  /**
   * @description Configuration used for scroll pagination on ULB list for
   * comparision
   */
  ComparisionAutoCompleteConfig = {
    currentStateIndex: 1,
    isVisible: false,
    canLoadMore: true,
  };

  observer1: IntersectionObserver;
  observer2: IntersectionObserver;

  ulbSelectedMapping: { [ulbId: string]: LedgerULB } = {};
  @ViewChild(MatAutocompleteTrigger) trigger: MatAutocompleteTrigger;

  baseULB: LedgerULB;

  ngOnInit(): void {
    this.initializeFilterForm();
    this.fetchULBList();
    this.fetchAllFinancialYears();
    this.ulbTypeInView.type = this.newULBTypes[0];
    this.fetchHomepageData();
  }

  private showWarning(message: string, width?: string) {
    const selectionResult = new Promise<boolean>((resolve, reject) => {
      const dailogboxx = this._dialog.open(DialogComponent, {
        data: {
          message,
          buttons: {
            signup: {
              text: "Contiue",
              callback: () => {
                resolve(true);
              },
            },
            cancel: {
              text: "Cancel",
              callback: () => {
                resolve(false);
              },
            },
          },
        },
        width: width || "43vw",
      });
    });

    return selectionResult;
  }

  routerTo(url: string, downloadFilteredULBs = false) {
    const criteria = this.reportService.getNewReportRequest().value;
    const ulbs: string[] = criteria.ulbIds;
    const years: string[] = criteria.years;
    const query = `ulb=${ulbs.toString()}&year=${years.toString()}&backRoute=${
      window.location.pathname
    }`;

    const isUserLoggedIn = this.authService.loggedIn();
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
                this.router.navigate(["/login"], { queryParams: { user: 'USER' } });
              },
            },
            cancel: { text: "Cancel" },
          },
        },
        width: "28vw",
      });
      return;
    }

    return this.router.navigate(["/data-tracker"], {
      queryParams: {
        ulb: ulbs.toString(),
        year: years.toString(),
        backRoute: window.location.pathname,
      },
    });
  }

  private fetchHomepageData() {
    this.homePageSubscription = this.commonService.fetchDataForHomepageMap();
  }

  private fetchAllFinancialYears() {
    this.reportService.getFinancialYearBasedOnData().subscribe((res) => {
      this.allFinancialYears = res["data"].map((value) => ({
        value,
        isSelectable: false,
        selected: false,
      }));
      this.changeDetector.detectChanges();
      setTimeout(() => {
        this.calculateArrowVisibility();
      }, 0);
    });
  }

  protected initializeFilterForm() {
    this.filterForm = this.formBuilder.group({
      ulbList: [[]],
      ulbIds: [[]],
      years: [[]],
      yearList: [],
      type: ["Summary"],
      valueType: ["absolute"],
      reportGroup: ["Income & Expenditure Statement"],
    });
    this.baseUlbSearchControl = this.formBuilder.control("");
    this.ulbSearchControl = this.formBuilder.control("");
    this.initializeULBSearch();
    this.initializeComparisionULBSearch();

    this.filterForm.controls.ulbList.valueChanges.subscribe((newValue) => {
      this.yearListUpdate = false;
      if (!this.shiftFormToLeft) return;
    });

    /**
     * @description If no year is selected then comparison part should not be show.
     */
    this.filterForm.controls.years.valueChanges.subscribe((newValue) => {
      if (!newValue?.length) {
        this.showULBsForComparision = false;
      } else this.formInvalidMessage = null;
    });
    this.initializeReportTypeChangeDetection();
  }

  private initializeULBSearch() {
    this.baseUlbSearchControl.valueChanges
      .pipe(
        tap((data) => (this.formInvalidMessage = null)),
        filter((value) => (value ? value.length >= 2 : true)),
        debounceTime(300),
        tap((data) => (this.isULBSearchingInProgress = true))
      )
      .subscribe((textToSearch: string) => {
        this.filteredULBList = null;
        textToSearch = textToSearch ? textToSearch.trim() : null;

        if (!textToSearch) {
          this.isULBSearchingInProgress = false;

          this.filteredULBList = this.getDefaultAutocompleteList(
            this.NeworiginalUlbList
          );
          this.fisrtAutoCompleteConfig.canLoadMore =
            this.filteredULBList.length < this.NeworiginalUlbList.length;
          this.changeDetector.detectChanges();
          this.intializeObserver();
          return;
        }

        const newList: LedgerState[] = [];
        this.NeworiginalUlbList.forEach((state) => {
          const newULBList = state.ulbList
            .filter((ulb) => {
              return ulb.name.match(new RegExp(textToSearch, "gi"));
            })
            .map((oldULB: TSearchedULB) => {
              const ulb = { ...oldULB };
              const matchedText = ulb.name.match(
                new RegExp(textToSearch, "gi")
              );

              new Set(matchedText).forEach((text) => {
                ulb.searchedName = ulb.name.replace(
                  new RegExp(text + "(?!([^<]+)?>+)", "g"),
                  `<span class="search-text-matched">${text}</span>`
                );
              });

              return ulb;
            });
          if (!newList || !newULBList.length) return;
          newList.push({ ...state, ulbList: newULBList });
        });

        this.filteredULBList = [...newList];
        this.fisrtAutoCompleteConfig.canLoadMore = false;
        this.isULBSearchingInProgress = false;
        this.changeDetector.detectChanges();
      });
  }

  private initializeComparisionULBSearch() {
    this.ulbSearchControl.valueChanges
      .pipe(
        filter((value) => (value ? value.length >= 2 : true)),
        debounceTime(300),
        tap((data) => (this.isULBSearchingInProgress = true))
      )
      .subscribe((textToSearch: string) => {
        this.paginatedULBListForComparison = null;
        textToSearch = textToSearch?.trim() || null;

        if (!textToSearch) {
          this.isULBSearchingInProgress = false;

          this.paginatedULBListForComparison = this.getDefaultAutocompleteList(
            this.ulbListForComparision
          );
          this.ComparisionAutoCompleteConfig.canLoadMore =
            this.paginatedULBListForComparison.length <
            this.ulbListForComparision.length;
          this.changeDetector.detectChanges();
          this.intializeObserverForComparision();

          return;
        }

        const newList: LedgerState[] = [];
        this.ulbListForComparision.forEach((state) => {
          const newULBList = state.ulbList
            .filter((ulb) => {
              return ulb.name.match(new RegExp(textToSearch, "gi"));
            })
            .map((oldULB: TSearchedULB) => {
              const ulb = { ...oldULB };
              const matchedText = ulb.name.match(
                new RegExp(textToSearch, "gi")
              );

              new Set(matchedText).forEach((text) => {
                ulb.searchedName = ulb.name.replace(
                  new RegExp(text + "(?!([^<]+)?>+)", "g"),
                  `<span class="search-text-matched">${text}</span>`
                );
              });

              return ulb;
            });
          if (!newList || !newULBList.length) return;
          newList.push({ ...state, ulbList: newULBList });
        });

        this.paginatedULBListForComparison = [...newList];
        this.ComparisionAutoCompleteConfig.canLoadMore = false;
        this.isULBSearchingInProgress = false;
        this.changeDetector.detectChanges();
      });
  }

  private initializeULBListForComparision() {
    const yearsSelected = this.allFinancialYears
      .filter((year) => year.isSelectable && year.selected)
      .map((year) => year.value);
    const list: LedgerState[] = [];
    this.NeworiginalUlbList.forEach((state) => {
      const filteredULBs = state.ulbList.filter((ulb) =>
        yearsSelected.every((year) => ulb.financialYear?.includes(year))
      );
      if (!filteredULBs.length) return;
      list.push({ ...state, ulbList: filteredULBs });
    });
    this.ulbListForComparision = list;

    this.paginatedULBListForComparison = this.ulbListForComparision.slice(0, 1);
  }

  /**
   * @description This List will be shown in auto-complete
   * ulb search.
   */
  private getDefaultAutocompleteList(list: LedgerState[]) {
    if (!list || !list.length) return [];
    return [...list.slice(0, 2)];
  }

  /**
   * @description Whenever the value in these controls changes,
   * we need to re-calculate the values for table.
   */
  private initializeReportTypeChangeDetection() {
    merge(
      this.filterForm.controls.type.valueChanges,
      this.filterForm.controls.valueType.valueChanges,
      this.filterForm.controls.reportGroup.valueChanges
    )
      .pipe(debounceTime(200))
      .subscribe((newValues) => {
        this.showData();
      });
  }

  updateReportGroup(newValue: string) {
    this.filterForm.controls.reportGroup.setValue(newValue);
  }

  protected fetchULBList() {
    this._loaderService.showLoader();
    this.commonService.fetchBasicLedgerData().subscribe((res) => {
      this._loaderService.showLoader();

      this.NeworiginalUlbList = res.data;
      this.filteredULBList = this.getDefaultAutocompleteList(
        this.NeworiginalUlbList
      );
      this._loaderService.stopLoader();
      this.stateSelectToFilterULB.setValue(
        this.NeworiginalUlbList[0]._id.state
      );
      this.showULBOfState(
        this.NeworiginalUlbList[0]._id.state,
        this.modelOpenForType === "base"
          ? this.NeworiginalUlbList
          : this.ulbListForComparision
      );
      this.changeDetector.detectChanges();
    });
  }

  /**
   *
   * @description Currently, Material UI does not expose any api to keep the
   * dropdown open. Therefore, we have to implement this hack. It should be
   * replaced with the actual implementation if they implement such feature
   * in the future.
   */
  handleClose(className: string, trigger: MatAutocompleteTrigger) {
    let parent = document.getElementsByClassName(className)[0];

    const parentPreviousScrollPosition = parent.scrollTop;

    requestAnimationFrame(() => {
      trigger.openPanel();
      setTimeout(() => {
        parent = document.getElementsByClassName(className)[0];

        parent.scrollTop = parentPreviousScrollPosition;
      }, 0);
    });
  }

  /**
   * @description Handle the scrolling pagination on Select ULB dropdown.
   */
  intializeObserver() {
    if (
      this.fisrtAutoCompleteConfig.currentStateIndex >=
      this.NeworiginalUlbList.length
    ) {
      return;
    }
    this.observer1?.disconnect();
    setTimeout(() => {
      const parent = document.getElementById("mat-autocomplete-0");
      if (!parent) {
        return console.warn("dropdown closed too quickly.");
      }
      const options: IntersectionObserverInit = {
        threshold: 0.1,
        root: parent,
      };

      this.observer1 = new IntersectionObserver((event) => {
        const noOfStateToAdd = 2;
        this.fisrtAutoCompleteConfig.isVisible = false;
        if (!event[0].isIntersecting) return;
        this.fisrtAutoCompleteConfig.isVisible = true;

        if (
          this.fisrtAutoCompleteConfig.currentStateIndex >=
          this.NeworiginalUlbList.length
        ) {
          this.observer1.disconnect();
          this.fisrtAutoCompleteConfig.canLoadMore = false;
          return;
        }
        const newStatesToAdd = this.NeworiginalUlbList.slice(
          this.fisrtAutoCompleteConfig.currentStateIndex,
          this.fisrtAutoCompleteConfig.currentStateIndex + noOfStateToAdd
        );
        const parentPreviousScrollPosition = parent.scrollTop;
        this.filteredULBList.push(...newStatesToAdd);
        this.fisrtAutoCompleteConfig.currentStateIndex += noOfStateToAdd;
        this.changeDetector.detectChanges();
        setTimeout(() => {
          parent.scrollTop = parentPreviousScrollPosition;
        }, 500);
      }, options);
      this.observer1.observe(document.getElementById("scroll-bottom"));
    }, 1000);
  }

  /**
   * @description Handle the scrolling pagination on Select ULB for Comparison dropdown.
   */
  intializeObserverForComparision() {
    if (
      this.ComparisionAutoCompleteConfig.currentStateIndex >=
      this.ulbListForComparision.length
    ) {
      return;
    }
    this.observer2?.disconnect();

    setTimeout(() => {
      const parent = document.getElementById("mat-autocomplete-1");
      if (!parent) {
        return console.warn("dropdown closed too quickly");
      }
      const options: IntersectionObserverInit = {
        threshold: 0.1,
        root: parent,
      };

      this.observer2 = new IntersectionObserver((event) => {
        const noOfStateToAdd = 2;
        this.ComparisionAutoCompleteConfig.isVisible = false;
        if (!event[0].isIntersecting) return;
        this.ComparisionAutoCompleteConfig.isVisible = true;

        if (
          this.ComparisionAutoCompleteConfig.currentStateIndex >=
          this.ulbListForComparision.length
        ) {
          this.observer2.disconnect();
          this.ComparisionAutoCompleteConfig.canLoadMore = false;
          return;
        }
        const newStatesToAdd = this.ulbListForComparision.slice(
          this.ComparisionAutoCompleteConfig.currentStateIndex,
          this.ComparisionAutoCompleteConfig.currentStateIndex + noOfStateToAdd
        );
        const parentPreviousScrollPosition = parent.scrollTop;
        this.paginatedULBListForComparison.push(...newStatesToAdd);
        this.ComparisionAutoCompleteConfig.currentStateIndex += noOfStateToAdd;
        this.changeDetector.detectChanges();
        setTimeout(() => {
          parent.scrollTop = parentPreviousScrollPosition;
        }, 500);
      }, options);
      this.observer2.observe(document.getElementById("scroll-bottom-2"));
    }, 1000);
  }

  scrollLeft() {
    this.widgetsContent.nativeElement.scrollLeft = -200;
  }

  scrollRight() {
    this.widgetsContent.nativeElement.scrollLeft = 200;
  }

  openUlbModal(
    template: TemplateRef<any>,
    type: "base" | "comparision" = "base"
  ) {
    this.modelOpenForType = type;
    if (this.reportForm.value.isComparative) {
      this.ulbTypeSelected = "base";
    } else {
      this.ulbTypeSelected = "other";
    }
    this.modalRef = this.modalService.show(template, {
      class: "modal-lg",
    });
    this.showULBOfState(
      this.stateSelectToFilterULB.value,
      this.modelOpenForType === "base"
        ? this.NeworiginalUlbList
        : this.ulbListForComparision
    );
  }

  showULBOfState(
    stateId: IBasicLedgerData["data"][0]["_id"]["state"],
    list: LedgerState[]
  ) {
    const stateFound = list.find((state) => state._id.state === stateId);
    if (!stateFound) return console.warn("State not Found");
    this.ulbListForPopup = stateFound.ulbList.filter(
      (ulb) => ulb.ulbType === this.ulbTypeInView.type
    );
  }

  onSelectingULBType(type: ulbType) {
    if (this.ulbTypeInView.type === type) return;
    this.ulbTypeInView.type = type;
    this.showULBOfState(
      this.stateSelectToFilterULB.value,
      this.modelOpenForType === "base"
        ? this.NeworiginalUlbList
        : this.ulbListForComparision
    );
  }

  async selectBaseULB(
    ulb: IBasicLedgerData["data"][0]["ulbList"][0],
    removeIfFound = false,
    stateId?: string,
    event?: Event
  ) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!ulb.financialYear) return;

    const oldULBS: IBasicLedgerData["data"][0]["ulbList"] = this.filterForm
      .controls.ulbList.value;
    const indexFound = this.baseULB?.ulb === ulb?.ulb ? 0 : -1;
    this.baseUlbSearchControl.setValue("");

    /**
     * When user the typed in search box and select a ulb,
     * we need to unfocus the auto-complete input to show new
     * lists.
     */
    (document.activeElement as HTMLElement).blur();
    if (indexFound > -1) {
      if (removeIfFound) {
        oldULBS.splice(indexFound, 1);
        this.ulbSelectedMapping[oldULBS[indexFound].ulb] = null;
      } else {
        this.formInvalidMessage = `${oldULBS[indexFound].name} is already selected.`;
        setTimeout(() => {
          this.formInvalidMessage = null;

          this.changeDetector.detectChanges();
        }, 3000);
        return;
      }
    }

    /**
     *
     */
    if (oldULBS?.length > 1 || this.filterForm.value.years?.length) {
      const message = `<p class='text-center'>By changing the ULB, all the previously selected year(s) and ULB(s) will be removed. <br /> <p class="text-center">Do you want to conitue? </p></p>`;
      const shouldContainue = await this.showWarning(message);
      if (!shouldContainue) {
        const radioButton = document.getElementById("ulb" + ulb.ulb);
        if (!radioButton) return;
        radioButton["checked"] = false;
        return;
      }
    }
    if (indexFound == -1) {
      this.baseULB = ulb;
      oldULBS.push(ulb);
      this.ulbSelectedMapping = {};
      this.ulbSelectedMapping[ulb.ulb] = ulb;
    }
    this.showULBsForComparision = false;
    this.filterForm.controls.ulbList.setValue([ulb]);

    this.filterForm.controls.ulbList.updateValueAndValidity();
    this.onClosingULBSelection();
    this.baseUlbSearchControl.setValue("");
    this.updateFinancialYearSelection(true);
    this.initializeULBListForComparision();
  }

  private resetFinancialYearSelection() {
    this.allFinancialYears.forEach((year) => {
      year.isSelectable = false;
      year.selected = false;
    });
  }

  private updateFinancialYearSelection(reInitialize = false) {
    let preSelectedYears: string[];
    if (reInitialize) {
      this.allFinancialYears.forEach((year) => {
        year.isSelectable = this.baseULB?.financialYear?.includes(year?.value);
        year.selected = false;
      });
    }

    this.allFinancialYears = this.allFinancialYears.sort((yearA, yearB) => {
      if (
        (yearA.isSelectable && yearB.isSelectable) ||
        (!yearA.isSelectable && !yearB.isSelectable)
      ) {
        return +yearA.value - +yearB.value;
      }

      if (yearA.isSelectable) return -1;
      return 1;
    });

    preSelectedYears = this.allFinancialYears
      .filter((year) => year.isSelectable && year.selected)
      .map((year) => year.value);

    this.filterForm.controls.years.setValue(preSelectedYears);
  }

  preventEventProp(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }

  selectULB(
    ulb: IBasicLedgerData["data"][0]["ulbList"][0],
    removeIfFound = false,
    stateId?: string
  ) {
    if (!ulb.financialYear) return;
    if (ulb.ulb === this.baseULB?.ulb) return;
    if (stateId) {
      this.onULBClick(stateId, { type: ulb.ulbType }, (ulb as any) as IULB);
    }

    const oldULBS: IBasicLedgerData["data"][0]["ulbList"] = this.filterForm
      .controls.ulbList.value;
    const indexFound = oldULBS.findIndex((oldulb) => oldulb.ulb === ulb.ulb);
    this.ulbSearchControl.setValue("");

    /**
     * When user the typed in search box and select a ulb,
     * we need to unfocus the auto-complete input to show new
     * lists.
     */
    (document.activeElement as HTMLElement).blur();
    if (indexFound > -1) {
      if (removeIfFound) {
        oldULBS.splice(indexFound, 1);
        this.ulbSelectedMapping[ulb.ulb] = null;
      } else {
        this.formInvalidMessage = `${oldULBS[indexFound].name} is already selected.`;
        setTimeout(() => {
          this.formInvalidMessage = null;
          this.changeDetector.detectChanges();
        }, 3000);
        return;
      }
    }
    if (indexFound == -1) {
      oldULBS.push(ulb);
      this.ulbSelectedMapping[ulb.ulb] = ulb;
    }
    this.filterForm.controls.ulbList.setValue(oldULBS);
    this.filterForm.controls.ulbList.updateValueAndValidity();
    this.onClosingULBSelection();
    this.changeDetector.detectChanges();
  }

  private reInitializeULBMapping() {
    const { ulbList }: { ulbList: LedgerULB[] } = this.filterForm.value;
    this.ulbSelectedMapping = {};
    this.StateULBTypeMapping = {};
    ulbList.forEach((ulb) => {
      this.ulbSelectedMapping[ulb.ulb] = ulb;
      this.onULBClick(ulb.stateId, { type: ulb.ulbType }, (ulb as any) as IULB);
    });
  }

  resetPage() {
    this.initializeFilterForm();
    this.shiftFormToLeft = false;
    this.showReport = false;
    this.commonYears = null;
    this.formInvalidMessage = null;
    this.baseULB = null;
    this.StateULBTypeMapping = {};

    this.showULBsForComparision = false;
    this.ulbSelectedMapping = {};

    this.resetFinancialYearSelection();

    setTimeout(() => {
      this.calculateArrowVisibility();
    }, 0);
  }

  onClosingULBSelection() {
    this.commonYears = [];
    const ulbs: IBasicLedgerData["data"][0]["ulbList"] = this.filterForm
      .controls.ulbList.value;

    if (!ulbs || !ulbs.length) {
      this.filterForm.controls.years.reset();
      return;
    }
    this.filterForm.controls.ulbIds.setValue(ulbs.map((ulb) => ulb.ulb));
    if (!this.shiftFormToLeft) return;

    setTimeout(() => this.calculateArrowVisibility(), 0);
  }

  calculateArrowVisibility() {
    const elements = document.getElementsByClassName("year");
    if (!elements) {
      this.showArrow = false;
      return;
    }
    let widthOfAllYear = 0;
    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      widthOfAllYear += element.clientWidth;
    }
    const container = document.getElementById("years-container");
    this.showArrow = widthOfAllYear > container?.clientWidth;
  }

  createYearControls(
    ulbs: IBasicLedgerData["data"][0]["ulbList"],
    keepPreviousValues = false
  ) {
    const ulbToCompare = ulbs[0];

    ulbToCompare.financialYear.forEach((yearToSearch) => {
      const yearExitsInAllULB = ulbs.every((ulb) =>
        ulb.financialYear.length
          ? ulb.financialYear.includes(yearToSearch)
          : true
      );

      if (yearExitsInAllULB) {
        this.commonYears.push(yearToSearch);
      }
    });
    this.yearListUpdate = true;

    return;
    const yearsSelected = this.filterForm.controls.years.value.filter(
      (year) => year
    );
    const yearControl = this.filterForm.controls.years as FormArray;

    while (yearControl.controls.length) {
      yearControl.removeAt(0);
    }

    if (!keepPreviousValues) return;

    // Set the previous selected year if present in the new year list
    yearsSelected.forEach((year, index) => {
      if (!this.commonYears.includes(year)) return;
      yearControl.at(index).setValue(year);
    });
  }

  removeSelectedULBAt(index: number) {
    const allULBs: LedgerULB[] = this.filterForm.value.ulbList;

    this.ulbSelectedMapping[allULBs[index]?.ulb] = null;
    allULBs.splice(index, 1);

    this.filterForm.controls.ulbList.updateValueAndValidity();
    this.onClosingULBSelection();
  }

  /**
   * @description Toggle year selection. Index must be from common year list.
   */
  async onClickingYear(indexOfYearSelected: number) {
    const yearClicked = this.allFinancialYears[indexOfYearSelected];
    if (!yearClicked || !yearClicked.isSelectable) {
      this.updateFinancialYearSelection();
      return;
    }
    if (this.filterForm.value.ulbList?.length > 1) {
      const message = `<p class='text-center'>By changing the Year, all ULB(s) selected for comparision will be removed. <br /> <p class="text-center">Do you want to conitue? </p></p>`;
      const shouldContainue = await this.showWarning(message, "30vw");
      if (!shouldContainue) return;
    }
    yearClicked.selected = !yearClicked.selected;
    this.updateFinancialYearSelection();
    this.initializeULBListForComparision();
    this.updatedSelectedULBs();
    this.reInitializeULBMapping();
    this.changeDetector.detectChanges();
  }

  private updatedSelectedULBs() {
    const { ulbList, years: yearsSelected } = this.filterForm.value;
    const NewList = ulbList.filter((ulb) => {
      if (ulb.ulb === this.baseULB?.ulb) return true;

      return yearsSelected?.length
        ? yearsSelected.every((year) =>
            ulb.financialYear.find((ulbYear) => ulbYear == year)
          )
        : false;
    });
    this.filterForm.controls.ulbList.setValue(NewList);
  }

  showData() {
    this.formInvalidMessage = this.validateFormError();

    if (this.formInvalidMessage) {
      setTimeout(() => (this.formInvalidMessage = null), 5000);
      return;
    }
    this.shiftFormToLeft = true;
    setTimeout(() => {
      this.showReport = true;
      this.changeDetector.detectChanges();
    }, 1000);
    const value = this.jsonUtil.deepCopy({ ...this.filterForm.value });
    value.years = value.years ? value.years.filter((year) => year) : null;
    this.reportForm.patchValue(value);

    this.search();
    setTimeout(() => {
      this.calculateArrowVisibility();
    }, 1500);
  }

  protected validateFormError() {
    let errorMessage;
    errorMessage = null;
    const ulbList = this.filterForm.value.ulbList;
    if (!ulbList || !ulbList.length) {
      errorMessage = "Atleat 1 ULB ";
    }
    const yearList = this.filterForm.value.years.filter((year) => year);
    if (!yearList || !yearList.length) {
      if (errorMessage) {
        errorMessage += "and 1 Year must be selected";
      } else {
        errorMessage = "Atleast 1 Year must be selected ";
      }
    }
    this.filterForm.controls.yearList.setValue(
      yearList.map((year) => ({ id: year, itemName: year }))
    );
    return errorMessage;
  }

  ngOnDestroy() {}
}
