import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  games: any[] = []
  loaded = false;
  constructor(private http: HttpClient) {
    this.getGamesData().then(()=> {
      this.loaded = true;
    });

  }


  async getGamesData(){
    const filePathBase = '../../assets/PGN/';
    for(let i = 1; i < 44; i++) {
      if(i == 19) continue;
      await this.readPGNFile(filePathBase + i + ".pgn");
    }
    console.log(this.games)
  }
  async readPGNFile(filePath: string) {
    let pgnObject : any = {};
    this.http.get(filePath, { responseType: 'text' }).subscribe(data => { 
      const x = data.split('\n')
      for (const line of x) {
        const match = line.match(/^\[([A-Za-z0-9]+) "([^"]+)"\]$/);
        if (match) {
          const [, tag, value] = match;
          pgnObject[tag] = value.trim();
          // Trimming data as data
          if(tag == "EndDate"){
            const currentDate = new Date();
            const [year, month, day] = value.trim().split('.').map(Number);
            const targetDate = new Date(year, month - 1, day); // Note: Months in Date are 0-based (0 = January)
            pgnObject[tag] = targetDate;
          }
          //
        } else {
          if(Object.keys(pgnObject).length !== 0) {
            this.findMyElo(pgnObject);
            this.games.push(pgnObject);
          }
          pgnObject = {};
        }
      }
    }); 
 
  }


  findMyElo(pgnObject: any){
    if(pgnObject["White"] == "SimCena"){
      pgnObject["Side"] = "White";
      pgnObject["Elo"] = pgnObject["WhiteElo"];
    }
    else {
      pgnObject["Side"] = "Black";
      pgnObject["Elo"] = pgnObject["BlackElo"];
    }
  }
  
}