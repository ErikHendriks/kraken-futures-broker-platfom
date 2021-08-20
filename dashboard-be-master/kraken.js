function getsymbol(symbol) {
    // console.log(symbol)
    $http.get('http://localhost:3000/changesymbol',{"symbol":symbol})
    console.log(data);
}

function sellmarket() {
    $http.get('http://localhost:3000/sell',{"symbol":"symbol"})
    console.log("sell");
}

function buymarket() {
    $http.get('http://localhost:3000/buy',{"symbol":"symbol"})
    console.log("buy")
}
