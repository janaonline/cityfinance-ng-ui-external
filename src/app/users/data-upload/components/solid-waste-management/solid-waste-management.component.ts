import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChange } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataEntryService } from 'src/app/dashboard/data-entry/data-entry.service';
import { USER_TYPE } from 'src/app/models/user/userType';
import { IQuestionnaireDocumentsCollection } from 'src/app/pages/questionnaires/model/document-collection.interface';
import { DialogComponent } from 'src/app/shared/components/dialog/dialog.component';
import { IDialogConfiguration } from 'src/app/shared/components/dialog/models/dialogConfiguration';

import { SolidWasteManagementDocuments } from '../../models/financial-data.interface';
import { ISolidWasteQuestion, SolidWasteEmitValue } from '../../models/solid-waste-questions.interface';
import { QuestionsIdMapping, solidWasteForm } from '../configs/solid-waste-management';
import { SweetAlert } from "sweetalert/typings/core";
const swal: SweetAlert = require("sweetalert");
/**
 * These are thew question ids that are mapped to files that user select and the question.
 * This will be used to unique identify each question and their respective file.
 */
type fileKeys = keyof SolidWasteManagementDocuments;

//
type userSelectedFile = {
  [key in fileKeys]?: File[];
};

// Values to be emitted

type IFileUploadTracking = {
  [key in fileKeys]?: {
    [fileName: string]: {
      fileName?: string;
      percentage?: number;
      status?: "in-process" | "completed";
      url?: string;
      subscription?: Subscription;
    };
  };
};

@Component({
  selector: "app-solid-waste-management",
  templateUrl: "./solid-waste-management.component.html",
  styleUrls: ["./solid-waste-management.component.scss"],
})
export class SolidWasteManagementComponent implements OnInit {
  @Input()
  documents: IQuestionnaireDocumentsCollection;
  @Input()
  canUploadFile = true;
  @Input()
  editable = true;

  @Input()
  userType: USER_TYPE;

  @Output()
  outputValues = new EventEmitter<SolidWasteEmitValue>();
  @Output()
  saveAsDraft = new EventEmitter<SolidWasteEmitValue>();

  @Output()
  previous = new EventEmitter<boolean>();

  /**
   * @description Keeps the track of which file User has selected.
   */
  userSelectedFiles: userSelectedFile = {};

  /**
   * @description This is used for 2 purpose.
   * 1. It keeps the tracking of each file upload. How much file is upload, wheter it is completed or not.
   * 2. Its value will be emiited to parent component with fileName and url only.
   * So it user removes/deselect a file, then that file entry must be removed from here also.
   */
  fileUploadTracker: IFileUploadTracking = {};

  NoOfFileInProgress = 0;

  questions: ISolidWasteQuestion[];

  fileExnetsionAllowed = ["pdf"];

  defaultDailogConfiuration: IDialogConfiguration = {
    message:
      "This is the last step. After uploading, You will not be allowed to change any answer. <br>Do you want to continue?",
    buttons: {
      confirm: {
        text: "Yes",
        callback: () => {
          // this.startUpload();
          this._dialog.closeAll();
        },
      },
      cancel: { text: "No" },
    },
  };
  defaultErrorMessageConfiguration: IDialogConfiguration = {
    message: "You need to upload atleast 1 file for the mandatory question.",
    buttons: {
      cancel: { text: "OK" },
    },
  };
  documentForm: FormGroup;
  USER_TYPE = USER_TYPE;

  MaxFileSize = 20 * 1024 * 1024; // 20 MB. Always keep it in MB since in other places, we are dealing in MB only.

  constructor(
    private dataEntryService: DataEntryService,
    private _dialog: MatDialog
  ) {}
  ngOnChanges(changes: {
    documents: SimpleChange;
    canUploadFile: SimpleChange;
  }): void {
    this.initializeQuestionMapping();

    if (changes.documents && changes.documents.currentValue) {
      if (changes.canUploadFile && !changes.canUploadFile.currentValue) {
        return;
      }
      this.documentForm.patchValue(changes.documents.currentValue);

      this.userSelectedFiles = { ...changes.documents.currentValue };
      Object.keys(this.userSelectedFiles).forEach((questiopnId) => {
        if (!this.userSelectedFiles[questiopnId]) {
          return;
        }

        this.fileUploadTracker[questiopnId] = {};

        this.userSelectedFiles[questiopnId].forEach((file) => {
          this.fileUploadTracker[questiopnId][file.name] = {
            fileName: file.name,
            percentage: 100,
            url: file.url,
            status: "completed",
          };

          //      fileName?: string;
          // percentage?: number;
          // status?: "in-process" | "completed";
          // url?: string;
          // subscription?: Subscription;
        });
      });
    }
  }

