'use strict'
// http://localhost:7651
// https://discordapp.com/oauth2/authorize?&client_id=199938847948275714&scope=bot
const _ = require('lodash-fp')
const pathJoin = require('path').join
// const ChildProcess = require('child_process')
const discord = require('discord.js')
const tldr = require('tldr/lib/index')
const cache = require('tldr/lib/cache')
const parser = require('tldr/lib/parser')
const render = require('tldr/lib/render')
const google = require('google')
const ImagesClient = require('google-images')
const googleImage = new ImagesClient('013192016961491793777:da5hivxkymw',
  'AIzaSyBLINskY-Zn4LAxABf_Am_C0Jw9RMhIiRw')

const updateCache = () => cache.update(err => err
  && setTimeout(updateCache, 60000))

setInterval(updateCache, 3*24*60*60*1000)

const printBestPage = command => {
  const content = cache.getPage(command)
  if (!content) return 'command not found'

  let i = 0
  const total = []

  while (i < content.length) {
    const pos = content.indexOf('\n> ', i)
    if (pos === -1) {
      total.push(content.slice(i, content.length))
      break
    }
    total.push(content.slice(i, pos))
    i = content.indexOf('\n', pos + 3)
    if (i === -1) i = content.length
    total.push(`\n*${content.slice(pos + 3, i)}*`)
  }
  
  return total.filter(Boolean).join('')
    .replace(/\n`/g, '\n```handlebars\n')
    .replace(/`\n/g, '```\n')
}


const config = {
  botToken: 'MTk5OTM5MDk3MTQwMjY0OTYx.CnZYZw.yYQ6rwJZyvpXQYXvXQ-R-FX1TQU',
  self: '199939097140264961',
}

const bot = new discord.Client()
bot.loginWithToken(config.botToken)

const voices = {}

const getVoiceConnection = voiceChannel =>
  voices[voiceChannel]
  || (voices[voiceChannel] = bot.joinVoiceChannel(voiceChannel))

const not = fn => v => !fn(v)

const filters = {
  self: msg => msg.author.id === config.self,
  userVoice: msg => msg.author.voiceChannel,
  voice: msg => bot.voiceConnection,
}


let throttle = 0
const playSound = filename => ({
  if:  [ filters.voice, not(filters.self) ],
  action: msg => //throttle
//    ? msg.reply('antiflood dsl mon bichon')
     getVoiceConnection(msg.author.voiceChannel)
        .then(channel => {
          console.log('wololo')
    //      throttle = setTimeout(() => throttle = 0, 3000)
          return channel.playFile(pathJoin(__dirname, filename))
        })
        .catch(err => msg.reply(wesh(err)))
})

const actions = {
  wesh: { action: msg => bot.reply(msg, 'wesh') },
  yo: { action: msg => bot.reply(msg, 'bien ou bien ?') },
  stop: {
    if: [ filters.voice, not(filters.self) ],
    action: msg => bot.voiceConnection.stopPlaying(),
  },
  volume: {
    if: [ filters.voice, not(filters.self) ],
    action: (msg, args) => bot.voiceConnection.setVolume(parseFloat(args)),
  },
  cheer: playSound('international.mp3'),
  balek: playSound('balek.mp3'),
  help: {
    action: msg => msg.reply(`Available commands: man, js, css, google, !${Object.keys(actions).join(', !')}`)
  },
}

const parseTxt = txt => {
  const idx = txt.indexOf(' ')
  if (idx < 0) {
    return [ txt.slice(1), '' ]
  }
  return [ txt.slice(1, idx), txt.slice(idx).trim() ]
}

const wesh = _ => (console.log(_), _)
const toTest = rgx => RegExp.prototype.test.bind(rgx)
const isCmd = toTest(/^(man|tldr) \S/i)
const isJs = toTest(/^js \S/i)
const isNode = RegExp.prototype.test.bind(/^node \S/i)
const isCss = RegExp.prototype.test.bind(/^css \S/i)
const isGoogle = RegExp.prototype.test.bind(/^google \S/)
const isImg = RegExp.prototype.test.bind(/^image \S/)
const isNpm = RegExp.prototype.test.bind(/^npm \S/)
const isCaniuse = RegExp.prototype.test.bind(/^caniuse \S/)
const mapLink = l => l.link
const notW3School = url => url
  && url.indexOf('w3schools.') === -1
  && url.indexOf('davidwalsh.name') === -1
const noResult = 'No results, have some :pizza: instead'
const getLink = res => (res && res.links.length)
  ? res.links.map(mapLink).filter(notW3School)[0]
  : noResult

bot.on('message', msg => {
  const txt = msg.content
  if (isGoogle(txt)) return google(txt.slice(7), (err, res) => err
    ? msg.reply(err.message.slice(2000)).catch(wesh)
    : msg.reply(getLink(res)))
  if (isJs(txt)) return google(wesh(`site:developer.mozilla.org javascript ${txt.slice(3)}`),
    (err, res) => msg.reply(getLink(res)))
  if (isCss(txt)) return google(wesh(`site:developer.mozilla.org css ${txt.slice(4)}`),
    (err, res) => msg.reply(getLink(res)))

  if (isImg(txt)) return googleImage.search(`${txt.slice(6)}`)
    .then(img => img.length ? msg.reply(img[0].url) : msg.reply(noResult))
  
  if (isNode(txt)) return google(wesh(`site:nodejs.org/api/ ${txt.slice(5)}`),
    (err, res) => msg.reply(getLink(res)))

  if (isNpm(txt)) return google(wesh(`site:nodejs.org/api/ ${txt.slice(5)}`),
    (err, res) => msg.reply(getLink(res)))

  if (isCaniuse(txt)) return google(wesh(`caniuse ${txt.slice(4)}`),
    (err, res) => msg.reply(getLink(res)))

  if (isCmd(txt)) return msg.reply(printBestPage(txt.split(' ')[1])).catch(console.dir)
  if (txt[0] !== '!') return
  const [ key, args ] = parseTxt(txt)
  console.log({  key, args })
  const match = actions[key]
  if (!match) return

  if (match.if) {
    for (let f of match.if) {
      if (!f(msg)) return
    }
  }

  match.action(msg, args, key)
})
