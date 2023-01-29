import { Component, OnInit } from '@angular/core';
import { ChessComDataHandlerService } from './services/chess-com-data-handler.service';
import * as d3 from 'd3';
import { saveAs } from "file-saver";

interface Games {
  games?: any;
}
interface Country {
  name: string,
  code: string,
  count: number,
}
interface WinRate {
  name: string,
  code: string,
  winRate: number,
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chess-project';
  data:any;
  winMap: any;
  drawMap: any;
  lostMap: any;

  counter = 0;
  dataArrays: Country[][] = [];
  map: any;
  currentGames: any;
  constructor(private dataHandler: ChessComDataHandlerService) {

  }

  ngOnInit(){
    //this.retrieveData();
    this.loadData('winData.csv', 'winGraph', 'Wins Graph');
    this.loadData('lostData.csv', 'lostGraph', 'Loses Graph');
    this.loadData('drawData.csv', 'drawGraph', 'Draws Graph');
  }
  
  calculateStats(){
    console.log('alo')
    console.log(this.getTopTenWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]))
    console.log(this.getWorseWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]))
    console.log(this.getTotalWinRate(this.dataArrays[0], this.dataArrays[1]))
    
  }

  getTotalWinRate(wins: Country[], loses: Country[]){
    const winsCount = wins.reduce((currentVal, w) => w.count+ currentVal, 0)
    const losesCount = loses.reduce((currentVal, l) => l.count+ currentVal, 0)

    console.log(winsCount / losesCount)
  }

  getTopTenWinRates(wins: Country[], loses: Country[], draws: Country[]) {
    const winRates: { name: string; code: string; winRate: number; gamesPlayed: number;}[] = []
    wins.forEach((w)=>{
      const countryTemp = loses.find((l)=> {return l.code === w.code})
      winRates.push({
        name: w.name,
        code: w.code,
        winRate: w.count / (countryTemp === undefined ? 1 : countryTemp.count),
        gamesPlayed: w.count + (countryTemp === undefined ? 0 : countryTemp.count)
      })
    })
    winRates.sort((a, b)=> {
      return b.winRate - a.winRate
    })
    return winRates.splice(0,10)
  }

  getWorseWinRates(wins: Country[], loses: Country[], draws: Country[]) {
    const winRates: { name: string; code: string; winRate: number;  gamesPlayed: number;}[] = []
    loses.forEach((l)=>{
      const countryTemp = wins.find((w)=> {return l.code === w.code})
      winRates.push({
        name: l.name,
        code: l.code,
        winRate: (countryTemp === undefined ? 0 : countryTemp.count) / l.count,
        gamesPlayed: l.count + (countryTemp === undefined ? 0 : countryTemp.count)
      })
    })
    return winRates.filter((wr) => {
      return wr.winRate === 0;
    }).sort((a, b) => { return b.gamesPlayed - a.gamesPlayed })
  }


  loadData(fileName: string, className: string, title: string) {
    d3.csv('../assets/' + fileName).then(  (rawData) => {
      let data: Country[] = []
      rawData.forEach((d) => {
        // if(parseInt(d['count']!)>1) {
        //   data.push({
        //     name: d['name']!,
        //     code: d['code']!,
        //     count: parseInt(d['count']!)
        //   })
        // }
        data.push({
          name: d['name']!,
          code: d['code']!,
          count: parseInt(d['count']!)
        })
      })
      this.dataArrays.push(data);
      const w = 4000;
      const h = 1000;
      var svg = d3.select("body")
            .append("svg")
            .attr("class", className)
            // .attr("width", w)
            // .attr("height", h)
            .attr('viewBox', '0 0 4000, 1000')
            .attr('overflow', 'scroll')

      d3.select('.' + className).append('text').text(title)
      .attr("x", (w / 2))             
      .attr("y", 60)
      .attr("text-anchor", "middle")  
      .style("font-size", "40px") 
      .style("text-decoration", "underline")
      .style('fill', 'black')
      let max = 0;
      data.forEach((c)=>{
        if(c.count > max) max = c.count;
      })
      var yScale = d3.scaleLinear()
            .domain([0, max])
            .range([50, h-50]);
      // displayFlags();
      this.drawBars(data, svg, w, h, yScale);
      this.drawLabels(data, svg, w, h, yScale);
    this.counter++;
      if(this.counter > 2){
        this.calculateStats();
      }
    })
  }


  drawBars(dataArray: Country[], svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, w: number, h: number, yScale: d3.ScaleLinear<any, any>){
    const barPadding = 1;
    const sortBars = () => {
      svg.selectAll("rect")
          .sort(function(a: any, b: any) {
            return d3.ascending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length) * i;
          });
      svg.selectAll(".code")
          .sort(function(a: any, b: any) {
            return d3.ascending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length) * i + 15;
          });
      svg.selectAll(".count")
          .sort(function(a: any, b: any) {
            return d3.ascending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length) * i + 15;
          });
    }
    var bars = svg.selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        // .on("mouseover", function() {
        //   d3.select(this)
        //   .attr("fill", "orange");
        //   })
        // .on("mouseout", function(d) {
        //   d3.select(this)
        //     .transition()
        //     .duration(1050)
        //     .attr("fill", "rgb(0, 0, " + 0 + ")");
        //   })
        .attr('class', 'bar')
        .on("click", function() {
          sortBars();
          })
        .attr("x", (d, i) => { return i * (w / dataArray.length); })
        .attr("y", (d) => { 
          return h - yScale(d.count) })
        .attr("width", w / dataArray.length - barPadding)
        .attr("height", function(d) { return yScale(d.count) });
  }

  drawLabels(dataArray: Country[], svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, w: number, h: number, yScale: d3.ScaleLinear<any, any>){
    svg.selectAll(".count")
        .data(dataArray)
        .enter()
        .append("text")
        .attr('class', 'count')
        .text(function(d) { return d.count; })
        .attr("x", (d, i) => { return i * (w / dataArray.length) + 15; })
        .attr("y", function(d) { return h - yScale(d.count) + 15; })
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    svg.selectAll(".codes")
        .data(dataArray)
        .enter()
        .append("text")
        .text(function(d) { return d.code; })
        .attr('class', 'code')
        .attr("x", (d, i) => { return i * (w / dataArray.length) + 15; })
        .attr("y", h-10)
        .attr("text-anchor", "middle")
        .attr("fill", "white");
  }


  // Fonctions pour get le data

  sleep(delayTime: number) {
    return new Promise(resolve => setTimeout(resolve, delayTime));
  }

  getFlag(userUrl: string, result: string){
    this.dataHandler.getDataFromUrl(userUrl).subscribe(
      (response:any) =>{
        this.dataHandler.getDataFromUrl(response.country).subscribe(
          (response:any) => {
            let tempName = response.code;
            if(result === 'win') {
              this.lostMap[tempName] = this.lostMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
                { code: this.lostMap[tempName].code, name: this.lostMap[tempName].name, count: this.lostMap[tempName].count + 1};
              return;
            } else if (result === 'stalemate' || result === 'repetition') {
              this.drawMap[tempName] = this.drawMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
                { code: this.drawMap[tempName].code, name: this.drawMap[tempName].name, count: this.drawMap[tempName].count + 1};
              return;
            } else {
              this.winMap[tempName] = this.winMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
                { code: this.winMap[tempName].code, name: this.winMap[tempName].name, count: this.winMap[tempName].count + 1};
              return;
            }
            
          }
        )
      }
    )
  }

  retrieveData() {
    this.winMap = new Object();
    this.drawMap = new Object();
    this.lostMap = new Object();
    this.dataHandler.getGames()
    .subscribe((response:any) => {
      this.data = response.archives;
      console.log(this.data);
      console.log(this.data['length']);
      this.displayMonthGames(0);
      });
  }

  
  async displayMonthGames(index: number){
    this.dataHandler.getDataFromUrl(this.data[index])
    .subscribe(async (response: Games) => {
      this.currentGames = Object.values(response.games);
      let current: any = new Object;
      for(let i = 0; i< this.currentGames.length; i++){
        current = this.currentGames[i];
        let opponent = current.black.username === 'SimCena' ? current.white : current.black;
        console.log(this.currentGames.length);
        this.getFlag("https://api.chess.com/pub/player/" + opponent.username, opponent.result);
        await this.sleep(200);
      }
      this.counter++;
      if(this.counter < 36) {
        console.log(this.counter);
        this.displayMonthGames(++index);
      } else {
        this.saveAsCSV(this.winMap, 'winData.csv');
        this.saveAsCSV(this.lostMap, 'lostData.csv');
        this.saveAsCSV(this.drawMap, 'drawData.csv');
        return;
      }
    });
  }

  saveAsCSV(map: any, fileName: string){
    const dataArray: Country[] = Object.values(map);
    console.log(dataArray);
    const csvData = d3.csvFormat(dataArray);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, fileName);
  }

}
