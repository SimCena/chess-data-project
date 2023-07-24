import { Component, OnInit } from '@angular/core';
import { ChessComDataHandlerService } from './services/chess-com-data-handler.service';
import * as d3 from 'd3';
import { saveAs } from "file-saver";
import { StatsService } from './services/stats.service';
import { DataService } from './services/data.service';

interface Games {
  games?: any;
}
export interface Country {
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

  BAR_WIDTH = 35;
  counter = 0;
  dataArrays: Country[][] = [];
  map: any;
  currentGames: any;
  stats : StatsService;
  constructor(private dataHandler: ChessComDataHandlerService, private dataService: DataService) {
    this.stats = new StatsService(dataService);
  }

  ngOnInit(){
    //this.retrieveData();
    this.loadData('winData.csv', false);
    this.loadData('lostData.csv', false);
    this.loadData('drawData.csv', false);

    //this.loadData('lostData.csv', 'lostGraph', 'Loses Graph');
    //this.loadData('drawData.csv', 'drawGraph', 'Draws Graph');
  }
  afterLoad() {
    this.appendSVG(this.dataArrays[0], 'winsGraph', 'Wins Graph')
    this.appendSVG(this.dataArrays[1], 'losesGraph', 'Loses Graph')
    this.appendSVG(this.dataArrays[2], 'drawsGraph', 'Draws Graph')
    this.calculateStats();

    if(this.dataService.loaded){
      // this.stats.
      console.log("hello");
      this.stats.getMonthlyElo();
    }
  }
  
