import { Country, MonthlyElo } from "../app.component";
import { ConstantsService } from "../services/constants.service";

export class Tooltip {

  savedStyle = {};
  constructor() {
  }

  showTooltipInfo (e: MouseEvent, data: any)  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + 30 + "px";
    tooltip.style.top = e.pageY - 200 + "px";
    this.savedStyle = tooltip.style;
    tooltip.classList.add('info-tooltip')
    tooltip.innerHTML = `
    Best winrates: <br>
    &nbsp; &nbsp; ${data.topWinrates[0].name}: ${data.topWinrates[0].winRate}% <br>
    &nbsp; &nbsp; ${data.topWinrates[1].name}: ${data.topWinrates[1].winRate}% <br>
    &nbsp; &nbsp; ${data.topWinrates[2].name}: ${data.topWinrates[2].winRate}% <br> <br>
    Worst winrates: <br>
    &nbsp; &nbsp; ${data.worstWinrates[0].name}: ${data.worstWinrates[0].winRate}% <br>
    &nbsp; &nbsp; ${data.worstWinrates[1].name}: ${data.worstWinrates[1].winRate}% <br>
    &nbsp; &nbsp; ${data.worstWinrates[2].name}: ${data.worstWinrates[2].winRate}% <br> <br>
    Global winrate: ${(data.totalWinrate*100).toFixed(1)}% <br>
    <i>Click on a bar to sort the graph.</i> `;
  }

  hideAndResetInfo() {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.remove('info-tooltip')
    this.hideTooltip();
  }

  showTooltipHowChart (e: MouseEvent, d: any, totalGames: number)  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    
    // const ratio = ((d.data.count / (d.parent.data.reason[0].count + d.parent.data.reason[1].count + d.parent.data.reason[2].count )) * 100).toFixed(1);
    const ratio = ((d.data.count / (totalGames )) * 100).toFixed(1);

    tooltip.innerHTML = `${d.data.name}: ${d.data.count}<br> Ratio: ${ratio}% `;
  }

  showTooltipTimeChart (e: MouseEvent, data: any)  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    const number = data[1] - data[0];
    const ratio = ((number / (data.data.wins + data.data.losses + data.data.draws)) * 100).toFixed(1);
    let result = null;
    const keys = Object.keys(data.data);
    for (const key of keys) {
      if (data.data[key] == number) {
          result = key.charAt(0).toUpperCase() + key.slice(1);;
      }
    }
    tooltip.innerHTML = `${result}: ${number}<br> Ratio: ${ratio}% `;
  }

  showTooltipDonut (e: MouseEvent, data: any)  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    tooltip.innerHTML = `Color: ${data.color} <br> ${data.percent}% `;
  }
  
  showTooltipHistBubble (e: MouseEvent, data: MonthlyElo,  constant: ConstantsService)  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    tooltip.innerHTML = `Date: ${constant.getDateFormat(data.date)} <br>Elo: ${data.elo} `;
  }
  
  showTooltipHistLine(e: MouseEvent, data: MonthlyElo, constant: ConstantsService) {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    tooltip.innerHTML = `Date: ${constant.getDateFormat(data.date)} <br> Game played: ${data.count}`;
  }
  
  showTooltipBarGraph = (e: MouseEvent, data: Country) => {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.add('visible')
    tooltip.style.left = e.pageX + "px";
    tooltip.style.top = e.pageY - 70 + "px";
    tooltip.innerHTML = data.name;
  }
  
  hideTooltip()  {
    const tooltip = document.getElementById("tooltip");
    if(!tooltip) return;
    tooltip.classList.remove('visible')
  }
  

}
