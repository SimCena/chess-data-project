import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ChessComDataHandlerService } from './services/chess-com-data-handler.service';
import * as d3 from 'd3';
import { StatsService } from './services/stats.service';
import { DataService } from './services/data.service';
import { ConstantsService } from './services/constants.service';
import { Tooltip } from './components/tooltip';

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

var tooltip = new Tooltip(); 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chess-project';
  public gameModeSelected: string;
  public graphSelected: string;
  gameModeSelectedId: number = 0;
  graphSelectedId: number = 0;
  BAR_WIDTH = 35;
  loadCounter = 0;
  dataArrays: Country[][] = [];
  monthlyEloArrays: any;
  currentGames: any;
  stats : StatsService;
  mouseBar = false;
  mouseHist = false;
  savedStats = {
    topWinrates: [],
    worstWinrates: [],
    totalWinrate: 0,
    totalWins: 0,
    totalLosses: 0,
    totalDraws:0
  }
  constructor(private dataHandler: ChessComDataHandlerService, private dataService: DataService, private constants: ConstantsService) {
    this.stats = new StatsService(dataService);
    this.gameModeSelected = "Blitz";
    this.graphSelected = "Wins Graph"
  }

  ngOnInit(){
    //this.retrieveData();
    this.loadData('winData.csv', false);
    this.loadData('lostData.csv', false);
    this.loadData('drawData.csv', false);
    this.loadMonthlyEloData('monthlyGameElo.json');
    this.loadGames();

  }
  afterLoad() {
    this.appendBarSVG(this.dataArrays[0], 'winsGraph', 'Wins Graph')
    this.appendBarSVG(this.dataArrays[1], 'lossesGraph', 'Losses Graph')
    this.appendBarSVG(this.dataArrays[2], 'drawsGraph', 'Draws Graph')
    this.calculateStats();

    this.drawEloHistory(this.monthlyEloArrays[300], "Blitz")
    this.drawEloHistory(this.monthlyEloArrays[600], "Rapid")
    this.drawEloHistory(this.monthlyEloArrays[60], "Bullet")
    this.drawCircle();
    this.drawTimeChart();
    this.drawHowChart();
  }

  ngAfterViewInit(){
    document.addEventListener('keydown', (e) => this.handleArrowKeys(e));
    const barDiv = document.getElementById('bar-info-container')!;
    barDiv!.addEventListener('mouseenter', () => {
      this.mouseBar = true;
    });
    barDiv!.addEventListener('mouseleave', () => {
      this.mouseBar = false;
    });
    const histDiv = document.getElementById('hist-container')!;
    histDiv!.addEventListener('mouseenter', () => {
      this.mouseHist = true;
    });
    histDiv!.addEventListener('mouseleave', () => {
      this.mouseHist = false;
    });
    const histDivInfo = document.getElementById('hist-info-container')!;
    histDivInfo!.addEventListener('mouseenter', () => {
      this.mouseHist = true;
    });
    histDivInfo!.addEventListener('mouseleave', () => {
      this.mouseHist = false;
    });
    document!.addEventListener('keydown', (e) => this.handleArrowKeys(e));
  }

  handleArrowKeys(event: any) {
    
    if (event.key === 'ArrowLeft') {
      if(this.mouseHist)
        this.selectHistMode(-1);
      if(this.mouseBar)
        this.selectGraph(-1);
    } else if (event.key === 'ArrowRight') {
      if(this.mouseHist)
        this.selectHistMode(1);
      if(this.mouseBar)
        this.selectGraph(1);
    }
  }
  selectHistMode(inc: number) {
    document.getElementById(this.gameModeSelected + "-hist")!.style.zIndex = '1';
    this.gameModeSelectedId = ( this.gameModeSelectedId + inc ) % 3;
    if(this.gameModeSelectedId < 0) this.gameModeSelectedId = 2

    switch (this.gameModeSelectedId){
      case 1:
        this.gameModeSelected = "Rapid";
        break;
      case 2:
        this.gameModeSelected = "Bullet";
        break;
      case 0:
        this.gameModeSelected = "Blitz";
        break;
    }
    document.getElementById(this.gameModeSelected + "-hist")!.style!.zIndex = '3';
  }

  selectGraph(inc: number) {
    const val = this.graphSelected.split(" ")[0].toLowerCase();
    document.getElementById(val + "GraphContainer")!.style!.zIndex = '1';
    this.graphSelectedId = ( this.graphSelectedId + inc ) % 3;
    if(this.graphSelectedId < 0) this.graphSelectedId = 2
    switch(this.graphSelectedId) {
      case 0:
        //this.redrawSVG(this.dataArrays[0])
        this.graphSelected = "Wins Graph";
        break;
      case 1:
        //this.redrawSVG(this.dataArrays[1])
        this.graphSelected = "Losses Graph";

        break;
      case 2:
        //this.redrawSVG(this.dataArrays[2])
        this.graphSelected = "Draws Graph";
        break;
    }
    document.getElementById(this.graphSelected.split(" ")[0].toLowerCase() + "GraphContainer")!.style!.zIndex = '3';

  }

  calculateStats(){
    //this.stats.waffleChart(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
    this.savedStats.topWinrates = <any>this.stats.getTopTenWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
    this.savedStats.worstWinrates = <any>this.stats.getWorseWinRates(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
    this.savedStats.totalWinrate = <any>this.stats.getTotalWinRate(this.dataArrays[0], this.dataArrays[1], this.dataArrays[2]);
    this.savedStats.totalWins = this.dataArrays[0].reduce((currentVal, w) => w.count+ currentVal, 0);
    this.savedStats.totalLosses = this.dataArrays[1].reduce((currentVal, w) => w.count+ currentVal, 0);
    this.savedStats.totalDraws = this.dataArrays[2].reduce((currentVal, w) => w.count+ currentVal, 0);

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
      this.incrLoadCounter();
    })
  }

  loadMonthlyEloData(fileName: string){
    d3.json('../assets/' + fileName).then( (data)=> {
      this.monthlyEloArrays = data;
      this.incrLoadCounter();
    })
  }

  loadGames(){
    d3.json('../assets/games.json' ).then( (data: any)=> {
      this.dataService.games = data;
      this.incrLoadCounter();
    })
  }

  incrLoadCounter(){
    this.loadCounter++;
    if(this.loadCounter > 4){
      this.afterLoad()
    }
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
          d3.select(this).style("opacity", "0.8")
          showTooltipBarGraph(e, d);
        })
        .on("mouseout", function(){
          d3.select(this).style("opacity", "1")
          hideTooltip();
        })
        .attr("x", (d, i) => { return i * ((w / dataArray.length ) + 1) ; })
        .attr("y", (d) => { 
          return h - yScale(d.count) })
        .attr("width", this.BAR_WIDTH + "px")
        .attr("height", function(d) { return yScale(d.count) })
        .style("fill", "rgb(39, 37, 34)")
        .style("cursor", "pointer")
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

    function customSortObjects(a: MonthlyElo, b: MonthlyElo): number {
      const [aMonth, aYear] = a.date.split(" ").map(Number);
      const [bMonth, bYear] = b.date.split(" ").map(Number);
    
      if (aYear !== bYear) {
        return aYear - bYear;
      } else {
        return aMonth - bMonth;
      }
    }
    eloData = eloData.sort(customSortObjects)

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
      .style("cursor", "pointer")
      .on("mousemove", function(e, d){
        var eachBand = xScale.step();
        var index = Math.floor(((e.pageX - axis.node()!.getBoundingClientRect()!.x - margin.left)/ eachBand));
        d3.select(this).attr("stroke-width", 8)
        tooltip.showTooltipHistLine(e, eloData[index], new ConstantsService);
      })
      .on("mouseout", function(){
        d3.select(this).attr("stroke-width", 6)
        tooltip.hideTooltip();
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
        tooltip.showTooltipHistBubble(e, d, new ConstantsService);
        d3.select(this).attr("r", 12)

      })
      .on("mouseout", function(){
        tooltip.hideTooltip();
        d3.select(this).attr("r", 9)
      });

  }

  drawCircle(){
    //TODO ADD DRAWS
    const width = 500;
    const height = 500;
    const radius = Math.min(width, height) / 2;

    const sideData = [{color: "White", value: 0, percent: ""}, {color: "Black", value: 0, percent: ""}]
    const testData = [0, 0];

    this.dataService.games.forEach(element => {
      if(element.Termination.split(" ")[0] == "SimCena"){
        if(element.Side == "White"){
          // sideData["White"]++;
          sideData[0].value++;
          testData[0]++;
        }
        else {
          // sideData["Black"]++;
          testData[1]++;
          sideData[1].value++;
        }
      }
    });

    sideData[0].percent = ((sideData[0].value / (sideData[0].value + sideData[1].value))* 100).toFixed(1);
    sideData[1].percent = ((sideData[1].value / (sideData[0].value + sideData[1].value))* 100).toFixed(1);

    const colorScale = d3.scaleOrdinal()
      .domain(["White", "Black"])
      .range(["#f0f0f0", "#000000"]);

    const svg = d3.select("#donut-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);


    const arc = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius * 0.8);

    var pie = d3.pie().value(function(d: any) { 
      return d.value; 
    });

    // var data_ready = pie(Object.entries(sideData))

    // console.log(data_ready);
    const arcs = svg.selectAll("arc")
      .data(pie(<any>sideData))
      .enter()
      .append("g")
      .attr("class", "arc");

    arcs.append("path")
      .attr("d", <any>arc)
      .attr("fill", function (d: any): any { return colorScale(d.data.color)})
      .style("cursor", "pointer")
      .attr("stroke", "#333333")
      .attr("stroke-width", 3)
      .on("mousemove", function(e, d:any) {
        tooltip.showTooltipDonut(e, d.data);
      })
      .on("mouseleave", function(e, d:any) {
        tooltip.hideTooltip()
      })

    arcs.append("text")
      .attr("transform", function(d: any):any { return `translate(${arc.centroid(d)})`})
      .attr("text-anchor", "middle")
      .attr("fill", function(d:any) {
        if(d.data.color == "Black") return "#f0f0f0";
        else return "#000000";
      })
      .style("pointer-events", "none")
      .style("user-select", "none")
      .text(function(d: any):any{return  d.data.color});

    svg.append("text")
      .attr("transform", "translate(0, -10)")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .style("font-size", "28px")
      .text("Chess Pieces");

  }

  drawTimeChart(){
    const width = 900;
    const height = 500;
    const margin = { top: 30, right: 10, bottom: 40, left: 60 };
    const timeData = [{Time: "Night (0h-6h)", wins: 0, losses:0, draws: 0}, {Time: "Morning (6h-12h)", wins: 0, losses:0, draws:0 }, {Time: "Afternoon (12h-18h)", wins: 0, losses:0, draws: 0}, {Time: "Evening (18h-0h)", wins: 0, losses:0, draws:0}]

    this.dataService.games.forEach(game => {
      const hourOfDay = parseInt(game.UTCTime.split(":")[0])
      const indexOfDay = Math.floor(hourOfDay / 6);
      const opponentName = game.Side == "White" ? game.Black : game.White;
      if(game.Termination.split(" ")[0] == "SimCena"){
        timeData[indexOfDay].wins++;
      } else if (game.Termination.split(" ")[0] == opponentName){
        timeData[indexOfDay].losses++;
      } else {
        timeData[indexOfDay].draws++;
      }
    });
    const colors = ["#81b64c", "#e02828", "#006cc2"];

    const svg = d3.select("#time-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
    
    const stack = d3.stack()
      .keys(["wins", "losses", "draws"])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);
    
    const stackedData = stack(<any>timeData);
    
    const xScale = d3.scaleBand()
      .domain(timeData.map(d => d.Time))
      .range([margin.left, width - margin.right])
      .padding(0.1);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(stackedData, function(d:any):any {return d3.max(d, function(d:any) {return d[1]})})])
      .range([height - margin.bottom, margin.top]);
    
    const xAxis = d3.axisBottom(xScale)
    const yAxis = d3.axisLeft(yScale);
    
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .style('font-size', '14px')
      .call(xAxis);
    
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .style('font-size', '12px')
      .call(yAxis);
    
    const bars = svg.selectAll(".bar")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("fill", (d, i) => colors[i]);
    
    bars.selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => xScale(<any>d.data["Time"])!)
      .attr("y", d => yScale(d[1]))
      .attr("height", d => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth())
      .attr("stroke", "#333333")
      .attr("stroke-width", 3)
      .on("mousemove", function(e, d) {
        tooltip.showTooltipTimeChart(e, d)
      })
      .on("mouseleave", tooltip.hideTooltip)
    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom / 2 + 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Time of Day");
    
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", 0 - height / 2)
      .attr("y", margin.left / 2 -10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Games");

  }

  drawHowChart(){
    const width = 500;
    const height = 500;
    const margin = { top: 30, right: 10, bottom: 40, left: 60 };
    const howData = [{result: "Win", reason: [{name: "Resignation", count: 0,}, {name: "Checkmate", count: 0}, {name: "Timeout", count: 0}]},
                    {result: "Lose", reason: [{name: "Resignation", count: 0}, {name: "Checkmate", count: 0}, {name: "Timeout", count: 0}]},]
    let totalGames = 0;
    this.dataService.games.forEach(game => {
      let resultIndex = 0;
      const opponentName = game.Side == "White" ? game.Black : game.White;
      totalGames++;
      if(game.Termination.split(" ")[0] == "SimCena"){
        resultIndex = 0;
      } else if (game.Termination.split(" ")[0] == opponentName){
        resultIndex = 1;
      } else return;
      if(game.Termination.includes("resignation") || game.Termination.includes("abandoned")){
        howData[resultIndex].reason[0].count++;
      } else if(game.Termination.includes("checkmate")){
        howData[resultIndex].reason[1].count++;
      } else if(game.Termination.includes("time")){
        howData[resultIndex].reason[2].count++;
      } else console.log(game.Termination);

    });

    const svg = d3.select("#how-chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Create a hierarchical structure using d3.hierarchy
    const root = d3.hierarchy(howData, function(d:any):any { return (Array.isArray(d) ? d : d.reason) })
      .sum(d => d.count)
      .sort((a, b) => b.value! - a.value!);

    // Create the treemap layout using d3.treemap
    const treemap = d3.treemap()
      .size([width, height])
      .padding(1);

    // Compute the treemap layout
    treemap(root);

    // Draw the treemap
    const tiles = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("transform", function(d:any):any { return `translate(${d.x0}, ${d.y0})`});

    tiles.append("rect")
      .attr("class", "tile")
      .attr("width", function(d:any):any { return d.x1 - d.x0})
      .attr("height", function(d:any):any { return d.y1 - d.y0})
      .attr("fill", function(d:any):any { 
        let color; 
        if(d.parent.data.result == "Win") color = d3.rgb(129, 182, 76);
        else color = d3.rgb(224, 40, 40)
        if(d.data.name == "Checkmate") color = color.brighter();
        else if(d.data.name == "Timeout") color = color.darker();
        return color;

      })
      .attr("stroke", "#333333")
      .attr("stroke-width", 3)
      .on("mousemove", function(e, d) {
        tooltip.showTooltipHowChart(e, d, totalGames);
      })
      .on("mouseleave", tooltip.hideTooltip)

    tiles.append("text")
      .attr("class", "tile-text")
      .selectAll("tspan")
      .data(function(d:any):any { return d.data.name.split(/(?=[A-Z][^A-Z])/g)})
      .enter()
      .append("tspan")
      .attr("x", 4)
      .attr("y", (d, i) => 13 + i * 10)
      .text(function(d:any):any {return d});
    
  }

  showInfo(e:any) {
    tooltip.showTooltipInfo(e, this.savedStats)
  }

  hideInfo(){
    tooltip.hideAndResetInfo();
  }

}