  selectGraph(value:any) {
    const boxes = document.getElementsByClassName('box') as HTMLCollectionOf<HTMLElement>;
    const boxesArray = Array.from(boxes);
  
    const maxZIndex = boxesArray.reduce((max, box) => Math.max(max, parseInt(box.style.zIndex) || 0), 0);
  
    for (const box of boxesArray) {
      const zIndex = parseInt(box.style.zIndex) || 0;
      box.style.zIndex = "1";
    }
    switch(value) {
      case 'wins':
        //this.redrawSVG(this.dataArrays[0])
        document.getElementById("winsGraphContainer")!.style.zIndex = '3';
        break;
      case 'loses':
        //this.redrawSVG(this.dataArrays[1])
        document.getElementById("losesGraphContainer")!.style.zIndex = '3';
        break;
      case 'draws':
        //this.redrawSVG(this.dataArrays[2])
        document.getElementById("drawsGraphContainer")!.style.zIndex = '3';
        break;
      
    }
  }

  
  calculateStats(){
    console.log("STATS: ")
    console.log(this.stats.getTopTenWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]))
    console.log(this.stats.getWorseWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]))
    console.log(this.stats.getTotalWinRate(this.dataArrays[0], this.dataArrays[1])) 
    this.stats.waffleChart(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
   
    this.drawBubbles();
  }

  drawBubbles() {
    const width = 2000;
    const height = 500;
    const data = this.stats.getTopTenWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
    this.stats.getWorseWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]).forEach((w) => {
      data.push(w);
    })
    var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

    const circles = svg.selectAll("circle")
      .data(data)
      .enter().append("circle")
      .attr("class", "dot")
      .attr('fill', function(d) { return (d.winRate < 50 ? "red" : 'green')})
      .attr("cx", function(d, i) { return d.winRate + i * 50; })
      .attr("cy", height/2)
      .attr("r", function(d) { return d.winRate*0.60; })
      .append("text")
      .text("PA")
  }

  loadData(fileName: string,  drawGraph: boolean, className?: string, title?: string,) {
    d3.csv('../assets/' + fileName).then(  (rawData) => {
      let data: Country[] = []
      rawData.forEach((d) => {
        data.push({
          name: d['name']!,
          code: d['code']!,
          count: parseInt(d['count']!)
        })
      })
      this.dataArrays.push(data);
      this.counter++;
      if(this.counter > 2){
        this.afterLoad()
      }
    })
  }

  appendSVG(data: Country[], className: string, title: string) {
    // const w = 5000;
    const h = 500;
    let w = data.length * this.BAR_WIDTH;
    console.log(w)
    if(w < 2000) w = 2000;
    var svg = d3.select("#" + className)
          .append("svg")
          .attr('id', 'barChart')
          .attr("class", className)
          .attr("width", w)
          .attr("height", h)
          .attr('overflow', 'scroll')
    let max = 0;
    data.forEach((c)=>{
      if(c.count > max) max = c.count;
    })
    var yScale = d3.scaleLinear()
          .domain([0, max])
          .range([50, h-50]);
    
    this.drawBars(data, svg, w, h, yScale);
    this.drawLabels(data, svg, w, h, yScale);
  }

  drawBars(dataArray: Country[], svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, w: number, h: number, yScale: d3.ScaleLinear<any, any>){
    const barPadding = 1;
    const sortBars = () => {
      svg.selectAll("rect")
          .sort(function(a: any, b: any) {
            return d3.descending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length + 1) * i;
          });
      svg.selectAll(".code")
          .sort(function(a: any, b: any) {
            return d3.descending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length + 1) * i + 15;
          });
      svg.selectAll(".count")
          .sort(function(a: any, b: any) {
            return d3.descending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length + 1) * i + 15;
          });
    }
    var showTooltip = (e: MouseEvent, data: Country) => {
      const tooltip = document.getElementById("tooltip");
      if(!tooltip) return;
      tooltip.classList.add('visible')
      tooltip.style.left = e.pageX + "px";
      tooltip.style.top = e.pageY - 50 + "px";
      tooltip.innerHTML = data.name;
    }
    var hideTooltip = () => {
      const tooltip = document.getElementById("tooltip");
      if(!tooltip) return;
      tooltip.classList.toggle('visible')
    }
    var bars = svg.selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        .attr('class', 'bar')
        .on("click", function() {
          sortBars();
          })
        .on("mousemove", function(e, d){
          showTooltip(e, d);
        })
        .on("mouseout", function(){
          hideTooltip();
        })
        .attr("x", (d, i) => { return i * ((w / dataArray.length ) + 1) ; })
        .attr("y", (d) => { 
          return h - yScale(d.count) })
        .attr("width", this.BAR_WIDTH + "px")
        .attr("height", function(d) { return yScale(d.count) })
        .style("fill", "rgb(39, 37, 34)")
        .style("opacity", 1.);
  }

  

  drawLabels(dataArray: Country[], svg: d3.Selection<any, any, HTMLElement, any>, w: number, h: number, yScale: d3.ScaleLinear<any, any>){
    svg.selectAll(".count")
        .data(dataArray)
        .enter()
        .append("text")
        .attr('class', 'count')
        .text(function(d) { return d.count; })
        .attr("x", (d, i) => { return (w / dataArray.length + 1) * i + 15; })
        .attr("y", function(d) { return h - yScale(d.count) + 15; })
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr('pointer-events', 'none');
    svg.selectAll(".code")
        .data(dataArray)
        .enter()
        .append("text")
        .text(function(d) { return d.code; })
        .attr('class', 'code')
        .attr("x", (d, i) => { return (w / dataArray.length + 1) * i + 15; })
        .attr("y", h-10)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr('pointer-events', 'none');
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

  //Unused functions 
  redrawSVG(data: Country[]) {
    const w = 3000;
    const h = 500;
    var svg = d3.selectAll('rect').data(data)
    let max = 0;
    data.forEach((c)=>{
      if(c.count > max) max = c.count;
    })
    var yScale = d3.scaleLinear()
          .domain([0, max])
          .range([50, h-50]);
    svg.attr("x", (d, i) => { return i * (w / data.length); })
        .attr("y", (d) => { 
          return h - yScale(d.count) })
        .attr("width", w / data.length - 1)
        .attr("height", function(d) { return yScale(d.count) });
    
   
    d3.selectAll('.code').data(data).text(function(d) { return d.code})
        .attr("x", (d, i) => { return i * (w / data.length) + 10; })
        .attr("y", h-10)
        .attr("text-anchor", "middle")
    
    d3.selectAll('.count').data(data).text(function(d) { return d.count; })
        .attr("x", (d, i) => { return i * (w / data.length) + 10; })
        .attr("y", function(d) { return h - yScale(d.count) + 15; })
  }
}