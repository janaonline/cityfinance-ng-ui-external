import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { Observable, Subject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
@Injectable({
  providedIn: "root",
})
export class State2223Service {
  constructor(private http: HttpClient) {}

  dpReviewChanges = new Subject<any>();
  agGridDeleteRow = new Subject<any>();
  postGtcForm(body) {
    return this.http.post(
      `${environment.api.url}grant-transfer-certificate`,
      body
    );
  }
  getGtcData(stateId) {
    return this.http.get(
      `${environment.api.url}grant-transfer-certificate?state=${stateId}&design_year=606aafb14dff55e6c075d3ae`
    );
  }

  getDashboardFormData(params) {
    return this.http.get(
      `${environment.api.url}dashboard?formType=${params.formType}&design_year=${params.design_year}&stateId=${params.stateId}&installment=${params.installment}`
    );
  }
  // getGtaTemplate(ins, type, yr) {
  //   return this.http.get(
  //     `${environment.api.url}grantDistribution/template?type=${type}&year=${yr}&installment=${ins}`
  //   );
  // }
  getGtaTemplate(ins, type, yr): Observable<any> {
    // return this.http.get(environment.api.url + 'grantDistribution/template', { responseType: 'blob' });
    return this.http.get(
      `${environment.api.url}grantDistribution/template?type=${type}&year=${yr}&installment=${ins}`,
      { responseType: "blob" }
    );
  }
  checkFile(val, ins, yr, type) {
    let url =
      environment.api.url +
      `grantDistribution/upload?url=${val}&design_year=${yr}&type=${type}&installment=${ins}`;
    return this.http.get(url, { responseType: "blob" });
  }
  postGTAFile(body) {
    return this.http.post(`${environment.api.url}grantDistribution/save`, body);
  }
  getGTAFiles(state_id) {
    let getFilesUrl =
      environment.api.url +
      `grantDistribution/get/606aafb14dff55e6c075d3ae?state_id=${state_id}`;
    return this.http.get(getFilesUrl).pipe(
      catchError((error) => {
        let errMes = "An error occured.";
        console.log(error);
        if (error.status == "404") {
          errMes = "No records found.";
          return throwError(errMes);
        } else {
          return throwError(errMes);
        }
      })
    );
  }
  getWaterSupplyData(params) {
    console.log(params);
    return this.http.get(`${environment.api.url}/UA/get2223?ua=${params.ua}&design_year=${params.design_year}`);
  }
  getUAList(state_id) {
    return this.http.get(`${environment.api.url}masterForm/UAList?state_id=${state_id}`);
  }
  getFormDataAction(state_id, year) {
    return this.http.get(
      `${environment.api.url}ActionPlans/${year}?state_id=${state_id}`
    );
  }
  postActionDataForAWForm(data, endPoint) {
    // endPoint : ActionPlans/action,  WaterRejenuvation/action
    let utUrl = environment.api.url + `${endPoint}`
    return this.http.post(utUrl, data)
  }

}
