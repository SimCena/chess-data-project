import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const USERNAME = 'SimCena';

@Injectable({
  providedIn: 'root'
})
export class ChessComDataHandlerService {

  constructor(private httpClient: HttpClient) { }

  getGames(){
    const baseUrl = "https://api.chess.com/pub/player/" + USERNAME + "/games/";
    const archivesUrl = baseUrl + 'archives';
    return this.httpClient.get(archivesUrl);
  }

  getDataFromUrl(url: string):any {
    return this.httpClient.get(url);
  }
}
// #read the archives url and store in a list
// f = urllib.request.urlopen(archivesUrl)
// archives = f.read().decode("utf-8")
// archives = archives.replace("{\"archives\":[\"", "\",\"")
// archivesList = archives.split("\",\"" + baseUrl)
// archivesList[len(archivesList)-1] = archivesList[len(archivesList)-1].rstrip("\"]}")

// #download all the archives
// for i in range(len(archivesList)-1):
//     url = baseUrl + archivesList[i+1] + "/pgn"
//     filename = archivesList[i+1].replace("/", "-")
//     urllib.request.urlretrieve(url, "/Users/Magnus/Desktop/My Chess Games/" + filename + ".pgn") #change
//     print(filename + ".pgn has been downloaded.")
// print ("All files have been downloaded.")




  // Fonctions pour get le data

  // sleep(delayTime: number) {
  //   return new Promise(resolve => setTimeout(resolve, delayTime));
  // }

  // getFlag(userUrl: string, result: string){
  //   this.dataHandler.getDataFromUrl(userUrl).subscribe(
  //     (response:any) =>{
  //       this.dataHandler.getDataFromUrl(response.country).subscribe(
  //         (response:any) => {
  //           let tempName = response.code;
  //           if(result === 'win') {
  //             this.lostMap[tempName] = this.lostMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
  //               { code: this.lostMap[tempName].code, name: this.lostMap[tempName].name, count: this.lostMap[tempName].count + 1};
  //             return;
  //           } else if (result === 'stalemate' || result === 'repetition') {
  //             this.drawMap[tempName] = this.drawMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
  //               { code: this.drawMap[tempName].code, name: this.drawMap[tempName].name, count: this.drawMap[tempName].count + 1};
  //             return;
  //           } else {
  //             this.winMap[tempName] = this.winMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
  //               { code: this.winMap[tempName].code, name: this.winMap[tempName].name, count: this.winMap[tempName].count + 1};
  //             return;
  //           }
            
  //         }
  //       )
  //     }
  //   )
  // }

  // retrieveData() {
  //   this.winMap = new Object();
  //   this.drawMap = new Object();
  //   this.lostMap = new Object();
  //   this.dataHandler.getGames()
  //   .subscribe((response:any) => {
  //     this.data = response.archives;
  //     console.log(this.data);
  //     console.log(this.data['length']);
  //     this.displayMonthGames(0);
  //     });
  // }

  
  // async displayMonthGames(index: number){
  //   this.dataHandler.getDataFromUrl(this.data[index])
  //   .subscribe(async (response: Games) => {
  //     this.currentGames = Object.values(response.games);
  //     let current: any = new Object;
  //     for(let i = 0; i< this.currentGames.length; i++){
  //       current = this.currentGames[i];
  //       let opponent = current.black.username === 'SimCena' ? current.white : current.black;
  //       console.log(this.currentGames.length);
  //       this.getFlag("https://api.chess.com/pub/player/" + opponent.username, opponent.result);
  //       await this.sleep(200);
  //     }
  //     this.counter++;
  //     if(this.counter < 36) {
  //       console.log(this.counter);
  //       this.displayMonthGames(++index);
  //     } else {
  //       this.saveAsCSV(this.winMap, 'winData.csv');
  //       this.saveAsCSV(this.lostMap, 'lostData.csv');
  //       this.saveAsCSV(this.drawMap, 'drawData.csv');
  //       return;
  //     }
  //   });
  // }

  // saveAsCSV(map: any, fileName: string){
  //   const dataArray: Country[] = Object.values(map);
  //   console.log(dataArray);
  //   const csvData = d3.csvFormat(dataArray);
  //   const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
  //   saveAs(blob, fileName);
  // }

  // //Unused functions 
  // redrawSVG(data: Country[]) {
  //   const w = 3000;
  //   const h = 500;
  //   var svg = d3.selectAll('rect').data(data)
  //   let max = 0;
  //   data.forEach((c)=>{
  //     if(c.count > max) max = c.count;
  //   })
  //   var yScale = d3.scaleLinear()
  //         .domain([0, max])
  //         .range([50, h-50]);
  //   svg.attr("x", (d, i) => { return i * (w / data.length); })
  //       .attr("y", (d) => { 
  //         return h - yScale(d.count) })
  //       .attr("width", w / data.length - 1)
  //       .attr("height", function(d) { return yScale(d.count) });
    
   
  //   d3.selectAll('.code').data(data).text(function(d) { return d.code})
  //       .attr("x", (d, i) => { return i * (w / data.length) + 10; })
  //       .attr("y", h-10)
  //       .attr("text-anchor", "middle")
    
  //   d3.selectAll('.count').data(data).text(function(d) { return d.count; })
  //       .attr("x", (d, i) => { return i * (w / data.length) + 10; })
  //       .attr("y", function(d) { return h - yScale(d.count) + 15; })
  // }