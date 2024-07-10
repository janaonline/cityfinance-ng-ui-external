import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, Input, OnChanges, OnInit, TemplateRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { IUserLoggedInDetails } from 'src/app/models/login/userLoggedInDetails';
import { USER_TYPE } from 'src/app/models/user/userType';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { IDialogConfiguration } from 'src/app/shared/components/dialog/models/dialogConfiguration';
import { AccessChecker } from 'src/app/util/access/accessChecker';
import { ACTIONS } from 'src/app/util/access/actions';
import { MODULES_NAME } from 'src/app/util/access/modules';
import { ULBSIGNUPSTATUS } from 'src/app/util/enums';
import { JSONUtility } from 'src/app/util/jsonUtil';
import { Login_Logout } from 'src/app/util/logout.util';
import { UserUtility } from 'src/app/util/user/user';

import { ulbType } from '../../../../dashboard/report/report/ulbTypes';
import { FormUtil } from '../../../../util/formUtil';
import { SidebarUtil } from '../../../../users/utils/sidebar.util';
import { IULBProfileData } from '../../../../users/profile/model/ulb-profile';
import { ProfileService } from '../../../../users/profile/service/profile.service';
import { EditServicesService } from '../edit-services.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit, OnChanges {
  constructor(
    private _profileService: ProfileService,
    public modalService: BsModalService,
    public dialogBox: MatDialog,
    private router: Router,
    private editService : EditServicesService,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) {
    this.fetchDatas();
    SidebarUtil.showSidebar();
  }
  @Input() profileData: IULBProfileData;
  @Input() editable = true;

  profile: FormGroup;
  SignupRejectReason = new FormControl("", [Validators.required]);
  formUtil = new FormUtil();
  jsonUtil = new JSONUtility();

  typesOfULB = ulbType;

  ulbTypeList: any[];

  formSubmitted = false;

  formErrorMessage: string[];
  respone = { successMessage: null, errorMessage: null };
  canSubmitForm = false;
  loggedInUserType: USER_TYPE;
  USER_TYPE = USER_TYPE;
  window = window;
  SIGNUP_STATUS = ULBSIGNUPSTATUS;

  apiInProgress = false;

  userUtil = new UserUtility();

  ngOnChanges(changes) {}

  fetchDatas() {
    this._profileService.getULBTypeList().subscribe((res) => {
      this.ulbTypeList = res["data"];
      console.log('fetchdatas', this.ulbTypeList)
    });
  }


  ngOnInit() {
    console.log('view', this.data);
   this.editService.editProfie(this.data._id).subscribe((res) => {
   console.log('editRes',res);
   let dataObj:any = res;
   this.profileData = dataObj.data;
   this.initializeAccess();
    this.initializeForm();
    this.initializeLogginUserType();

  })
 // if()
  }
  close() {
    this.dialogBox.closeAll();
   // this.window.location.reload();
  }

  onClickingChangePassword(event: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const defaultDailogConfiuration: IDialogConfiguration = {
      message:
        "<div class='text-center'>You will be logged out for changing password. <br>Are you sure you want to continue?</div>",
      buttons: {
        confirm: {
          text: "Yes",
          callback: () => {
            this._profileService.getTokenToChangePassword().subscribe((res) => {
              Login_Logout.logout();
              this.router.navigate(["/password/request"], {
                queryParams: { token: res["token"] },
              });
            });
          },
        },
        cancel: { text: "No" },
      },
    };

    this.dialogBox.open(DialogComponent, {
      data: defaultDailogConfiuration,
    });
  }
  submitForm(form: FormGroup) {
    if (!this.canSubmitForm) {
      return;
    }

    this.resetResponseMessage();

    this.formSubmitted = true;

    const errors = this.checkFieldsForError(form);
    this.formErrorMessage = errors;

    if (errors) {
      console.error(`errors`, errors);
      return;
    }

    // upload files and their value
    const updatedFields = this.getUpdatedFieldsOnly(form);

    if (!updatedFields || !Object.keys(updatedFields).length) {
      this.onUpdatingProfileSuccess({
        message: "Profile Updated Successfully",
      });
      this.profile.disable({ onlySelf: true, emitEvent: false });

      return;
    }

    const flatten = this.jsonUtil.convertToFlatJSON(updatedFields);
    if (flatten["_id"]) {
      flatten["ulbType"] = flatten["_id"];
      delete flatten["_id"];
    }
    if (this.loggedInUserType !== USER_TYPE.ULB) {
      flatten["ulb"] = this.profileData.ulb._id;
    }

    this.profile.disable({ onlySelf: true, emitEvent: false });
    this.respone.successMessage = "Updating....";
    this.apiInProgress = true;

    this._profileService.createULBUpdateRequest(flatten).subscribe(
      (res) => this.onUpdatingProfileSuccess(res, flatten as IULBProfileData),
      (err) => this.onUpdatingProfileError(err)
    );
  }

  updateFormStatus(status: {
    status: IULBProfileData["status"];
    _id: string;
    rejectReason?: string;
  }) {
    this.resetResponseMessage();

    this._profileService.updateULBSingUPStatus(status).subscribe(
      (res) => {
        if (status.rejectReason) {
          this.profileData.rejectReason = status.rejectReason;
        }
        this.profileData.status = status.status;
        this.respone.successMessage = "ULB Singup updated successfully.";
        this.canSubmitForm = status.status === "REJECTED" ? false : true;
        this.dialogBox.closeAll();
      },
      (err) => {
        this.respone.errorMessage = err.error.message || "Server Error";
      }
    );
  }

  enableProfileEdit() {
    this.profile.enable();
    this.resetResponseMessage();
    this.disableNonEditableFields(false);
  }
  disableProfileEdit() {
    this.profile.disable({ emitEvent: false });
    this.disableNonEditableFields();
  }

  openSignupRejectPopup(templateRef: TemplateRef<any>) {
    this.dialogBox.open(templateRef, {
      height: "fit-content",
      width: "28vw",
    });
  }

  closeSignupRejectPopup(templateRef: TemplateRef<any>) {
    this.modalService.hide(1);
  }

  private onUpdatingProfileSuccess(res, dataUpdated?: IULBProfileData) {
    this.respone.successMessage = res.message || "Profile Updated Successfully";
    this.apiInProgress = false;
    this.updateLocalLoggedInData(dataUpdated);
  }

  private updateLocalLoggedInData(dataUpdated: IULBProfileData) {
    if (this.userUtil.getUserType() !== USER_TYPE.ULB) return;
    let newData: Partial<IUserLoggedInDetails>;
    if (dataUpdated.accountantEmail) {
      newData = { email: dataUpdated.accountantEmail };
    }

    if (dataUpdated.name) {
      if (!newData) newData = {};
      newData.name = dataUpdated.name;
    }

    if (!newData) return;
    this.userUtil.updateUserDataInRealTime(newData);
  }

  private onUpdatingProfileError(err: HttpErrorResponse) {
    this.respone.errorMessage =
      err.error.message || "Failed to updated profile.";
    this.apiInProgress = false;
    this.respone.successMessage = null;
  }

  private resetResponseMessage() {
    this.respone.successMessage = null;
    this.respone.errorMessage = null;
  }

  private checkFieldsForError(form: FormGroup) {
    return new FormUtil().validationULBProfileUpdateForm(form);
  }

  private getUpdatedFieldsOnly(form: FormGroup): {} | null {
    let updateObject: { [key: string]: any };
    Object.keys(form.controls).forEach((controlName) => {
      const control = form.controls[controlName];
      if (!control.dirty) {
        return;
      }
      if (control instanceof FormGroup) {
        const nestedValue = this.getUpdatedFieldsOnly(control);

        if (nestedValue && Object.keys(nestedValue).length) {
          if (updateObject) {
            updateObject[controlName] = nestedValue;
          } else {
            updateObject = { [controlName]: nestedValue };
          }
        }
        return;
      }

      if (updateObject) {
        updateObject[controlName] = control.value;
      } else {
        updateObject = { [controlName]: control.value };
      }
    });
    return updateObject;
  }

  private initializeForm() {
    this.profile = this.formUtil.getULBForm("EDIT");
    if (this.profileData) {
      this.profile.patchValue({
        ...{ ...this.profileData },
        name: this.profileData.ulb.name,
        state: this.profileData.ulb.state.name,
      });
      console.log('profile form...', this.profileData);
      console.log('profile form...', this.profile);
      if (this.profileData.status !== "APPROVED") {
        this.canSubmitForm = false;
      } else {
        this.initializeAccess();
      }
      if (
        !this.editable ||
        this.profileData.status !== this.SIGNUP_STATUS.APPROVED
      ) {
        this.profile.disable({ emitEvent: false, onlySelf: true });
      }

      this.disableNonEditableFields(this.editable);
    }
  }

  private initializeAccess() {
    const accessCheck = new AccessChecker();
    this.canSubmitForm = accessCheck.hasAccess({
      action: ACTIONS.EDIT,
      moduleName: MODULES_NAME.ULB,
    });
  }

  private initializeLogginUserType() {
    this.loggedInUserType = this._profileService.getLoggedInUserType();
  }

  /**
   * @description The Following fields cannot be changed, therefore they should stay
   * disabled. If loggedIn User is ULB or all = true, then disable all fields.
   *
   */
  private disableNonEditableFields(all = true) {
    this.profile.controls.state.disable();

    if (this.loggedInUserType === USER_TYPE.ULB || this.loggedInUserType === USER_TYPE.STATE ||  all) {
      (<FormGroup>this.profile.controls.ulb).controls.censusCode.disable();
      (<FormGroup>this.profile.controls.ulb).controls.ulbType.disable();
      (<FormGroup>this.profile.controls.ulb).controls.sbCode.disable();
      (<FormGroup>this.profile.controls.ulb).controls.name.disable();
      (<FormGroup>this.profile.controls.ulb).controls.wards.disable();
      (<FormGroup>this.profile.controls.ulb).controls.area.disable();
      (<FormGroup>this.profile.controls.ulb).controls.population.disable();
      return;
    }
  }
}



