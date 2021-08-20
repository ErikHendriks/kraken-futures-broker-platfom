import { Component, AfterViewInit } from '@angular/core';
import { Chart } from 'chart.js';

import io from 'socket.io-client';

const socket = io('http://localhost:3000');

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements AfterViewInit {
  title = 'bid/ask prices';
  chart;
  http: any;
  constructor() {}

  ngAfterViewInit() {
    let symbol = "XETHZUSD"
    document.getElementById("symbol").innerHTML = symbol
    socket.on('tickdata', (res) => {
      // console.log(res)
      this.updateChartData(this.chart, res);
    })

    let pnl = {"fi_xbtusd": 0, "fi_ethusd": 0, "fi_ltcusd": 0, "fi_xrpusd": 0}
    socket.on('accountdata', (res) => {
      document.getElementById("parentfunds").innerHTML = "";
      // console.log(res)
      for (let i in res){
        if ((i == "cash") || (i == "fv_xrpxbt") || (i == "fi_bchusd")) { continue }
        console.log(res[i].auxiliary)
        var root = document.getElementById("parentfunds");
        var div = document.createElement("div");
        (res[i]["auxiliary"]["pnl"] == 0) ? div.className = "" : (res[i]["auxiliary"]["pnl"] < 0) ? div.className = "rpnl" : div.className = "gpnl"
        div.innerHTML = (`
        <div class="funds" style="margin: 15px;">
          <p>symbol = ${i}</p>
          <p>funds = ${res[i]["auxiliary"]["af"]}</p>
          <p style="margin-right:10px;">pnl = ${res[i]["auxiliary"]["pnl"]}</p>
          <p>margin = ${res[i]["marginRequirements"]["im"]}</p>
        <div>
        `);
        root.appendChild(div);
        pnl[i] = res[i]["auxiliary"]["af"]
      }
    })

    socket.on('openpositions', (res) => {
      document.getElementById("openpositions").innerHTML = "";
      console.log(res);
      for (let i in res){
        console.log(i)
        var ul = document.getElementById("openpositions");
        var li = document.createElement("li");
        li.className = "nav-item"
        li.innerHTML = (`
        <div class="sidepositions">
          <a class="nav-link" onclick="getsymbol('${res[i].symbol}')">${res[i].symbol}</a>
          <p>side = ${res[i].side}</p>
          <p>price = ${res[i].price}</p>
          <p>size = ${res[i].size}</p>
          <!--<p>unrealizedFunding = ${res[i].unrealizedFunding}</p>-->
          <hr style="width: 100%; margin: 0 auto; color: red; height: 2px;">
        <div>
          `);
        ul.appendChild(li);
      }
    })

    socket.on('openorders', (res) => {
      // document.getElementById("openpositions").innerHTML = "";
      console.log(res);
      for (let i in res){
        console.log(i)
        var ul = document.getElementById("openpositions");
        var li = document.createElement("li");
        li.className = "nav-item"
        li.innerHTML = (`
        <div class="sidepositions">
          <div class="cancelbutton">
            <a class="nav-link" onclick="getsymbol('${res[i].symbol}')">${res[i].symbol}</a>
            <button onclick="cancelorder('${res[i].order_id}')" style="background-color:blue;color:white" type="button" class="btn btn-sm btn-outline-secondary">close</button>
          </div>
          <p>side = ${res[i].side}</p>
          <p>filltime = ${res[i].receivedTime}</p>
          <hr style="width: 100%; margin: 0 auto; color: red; height: 2px;">
        <div>
          `);
        ul.appendChild(li);
      }
    })

    socket.on('ohlc', (res) => {
      document.getElementById("myTable").innerHTML = "";
      // const symbols = ["XZECZUSD", "XETHZUSD", "XXBTZUSD", "XLTCZUSD", "XXRPZUSD", "XZECZEUR", "XETHZEUR", "XXBTZEUR", "XLTCZEUR", "XXRPZEUR"]
      const symbols = ["XETHZUSD", "XXBTZUSD", "XLTCZUSD", "XXRPZUSD"]
      function inserttable(symbol) {
        //console.log(res[symbol])
        var table: HTMLTableElement = <HTMLTableElement> document.getElementById("myTable");
        var row = table.insertRow(0);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        cell1.innerHTML = "<a onclick=\"getsymbol('" + symbol + "')\">" + symbol + "</a>";
        cell2.innerHTML = new Date(res[symbol][719][0] * 1000).toISOString().substring(0,19).replace("T", " ");
        cell3.innerHTML = res[symbol][719][1];
        cell4.innerHTML = res[symbol][719][2];
        cell5.innerHTML = res[symbol][719][3];
        cell6.innerHTML = res[symbol][719][4];
      }
      symbols.forEach(inserttable)
    })

    this.chart = new Chart('chartjs', {
      type: 'line',
      options: {
        animation: false,
        indexAxis: 'y',
        scales: {xAxes: [{
          display: true
        }],
        yAxes: [{
          display: true
        }],
          y: {
            offset: false,
            type: 'linear',
            grace: '15%',
            data: {
              crossAlign: 'near',
            }
          }
        },
        layout: {
          padding: {
            top: 50,
            bottom: 50
          },
        },
        responsive: true,
        title: {
          display: true,
          text: 'bid/ask prices'
        },
      },
      data: {
        labels: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],

        datasets: [
          {
            type: 'line',
            label: 'ask',
            borderColor: 'red',
            fill: false,
          },{
            type: 'line',
            label: 'bid',
            borderColor: 'blue',
            fill: false,
          }
        ]
      }
    });
  }

  updateChartData(chart, data){
    // console.log("updatechart: ", data)
    chart.data.datasets[0].data = data[0];
    chart.data.datasets[1].data = data[1];
    chart.update();
  }
}
