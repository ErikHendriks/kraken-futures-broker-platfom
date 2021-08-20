const Http = new XMLHttpRequest();

function getsymbol(symbol) {
  document.getElementById("symbol").innerHTML = symbol
  let url='http://localhost:3000/changesymbol?symbol='+symbol;
  //url+=symbol
  // console.log(url)
  Http.open("GET", url);
  Http.send();

}


function sellmarket() {
  let url='http://localhost:3000/sell?amount='+document.getElementById("amount").value;
  // console.log(url)
  Http.open("GET", url);
  Http.send();
}

function buymarket() {
  let url='http://localhost:3000/buy?amount='+document.getElementById("amount").value;
  // console.log(url)
  Http.open("GET", url);
  Http.send();
}

function cancelorder(order_id) {
  let url='http://localhost:3000/cancelorder?order_id='+order_id;
  // console.log("kraken cancelorder", url)
  Http.open("GET", url);
  Http.send();
}
