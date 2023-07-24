import * as d3 from 'd3';
import { Country } from '../app.component';
import { DataService } from './data.service';

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
    const monthlyGameElo: any[] = []
    let firstMonthlyGame: any = {};

    for(let i = 0; i < this.dataService.games.length; i++){
      if(i==0 || this.isNewMonth(this.dataService.games[i]["EndDate"], this.dataService.games[i-1]["EndDate"])){
        firstMonthlyGame = {};
        firstMonthlyGame["Elo"] = this.dataService.games[i]["Elo"];
        firstMonthlyGame["Date"] = this.dataService.games[i]["EndDate"];
        console.log(firstMonthlyGame)
        monthlyGameElo.push(firstMonthlyGame);
      }
    }

    console.log(monthlyGameElo)
    return monthlyGameElo;
  }

  isNewMonth(currentDate: Date, targetDate: Date){
    return Math.abs(targetDate.getMonth() - currentDate.getMonth()) > 0;
  }
}