  ngOnInit() {}

  cancelFileUpload(questionKey: fileKeys, fileNameToFilter: string) {
    // if (!this.userSelectedFiles || !this.userSelectedFiles[questionKey]) {
    //   return false;
    // }

    // Remove the file requested from user selection.
    if (this.userSelectedFiles[questionKey]) {
      this.userSelectedFiles[questionKey] = this.userSelectedFiles[
        questionKey
      ].filter((file) => file.name !== fileNameToFilter);
    }

    if (!this.fileUploadTracker || !this.fileUploadTracker[questionKey]) {
      return false;
    }

    const currentFileTracker = this.fileUploadTracker[questionKey][
      fileNameToFilter
    ];

    // Cancel the subscribtion if the file is being uploaded.
    if (!currentFileTracker.percentage || currentFileTracker.percentage < 100) {
      currentFileTracker.subscription.unsubscribe();
      this.NoOfFileInProgress--;
    }

    // Remove the file from file Tracker.
    delete this.fileUploadTracker[questionKey][fileNameToFilter];
  }

  fileChangeEvent(event: Event, key: fileKeys) {

    const filteredFiles = <any>(
      this.filterInvalidFiles(event.target["files"], key)
    );

    if (this.userSelectedFiles[key]) {
      this.userSelectedFiles[key].push(...filteredFiles);
    } else {
      this.userSelectedFiles[key] = filteredFiles;
    }

    this.startUpload({ [key]: filteredFiles });
  }

