'use strict'
// http://localhost:7651
// https://discordapp.com/oauth2/authorize?&client_id=199938847948275714&scope=bot
const _ = require('lodash-fp')
const pathJoin = require('path').join
const ChildProcess = require('child_process')
const discord = require('discord.js')
// const tldr = require('tldr')

// tldr.list = /* singleColumn */
// tldr.listAll = /* singleColumn */
// tldr.get = /* commands */
// tldr.random = 
// tldr.randomExample = 
// tldr.render = /* file */
// tldr.clearCache = 
// tldr.updateCache = 

const config = {
  botToken: 'MTk5OTM5MDk3MTQwMjY0OTYx.Cl1_Sw.KLm2QHRZrqorokHkSsUzbbyZAcU',
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
  help: {
    if: [ filters.userVoice, not(filters.self) ],
    action: msg => getVoiceConnection(msg.author.voiceChannel)
      .then(channel => channel.playFile(pathJoin(__dirname, 'balek.mp3')))
      .catch(err => bot.reply(msg, err))
  }
}


const parseTxt = txt => {
  const idx = txt.indexOf(' ')
  if (idx < 0) {
    return [ txt.slice(1), '' ]
  }
  return [ txt.slice(1, idx), txt.slice(idx).trim() ]
}

bot.on('message', msg => {
  const txt = msg.content
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
