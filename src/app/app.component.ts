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
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'chess-project';
  data:any;
  countryMap: any;
  counter = 0;
  dataArray = [];
  map: any;
  currentGames: any;
  constructor(private dataHandler: ChessComDataHandlerService) {
    this.countryMap = new Object();
  }

  ngOnInit(){
    //this.retrieveData();
    this.loadData();
  }

  loadData() {
    console.log('allo')
    d3.csv('../assets/data.csv').then(  (rawData) => {
      console.log(rawData);
      const data: Country[] = []
      rawData.forEach((d) => {
        data.push({
          name: d['name']!,
          code: d['code']!,
          count: parseInt(d['count']!)
        })
      })
      data = data.splice((d) => {
        if(d.count > 1) return d;

      })
        const w = 3000;
        const h = 1000;
        var svg = d3.select("body")
              .append("svg")
              .attr("width", h)
              .attr("height", w);
        
        let max = 0;
        data.forEach((c)=>{
          if(c['count'] > max) max = c['count'];
        })
        console.log(max)
        var yScale = d3.scaleLinear()
              .domain([0, max])
              .range([50, h-50]);
        // displayFlags();
        this.drawBars(data, svg, w, h, yScale);
        this.drawLabels(data, svg, w, h, yScale);
    })
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
        this.getFlag("https://api.chess.com/pub/player/" + opponent.username);
        await this.sleep(150);
      }
      this.counter++;
      if(this.counter < 36) {
        console.log(this.counter);
        this.displayMonthGames(++index);
      } else {
        this.map = Object.values(this.countryMap);
        console.log(this.map);
       
          
        const dataArray: Country[] = Object.values(this.countryMap);
        const csvData = d3.csvFormat(dataArray);
        
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
        saveAs(blob, "data.csv");

        // const w = 1000;
        // const h = 1000;
        // var svg = d3.select("body")
        //       .append("svg")
        //       .attr("width", h)
        //       .attr("height", w);
        
        // let max = dataArray[0].count
        // dataArray.forEach((c)=>{
        //   if(c.count > max) max = c.count;
        // })
        // var yScale = d3.scaleLinear()
        //       .domain([0, max])
        //       .range([50, h-50]);
        // // displayFlags();
        // this.drawBars(dataArray, svg, w, h, yScale);
        // this.drawLabels(dataArray, svg, w, h, yScale);
        return;
      }
    });
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
    svg.selectAll("text")
        .data(dataArray)
        .enter()
        .append("text")
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

  sleep(delayTime: number) {
    return new Promise(resolve => setTimeout(resolve, delayTime));
  }

  getFlag(userUrl: string){
    this.dataHandler.getDataFromUrl(userUrl).subscribe(
      (response:any) =>{
        this.dataHandler.getDataFromUrl(response.country).subscribe(
          (response:any) => {
            let tempName = response.code;
            this.countryMap[tempName] = this.countryMap[tempName] === undefined ? {code: response.code, name: response.name, count: 1} :
            { code: this.countryMap[tempName].code, name: this.countryMap[tempName].name, count: this.countryMap[tempName].count + 1};
            return;
          }
        )
      }
    )
  }

  retrieveData() {
    this.dataHandler.getGames()
    .subscribe((response:any) => {
      this.data = response.archives;
      console.log(this.data);
      console.log(this.data['length']);
      this.displayMonthGames(0);
      });
  }

}
