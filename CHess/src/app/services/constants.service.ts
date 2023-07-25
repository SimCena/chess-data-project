import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class ConstantsService {

  MONTHS_ABR: any;

  constructor() {
    this.MONTHS_ABR = new Map([
      ["1", "Jan."],
      ["2", "Feb."],
      ["3", "Mar."],
      ["4", "Apr."],
      ["5", "May"],
      ["6", "June"],
      ["7", "July"],
      ["8", "Aug."],
      ["9", "Sept."],
      ["10", "Oct."],
      ["11", "Nov."],
      ["12", "Dec."],
    ]);
  }

  getDateFormat(dateString: string) {
    const tempDate = dateString.split(" ");
    return this.MONTHS_ABR.get(tempDate[0]) + " " + tempDate[1];
  }


}
