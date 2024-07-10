import { Component, ElementRef, NgZone, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IUserLoggedInDetails } from 'src/app/models/login/userLoggedInDetails';
import { BaseComponent } from 'src/app/util/BaseComponent/base_component';
import { Login_Logout } from 'src/app/util/logout.util';
import { UserUtility } from 'src/app/util/user/user';

import { ACTIONS } from '../../../../app/util/access/actions';
import { MODULES_NAME } from '../../../../app/util/access/modules';
import { AuthService } from '../../../auth/auth.service';
import { USER_TYPE } from '../../../models/user/userType';
import { AccessChecker } from '../../../util/access/accessChecker';
import { AnalyticsTabs, IAnalyticsTabs } from './tabs';

@Component({
  selector: "app-home-header",
  templateUrl: "./home-header.component.html",
  styleUrls: ["./home-header.component.scss"],
})
export class HomeHeaderComponent extends BaseComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private _elementRef: ElementRef,
    private renderer: Renderer2,
    private _ngZone: NgZone
  ) {
    super();
    Object.values(AnalyticsTabs).forEach((tab) => {
      this.tabs.push(tab);
    });
    this.initializeAccessChecking();
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAnalyticsPageActive = event.url.includes(`analytics`);

        if (event.url.includes(`/borrowings/credit-rating`)) {
          this.isCreditRatingActive = true;
          this.isMunicipalBondActive = false;
          this.isResourceTabActive = false;
          this.isFcGrantPageActive = false;
          this.isQuestionnaireActive = false;
        } else if (event.url.includes(`municipal-bond`)) {
          this.isMunicipalBondActive = true;
          this.isResourceTabActive = false;
          this.isFcGrantPageActive = false;
          this.isQuestionnaireActive = false;

          this.isCreditRatingActive = false;
        } else if (event.url.includes(`resources`)) {
          this.isResourceTabActive = true;
          this.isFcGrantPageActive = false;
          this.isCreditRatingActive = false;
          this.isMunicipalBondActive = false;
          this.isQuestionnaireActive = false;
        } else if (event.url.includes(`data-upload`)) {
          this.isFcGrantPageActive = true;
          this.isCreditRatingActive = false;
          this.isMunicipalBondActive = false;
          this.isResourceTabActive = false;
          this.isQuestionnaireActive = false;
        } else if (event.url.includes(`questionnaires`)) {
          this.isQuestionnaireActive = true;
          this.isFcGrantPageActive = false;
          this.isCreditRatingActive = false;
          this.isMunicipalBondActive = false;
          this.isResourceTabActive = false;
        } else {
          this.isFcGrantPageActive = false;
          this.isCreditRatingActive = false;
          this.isMunicipalBondActive = false;
          this.isResourceTabActive = false;
          this.isQuestionnaireActive = false;
        }
      }
      this.isLoggedIn = this.authService.loggedIn();
      this.user = this.isLoggedIn ? this.user : null;

      this.initializeAccessChecking();

      if (this.isLoggedIn) {
        UserUtility.getUserLoggedInData().subscribe((value) => {
          this.user = value;
        });
      }
    });
  }
  isProduction: boolean;

  userUtil = new UserUtility();
  showAnalyticsSubMenu = !this.userUtil.isUserOnMobile();

  isLoggedIn = false;
  user: IUserLoggedInDetails = null;

  canViewUploadData = false;
  canViewULBSingUpListing = false;
  canViewUserList = false;
  canViewStateList = false;
  canViewPartnerList = false;
  canViewMoHUAList = false;
  canEditOwnProfile = false;

  canViewQuestionnaireForm = false;
  canViewQuestionnaireList = false;

  tabs: IAnalyticsTabs[] = [];

  USER_TYPE = USER_TYPE;

  isMunicipalBondActive = false;
  isCreditRatingActive = false;
  isResourceTabActive = false;
  isFcGrantPageActive = false;
  isQuestionnaireActive = false;
  private accessChecker = new AccessChecker();

  isAnalyticsPageActive = false;

  canViewFcGRantModule = false;

  private initializeAccessChecking() {
    this.canViewUploadData = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.ULB_DATA_UPLOAD,
      action: ACTIONS.VIEW,
    });

    this.canEditOwnProfile = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.SELF_PROFILE,
      action: ACTIONS.EDIT,
    });

    this.canViewMoHUAList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.MoHUA,
      action: ACTIONS.VIEW,
    });

    this.canViewPartnerList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.PARTNER,
      action: ACTIONS.VIEW,
    });

    this.canViewStateList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.STATE,
      action: ACTIONS.VIEW,
    });

    this.canViewULBSingUpListing = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.ULB_SIGNUP_REQUEST,
      action: ACTIONS.VIEW,
    });

    this.canViewUserList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.USERLIST,
      action: ACTIONS.VIEW,
    });

    this.canViewQuestionnaireList = this.accessChecker.hasAccess({
      moduleName: MODULES_NAME.PROPERTY_TAX_QUESTIONNAIRE_LIST,
      action: ACTIONS.VIEW,
    });

    this.canViewQuestionnaireForm =
      this.accessChecker.hasAccess({
        moduleName: MODULES_NAME.STATE_PROPERTY_TAX_QUESTIONNAIRE,
        action: ACTIONS.VIEW,
      }) ||
      this.accessChecker.hasAccess({
        moduleName: MODULES_NAME.ULB_LEVEL_PROPERTY_TAX_QUESTIONNAIRE,
        action: ACTIONS.VIEW,
      });

    if (this.userUtil.getUserType() === USER_TYPE.USER) {
      this.canViewFcGRantModule = false;
    } else {
      this.canViewFcGRantModule = true;
    }
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.loggedIn();
    this.initializedIsProduction();
    this.setTopRowSticky();
    Login_Logout.getListenToLogoutEvent().subscribe((res) => {
      console.log("res", res);
      localStorage.clear();
      this.removeSessionItem()
      this.isLoggedIn = false;
      if (res && res.redirectLink) {
        this.router.navigate([`${res.redirectLink || "/"}`]);
      }
    });
  }

  removeSessionItem(){
    let postLoginNavigation = sessionStorage.getItem("postLoginNavigation"),
    sessionID = sessionStorage.getItem("sessionID")
    sessionStorage.clear()
    sessionStorage.setItem("sessionID",sessionID);
    if(postLoginNavigation) sessionStorage.setItem("postLoginNavigation",postLoginNavigation)
  }

  onClickingNavbarDropdown() {
    const element = document.getElementById("analyticsDropdown");
    if (!element) return;
    if (!this.isAnalyticsPageActive) return;
    setTimeout(() => {
      element.classList.add("open");
    }, 0);
  }

  navigateToAnalytics() {
    this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
    if (this.userUtil.isUserOnMobile()) return;
    this.router.navigate(["analytics/own-revenues"]);
  }

  // navigateToHome() {
  //   // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  //  //  if (this.userUtil.isUserOnMobile()) return;
  //  let element = document.getElementById("navbarNavDropdown");
  //  element.classList.remove("in");
  //    this.router.navigate(["/home"]);
  //  }

  // navigateToFinancial() {
  //  // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  // //  if (this.userUtil.isUserOnMobile()) return;
  // let element = document.getElementById("navbarNavDropdown");
  // element.classList.remove("in");
  //   this.router.navigate(["/financial-statement/report"]);
  // }

  // navigateToMunicipalLaw() {
  //   // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  //  //  if (this.userUtil.isUserOnMobile()) return;
  //  let element = document.getElementById("navbarNavDropdown");
  //  element.classList.remove("in");
  //    this.router.navigate(["/municipal-law"]);
  //  }

  //  navigateToMunicipalBond() {
  //   // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  //  //  if (this.userUtil.isUserOnMobile()) return;
  //  let element = document.getElementById("navbarNavDropdown");
  //  element.classList.remove("in");
  //    this.router.navigate(["/borrowings/municipal-bond"]);
  //  }
  //  navigateToCreditRating() {
  //   // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  //  //  if (this.userUtil.isUserOnMobile()) return;
  //  let element = document.getElementById("navbarNavDropdown");
  //  element.classList.remove("in");
  //    this.router.navigate(["/borrowings/credit-rating"]);
  //  }

  //  navigateToResources() {
  //   // this.showAnalyticsSubMenu = !this.showAnalyticsSubMenu;
  //  //  if (this.userUtil.isUserOnMobile()) return;
  //  let element = document.getElementById("navbarNavDropdown");
  //  element.classList.remove("in");
  //    this.router.navigate(["/files"]);
  //  }

  /**
   * @description Closed sidebar menu on mobile.
   */
  closeSidebarMenu() {
    const element = document.getElementById("navbarNavDropdown");
    if (element) element.classList.remove("in");
  }

  onClickingAnalyticsSubMenu(event: Event) {
    if (!this.userUtil.isUserOnMobile()) return;
    event.stopPropagation();
    const element = document.getElementById("navbarNavDropdown");
    element.classList.remove("in");
  }

  closeNavbar(event) {
    const el = event.path[0].classList.value == "dropdown-toggle";
    const element = document.getElementById("navbarNavDropdown");
    if (!el && element) {
      element.classList.remove("in");
    }
  }

  initializedIsProduction() {
    this.isProduction = !(
      window.location.hostname.includes("demo") ||
      window.location.hostname.includes("staging") ||
      window.location.hostname.includes("localhost")
    );
  }

  goToReportPage() {
    if (!window.location.pathname.includes("/financial-statement/report")) {
      this.router.navigate(["/financial-statement", "report"]);
    }
  }

  logout() {
    Login_Logout.logout({ redirectLink: "/" });
  }

  /**
   * @description Why are we setting sticky position explicity here using js/ts and not just by using
   * css?. It is so because we need to set sticky only 2nd row of navbar, and by just setting position
   * sticky to 2nd row wont work as this element <code> HomeHeaderComponent </code> gets out of view after
   * scroll. So we need to manually set the sticky position on HomeHeaderComponent. This can be done from
   * its parent component also, but it would be better to keep this functionality here only as it is its part,
   * and not the parent's component part.
   */
  private setTopRowSticky() {
    const element = document.getElementById("1stNavbarRow");
    if (!element) {
      return;
    }
    const topPosition = -element.offsetHeight + "px";
    this.renderer.setStyle(this._elementRef.nativeElement, "top", topPosition);
  }

  private initializeTranparenceyHandler() {
    this._ngZone.runOutsideAngular(() => {
      const root = document.getElementsByTagName("body")[0];
      const options: IntersectionObserverInit = {
        root: null,
        rootMargin: "0px",
        threshold: [0, 0.1, 0.2, 0.25, 0.4, 0.75, 1],
      };
      const observer = new IntersectionObserver((event) => {}, options);
      const target = document.getElementById("carousel");
      observer.observe(target);
    });
  }
}
