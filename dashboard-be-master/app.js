#!/usr/bin/env node --max-old-space-size=4096
process.env.UV_THREADPOOL_SIZE = 128;
// const crypto = require('crypto');
// const qs     = require('qs');

let crypto = require('crypto')
const utf8 = require('utf8')
let qs = require('querystring')
let request = require('request')
const express = require('express');
const socket = require('socket.io');
const cors = require('cors');
const KrakenClient = require('kraken-api');
const app = express();

app.use(cors({origin: '*'}));

// let symbol = "PI_XBTUSD"
let symbol = "PI_ethusd"
let tickdata = [[], []]
// let ask = []
// let bid = []

const server = app.listen(3000,() => {
    console.log('Started in 3000');
});

const io = socket(server);

io.sockets.on('connection', (socket) => {
    getaccount(socket)
    getOHLC(socket);
    orderbook(socket);
    openpositions(socket);
    openorders(socket);
})
//fv_xrpxbt
app.get('/changesymbol',function(res){
    (res.query.symbol === "XETHZUSD") ? symbol = "PI_ethusd" :
    (res.query.symbol === "XXBTZUSD") ? symbol = "PI_xbtusd" :
    (res.query.symbol === "XLTCZUSD") ? symbol = "PI_ltcusd" :
    (res.query.symbol === "XXRPZUSD") ? symbol = "PI_xrpusd" : symbol = "PI_xbtusd" 
    tickdata = [[], []]

});

app.get('/sell',function(res){
    // console.log(res.query.amount)
    sendlimitorder("sell", res.query.amount)
});

app.get('/buy',function(res){
    // console.log(res.query.amount)
    sendlimitorder("buy", res.query.amount)
});

app.get('/cancelorder',function(res){
    // console.log(res.query.order_id)
    cancelorder(res.query.order_id)
});

