import * as d3 from 'd3';
import { Country, MonthlyElo } from '../app.component';
import { DataService } from './data.service';
import { saveAs } from "file-saver";


export class StatsService {

  dataService: DataService;

  constructor(dataService: DataService) {
    this.dataService = dataService;
   }

  

  getTotalWinRate(wins: Country[], loses: Country[]){
    const winsCount = wins.reduce((currentVal, w) => w.count+ currentVal, 0)
    const losesCount = loses.reduce((currentVal, l) => l.count+ currentVal, 0)
    console.log(winsCount + losesCount)
    console.log(winsCount / losesCount)
    
  }

  waffleChart(wins: Country[], loses: Country[], draws: Country[]) {
    const data = [];
    data.push({"name" : "wins", "value" : d3.sum(wins, function (c) {
      return c.count;
    }) })
    data.push({"name" : "Loses", "value" : d3.sum(loses, function (c) {
      return c.count;
    }) })
    data.push({"name" : "draws", "value" : d3.sum(draws, function (c) {
      return c.count;
    }) })
    const myColors = d3.scaleOrdinal()
      .domain(["Wins", "Loses", "Draws"])
      .range(["#EDAE49", "#D1495B", "#00798C"]);
    const ttColors = d3.scaleOrdinal()
      .domain(["Wins", "Loses", "Draws"])
      .range(["#ba8839", "#91323f", "#00515e"]);
    console.log(data)
  }

  getTopTenWinRates(wins: Country[], loses: Country[], draws: Country[]) {
    const winRates: { name: string; code: string; winRate: number; gamesPlayed: number;}[] = []
    wins.forEach((w)=>{
      const countryTemp = loses.find((l)=> {return l.code === w.code})
      const lCount = (countryTemp === undefined ? 0 : countryTemp.count);
      if(w.count + lCount > 30)
        winRates.push({
          name: w.name,
          code: w.code,
          winRate:parseFloat(((w.count / (lCount + w.count))*100).toFixed(1)),
          gamesPlayed: w.count + lCount
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
      const wCount = (countryTemp === undefined ? 0 : countryTemp.count);
      if(l.count + wCount > 30)
        winRates.push({
          name: l.name,
          code: l.code,
          winRate: parseFloat(((wCount / (l.count + wCount))*100).toFixed(1)),
          gamesPlayed: l.count + wCount
        })
    })
    
    winRates.sort((a, b)=> {
      return b.winRate - a.winRate
    })
    return winRates.sort((a, b)=> {
      return a.winRate - b.winRate
    }).splice(0,10);
  }

  getMonthlyElo() {
    const monthlyGameElo: any = {}
    const monthMap: any = {};
    let firstMonthlyGame: any = {};
    let games_count = 0;

    
    // for(let i = 0; i < this.dataService.games.length; i++){
    //   const formattedMonth = this.dataService.games[i]["EndDate"].getMonth()+1 + " " + (this.dataService.games[i]["EndDate"].getYear() + 1900);
    //   const timeControl = this.dataService.games[i]["TimeControl"];
    //     if(monthMap[timeControl] == undefined) monthMap[timeControl] = {}
    //     if(monthMap[timeControl][formattedMonth] == undefined){
    //         firstMonthlyGame = {};
    //         firstMonthlyGame["elo"] = this.dataService.games[i]["Elo"];
    //         firstMonthlyGame["date"] = formattedMonth;
    //         firstMonthlyGame["count"] = 1;
    //         monthMap[timeControl][formattedMonth] = firstMonthlyGame;
    //     } else {
    //       monthMap[timeControl][formattedMonth]["count"]++;
    //     }
    // }
    // let i = 0;
    // for (const timeControls in monthMap){
    //   monthlyGameElo[timeControls] = [];
    //   for(const month in monthMap[timeControls]){
    //     monthlyGameElo[timeControls].push(monthMap[timeControls][month]);
    //   }
    //   monthlyGameElo[timeControls] = monthlyGameElo[timeControls].sort((a:any, b:any) => {
    //     const [monthA, yearA] = a.date.split(" ");
    //     const [monthB, yearB] = b.date.split(" ");
        
    //     if (yearA !== yearB) {
    //       return parseInt(yearA) < parseInt(yearB); // Compare years as strings
    //     } else {
    //       return parseInt(monthA) < parseInt(monthB); // Compare months as strings within the same year
    //     }
    //   });
    //   const [minMonth, minYear] = monthlyGameElo[timeControls][0].date.split(" ");
    //   const [maxMonth, maxYear]  = monthlyGameElo[timeControls][monthlyGameElo[timeControls].length - 1].date.split(" ");
    //   let [currMonth, currYear] = [minMonth, minYear]; 
    //   let i = 0;

    //   while( !(currMonth == maxMonth && currYear == maxYear)) {
    //     let formatedDate = currMonth + " " + currYear;
    //     if(!monthlyGameElo[timeControls].some((item: { date: string; }) => item.date == formatedDate )){
    //       const lastElo = monthlyGameElo[timeControls][i-1].elo;
    //       monthlyGameElo[timeControls].splice(i, 0, {elo: lastElo, date: formatedDate, count: 0})
    //     }
    //     currMonth++;
    //     if(currMonth > 12) {
    //       currMonth = 1;
    //       currYear++;
    //     }
    //     i++;
    //   }
      
    // }
    //this.saveascsv(monthlyGameElo, "monthlyGameElo.json");
    
    return monthlyGameElo;

  }

  saveascsv(obj: any, filename: string){
    console.log(obj);
    const blob: any = new Blob([JSON.stringify(obj)], { type: "text/json;charset=utf-8" });
    saveAs(blob, filename);
  }
}
