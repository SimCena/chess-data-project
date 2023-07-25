import { Component, OnInit } from '@angular/core';
import { ChessComDataHandlerService } from './services/chess-com-data-handler.service';
import * as d3 from 'd3';
import { StatsService } from './services/stats.service';
import { DataService } from './services/data.service';
import { ConstantsService } from './services/constants.service';


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

export interface MonthlyElo {
  elo: number,
  date: string,
  count: number,
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
  public gameModeSelected: string;
  gameModeSelectedId: number = 0;
  BAR_WIDTH = 35;
  loadCounter = 0;
  dataArrays: Country[][] = [];
  monthlyEloArrays: any;
  currentGames: any;
  stats : StatsService;
  constructor(private dataHandler: ChessComDataHandlerService, private dataService: DataService, private constants: ConstantsService) {
    this.stats = new StatsService(dataService);
    this.gameModeSelected = "blitz";
  }

  ngOnInit(){
    //this.retrieveData();
    this.loadData('winData.csv', false);
    this.loadData('lostData.csv', false);
    this.loadData('drawData.csv', false);
    this.loadMonthlyEloData('monthlyGameElo.json')
    document.addEventListener('keydown', (e) => this.handleArrowKeys(e));
    //this.loadData('lostData.csv', 'lostGraph', 'Loses Graph');
    //this.loadData('drawData.csv', 'drawGraph', 'Draws Graph');
  }
  afterLoad() {
    this.appendBarSVG(this.dataArrays[0], 'winsGraph', 'Wins Graph')
    this.appendBarSVG(this.dataArrays[1], 'losesGraph', 'Loses Graph')
    this.appendBarSVG(this.dataArrays[2], 'drawsGraph', 'Draws Graph')
    this.calculateStats();

    this.drawEloHistory(this.monthlyEloArrays[300], "blitz")
    this.drawEloHistory(this.monthlyEloArrays[600], "rapid")
    this.drawEloHistory(this.monthlyEloArrays[60], "bullet")

    // if(this.dataService.loaded){
    //   const monthlyGameElos = this.stats.getMonthlyElo();
    //   this.drawEloHistory(monthlyGameElos[300], "blitz")
    //   this.drawEloHistory(monthlyGameElos[600], "rapid")
    //   this.drawEloHistory(monthlyGameElos[60], "bullet")
    // }
  }

  handleArrowKeys(event: any) {
    
    if (event.key === 'ArrowLeft') {
      this.selectHistMode(-1);
    } else if (event.key === 'ArrowRight') {
      this.selectHistMode(1);
    }
  }
  selectHistMode(inc: number) {
    console.log(inc)
    document.getElementById(this.gameModeSelected + "-hist")!.style.zIndex = '1';
    this.gameModeSelectedId = ( this.gameModeSelectedId + inc ) % 3;
    if(this.gameModeSelectedId < 0) this.gameModeSelectedId = 2
    console.log(this.gameModeSelectedId)

    switch (this.gameModeSelectedId){
      case 1:
        this.gameModeSelected = "rapid";
        break;
      case 2:
        this.gameModeSelected = "bullet";
        break;
      case 0:
        this.gameModeSelected = "blitz";
        break;
    }
    document.getElementById(this.gameModeSelected + "-hist")!.style!.zIndex = '3';
  }

