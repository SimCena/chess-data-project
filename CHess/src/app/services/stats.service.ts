import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Country } from '../app.component';

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  constructor() { }

  

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
}
