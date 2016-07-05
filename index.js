"use strict"
// http://localhost:7651
// https://discordapp.com/oauth2/authorize?&client_id=199938847948275714&scope=bot
const pathJoin = require('path').join
const ChildProcess = require("child_process")
const Eris = require('eris')
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
  botToken: "MTk5OTM5MDk3MTQwMjY0OTYx.Cl1_Sw.KLm2QHRZrqorokHkSsUzbbyZAcU"
}

const bot = new Eris(config.botToken)

bot.on("ready", () => {
  console.log("Ready!")
})

const voices = {
  
}

const getVoiceConnection = msg => {
  const channelID = msg.channel.id
  const vc = voices[channelID] || (voices[channelID] = new Eris.VoiceConnection(channelID))
  vc.converterCommand = 'ffmpeg'
  return vc
}

console.log(pathJoin(__dirname, 'balek.mp3'))

const actions = {
  wesh: msg => bot.createMessage(msg.channel.id, "wesh"),
  help: msg => {
    const vc = getVoiceConnection(msg)
    vc.on('error', err => bot.createMessage(msg.channel.id, err.stack))
    vc.playFile(pathJoin(__dirname, 'balek.mp3'), { waitForever: true })
  },
}

let i = 0
bot.on("messageCreate", msg => {
  // console.log(msg)
  const txt = msg.content

  if (msg.author.id === '199939097140264961') return

  if (txt[0] !== '!') return bot.createMessage(msg.channel.id, txt + ' lol ' + (++i))
  const action = actions[txt.slice(1).trim()]
  if (!action) return
  action(msg)
})
// tldr.list('ls')
bot.connect()