  startUpload(filesToUpload: userSelectedFile) {
    Object.keys(filesToUpload).forEach((fieldKey: fileKeys) => {
      const files = <File[]>filesToUpload[fieldKey];
      this.NoOfFileInProgress += files.length;
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        let isfileValid =  this.dataEntryService.checkSpcialCharInFileName(file);
        if(isfileValid == false){
          swal("Error","File name has special characters ~`!#$%^&*+=[]\\\';,/{}|\":<>?@ \nThese are not allowed in file name,please edit file name then upload.\n", 'error');
           return;
        }
        const subs = this.dataEntryService
          .newGetURLForFileUpload(file.name, file.type)
          .pipe(
            switchMap((res: any) =>
              this.initiateFileUploadProcess(
                file,
                res.data[0].url,
                res.data[0].path,
                file.name,
                fieldKey
              )
            )
          );

        // Save the subscription so that each file can be cancelled individually.
        if (!this.fileUploadTracker[fieldKey]) {
          this.fileUploadTracker[fieldKey] = { [file.name]: {} };
        }
        if (!this.fileUploadTracker[fieldKey][file.name]) {
          this.fileUploadTracker[fieldKey][file.name] = {};
        }
        this.fileUploadTracker[fieldKey][
          file.name
        ].subscription = subs.subscribe();
      }
    });
  }

  filterInvalidFiles(list: FileList, key: fileKeys) {
    const newList: File[] = [];
    const maxLimit = list.length > 10 ? 10 : list.length;
    for (let index = 0; index < maxLimit; index++) {
      const file = list[index];
      if (file.size > this.MaxFileSize) continue;
      const noOfFileAlreadySelect = this.fileUploadTracker[key]
        ? Object.keys(this.fileUploadTracker[key]).length
        : 0;

      const isFileAlreadySelected = this.isFileAlreadySelected(file, key);

      if (
        this.isValidFile(file) &&
        noOfFileAlreadySelect < 10 &&
        !isFileAlreadySelected
      ) {
        newList.push(file);
      }
    }
    return newList;
  }

  onUploadButtonClick() {
    const valueToEmit = this.mapFileTrackerToEmitValues(this.fileUploadTracker);
    this.documentForm.patchValue({ ...valueToEmit });

    this.outputValues.emit(valueToEmit);
  }

  onSaveAsDraftClick() {
    const valueToEmit = this.mapFileTrackerToEmitValues(this.fileUploadTracker);

    this.documentForm.reset();

    this.documentForm.patchValue({ ...valueToEmit });

    this.saveAsDraft.emit(valueToEmit);
  }

  private mapFileTrackerToEmitValues(
    tracker: IFileUploadTracking
  ): SolidWasteEmitValue {
    const output: SolidWasteEmitValue = {};
    Object.keys(tracker).forEach((questionId) => {
      if (!tracker[questionId]) {
        return;
      }
      Object.values(tracker[questionId]).forEach(
        (value: IFileUploadTracking[fileKeys]["fileName"]) => {
          const objectToSave = { name: value.fileName, url: value.url };

          if (!output[questionId]) {
            output[questionId] = [objectToSave];
          } else {
            output[questionId].push(objectToSave);
          }
        }
      );
    });

    if (!Object.keys(output).length) {
      return null;
    }
    return output;
  }

  showconfirmationDialog() {
    const dailogboxx = this._dialog.open(DialogComponent, {
      data: this.defaultDailogConfiuration,
    });
  }

  showErrorDialog() {
    const dailogboxx = this._dialog.open(DialogComponent, {
      data: this.defaultErrorMessageConfiguration,
    });
  }

  /**
   *
   * @param fileAlias This contains the url  to download the file. Therefore we need to store this key and not url key
   * @param url File will be uploaded on this url
   */
  private initiateFileUploadProcess(
    file: File,
    url: string,
    fileAlias: string,
    fileID: string,
    questionId: fileKeys
  ) {
    return this.dataEntryService.uploadFileToS3(file, url).pipe(
      map((response: HttpEvent<any>) => {
        return this.logUploadProgess(response, fileID, fileAlias, questionId);
      })
    );
  }

  private logUploadProgess(
    event: HttpEvent<any>,
    fileId: string,
    url: string,
    questionId: fileKeys
  ) {
    if (event.type === HttpEventType.UploadProgress) {
      const percentDone = Math.round((100 * event.loaded) / event.total);

      /**
       * NOTE: Why are we comparing loaded and total instead of using percentDone?
       * It is because if the difference between load and total is very small
       * like total = 2797671 and loaded = 2797613, percentDone will be 100%
       * (we cannot show percentage done in decimal) but actual file is
       * not uploaded 100%. It can casue issue in the NoOfFileInProgress going
       * negative direction.
       */
      this.NoOfFileInProgress += event.loaded === event.total ? -1 : 0;

      if (!this.fileUploadTracker[questionId]) {
        this.fileUploadTracker[questionId] = {
          [fileId]: {
            percentage: percentDone,
            fileName: fileId,
            status: percentDone < 100 ? "in-process" : "completed",
            url,
          },
        };
        return event;
      }

      if (!this.fileUploadTracker[questionId][fileId]) {
        this.fileUploadTracker[questionId][fileId] = {
          percentage: percentDone,
          fileName: fileId,
          status: percentDone < 100 ? "in-process" : "completed",
          url,
        };
        return event;
      }
      this.fileUploadTracker[questionId][fileId] = {
        ...this.fileUploadTracker[questionId][fileId],
        percentage: percentDone,
        fileName: fileId,
        status: percentDone < 100 ? "in-process" : "completed",
        url,
      };
    }
    return event;
  }

  private hasUploadedMandatoryFile() {
    return this.documentForm.valid;
  }

  private isValidFile(file: File) {
    const fileExtends = file.name.split(".").pop();

    return this.fileExnetsionAllowed.includes(fileExtends);
  }

  private isFileAlreadySelected(fileToCheck: File, key: fileKeys) {
    if (!this.userSelectedFiles[key]) {
      return false;
    }

    return !!this.userSelectedFiles[key].find(
      (file) => file.name === fileToCheck.name
    );
  }

  ngOnDestroy(): void {
    // documentForm.reset();
    // documentForm.enable();
  }

  private initializeQuestionMapping() {
    this.questions = [
      {
        key: "garbageFreeCities",
        question: QuestionsIdMapping["garbageFreeCities"],
      },
      {
        key: "waterSupplyCoverage",
        question: QuestionsIdMapping["garbageFreeCities"],
      },
    ];
    this.documentForm = solidWasteForm;
  }
}
