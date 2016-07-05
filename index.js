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
  botToken: 'MTk5OTM5MDk3MTQwMjY0OTYx.Cl1_Sw.KLm2QHRZrqorokHkSsUzbbyZAcU'
}

// connecting and playing a file
// client.joinVoiceChannel(voiceChannel).then(function (connection) {
//   connection.playFile(fileName)
// })

// // accessing an existing connection
// if (client.voiceConnection) {
//   client.voiceConnection.stopPlaying()
// }

const bot = new discord.Client()
bot.loginWithToken(config.botToken)

const voices = {}

const getVoiceConnection = voiceChannel =>
  voices[voiceChannel]
  || (voices[voiceChannel] = bot.joinVoiceChannel(voiceChannel))

const actions = {
  wesh: msg => bot.reply(msg, 'wesh'),
  help: msg => {
    const voiceChannel = msg.author.voiceChannel
    if (!voiceChannel) return bot.reply(msg, 'balek')
    getVoiceConnection(voiceChannel.id)
      .then(connection => connection.playFile(pathJoin(__dirname, 'balek.mp3')))
      .catch(err => bot.reply(msg, err))
  },
}

let i = 0

bot.on('message', msg => {
  const txt = msg.content
  console.log(msg.author)
  if (msg.author.id === '199939097140264961') return

  const action = actions[txt.slice(1).trim()]
  if (!action) return
  action(msg)
})
