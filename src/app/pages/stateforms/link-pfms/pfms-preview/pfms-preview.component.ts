import {
  Component,
  OnInit,
  Inject,
  Input,
  ElementRef,
  ViewChild,
  TemplateRef,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogConfig,
} from "@angular/material/dialog";
import { QuestionnaireService } from "../../../questionnaires/service/questionnaire.service";
import { DialogComponent } from "src/app/shared/components/dialog/dialog.component";
import { defaultDailogConfiuration } from "../../../questionnaires/state/configs/common.config";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { SweetAlert } from "sweetalert/typings/core";
import { LinkPFMSAccount } from "../link-pfms.service";
import { StateformsService } from "../../stateforms.service";
const swal: SweetAlert = require("sweetalert");
@Component({
  selector: "app-pfms-preview",
  templateUrl: "./pfms-preview.component.html",
  styleUrls: ["./pfms-preview.component.scss"],
})
export class PfmsPreviewComponent implements OnInit, OnDestroy {
  @Input() parentData: any;
  @Input()
  changeFromOutSide: any;
  modalRef: BsModalRef;
  @ViewChild("pfmsPre") _html: ElementRef;
  showLoader;
  ulbName = "";
  stateName = "";
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _questionnaireService: QuestionnaireService,
    private LinkPFMSAccount: LinkPFMSAccount,
    public state_service: StateformsService,
    private _matDialog: MatDialog,
    private modalService: BsModalService
  ) { }
  @ViewChild("template") template;

  styleForPDF = `<style>
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
    margin-bottom: .3rem !important;
    text-align: center;
}
.st-d {
  margin-top: 10px !important;
}
  .card {
      margin-top: 10px !important;
      padding: 5px 10px;
      background-color: #EBF5F5;
  }

  .qus-h {
      margin-bottom: .5rem;
      margin-top: .5rem;
      font-size: 10px !important;
  }

  .ans-h {
      margin-bottom: .5rem;
      margin-left: 1.2rem;
      margin-top: .5rem;
      font-size: 10px !important;
  }


 .h-cls{
        display: none;
      }
 .form-status {
        font-size: 10px;
        margin-top: 10px;
      }
      h5{
        font-size: 10px !important;
        margin-top: 2px !important;
        padding-top : 0;
      }

    </style>`;

  formStatusCheck = "";
  statusArray = [
    'Not Started',
    'Under Review By State',
    'Completed',
    'In Progress'
  ]
  subParentForModal;
  @Output() change = new EventEmitter<any>();
  ngOnInit(): void {
    let userData = JSON.parse(localStorage.getItem("userData"));
    this.ulbName = userData["name"];
    this.stateName = userData["stateName"];
    let getData = JSON.parse(sessionStorage.getItem("pfmsAccounts"));
    this.subParentForModal = this.LinkPFMSAccount.OpenModalTrigger.subscribe(
      (change) => {
        if (this.changeFromOutSide) {
          this.openDialog(this.template);
        }
      }
    );
    if (this.parentData) {
      this.data = this.parentData;
    }

    if (getData) {
      {
        let change = sessionStorage.getItem("changeInPFMSAccountState");
        if (change == "true") {
          if (this.data['isDraft']) {
            this.formStatusCheck = this.statusArray[3]
          } else if (!this.data['isDraft']) {
            this.formStatusCheck = this.statusArray[2]
          }
        } else if (change == "false") {
          if (this.data['isDraft']) {
            this.formStatusCheck = this.statusArray[3]
          } else if (!this.data['isDraft']) {
            this.formStatusCheck = this.statusArray[1]
          }

        }
      }
    } else {
      let change = sessionStorage.getItem("changeInPFMSAccountState");
      if (change == "true") {
        if (this.data['isDraft']) {
          this.formStatusCheck = this.statusArray[3]
        } else if (!this.data['isDraft']) {
          this.formStatusCheck = this.statusArray[2]
        }
      } else if (change == "false") {
        this.formStatusCheck = this.statusArray[0]

      }
    }

    this.clicked = false;
  }

  ngOnDestroy(): void {
    if (this.subParentForModal) this.subParentForModal.unsubscribe();
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, { class: "modal-md" });
  }
  clicked = false;

  clickedDownloadAsPDF(template) {
    let changeHappen = sessionStorage.getItem("changeInPFMSAccountState");
    this.clicked = true;
    this.change.emit(this.clicked);
    if (changeHappen === "true") {
      this.openDialog(template);
    } else {
      this.downloadAsPDF();
    }
  }
  dialogRef;
  openDialog(template) {
    const dialogConfig = new MatDialogConfig();
    this.dialogRef = this._matDialog.open(template, dialogConfig);
  }

  downloadAsPDF() {
    const elementToAddPDFInString = this._html.nativeElement.outerHTML;
    const html = this.styleForPDF + elementToAddPDFInString;
    this.showLoader = true;
    this._questionnaireService.downloadPDF({ html }).subscribe(
      (res) => {
        this.downloadFile(res.slice(0), "pdf", "pfms.pdf");
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

    const a = document.createElement("a");
    a.setAttribute("style", "display:none;");
    document.body.appendChild(a);

    a.href = url;
    a.download = filename;
    a.click();
    return url;
  }

  async proceed(uploadedFiles) {

    this.dialogRef.close();
    console.log(this.data);
    this.LinkPFMSAccount.postData(this.data).subscribe(
      (res) => {
        console.log(res);
        const status = JSON.parse(sessionStorage.getItem("allStatus"));
        if (status) status.pfmsAccount.isSubmit = res["isCompleted"];
        console.log(res);
        if (res["isCompleted"] == true) {
          console.log("true");
          this.formStatusCheck = "Completed";
        } else {
          console.log("entered else, in progress");
          this.formStatusCheck = "In Progress";
        }
        sessionStorage.setItem("changeInPFMSAccountState", "false");
        swal("Record submitted successfully!");
      },
      (error) => {
        console.log(error.message);
      }
    );

    if (this.changeFromOutSide) {
      this.state_service.initiateDownload.next(true);
    } else this.downloadAsPDF();
  }
  alertClose() {
    this.stay();
  }

  stay() {
    this.dialogRef.close();
  }

  close() {
    this._matDialog.closeAll();
  }
}
