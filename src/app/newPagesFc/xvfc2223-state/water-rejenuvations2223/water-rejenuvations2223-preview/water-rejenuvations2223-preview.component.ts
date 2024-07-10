import {
  Component,
  OnInit,
  Inject,
  Input,
  ElementRef,
  ViewChild,
  TemplateRef,
  OnDestroy,
} from "@angular/core";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from "@angular/material/dialog";
import { DialogComponent } from "src/app/shared/components/dialog/dialog.component";
import { Router, Event } from "@angular/router";
import { SweetAlert } from "sweetalert/typings/core";
const swal: SweetAlert = require("sweetalert");
import { QuestionnaireService } from "src/app/pages/questionnaires/service/questionnaire.service";
import { USER_TYPE } from "src/app/models/user/userType";
import { UserUtility } from "src/app/util/user/user";
import { StateformsService } from "src/app/pages/stateforms/stateforms.service";
import { WaterRejenuvations2223ServiceService } from "../water-rejenuvations2223-service.service";
import { defaultDailogConfiuration } from "src/app/pages/questionnaires/state/configs/common.config";
import { environment } from "src/environments/environment";

@Component({
  selector: 'app-water-rejenuvations2223-preview',
  templateUrl: './water-rejenuvations2223-preview.component.html',
  styleUrls: ['./water-rejenuvations2223-preview.component.scss']
})
export class WaterRejenuvations2223PreviewComponent implements OnInit, OnDestroy {

