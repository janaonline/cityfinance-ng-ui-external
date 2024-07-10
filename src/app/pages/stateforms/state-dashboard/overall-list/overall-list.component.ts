import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OverallListService } from './overall-list.service'
import { UlbadminServiceService } from '../../../ulb-admin/ulbadmin-service.service';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as fileSaver from "file-saver";
import { StateDashboardService } from '../state-dashboard.service'
import { USER_TYPE } from 'src/app/models/user/userType';
import { UserUtility } from 'src/app/util/user/user';
@Component({
  selector: 'app-overall-list',
  templateUrl: './overall-list.component.html',
  styleUrls: ['./overall-list.component.scss']
})
export class OverallListComponent implements OnInit {

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
    skip: 0,
    csv: false,
    // limit: this.tableDefaultOptions.itemPerPage,
  };
  loading = false;
  filterObject;
  fcFormListSubscription: Subscription;
  nodataFound = false;
  errMessage = '';
  showLoader = true;
  constructor(
    private overallListService: OverallListService,
    public ulbService: UlbadminServiceService,
    public stateDashboardService: StateDashboardService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ulb_name_s = new FormControl('');
  state_name = new FormControl('');
  ulb_code_s = new FormControl('');
  ulb_type_s = new FormControl('');
  population_type_s = new FormControl('');
  ua_name_s = new FormControl('');
  status_s = new FormControl('');
  status_audited = new FormControl('');
  status_unaudited = new FormControl('');
  status_util = new FormControl('');
  status_slbMillion = new FormControl('');
  status_slbNonMillion = new FormControl('');
  states = null;

  closeDialog() {
    this.stateDashboardService.closeDialog.next('overall')

  }
  ngOnInit() {
    console.log(this.data)
    this.states = JSON.parse(sessionStorage.getItem("statesData"))
    this.loadData();
  }
  loadData() {
    this.overallListService.getData(this.data.state_id)
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

  setLIstFetchOptions() {
    console.log(this.status_s.value)
    let overall_statusCode,
      audited_statusCode,
      unaudited_statusCode,
      util_statusCode,
      slbMillion_statusCode,
      slbNonMillion_statusCode;

    if (this.status_s.value) {

      if (this.status_s.value == "Not Started") {
        overall_statusCode = 1;
      } else if (this.status_s.value == "In Progess") {
        overall_statusCode = 2;
      }
      // else if (this.status_s.value == "Completed but not Submitted") {
      //   overall_statusCode = 3;
      // }
      else if (this.status_s.value == "Under Review by State") {
        overall_statusCode = 4;
      } else if (this.status_s.value == "Approved By State") {
        overall_statusCode = 5;
      } else if (this.status_s.value == "Approval Completed") {
        overall_statusCode = 6;
      } else if (this.status_s.value == "Rejected by State") {
        overall_statusCode = 7;
      } else if (this.status_s.value == "Rejected by MoHUA") {
        overall_statusCode = 8;
      }
    }

    if (this.status_audited.value) {
      if (this.status_audited.value == "Not Started") {
        audited_statusCode = 13;
      } else if (this.status_audited.value == "In Progess") {
        audited_statusCode = 14;
      } else if (this.status_audited.value == "Accounts Not Submitted") {
        audited_statusCode = 15;
      } else if (this.status_audited.value == "Accounts Submitted") {
        audited_statusCode = 16;
      }
    }
    if (this.status_unaudited.value) {
      if (this.status_unaudited.value == "Not Started") {
        unaudited_statusCode = 17;
      } else if (this.status_unaudited.value == "In Progess") {
        unaudited_statusCode = 18;
      } else if (this.status_unaudited.value == "Accounts Not Submitted") {
        unaudited_statusCode = 19;
      } else if (this.status_unaudited.value == "Accounts Submitted") {
        unaudited_statusCode = 20;
      }
    }
    if (this.status_util) {
      if (this.status_util.value == "Not Started") {
        util_statusCode = 21;
      } else if (this.status_util.value == "In Progess") {
        util_statusCode = 22;
      } else if (this.status_util.value == "Completed") {
        util_statusCode = 23;
      }
    }
    if (this.status_slbMillion) {
      if (this.status_slbMillion.value == "Not Started") {
        slbMillion_statusCode = 32;
      } else if (this.status_slbMillion.value == "In Progess") {
        slbMillion_statusCode = 33;
      } else if (this.status_slbMillion.value == "Completed") {
        slbMillion_statusCode = 34;
      } else if (this.status_slbMillion.value == "Not Applicable") {
        slbMillion_statusCode = 35;
      }
    }
    if (this.status_slbNonMillion) {
      if (this.status_slbNonMillion.value == "Not Started") {
        slbNonMillion_statusCode = 36;
      } else if (this.status_slbNonMillion.value == "In Progess") {
        slbNonMillion_statusCode = 37;
      } else if (this.status_slbNonMillion.value == "Completed") {
        slbNonMillion_statusCode = 38;
      } else if (this.status_slbNonMillion.value == "Not Applicable") {
        slbNonMillion_statusCode = 39;
      }
    }
    //  const filterKeys = ["financialYear", "auditStatus"];
    this.filterObject = {
      filter: {
        state: this.state_name.value
          ? this.state_name.value
          : '',
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
        status: overall_statusCode
          ? overall_statusCode
          : "",
        auditedStatus: audited_statusCode
          ? audited_statusCode
          : "",
        unauditedStatus: unaudited_statusCode
          ? unaudited_statusCode
          : "",
        utilStatus: util_statusCode
          ? util_statusCode
          : "",
        slbMillionStatus: slbMillion_statusCode
          ? slbMillion_statusCode
          : "",
        slbNonMillionStatus: slbNonMillion_statusCode
          ? slbNonMillion_statusCode
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
    this.fcFormListSubscription = this.ulbService.fetchAllFormStatusList({ skip }, this.listFetchOption, null, this.data.state_id)
      .subscribe(
        (result: any) => {
          console.log(result)
          if (this.listFetchOption.csv) {
            let blob: any = new Blob([result], {
              type: "text/json; charset=utf-8",
            });
            const url = window.URL.createObjectURL(blob);
            fileSaver.saveAs(blob, "Overall Form Status List.xlsx");
          } else {
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
        (err) => {

        }

      );


  }

  viewUlbForm(resData) {
    console.log('review', resData);
    sessionStorage.setItem('ulb_id', resData?.ulb)
    sessionStorage.setItem('isMillionPlus', resData.isMillionPlus);
    sessionStorage.setItem('isUA', resData.isUA);
    sessionStorage.setItem('stateName', resData.state);
    sessionStorage.setItem('ulbName', resData.ulbName);
  }
  setPage(pageNoClick: number) {
    this.tableDefaultOptions.currentPage = pageNoClick;
    this.listFetchOption.skip =
      (pageNoClick - 1) * this.tableDefaultOptions.itemPerPage;
    // this.searchUsersBy(this.filterForm.value);
  }

}







