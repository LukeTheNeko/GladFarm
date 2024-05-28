const mineflayer = require('mineflayer')
const utils = require('./utils');
var colors = require('colors');
const fs = require('fs');
const { Client, EmbedBuilder } = require('discord.js')
const client = new Client({ intents: 3276799 });

require('dotenv').config();

let token = process.env.TOKEN;
let channel = process.env.CHANNEL;

client.login(token)

mineflayer.multiple = async (bots, constructor) => {
  const { Worker, isMainThread, workerData } = require('worker_threads')
  if (isMainThread) {
    const threads = []
    for (const i in bots) {
      await utils.sleep(14000)
      threads.push(new Worker(__filename, { workerData: bots[i] }))
    }
  } else {
    constructor(workerData)
  }
}

const accounts = []
const accountFile = 'accounts.txt';
const accountsFileData = fs.readFileSync(accountFile, 'utf8');
for (const account of accountsFileData.split('\r\n')) {
  const splitted = account.split(':')
  if (splitted.length === 4) {
    accounts.push({ username: splitted[0], pass: splitted[1], home: splitted[2], auth: splitted[3] });
  }
}

const bot_creator = ({ username, pass, home, auth }) => {
  let bot = mineflayer.createBot({
    username,
    host: 'jogar.gladmc.com',
    port: 25565,
    checkTimeoutInterval: 60000,
    version: '1.8.9',
    auth,
    pass,
    home
  })

  client.on('ready', () => {
    channel = client.channels.cache.get(channel)
    return;
  })

  client.on('messageCreate', async (message) => {
    if (message.channel.id !== channel.id) return
    if (!(message.content.startsWith('!'))) return

    // Manda MSG com o BOT
    else if (message.content.startsWith(`!chat`)) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`)
          return;
        }
        else {
          let index = split.length - 2
          split = split.splice(2, index)
          split = split.join(' ')
          bot.chat(split)
          channel.send(`${username} mensagem enviada com sucesso.`)
        }
      }
    }

    // Para o BOT
    else if (message.content.startsWith('!stop')) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        channel.send(`Desligando: ${username}`)
        bot.disconnected = true
        bot.quit()
        return;
      }
    }

    // Renicia o BOT
    else if (message.content.startsWith(`!restart`)) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        channel.send(`Reiniciando: ${username}`)
        bot.quit()
        return;
      }
    }

    // Verifica o moneytop
    else if (message.content.startsWith(`!topmoney`)) {
      let split = message.content.split(' ');
      if (split.length !== 3) {
        return;
      }
      let username = split[1];
      let target = split[2];
      if (bot.username.toLowerCase() !== username.toLowerCase()) {
        return;
      }
      if (bot.location !== 'home') {
        channel.send(`${username} Não está na home, aguarde um momento`);
        return;
      }

      let messagesReceived = 0;
      let gladmcDetected = false;
      let collectedMessages = '';

      bot.on('message', handleMessage);

      function handleMessage(message) {
        if (gladmcDetected) {
          messagesReceived++;
          if (messagesReceived > 1 && messagesReceived <= 11) {
            collectedMessages += `[GladMC] ${message}\n`;
          } else if (messagesReceived === 12) {
            bot.removeListener('message', handleMessage);
            const embed = new EmbedBuilder()
              .setTitle('Jogadores com mais dinheiro do GladMC')
              .setColor('#00FF00')
              .setDescription(collectedMessages)
              .setThumbnail('https://yt3.googleusercontent.com/F-mwc-JCMKxbvO_OnOUY2V8QGK4VsoBiUGV_4DHKBVUWUrqPoJJLBfau-XfxVtNbZx2dAl4r9Q=s900-c-k-c0x00ffffff-no-rj')
              .setTimestamp()
              .setFooter({ text: 'GladBOT by LukeTheNeko', iconURL: 'https://gladmc.com/uploads/logo_gladiador_gladmc.png' });

            channel.send({ embeds: [embed] });
          }
        } else if (message.toString().startsWith('[GladMC] ')) {
          gladmcDetected = true;
          messagesReceived++;
          if (messagesReceived > 1) {
            collectedMessages += `[GladMC] ${message.toString().substring(8)}\n`;
          }
        }
      }
      bot.chat(`/money top`);
    }

    else if (message.content.startsWith(`!balance`)) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`)
          return;
        }
        else {
          let index = split.length - 2
          split = split.splice(2, index)
          split = split.join(' ')
          bot.chat('/money balance')
          bot.once('message', (message) => {
            if (message.toString().startsWith('[GladMC] ')) {
              const moneyMessage = message.toString().substring(8);
              channel.send(` [GladMC] ${username}${moneyMessage}`);
            }
          });
        }
      }
    }

    // Verifica o money de outra pessoa
    else if (message.content.startsWith(`!vermoney`)) {
      let split = message.content.split(' ');
      if (split.length !== 3) {
        return;
      }
      let username = split[1];
      let target = split[2];
      if (bot.username.toLowerCase() !== username.toLowerCase()) {
        return;
      }
      if (bot.location !== 'home') {
        channel.send(`${username} Não está na home, aguarde um momento`);
        return;
      }
      bot.chat(`/money ${target}`);
      bot.once('message', (message) => {
        if (message.toString().startsWith('[GladMC] ')) {
          const moneyMessage = message.toString().substring(8);
          channel.send(` [GladMC] ${moneyMessage}`);
        }
      });
    }

    // Abre caixas lendarias
    else if (message.content.startsWith(`!len`)) {
      let split = message.content.split(' ');
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`);
          return;
        } else {
          let index = split.length - 2;
          split = split.splice(2, index);
          split = split.join(' ');
          channel.send(`${username} abriu uma caixa lendaria.`);
          bot.chat('/caixas');
          bot.once('windowOpen', () => {
            if (bot.currentWindow) {
              bot.clickWindow(7, 0, 0);

              const filter = (gameMessage) => gameMessage.toString().startsWith("ERRO! Você precisa de uma chave da Caixa") || gameMessage.toString().startsWith("Parabéns! Você ganhou");

              bot.once('message', (gameMessage) => {
                if (filter(gameMessage)) {
                  if (gameMessage.toString().startsWith("ERRO! Você precisa de uma chave da Caixa")) {
                    channel.send(gameMessage.toString());
                  } else if (gameMessage.toString().startsWith("Parabéns! Você ganhou")) {
                    channel.send(gameMessage.toString());
                  }
                }
              });
            }
          });
        }
      }
    }

    // Abre caixas epicas
    else if (message.content.startsWith(`!epic`)) {
      let split = message.content.split(' ');
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`);
          return;
        } else {
          let index = split.length - 2;
          split = split.splice(2, index);
          split = split.join(' ');
          channel.send(`${username} abriu uma caixa lendaria.`);
          bot.chat('/caixas');
          bot.once('windowOpen', () => {
            if (bot.currentWindow) {
              bot.clickWindow(5, 0, 0);

              const filter = (gameMessage) => gameMessage.toString().startsWith("ERRO! Você precisa de uma chave da Caixa") || gameMessage.toString().startsWith("Parabéns! Você ganhou");

              bot.once('message', (gameMessage) => {
                if (filter(gameMessage)) {
                  if (gameMessage.toString().startsWith("ERRO! Você precisa de uma chave da Caixa")) {
                    channel.send(gameMessage.toString());
                  } else if (gameMessage.toString().startsWith("Parabéns! Você ganhou")) {
                    channel.send(gameMessage.toString());
                  }
                }
              });
            }
          });
        }
      }
    }

    // Compra boost de cacto 12%
    else if (message.content.startsWith(`!cactus`)) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`)
          return;
        }
        else {
          let index = split.length - 2
          split = split.splice(2, index)
          split = split.join(' ')
          channel.send(`${username} Comprou Boost de 12% para cactus.`)
          bot.chat('/boost')
          bot.on('windowOpen', function () {
            bot.clickWindow(10, 0, 0);
          });
        }
      }
    }

    // Drop todos os items
    else if (message.content.startsWith('!drop')) {
      const split = message.content.split(' ');

      if (split[1] === bot.username || split[1] === 'all') {
        if (bot.player.entity) {
          if (bot.player.entity.onGround) {
            const interval = setInterval(() => {
              const inventory = bot.inventory;
              const inventoryItems = inventory.items();

              if (inventoryItems.length > 0) {
                const itemStack = inventoryItems[0];
                bot.tossStack(itemStack);
                inventoryItems.shift();
              } else {
                clearInterval(interval);
                channel.send(`${username} todos os itens do inventário foram descartados com sucesso.`);
              }
            }, 175);
          } else {
            channel.send(`${username} não está no chão, aguarde um momento.`);
          }
        }
      }
    }

    // Compra boost de cana de açucar 12%
    else if (message.content.startsWith(`!cana`)) {
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        if (bot.location !== 'home') {
          channel.send(`${username} não está na home, aguarde um momento`)
          return;
        }
        else {
          let index = split.length - 2
          split = split.splice(2, index)
          split = split.join(' ')
          channel.send(`${username} Comprou Boost de 12% para cana.`)
          bot.chat('/boost')
          bot.on('windowOpen', function () {
            bot.clickWindow(12, 0, 0);
          });
        }
      }
    }

    // Inicia o bot
    else if (message.content.startsWith('!start')) {
      console.log('test')
      let split = message.content.split(' ')
      if (split[1] == bot.username || split[1] == 'all') {
        if (!bot.disconnected) return
        channel.send(`Iniciando: ${username}`)
        bot.disconnected = false
        client.removeAllListeners()
        bot.removeAllListeners()
        bot._client.removeAllListeners()
        bot_creator({ username, pass, home, auth });
        return
      }
    }
  })

  bot.location = 'unknown'
  bot.isRestarting = false
  bot.disconnected = false

  bot.once('login', async () => console.log("Conectando > ".brightMagenta + username))

  bot.on('spawn', async () => {
    await utils.sleep(6000)
    await utils.getLocation(bot, home, async () => {
      if (bot.location === 'home') {
        channel.send(`${username} chegou na home (/pw${home})`)

      }
      else return;
    })
  })

  bot.on('message', async (message) => {
    console.log(message.toAnsi())
    if (message.toString().includes(' Use o comando "/login <senha>" ')) bot.chat(`/login ${pass}`)

    else if (message.toString().startsWith('Servidor está reiniciando')) {
      console.log(`Servidor reiniciando, desconectando: ${bot.username}`.cyan)
      bot.isRestarting = true
      bot.quit()
    }
  })

  bot.on('end', async (reason) => {
    if (reason.includes('quitting') && bot.isRestarting) {
      client.removeAllListeners()
      bot.removeAllListeners()
      bot._client.removeAllListeners()

      utils.log(`${username} aguardando 5 min para reconectar`, 'brightMagenta')
      await utils.sleep(60000 * 5)
      bot.isRestarting = false

      bot_creator({ username, pass, home, auth });
    }
    else if (reason.includes('quitting') && bot.disconnected) {
      console.log('disconnected')
    }

    else {
      client.removeAllListeners()
      bot.removeAllListeners()
      bot._client.removeAllListeners()
      utils.log(`${username} foi desconectado, reconectando...`, 'brightRed');
      await utils.sleep(14000);
      bot_creator({ username, pass, home, auth });
    }
  })
}

mineflayer.multiple(accounts, bot_creator)