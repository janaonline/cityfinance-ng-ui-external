import { Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class WaterRejenuvations2223ServiceService {
  constructor(private http: HttpClient) { }
  OpenModalTrigger = new Subject<any>();
  postData(body) {
    return this.http.post(`${environment.api.url}WaterRejenuvation`, body);
  }
  postStateAction(data) {
    let utUrl = environment.api.url + 'WaterRejenuvation/action'
    return this.http.post(utUrl, data)
  }
  getData(design_year, state_id) {
    if (state_id) {
      return this.http.get(`${environment.api.url}WaterRejenuvation/${design_year}?state_id=${state_id}`)
    }
    return this.http.get(`${environment.api.url}WaterRejenuvation/${design_year}`)
  }
  postWaterRejeData(body){
    return this.http.post(`${environment.api.url}WaterRejenuvation`, body);
  }
  getSubmittedFormData(design_year){
    // console.log(design_year)
    return this.http.get(`${environment.api.url}WaterRejenuvation/${design_year}`);
  }
}
