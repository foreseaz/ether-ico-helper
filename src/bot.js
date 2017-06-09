const Bot = require('./lib/Bot')
const SOFA = require('sofa-js')
const Fiat = require('./lib/Fiat')

const token = require('./client/src/data/tokens.json')
const logo_url = '../src/client/public/'

let bot = new Bot()

// ROUTING

bot.onEvent = function(session, message) {
  switch (message.type) {
    case 'Init':
      welcome(session)
      break
    case 'Message':
      onMessage(session, message)
      break
    case 'Command':
      onCommand(session, message)
      break
    case 'Payment':
      onPayment(session, message)
      break
    case 'PaymentRequest':
      welcome(session)
      break
  }
}

function onMessage(session, message) {
    // welcome(session)
    // search by ICO name
    for (var i = 0; i < token.length; i++){
        if (token[i]['name'].toLowerCase() === message.body.toLowerCase() || token[i]['symbol'].toLowerCase() === message.body.toLowerCase()){
            let msg = `${token[i]['name']} - ${token[i]['symbol']}\n\n${token[i]['description']}\n\n${token[i]['start_time']} ~ ${token[i]['end_time']}\n${token[i]['official_website']}`
            session.reply(SOFA.Message({
                body: msg,
                attachments: [{
                    "type": "image",
                    "url": `${logo_url}${token[i]['logo']}`
                }]
            }))
            return false
        }
    }
    sendMessage(session, "Please input an ICO name or symbol")
}

function onCommand(session, command) {
  switch (command.content.value) {
    case 'ping':
      pong(session)
      break
    case 'webview':
      webview(session)
      // count(session)
      break
    case 'donate':
      donate(session)
      break
  case 'completed':
      sendMessage(session, fetchICO('completed'))
      break
  case 'incoming':
      sendMessage(session, fetchICO('ICO coming'))
      break
  case 'ongoing':
      sendMessage(session, fetchICO('ICO running'))
      break
    }
}

function onPayment(session, message) {
  if (message.fromAddress == session.config.paymentAddress) {
    // handle payments sent by the bot
    if (message.status == 'confirmed') {
      // perform special action once the payment has been confirmed
      // on the network
    } else if (message.status == 'error') {
      // oops, something went wrong with a payment we tried to send!
    }
  } else {
    // handle payments sent to the bot
    if (message.status == 'unconfirmed') {
      // payment has been sent to the ethereum network, but is not yet confirmed
      sendMessage(session, `Thanks for the payment! 🙏`);
    } else if (message.status == 'confirmed') {
      // handle when the payment is actually confirmed!
    } else if (message.status == 'error') {
      sendMessage(session, `There was an error with your payment!🚫`);
    }
  }
}

// STATES

function welcome(session) {
  sendMessage(session, `一顆賽艇!`)
}

function pong(session) {
  sendMessage(session, `Pong`)
}

// example of how to store state on each user
function count(session) {
  let count = (session.get('count') || 0) + 1
  session.set('count', count)
  sendMessage(session, `${count}`)
}

function donate(session) {
  // request $1 USD at current exchange rates
  Fiat.fetch().then((toEth) => {
    session.requestEth(toEth.USD(1))
  })
}

function webview(session) {
  console.log('[session] ', session);
  session.reply(SOFA.Message({
    body: "Wanna more ICO info?",
    controls: [
      {
        type: "group",
        label: "ICO Info",
        controls: [
          {type: "button", label: "ICO Timetable", action: "Webview::https://google.com"},
          {type: "button", label: "BAT", action: "Webview::https://etherscan.io/token/BAT"},
          {type: "button", label: "Exit Info", value: "exit"},
        ]
      },
      {
        type: "group",
        label: "Past ICO Analysis",
        "controls": [
          {type: "button", label: "Find ICO", action: "Webview::https://etherscan.io/search"},
          {type: "button", label: "Find", value: "find"}
        ]
      }
    ]
  }))
}

// HELPERS

function sendMessage(session, message) {
  // let controls = [
  //   {type: 'button', label: 'Ping', value: 'ping'},
  //   {type: 'button', label: 'Webview Test', value: 'webview'},
  //   {type: 'button', label: 'Donate', value: 'donate'}
  // ]
    let controls = [
        {type: 'button', label: 'ICO list', controls: [
            {type: 'button', label: 'Incoming', value: 'incoming'},
            {type: 'button', label: 'Ongoing', value: 'ongoing'},
            {type: 'button', label: 'Trading', value: 'trading'}
        ]},
        {type: 'group', label: 'ICO tips', controls:[
            {type: 'button', label: 'Tips & Tricks',
             action: 'Webview::https://steemit.com/ethereum/@tomshwom/getting-in-to-icos-a-guide-and-some-tips-and-tricks'},
            {type: 'button', label: 'Crazy ICO',
             action: 'Webview::https://medium.com/@EthereumRussian/how-to-be-on-time-during-crazy-icos-d4580144613e'},
            {type: 'button', label: 'Ethereum Gas', action: 'Webview::https://steemit.com/ethereum/@tomshwom/ethereum-gas-how-it-works'}
        ]},
        {type: 'button', label: 'More', controls: [
            {type: 'button', label: 'ICO insider', action: 'Webview::https://icoinsider.herokuapp.com/'},
            {type: 'button', label: 'Search', action: 'Webview::https://etherscan.io/'}
        ]},
        {type: 'button', label: 'Donate', value: 'donate'}
    ]
  session.reply(SOFA.Message({
    body: message,
    controls: controls,
    showKeyboard: false,
  }))
}

function fetchICO(status){
    let list = []
    for (var i = 0; i < token.length; i++){
        if (status === 'completed'){
            if (token[i]['status'] === 'ICO over' || token[i]['status'] === 'Trading')
                list.push(token[i]['symbol'])
        }else if (token[i]['status'] === status)
            list.push(token[i]['symbol'])
    }
    return list.join('\n')
}