  @Input() parentData: any;
  @Input()
  changeFromOutSide: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _matDialog: MatDialog,
    public _router: Router,
    private _questionnaireService: QuestionnaireService,
    public waterRejenuvationService: WaterRejenuvations2223ServiceService,
    public state_service : StateformsService,
  ) {}

  styleForPDF = `<style>
  :root {
    font-size: 14px;
  }
  .header-p {
    background-color: #047474;
    height: 75px;
    text-align: center;
}
.heading-p {
    color: #FFFFFF;
    font-size: 18px;
    padding-top: 1rem !important;
    font-weight: 700;

}
.sub-h {
  font-weight: 600 !important;
  font-size: 14px;
}

.form-h {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
}
.st-d {
  margin-bottom: 2px;
}

  table tbody tr {
    border: 100px solid black;
  }
    table tbody tr:nth-child(even) {
    background: #d7ebeb;
  }
   table tbody tr:nth-child(even) td {
    border:1px solid #d7ebeb;
    background-color: #d7ebeb;

  }
    h2 {
      font-size: 1.25rem;
    }

    h3 {
      font-size: .9rem;
    }

     h4 {
      font-size: .7rem;
    }
       h5 {
      font-size: .5rem;
    }

    table thead th {
      font-size: .4rem
    }

    table tbody td, li {
      font-size: .4rem
    }

    .td-width {
      width: 25%;
    }

    button {
      display: none;
    }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 700;
  }

  .form-status {
    font-size: 10px;
    margin-top: 10px;


  }
  .table > tbody > tr > td,
  .table > tbody > tr > th,
  .table > tfoot > tr > td,
  .table > tfoot > tr > th,
  .table > thead > tr > td,
  .table > thead > tr > th {
    vertical-align: inherit;
    text-align: center;
  }

  .fa-times {
    display: none;
  }
  .qus-slb {
    margin-left: 2%;
    font-weight: normal;
    font-size: 12px;
}

#donwloadButton{
  display: none;
}
h5{
  display: inline-flex;
}
.d-i{
  display: inline-flex;
  width : 33.33%;
}
.mr-l{
  margin-left: 22%;
}
.form-status {
  font-size: 10px;
}
table {
    border: 1px solid gray;
}
.thHeader {
  background-color: #058e91;
  color: #ffffff;
}
.d-u {
  font-size: 10px !important;
  font-weight: 500;
}
.u-a-h {
display: inline-block;
width: 25%
}
.u-a-a {
  display: inline-block;
  width: 75%
  }
  .m-t {
    margin-top : .5rem !important;
  }
  </style>`;
  @ViewChild("waterRe") _html: ElementRef;
  @ViewChild("template") template;
  showLoader;
  dialogRef;
  err = "";
  status;
  stateName;

  uasData = JSON.parse(sessionStorage.getItem("UasList"));
  subParentForModal;
  USER_TYPES = USER_TYPE;
  userDetails = new UserUtility().getLoggedInUserDetails();

  storageBaseUrl:string = environment?.STORAGE_BASEURL;

  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem("userData"));
    if(this.userDetails.role == USER_TYPE.STATE){
      this.stateName = userData.stateName;
  }else {
      this.stateName = sessionStorage.getItem('stateName');
  }

    console.log('pre rejaaaaa', this.data, this.parentData);
    if (this.parentData) {
      this.data = this.parentData;
    }
    this.subParentForModal = this.waterRejenuvationService.OpenModalTrigger.subscribe(
      (change) => {
        if (this.changeFromOutSide) {
          this.openModal(this.template);
        }
      }
    );
    this.setStatus();
  }
  ngOnDestroy(): void {
    if (this.subParentForModal) this.subParentForModal.unsubscribe();
  }

  clickedDownloadAsPDF() {
    let change = sessionStorage.getItem("changeInWaterRejenuvation");
    if (change == "true") {
      this.openModal(this.template);
    } else {
      this.downloadAsPDF();
    }
  }

  close() {
    this._matDialog.closeAll();
  }

  downloadAsPDF() {
    const elementToAddPDFInString = this._html.nativeElement.outerHTML;
    const html = this.styleForPDF + elementToAddPDFInString;
    this.showLoader = true;
    this._questionnaireService.downloadPDF({ html }).subscribe(
      (res) => {
        this.downloadFile(res.slice(0), "pdf", "ProjectWaterSanitation.pdf");
        this.showLoader = false;
      },
      (err) => {
        this.showLoader = false;
        this.onGettingError(
          ' "Failed to download PDF. Please try after sometime."'
        );
      }
    );
  }
  private onGettingError(message: string) {
    const option = { ...defaultDailogConfiuration };
    option.buttons.cancel.text = "OK";
    option.message = message;
    this.showLoader = false;
    this._matDialog.open(DialogComponent, { data: option });
  }
  private downloadFile(blob: any, type: string, filename: string): string {
    const url = window.URL.createObjectURL(blob); // <-- work with blob directly

    // create hidden dom element (so it works in all browsers)
    const a = document.createElement("a");
    a.setAttribute("style", "display:none;");
    document.body.appendChild(a);

    // create file, attach to hidden element and open hidden element
    a.href = url;
    a.download = filename;
    a.click();
    return url;
  }

  openModal(template: TemplateRef<any>) {
    const dialogConfig = new MatDialogConfig();
    this.dialogRef = this._matDialog.open(template, dialogConfig);
    this.dialogRef.afterClosed().subscribe((result) => {
      console.log("result", result);
    });
  }

  stay() {
    this.dialogRef.close(true);
  }

  proceed(uploadedFiles) {
    this._matDialog.closeAll();
    this.postsDataCall(uploadedFiles);
    //this.downloadAsPDF();
    sessionStorage.setItem("changeInWaterRejenuvation", "false");
    if (this.changeFromOutSide) {
      this.state_service.initiateDownload.next(true);
    } else this.downloadAsPDF();
    return;
  }
  postsDataCall(uploadedFiles) {
    return new Promise((resolve, reject) => {
      this.waterRejenuvationService.postData(this.data).subscribe(
        async (res) => {
          sessionStorage.setItem("changeInWaterRejenuvation", "false");
          swal("Record Submitted Successfully!");
          resolve(res);
        },
        (error) => {
          this.err = error.message;
          console.log(this.err);
          swal(`Error- ${this.err}`);
          resolve(error);
        }
      );
    });
  }

  alertClose() {
    this.stay();
  }

  setStatus() {
    if (this.data.isDraft == null) {
      this.status = "Not Started";
    } else if (this.data.isDraft) {
      this.status = "In Progress";
    } else if (!this.data.isDraft) {
      this.status = "Completed but Not Submitted";
    }
  }
  getLineItem(id){
    //console.log('aaaa',this.data?.waterIndicators?.find(x => x.lineItemId == id));
   return (this.data?.waterIndicators?.find(x => x.lineItemId == id))?.name;
  }
}
