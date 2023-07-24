import { Component, OnInit } from '@angular/core';
import { ChessComDataHandlerService } from './services/chess-com-data-handler.service';
import * as d3 from 'd3';
import { saveAs } from "file-saver";
import { StatsService } from './services/stats.service';

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

  counter = 0;
  dataArrays: Country[][] = [];
  map: any;
  currentGames: any;
  constructor(private dataHandler: ChessComDataHandlerService, private stats: StatsService) {

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
    this.appendSVG(this.dataArrays[0], 'winGraph', 'Wins Graph')
    this.divScript();
    this.calculateStats();
  }
  
  test(value:any) {
    switch(value) {
      case 'wins':
        this.redrawSVG(this.dataArrays[0])
        break;
      case 'loses':
        this.redrawSVG(this.dataArrays[1])
        break;
      case 'draws':
        console.log(this.dataArrays[2])
        this.redrawSVG(this.dataArrays[2])
        break;
      
    }
  }

  divScript() {
    const container = document.getElementById("graph-container");
    const svg = document.getElementById("barChart");
    if( container === null || svg === null) return;
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX: number;
    let initialY: number;
    let xOffset = 0;
    let yOffset = 0;
    let scale = 1;
    let scaleMultiplier = 0.1;
    let containerWidth = container.offsetWidth;
    let maxScale = 2;
    let minScale = 1;
    container.addEventListener("mouseup", () => {
      isDragging = false;
    });
    container.addEventListener("mousedown", (e) => {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      isDragging = true;
    });
    container.addEventListener("mousemove", (e) => {
      if (isDragging) {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = Math.min(scale === 1 ? 0 : containerWidth / scale, Math.max(currentX, -3015 * scale + containerWidth));
        yOffset = Math.min(Math.max(-500 * (scale-1), currentY* scale ), 507 * scale - container.offsetHeight);
        setTranslate(xOffset, yOffset, svg);
      }
    });
    
    container.addEventListener("wheel", (e) => {
      e.preventDefault();
      let delta = -e.deltaY;
      let mouseX = e.clientX - container.offsetLeft;
      let mouseY = e.clientY - container.offsetTop;
      let beforeScale = scale;
      if (delta > 0 && scale < maxScale) {
        scale += scaleMultiplier;
      } else if (delta < 0 && scale > minScale) {
        scale -= scaleMultiplier;
      }
      let deltaScale = scale - beforeScale;
      xOffset -= (mouseX - containerWidth / 2) * deltaScale;
      yOffset -= (mouseY - container.offsetHeight / 2) * deltaScale;
      xOffset = Math.min(0, Math.max(xOffset, -3000 * scale + containerWidth));
      yOffset = Math.min(Math.max(0, yOffset), 500 * scale - container.offsetHeight);
      setTranslate(xOffset, yOffset, svg);
    });
    function setTranslate(xPos: number, yPos: number, el: HTMLElement) {
      el.style.transform = `translate(${xPos}px, ${yPos}px) scale(${scale})`;
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

  appendSVG(data: Country[], className: string, title: string) {
    const w = 3000;
    const h = 500;
    var svg = d3.select("#graph-container")
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
            return (w / dataArray.length) * i;
          });
      svg.selectAll(".code")
          .sort(function(a: any, b: any) {
            return d3.descending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length) * i + 10;
          });
      svg.selectAll(".count")
          .sort(function(a: any, b: any) {
            return d3.descending(a.count, b.count)
          })
          .transition()
          .duration(1000)
          .attr("x", function(d, i) {
            return (w / dataArray.length) * i + 10;
          });
    }
    var bars = svg.selectAll("rect")
        .data(dataArray)
        .enter()
        .append("rect")
        // .on("mouseenter", function() {
        //   d3.select(this)
        //   .attr("fill", "rgb(84, 161, 196)");
        //   })
        // .on("mouseleave", function(d) {
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

  drawLabels(dataArray: Country[], svg: d3.Selection<any, any, HTMLElement, any>, w: number, h: number, yScale: d3.ScaleLinear<any, any>){
    svg.selectAll(".count")
        .data(dataArray)
        .enter()
        .append("text")
        .attr('class', 'count')
        .text(function(d) { return d.count; })
        .attr("x", (d, i) => { return i * (w / dataArray.length) + 10; })
        .attr("y", function(d) { return h - yScale(d.count) + 15; })
        .attr("text-anchor", "middle")
        .attr("fill", "white");
    svg.selectAll(".code")
        .data(dataArray)
        .enter()
        .append("text")
        .text(function(d) { return d.code; })
        .attr('class', 'code')
        .attr("x", (d, i) => { return i * (w / dataArray.length) + 10; })
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
