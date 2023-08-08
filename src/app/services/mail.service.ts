import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RecordPatch } from '../models/recordPatch.model';
import { RecordRejected } from '../models/recordRejected.model';
import { RecordAwarded } from '../models/recordAwarded.model';

@Injectable({
  providedIn: 'root'
})
export class MailService {

  constructor(private httpClient: HttpClient) { }

  public sendEmail(json: any): Observable<any> {
    return this.httpClient.post(environment.logicAppMailAzure, json);
  }

  public sendMailsPatch(recordsToBePatched: RecordPatch[]) {
    recordsToBePatched.map(record => {
      if (recordNeedsToBeNotified(record)) {
        let resolution = this.getResolution(record.patchDTO[0].value)
        let mailJson = {
          "properties": {
            "Customer": record.customerName,
            "Email": record.mail,
            "Resolution": resolution,
            "Observation": resolution == 'C' ? record.patchDTO[0].value : ' ',
          }
        };
        this.httpClient.post(environment.logicAppMailAzure, mailJson).subscribe(response => console.log(response), error => console.error('Error: ' + error));
      }
    })
  }

  public sendMailsReject(recordsToBeRejected: RecordRejected[]) {

    recordsToBeRejected.map(record => {

      let mailJson = {
        "properties": {
          "Customer": record.customerName,
          "Email": record.mail,
          "Resolution": 'B',
          "Observation": record.observation,
        }
      };
      this.httpClient.post(environment.logicAppMailAzure, mailJson).subscribe(response => console.log(response), error => console.error('Error: ' + error));

    })
  }

  public sendMailsAwarded(recordsToBeAwarded: RecordAwarded[]) {

    recordsToBeAwarded.map(record => {

      let mailJson = {
        "properties": {
          "Customer": record.customerName,
          "Email": record.mail,
          "Resolution": 'A',
          "Observation": '',
        }
      };
      this.httpClient.post(environment.logicAppMailAzure, mailJson).subscribe(response => console.log(response), error => console.error('Error: ' + error));

    })
  }

  getResolution(value: string) {
    let resolutionLetter = ''
    switch (value) {
      //SEG OK - FIN OK
      case 'Aprobado':
        resolutionLetter = 'A'
        break;

      case 'Desaprobado':
        resolutionLetter = 'B'
        break;

      case 'Observado':
        resolutionLetter = 'C'
        break;
    }
    return resolutionLetter;
  }
}

function recordNeedsToBeNotified(record: RecordPatch) {
  let needsToBeNotified = false;
  for (let i = 0; i < record.patchDTO.length; i++) {

    if (record.patchDTO[i].path == '/SegmentAnalysis') {
      needsToBeNotified = true
    }
  }
  return needsToBeNotified;
}
