import { Component, OnInit, Inject } from '@angular/core';
import { UtilreportListService } from './utilreport-list.service'
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { UlbadminServiceService } from '../../../ulb-admin/ulbadmin-service.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as fileSaver from "file-saver";
import { StateDashboardService } from '../state-dashboard.service'
import { USER_TYPE } from 'src/app/models/user/userType';
import { UserUtility } from 'src/app/util/user/user';
@Component({
  selector: 'app-utilreport-list',
  templateUrl: './utilreport-list.component.html',
  styleUrls: ['./utilreport-list.component.scss']
})
export class UtilreportListComponent implements OnInit {
  loggedInUserDetails = new UserUtility().getLoggedInUserDetails();
  USER_TYPE = USER_TYPE;
  loggedInUserType = this.loggedInUserDetails.role;
  tabelData: any;
  currentSort = 1;
  tableDefaultOptions = {
    itemPerPage: 10,
    currentPage: 1,
    totalCount: null,
  };
  listFetchOption = {
    filter: null,
    sort: null,
    role: null,
    csv: false,
    skip: 0,
    // limit: this.tableDefaultOptions.itemPerPage,
  };
  loading = false;
  filterObject;
  fcFormListSubscription: Subscription;
  nodataFound = false;
  errMessage = '';
  showLoader = true;
  constructor(
    private utilreportListService: UtilreportListService,
    public ulbService: UlbadminServiceService,
    public stateDashboardService: StateDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  states = null
  closeDialog() {
    this.stateDashboardService.closeDialog.next('overall')
  }
  ngOnInit(): void {
    this.states = JSON.parse(sessionStorage.getItem("statesData"))
    this.utilreportListService.getData(this.data.state_id)
      .subscribe((res) => {

        let resData: any = res
        this.tabelData = resData.data;
        console.log('tabelData', this.tabelData)
        this.showLoader = false;
      },
        error => {
          this.errMessage = error.message;
          console.log(error, this.errMessage);
          this.showLoader = false;
        }
      )
  }
  setPage(pageNoClick: number) {
    this.tableDefaultOptions.currentPage = pageNoClick;
    this.listFetchOption.skip =
      (pageNoClick - 1) * this.tableDefaultOptions.itemPerPage;
    // this.searchUsersBy(this.filterForm.value);
  }
  ulb_name_s = new FormControl('');
  state_name = new FormControl('');
  ulb_code_s = new FormControl('');
  ulb_type_s = new FormControl('');
  population_type_s = new FormControl('');
  ua_name_s = new FormControl('');
  status_util = new FormControl('');

  setLIstFetchOptions() {

    let util_statusCode;



    if (this.status_util) {
      if (this.status_util.value == "Not Started") {
        util_statusCode = 21;
      } else if (this.status_util.value == "In Progess") {
        util_statusCode = 22;
      } else if (this.status_util.value == "Completed") {
        util_statusCode = 23;
      }
    }

    //  const filterKeys = ["financialYear", "auditStatus"];
    this.filterObject = {
      filter: {
        state: this.state_name.value
          ? this.state_name.value
          : "",
        ulbType: this.ulb_type_s.value
          ? this.ulb_type_s.value.trim()
          : "",
        populationType: this.population_type_s.value
          ? this.population_type_s.value.trim()
          : "",
        ulbName: this.ulb_name_s.value
          ? this.ulb_name_s.value.trim()
          : "",
        censusCode: this.ulb_code_s.value
          ? this.ulb_code_s.value.trim()
          : "",
        UA: this.ua_name_s.value
          ? this.ua_name_s.value.trim()
          : "",
        utilStatus: util_statusCode
          ? util_statusCode
          : "",

      }

    }

    return {
      ...this.listFetchOption,
      ...this.filterObject,
      //  ...config,
    };

  }
  stateData(csv) {
    this.loading = true;
    this.listFetchOption.skip = 0;
    this.tableDefaultOptions.currentPage = 1;
    this.listFetchOption = this.setLIstFetchOptions();
    const { skip } = this.listFetchOption;
    if (this.fcFormListSubscription) {
      this.fcFormListSubscription.unsubscribe();
    }
    this.listFetchOption.csv = csv
    this.fcFormListSubscription = this.ulbService
      .fetchAllFormStatusList({ skip }, this.listFetchOption, 'utilReport', this.data.state_id)
      .subscribe(
        (result: any) => {
          if (this.listFetchOption.csv) {
            let blob: any = new Blob([result], {
              type: "text/json; charset=utf-8",
            });
            const url = window.URL.createObjectURL(blob);
            fileSaver.saveAs(blob, "Utilisation Report Status List.xlsx");
          }
          else {
            let res: any = result;
            this.tabelData = res.data;
            if (res.data.length == 0) {
              this.nodataFound = true;
            } else {
              this.nodataFound = false;
            }
            console.log(result);
          }


        },
        (response: HttpErrorResponse) => {
          this.loading = false;
          alert('Some Error Occurred')

        }
      );


  }
}