class KrakenRestApiV3 {
  constructor(baseUrl='https://demo-futures.kraken.com' , apiKey='', apiSecret= '', timeout=5000) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.timeout = timeout
  }

    /**
     * Cancel order.
     */
    cancelOrder(orderId, cliOrdId) {
        let endpoint = '/derivatives/api/v3/cancelorder'
        let data
        if (orderId) data = `order_id=${orderId}`
        else data = `cliOrdId=${cliOrdId}`
        let nonce = createNonce()
        let authent = this.signRequest(endpoint, nonce, data)
        let headers = {
            Accept: 'application/json',
            APIKey: this.apiKey,
            Nonce: nonce,
            Authent: authent,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
        }
        let requestOptions = {
            url: this.baseUrl + endpoint,
            method: 'POST',
            headers: headers,
            body: data,
            timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'cancelOrder(): ')
    }

    /**
     * Returns key account information.
     */
    getAccounts() {
        let endpoint = '/derivatives/api/v3/accounts'
        let nonce = createNonce()
        let authent = this.signRequest(endpoint, nonce)
        let headers = {
        Accept: 'application/json',
        APIKey: this.apiKey,
        Nonce: nonce,
        Authent: authent,
        }

        let requestOptions = {
        url: this.baseUrl + endpoint,
        method: 'GET',
        headers: headers,
        timeout: this.timeout,
        }

        return makeRequest(requestOptions, 'getAccounts(): ')
    }

    getInstruments() {
        let requestOptions = {
            url: this.baseUrl + '/derivatives/api/v3/instruments',
            method: 'GET',
            headers: { Accept: 'application/json' },
            timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'getInstruments(): ')
    }

    /**
     * Returns all open orders.
     */
    getOpenOrders() {
        let endpoint = '/derivatives/api/v3/openorders'
        let nonce = createNonce()
        let authent = this.signRequest(endpoint, nonce)
        let headers = {
            Accept: 'application/json',
            APIKey: this.apiKey,
            Nonce: nonce,
            Authent: authent,
        }
        let requestOptions = {
            url: this.baseUrl + endpoint,
            method: 'GET',
            headers: headers,
            timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'getOpenOrders(): ')
    }

    getOpenPositions() {
        let endpoint = '/derivatives/api/v3/openpositions'
        let nonce = createNonce()
        let authent = this.signRequest(endpoint, nonce)
        let headers = {
            Accept: 'application/json',
            APIKey: this.apiKey,
            Nonce: nonce,
            Authent: authent,
        }
        let requestOptions = {
            url: this.baseUrl + endpoint,
            method: 'GET',
            headers: headers,
            timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'getOpenPositions(): ')
    }

    getOrderbook() {
        let params = qs.stringify({ symbol: symbol })
        //console.log("params: ", params)
        let requestOptions = {
            url: this.baseUrl + '/derivatives/api/v3/orderbook?' + params,
            // url: this.baseUrl + '/derivatives/api/v3/orderbook?symbol=PI_XBTUSD',
            method: 'GET',
            headers: { Accept: 'application/json' },
            timeout: this.timeout,
        }
        // console.log("requestOptions: ", requestOptions)
        return makeRequest(requestOptions, 'getOrderbook(): ')
    }

    /**
     * Returns market data for all instruments.
     */
    getTickers() {
        let requestOptions = {
        url: this.baseUrl + '/derivatives/api/v3/tickers',
        method: 'GET',
        headers: { Accept: 'application/json' },
        timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'getTickers(): ')
    }

    /**
     * Send/place order.
     */
    sendOrder(
        orderType,
        symbol,
        side,
        size,
        limitPrice,
        stopPrice = null,
        clientOrderId = null
    ) {
        let endpoint = '/derivatives/api/v3/sendorder'
        let nonce = createNonce()
        let data = `orderType=${orderType}&symbol=${symbol}&side=${side}&size=${size}&limitPrice=${limitPrice}`
        if (stopPrice) data.concat(`&stopPrice=${stopPrice}`)
        if (clientOrderId) data.concat(`&cliOrdId=${clientOrderId}`)
            let authent = this.signRequest(endpoint, nonce, data)
            let headers = {
            Accept: 'application/json',
            APIKey: this.apiKey,
            Nonce: nonce,
            Authent: authent,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
        }
        let requestOptions = {
        url: this.baseUrl + endpoint,
        method: 'POST',
        headers: headers,
        body: data,
        timeout: this.timeout,
        }
        return makeRequest(requestOptions, 'sendOrder(): ')
    }

    /**
     * Sign request.
     */
    signRequest(endpoint, nonce = '', postData = '') {
        // step 1: concatenate postData, nonce + endpoint
        if (endpoint.startsWith('/derivatives')) {
            endpoint = endpoint.slice('/derivatives'.length)
        }

        let message = postData + nonce + endpoint

        // Step 2: hash the result of step 1 with SHA256
        let hash = crypto.createHash('sha256').update(utf8.encode(message)).digest()

        // step 3: base64 decode apiPrivateKey
        let secretDecoded = Buffer.from(this.apiSecret, 'base64')

        // step 4: use result of step 3 to hash the result of step 2 with
        let hash2 = crypto.createHmac('sha512', secretDecoded).update(hash).digest()

        // step 5: base64 encode the result of step 4 and return
        return Buffer.from(hash2).toString('base64')
    }
} //class KrakenRestApiV3

// 
function makeRequest(requestOptions, printName) {
    return new Promise((resolve, reject) => {
        requestOptions.headers['User-Agent'] = 'kf-api-js/0.1'
    
        request(requestOptions, function (error, response, body) {
            if (error) {
                reject(error)
            } else {
                resolve({ name: printName, response, body })
            }
        })
    })
}