  selectGraph(value:any) {
    const boxes = document.getElementsByClassName('game-box') as HTMLCollectionOf<HTMLElement>;
    const boxesArray = Array.from(boxes);
  
  
    for (const box of boxesArray) {
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
      this.loadCounter++;
      if(this.loadCounter > 3){
        this.afterLoad()
      }
    })
  }

  loadMonthlyEloData(fileName: string){
    d3.json('../assets/' + fileName).then( (data)=> {
      this.monthlyEloArrays = data;
      this.loadCounter++;
      if(this.loadCounter > 3){
        this.afterLoad()
      }
    })
  }

  appendBarSVG(data: Country[], className: string, title: string) {
    // const w = 5000;
    const h = 500;
    let w = data.length * this.BAR_WIDTH;
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
    var showTooltipBarGraph = (e: MouseEvent, data: Country) => {
      const tooltip = document.getElementById("tooltip");
      if(!tooltip) return;
      tooltip.classList.add('visible')
      tooltip.style.left = e.pageX + "px";
      tooltip.style.top = e.pageY - 70 + "px";
      tooltip.innerHTML = data.name +"<br>"+ "Games: "+ data.count;
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
          showTooltipBarGraph(e, d);
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

  drawEloHistory(eloData: MonthlyElo[], name: string){
    const margin = { top: 20, right: 40, bottom: 30, left: 40 };
    const width = 2000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#" + name + "-hist")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
      .domain(eloData.map(d => d.date))
      .range([0, width])
      .padding(0.2);

    const minElo = Math.min(...eloData.map(obj => obj.elo));
    const maxElo = Math.max(...eloData.map(obj => obj.elo));

    const yScale = d3.scaleLinear()
      .domain([minElo, maxElo])
      .range([height, 0]);
  
    const line = d3.line<MonthlyElo>()
      .x(d => xScale(d.date)! + xScale.bandwidth() / 2)
      .y(d => yScale(d.elo))
      .curve(d3.curveLinear);

    const axis = svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(d3.scaleBand()
      .domain(eloData.map(d => d.date))
      .range([0, width])
      .padding(0.2)));

    svg.append("g")
      .call(d3.axisLeft(yScale));

    svg.append("path")
      .datum(eloData)
      .attr("fill", "none")
      .attr("stroke", "#5e5e5e")
      .attr("stroke-width", 6)
      .attr("d", line)
      .on("mousemove", function(e, d){
        var eachBand = xScale.step();
        var index = Math.floor(((e.pageX - axis.node()!.getBoundingClientRect()!.x - margin.left)/ eachBand));
        d3.select(this).attr("stroke-width", 8)
        showTooltipHistLine(e, eloData[index], new ConstantsService);
      })
      .on("mouseout", function(){
        d3.select(this).attr("stroke-width", 6)
        hideTooltip();
      });
  


    const dots = svg.selectAll(".dot")
      .data(eloData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date)! + xScale.bandwidth() / 2)
      .attr("cy", d => yScale(d.elo))
      .attr("r", 9) // Adjust the radius as needed
      .style("fill", "#272522") // Adjust the fill color as needed
      .style("cursor", "pointer")
      .on("mousemove", function(e, d){
        showTooltipHistBubble(e, d, new ConstantsService);
        d3.select(this).attr("r", 12)

      })
      .on("mouseout", function(){
        hideTooltip();
        d3.select(this).attr("r", 9)
      });
  }


}

function showTooltipHistBubble (e: MouseEvent, data: MonthlyElo,  constant: ConstantsService)  {
  const tooltip = document.getElementById("tooltip");
  if(!tooltip) return;
  tooltip.classList.add('visible')
  tooltip.style.left = e.pageX + "px";
  tooltip.style.top = e.pageY - 70 + "px";
  tooltip.innerHTML = `Date: ${constant.getDateFormat(data.date)} <br>Elo: ${data.elo} `;
}

function showTooltipHistLine(e: MouseEvent, data: MonthlyElo, constant: ConstantsService) {
  const tooltip = document.getElementById("tooltip");
  if(!tooltip) return;
  tooltip.classList.add('visible')
  tooltip.style.left = e.pageX + "px";
  tooltip.style.top = e.pageY - 70 + "px";
  tooltip.innerHTML = `Date: ${constant.getDateFormat(data.date)} <br> Game played: ${data.count}`;
}

var showTooltipBarGraph = (e: MouseEvent, data: Country) => {
  const tooltip = document.getElementById("tooltip");
  if(!tooltip) return;
  tooltip.classList.add('visible')
  tooltip.style.left = e.pageX + "px";
  tooltip.style.top = e.pageY - 70 + "px";
  tooltip.innerHTML = data.name;
}

function hideTooltip()  {
  const tooltip = document.getElementById("tooltip");
  if(!tooltip) return;
  tooltip.classList.toggle('visible')
}
