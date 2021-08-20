
let crypto = require('crypto')
const utf8 = require('utf8')
let qs = require('querystring')

let request = require('request')

class KrakenRestApiV3 {
  constructor(baseUrl='https://demo-futures.kraken.com' , apiKey='TBozV/D1lts3w0lsJ9WkowX4yLz6lHrElKUFKxGiZz0QXke+k/CPQmcF', apiSecret= '4zKicHY05iU9dVxJQj6T3TAz95QTdW+JXTeUw++gzs+PGn6IA2vPFYMVpEHoS77u51Kv/xOn1ipj7+1RUQAMPvox', timeout=5000) {
    this.baseUrl = baseUrl
    this.apiKey = apiKey
    this.apiSecret = apiSecret
    this.timeout = timeout
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
   * Returns the entire order book of a futures market.
   */
  getOrderbook(symbol) {
    let params = qs.stringify({ symbol: symbol })
    let requestOptions = {
      url: this.baseUrl + '/derivatives/api/v3/orderbook?' + params,
      method: 'GET',
      headers: { Accept: 'application/json' },
      timeout: this.timeout,
    }
    return makeRequest(requestOptions, 'getOrderbook(): ')
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

async function ticker() {
    const response = await Promise.all([
    //   instrumentsPromise,
      tickerPromise
    //   openPositionsPromise,
    ])
    let x = JSON.parse(response[0]['response']['body'])
    console.log(x.tickers[0])
    // for (const tickers of x.tickers) {
    //   console.log(tickers)
    // }
}
async function main() {
  const responses = await Promise.all([
    orderbookPromise,
    instrumentsPromise
  ])

  for (const response of responses) {
    console.log(response.name + '\n\t' + response.body)
  }
}

// Generate nonce

function createNonce() {
  if (nonce === 9999) nonce = 0
  let timestamp = new Date().getTime()
  return timestamp + ('0000' + nonce++).slice(-5)
}

let nonce = 0
let test = new KrakenRestApiV3;

// get orderbook
symbol = 'PI_XBTUSD'
let orderbookPromise = test.getOrderbook(symbol)
let instrumentsPromise = test.getInstruments()
main()





//console.log("test "+$test.getInstruments());

// get tickers
let tickerPromise = test.getTickers()
// get open positions
let openPositionsPromise = test.getOpenPositions()
//ticker()

class KrakenWebSocketApiV3 {
    constructor(baseUrl='wss://demo-futures.kraken.com' , apiKey='TBozV/D1lts3w0lsJ9WkowX4yLz6lHrElKUFKxGiZz0QXke+k/CPQmcF', apiSecret= '4zKicHY05iU9dVxJQj6T3TAz95QTdW+JXTeUw++gzs+PGn6IA2vPFYMVpEHoS77u51Kv/xOn1ipj7+1RUQAMPvox', timeout=5000) {
        this.baseUrl = baseUrl
        this.apiKey = apiKey
        this.apiSecret = apiSecret
        this.timeout = timeout
    }

    subscribe_public(product_ids=None) {
        (product_ids == None) ? request_message = { "event": "subscribe", "feed": feed } : request_message = { "event": "subscribe", "feed": feed, "product_ids": product_ids }

    }
    
} //class KrakenWebSocketApiV3

// let ws = new KrakenWebSocketApiV3
// //##### public feeds #####
// product_ids = ["PI_XBTUSD"]
// //# subscribe to trade
// feed = "trade"
// ws.subscribe_public(feed, product_ids)