async function cancelorder(orderId) {
    let clientId = 'my_client_id'
    let cancelOrderPromise = test.cancelOrder(orderId, clientId)
        
    try {
        const response = await Promise.all([cancelOrderPromise])
        let x = JSON.parse(response[0]['response']['body'])
        // console.log("openpos: ", x)
        // socket.emit('openpositions', x["openPositions"]);
    } catch(err) {
        console.log(err)
        //openpositions(socket)
    }
}

async function getaccount(socket) {
    let accountsPromise = test.getAccounts()
    try {
        const response = await Promise.all([accountsPromise])
        let x = JSON.parse(response[0]['response']['body'])
        // console.log("openpos: ", x["accounts"])
        socket.emit('accountdata', x["accounts"]);
    } catch(err) {
        console.log(err)
        //getaccount(socket)
    }

    setTimeout(() => {
        getaccount(socket);
    }, 1100);
}

async function openorders(socket) {
    let getOpenOrdersPromise = test.getOpenOrders()
    try {
        const response = await Promise.all([getOpenOrdersPromise])
        let x = JSON.parse(response[0]['response']['body'])
        // console.log("openorders: ", x)
        // socket.emit('openorders', x["openOrders"]);
    } catch(err) {
        console.log(err)
        // openpositions(socket)
    }

}

async function openpositions(socket) {
    let openPositionsPromise = test.getOpenPositions()
    try {
        const response = await Promise.all([openPositionsPromise])
        let x = JSON.parse(response[0]['response']['body'])
        socket.emit('openpositions', x["openPositions"]);
    } catch(err) {
        console.log(err)
        //openpositions(socket)
    }

}

async function orderbook(socket) {
    let orderbookPromise = test.getOrderbook()
    try {
        const response = await Promise.all([orderbookPromise])
        let x = JSON.parse(response[0]['response']['body'])
        tickdata[0].unshift(x["orderBook"]["asks"][0][0])
        tickdata[1].unshift(x["orderBook"]["bids"][0][0])
        
        if (tickdata[0].length > 30) {
            tickdata[0].pop()
            tickdata[1].pop()
            socket.emit('tickdata', tickdata);
        } else {
            socket.emit('tickdata', tickdata);
        }

    } catch(err) {
        console.log(err)
        //orderbook(socket)
    }

    setTimeout(() => {
        orderbook(socket);
    }, 1100);
}

async function sendlimitorder(side, size) {
    console.log(side)
    // send limit order
    let orderType = 'mkt'
    // symbol = 'PI_XBTUSD'
    // let side = 'buy'
    // let size = 1
    let limitPrice = 1.0
    let clientId = 'my_client_id'
    let sendOrderLimitPromise = test.sendOrder(
    orderType,
    symbol,
    side,
    size,
    limitPrice,
    (clientOrderId = clientId)
    )
    
    try {
        const response = await Promise.all([sendOrderLimitPromise])
        JSON.parse(response[0]['response']['body'])
        
        // console.log("openpos: ", x)
        // socket.emit('openpositions', x["openPositions"]);
    } catch(err) {
        console.log(err)
        //openpositions(socket)
    }
}

function createNonce() {
    if (nonce === 9999) nonce = 0
    let timestamp = new Date().getTime()
    return timestamp + ('0000' + nonce++).slice(-5)
  }
  
let nonce = 0
let test = new KrakenRestApiV3;

// async function ticker(socket) {
//     let tickerPromise = test.getTickers()
//     try {
//         const response = await Promise.all([tickerPromise])
//         let x = JSON.parse(response[0]['response']['body'])
//         console.log(x.tickers)
//         socket.emit('tickers', x.tickers);
//         // for (const ticker of x.tickers) {
        
//         // }
            
//     } catch(err) {
//         console.log(err)
//         ticker(socket)
//     }
//     setTimeout(() => {
//         ticker(socket);
//     }, 1100);
// }
// async function getOHLC(socket) {
//     let ohlcdata = {}
//     for (s of symbols) {
//         try {
//             let OHLC = await kraken.api('OHLC', { pair : s })
//             ohlcdata[s] = OHLC['result'][s]
//         } catch(err) {
//             console.log(err)
//         }
//     }
//     socket.emit('ohlc', ohlcdata);
// }

