//Modules externos
const inquire = require('inquirer')
const chalk = require("chalk")

//modules internos
const fs = require('fs')
//funçoes de operation

operation()
function operation() {
  inquire.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'O que você deseja fazer?',
      choices: ['Criar conta', 'Consultar saldo', 'Depositar', 'Sacar', 'Sair'],
    },
  ]).then((answer) => {
    const action = answer['action']
    if (action === 'Criar conta') {
      creatAccount()
    } else if (action === 'Depositar') {
      deposit()
    } else if (action === 'Consultar saldo') {
      getAccountBalance()
    } else if (action === 'Sacar') {
      withdraw()
    } else if (action === 'Sair') {
      console.log(chalk.bgBlue.black('Obrigado por utilizar o banck Rocha'))
      process.exit()
    }
  }).catch(err => console.log(err))

  //create an account

  function creatAccount() {
    console.log(chalk.bgGreen.black('parabéns por escolher o banck Rocha'))
    console.log(chalk.green('Defina as opções de sua conta'))
    buildAccount()
  }

  function buildAccount() {
    inquire
      .prompt([
        {
          name: 'accountName',
          message: 'Digite seu nome:'
        }
      ])
      .then(answer => {
        const accountName = answer['accountName']

        console.info(accountName)

        if (!fs.existsSync('accounts')) {
          fs.mkdirSync('accounts')
        }

        if (fs.existsSync(`accounts/${accountName}.json`)) {
          console.log(
            chalk.bgRed.black('Esta conta ja existe, Escolha outro nome')
          )
          buildAccount()
          return
        }

        fs.writeFileSync(
          `accounts/${accountName}.json`,
          '{"balance": 0}',
          function (err) {
            console.log(err)
          },
        )

        console.log(chalk.green('Parabéns a sua conta foi criada'))
        operation()
      })
      .catch(err => console.log(err))
  }

  // add an amount to user account
  function deposit() {
    inquire.prompt([
      {
        name: 'accountName',
        message: 'Qual o nome da sua Conta?'
      }
    ]).then((answer) => {

      const accountName = answer['accountName']

      //verify if account exists

      if (!checkAccount(accountName)) {
        return deposit()
      }

      inquire.prompt([
        {
          name: 'amount',
          message: 'Quanto você deseja depositar?'
        }
      ]).then((answer) => {

        const amount = answer['amount']

        //add an amount
        addAmount(accountName, amount)


      }).catch(err => console.log(err))

    }).catch(err => console.log(err))


    function checkAccount(accountName) {

      if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, Tente novamente'))
        return false
      }

      return true
    }

    //add an amount

    function addAmount(accountName, amount) {
      const accountData = getAccount(accountName)

      if (!amount) {
        console.log(
          chalk.bgRed.black('Ocorreu um erro, tente novamente!')
        )
        return deposit()
      }

      accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
          console.log(err)
        },
      )

      console.log(
        chalk.green(`Foi depositado o valor de R$${amount} na sua conta`)
      )
    }

    function getAccount(accountName) {
      const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
      })

      return JSON.parse(accountJSON)
    }

    //show Account balance

    function getAccountBalance() {
      inquirer.prompt([
        {
          name: 'accountName',
          massage: 'Qual o nome da sua conta?',
        }
      ]).then((answer) => {

        const accountName = answer["accountName"]

        //verify if account existent

        if (!checkAccount(accountName)) {
          return getAccountBalance()
        }

        const accountData = getAccount(accountName)

        console.log(
          chalk.bgBlue.black(
            `O saldo da sua conta R$${accountData.balance}`,
          ),
        )
        operation()

      })
        .catch(err => console.log(err))
    }

    //withdraw an amount from  user account

    function withdraw() {
      inquire.prompt([
        {
          name: 'accountName',
          message: 'Qual o nome da sua Conta?'
        }
      ]).then((answer) => {

        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
          return withdraw()
        }

        inquire.prompt([
          {
            name: 'amount',
            message: 'Quanto você deseja sacar?'
          }
        ]).then((answer) => {

          const amount = answer['amount']

          removeAmount(accountName, amount)
          operation()

        }).catch(err => console.log(err))

      }).catch((err) => console.log(err))
    }

    function removeAmount(accountName, amount) {
      const accountData = getAccount(accountName)

      if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente'))
        return withdraw()
      }

      if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return withdraw()
      }

      accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
          console.log(err)
        }
      )
      console.log(chalk.green.black(`Foi realizado um saque de R$${amount}da sua conta!`))
      operation()
    }