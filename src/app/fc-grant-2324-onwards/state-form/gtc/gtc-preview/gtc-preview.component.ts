import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { QuestionnaireService } from 'src/app/pages/questionnaires/service/questionnaire.service';
import { defaultDailogConfiuration } from 'src/app/pages/questionnaires/state/configs/common.config';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';

@Component({
  selector: 'app-gtc-preview',
  templateUrl: './gtc-preview.component.html',
  styleUrls: ['./gtc-preview.component.scss']
})
export class GtcPreviewComponent implements OnInit {
  constructor(
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _questionnaireService: QuestionnaireService,
    // private stateService: State2223Service,
    // private newCommonService: NewCommonService
  ) {
    this.userData = JSON.parse(localStorage.getItem("userData"));
    this.stateName = this.userData["stateName"];
    this.stateId = this.userData?.state;
    this.years = JSON.parse(localStorage.getItem("Years"));
  }
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
  margin-bottom: 1rem;
  text-align: center;
}
.m-d{
  margin-top: 10px !important;
}
.form-status {
  font-size: 10px;
}
  .card {
      padding: 5px 10px;
      border: 1px solid rgba(0, 0, 0, 0.125);
      border-radius: 6px;
      padding: 6px;
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
    .l-h {
      font-size: 12px !important;
    }
    .m-r{
      margin-bottom: 1.5rem !important;
    }

    .h-cls{
        display: none;
    }
    .form-status {
        font-size: 10px;
        margin-top: 10px;
      }
      .na-cls {
        text-decoration: none;
        color: black;
        pointer-events: none;
    }
    .sub-h {
      margin-top: .5rem !important;
    }
    .td {
      font-size: 6px;
      border: 1px solid gray;
    }
    .th {
      font-size: 6px;
      text-align: left;
    }
    </style>`;
  @ViewChild("gtcpre") _html: ElementRef;
  // @ViewChild("annualPreview") _html: ElementRef;
  @ViewChild("templateSave") template;
  dialogRef;
  download;
  showLoader;
  stateName = "";
  fileUrl = "";
  fileName = "";
  formStatus = "";
  userData;
  years;
  stateId;

  ngOnInit(): void {
    console.log("preview data", this.data);
  }

  openDialog(template) {
    const dialogConfig = new MatDialogConfig();
    this.dialogRef = this._matDialog.open(template, dialogConfig);
  }
  downloadAsPDF() {
    const elementToAddPDFInString = this._html.nativeElement.outerHTML;
    const html = this.styleForPDF + elementToAddPDFInString;
    this.showLoader = true;
    let downloadFileName = `${this.stateName}_gtcForm.pdf`;
    this._questionnaireService.downloadPDF({ html }).subscribe(
      (res) => {
        this.downloadFile(res.slice(0), "pdf", downloadFileName);
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
  closeMat() {
    this._matDialog.closeAll();
  }
  async proceed(uploadedFiles) {
    this.dialogRef.close();
    this._matDialog.closeAll();
    await this.saveFile();
    await this.downloadAsPDF();
  }
  saveFile() {
    let data = JSON.parse(sessionStorage.getItem("gtcIjData"));
    console.log("i, j data", data);
    // this.submit(data?.i, data?.j);
  }

  alertClose() {
    this.stay();
  }

  stay() {
    this.dialogRef.close();
  }

  canSeeInstallmentSection(questions: any[]) {
    if (!this.data?.selectedQuestion) return true;
    return questions.some(question => question?.type == this.data?.selectedQuestion?.type);
  }
}