//openorders()
//let orderbookPromise = test.getOrderbook()
// getaccount()
// sendlimitorder()
//console.log("test "+$test.getInstruments());
// let instrumentsPromise = test.getInstruments()
// get tickers
// let tickerPromise = test.getTickers()
// get open positions
//let openPositionsPromise = test.getOpenPositions()
// openpositions()
// let orderbookPromise = test.getOrderbook()
//ticker()





const key          = ''; // API Key
const secret       = ''; // API Private Key
const kraken       = new KrakenClient(key, secret);
const symbols = ["XXBTZUSD", "XXRPZUSD", "XETHZUSD", "XLTCZUSD"]
async function getOHLC(socket) {
    let ohlcdata = {}
    for (s of symbols) {
        try {
            let OHLC = await kraken.api('OHLC', { pair : s })
            ohlcdata[s] = OHLC['result'][s]
        } catch(err) {
            console.log(err)
        }
    }
    socket.emit('ohlc', ohlcdata);
}

// async function getTradables() {
//     try {
//         let tradables = await kraken.api('Assets')
//         for (s in tradables['result']) {
//             console.log(s)
//         }
//     } catch(err) {
//         console.log(err)
//     }
// }
// async function getOrders(socket) {
//     let orderdata = {}
//         try {
//             let orders = await kraken.api('OpenOrders')
//             console.log(orders)
//         } catch(err) {
//             console.log("error: ".err)
//         }
//     // }
//     //socket.emit('orders', orderdata);
// }
// getOrders()

// async function client(socket) {
//     let n = new Date();
//     try {
//         let tick = await kraken.api('Ticker', { pair : symbol })
//         ask.unshift(tick['result'][symbol]['a'][0])
//         bid.unshift(tick['result'][symbol]['b'][0])
        
//         // data.push(ask)
//         // data.push(bid)
//         if (ask.length < 30) {
//             socket.emit('data1', ask);
//             socket.emit('data2', bid);
//         } else {
//             ask.pop()
//             bid.pop()
//             socket.emit('data1', ask);
//             socket.emit('data2', bid);
//         }
//     } catch(err) {
//         console.log(err)
//         client(socket)
//     }
    
//     setTimeout(() => {
//         client(socket);
//     }, 1100);
// };


////////////
// ASSETS //
////////////
// AAVE
// ADA
// ADA.S
// ALGO
// ANKR
// ANT
// ATOM
// ATOM.S
// BAL
// BAT
// BCH
// BNT
// CHF
// COMP
// CRV
// DAI
// DASH
// DOT
// DOT.S
// ENJ
// EOS
// ETH2
// ETH2.S
// EUR.HOLD
// EUR.M
// EWT
// FIL
// FLOW
// FLOW.S
// FLOWH
// FLOWH.S
// GHST
// GNO
// GRT
// ICX
// KAVA
// KAVA.S
// KEEP
// KFEE
// KNC
// KSM
// KSM.S
// LINK
// LPT
// LSK
// MANA
// MATIC
// MKR
// NANO
// OCEAN
// OMG
// OXT
// PAXG
// QTUM
// RARI
// REN
// REPV2
// SAND
// SC
// SNX
// STORJ
// SUSHI
// TBTC
// TRX
// UNI
// USD.HOLD
// USD.M
// USDC
// USDT
// WAVES
// XBT.M
// XETC
// XETH
// XLTC
// XMLN
// XREP
// XTZ
// XTZ.S
// XXBT
// XXDG
// XXLM
// XXMR
// XXRP
// XZEC
// YFI
// ZAUD
// ZCAD
// ZEUR
// ZGBP
// ZJPY
// ZRX
// ZUSD
