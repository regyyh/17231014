require('dotenv').config();
const {
    Client, GatewayIntentBits, ActivityType,
    SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle,
    ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder,
    REST, Routes, EmbedBuilder, Events,
    PermissionFlagsBits, ChannelType
} = require('discord.js');
const { MongoClient, ObjectId } = require("mongodb");
const { startServer, setClient, setStartBotFn } = require('./server');

// Módulos do seu bot  
const { setUserSkin, getUserSkin } = require('./config'); 
const { handleDiceRoll, enviarLog } = require('./Dados.js'); 
const { handleHelp } = require('./help.js');
const { conectarDB, setUserDeck, getUserDeck, addFicha, getUserFichas, getUsuariosCollection } = require('./src/database');

// =========================================================
// === DEFINIÇÕES DE CARTAS E HANDLERS (INTEGRADO) ========
// =========================================================

const LOG_CHANNEL_ID = '1387454472472756374';

const cartasCopas = [
    { valor: 'A', nome: 'Ás', imagem: 'src/copas/A.png'},
    { valor: '2', nome: 'Dois', imagem: 'src/copas/2.png'},
    { valor: '3', nome: 'Três', imagem: 'src/copas/3.png'},
    { valor: '4', nome: 'Quatro', imagem: 'src/copas/4.png'},
    { valor: '5', nome: 'Cinco', imagem: 'src/copas/5.png'},
    { valor: '6', nome: 'Seis', imagem: 'src/copas/6.png'},
    { valor: '7', nome: 'Sete', imagem: 'src/copas/7.png'},
    { valor: '8', nome: 'Oito', imagem: 'src/copas/8.png'},
    { valor: '9', nome: 'Nove', imagem: 'src/copas/9.png'},
    { valor: '10', nome: 'Dez', imagem: 'src/copas/10.png'},
    { valor: 'J', nome: 'Valete', imagem: 'src/copas/J.png'},
    { valor: 'Q', nome: 'Dama', imagem: 'src/copas/Q.png'},
    { valor: 'K', nome: 'Rei', imagem: 'src/copas/k.png'}
];

const cartasPaus = [
    { valor: 'A', nome: 'Ás', imagem: 'src/paus/A.png'},
    { valor: '2', nome: 'Dois', imagem: 'src/paus/2.png'},
    { valor: '3', nome: 'Três', imagem: 'src/paus/3.png'},
    { valor: '4', nome: 'Quatro', imagem: 'src/paus/4.png'},
    { valor: '5', nome: 'Cinco', imagem: 'src/paus/5.png'},
    { valor: '6', nome: 'Seis', imagem: 'src/paus/6.png'},
    { valor: '7', nome: 'Sete', imagem: 'src/paus/7.png'},
    { valor: '8', nome: 'Oito', imagem: 'src/paus/8.png'},
    { valor: '9', nome: 'Nove', imagem: 'src/paus/9.png'},
    { valor: '10', nome: 'Dez', imagem: 'src/paus/10.png'},
    { valor: 'J', nome: 'Valete', imagem: 'src/paus/J.png'},
    { valor: 'Q', nome: 'Dama', imagem: 'src/paus/Q.png'},
    { valor: 'K', nome: 'Rei', imagem: 'src/paus/k.png'}
];

const cartasOuros = [
    { valor: 'A', nome: 'Ás', imagem: 'src/Ouros/A.png'},
    { valor: '2', nome: 'Dois', imagem: 'src/Ouros/2.png'},
    { valor: '3', nome: 'Três', imagem: 'src/Ouros/3.png'},
    { valor: '4', nome: 'Quatro', imagem: 'src/Ouros/4.png'},
    { valor: '5', nome: 'Cinco', imagem: 'src/Ouros/5.png'},
    { valor: '6', nome: 'Seis', imagem: 'src/Ouros/6.png'},
    { valor: '7', nome: 'Sete', imagem: 'src/Ouros/7.png'},
    { valor: '8', nome: 'Oito', imagem: 'src/Ouros/8.png'},
    { valor: '9', nome: 'Nove', imagem: 'src/Ouros/9.png'},
    { valor: '10', nome: 'Dez', imagem: 'src/Ouros/10.png'},
    { valor: 'J', nome: 'Valete', imagem: 'src/Ouros/J.png'},
    { valor: 'Q', nome: 'Dama', imagem: 'src/Ouros/Q.png'},
    { valor: 'K', nome: 'Rei', imagem: 'src/Ouros/K.png'}
];

const cartasEspadas = [
    { valor: 'A', nome: 'Ás', imagem: 'src/Espadas/A.png'},
    { valor: '2', nome: 'Dois', imagem: 'src/Espadas/2.png'},
    { valor: '3', nome: 'Três', imagem: 'src/Espadas/3.png'},
    { valor: '4', nome: 'Quatro', imagem: 'src/Espadas/4.png'},
    { valor: '5', nome: 'Cinco', imagem: 'src/Espadas/5.png'},
    { valor: '6', nome: 'Seis', imagem: 'src/Espadas/6.png'},
    { valor: '7', nome: 'Sete', imagem: 'src/Espadas/7.png'},
    { valor: '8', nome: 'Oito', imagem: 'src/Espadas/8.png'},
    { valor: '9', nome: 'Nove', imagem: 'src/Espadas/9.png'},
    { valor: '10', nome: 'Dez', imagem: 'src/Espadas/10.png'},
    { valor: 'J', nome: 'Valete', imagem: 'src/Espadas/J.png'},
    { valor: 'Q', nome: 'Dama', imagem: 'src/Espadas/Q.png'},
    { valor: 'K', nome: 'Rei', imagem: 'src/Espadas/K.png'}
];

const cartasBaralho = [
    { valor: 'A', naipe: 'Paus', nome: 'Ás de Paus', imagem: 'src/Cartas/AP.png'},
    { valor: '2', naipe: 'Paus', nome: '2 de Paus', imagem: 'src/Cartas/2p.png'},
    { valor: '3', naipe: 'Paus', nome: '3 de Paus', imagem: 'src/Cartas/3p.png'},
    { valor: '4', naipe: 'Paus', nome: '4 de Paus', imagem: 'src/Cartas/4p.png'},
    { valor: '5', naipe: 'Paus', nome: '5 de Paus', imagem: 'src/Cartas/5p.png'},
    { valor: '6', naipe: 'Paus', nome: '6 de Paus', imagem: 'src/Cartas/6p.png'},
    { valor: '7', naipe: 'Paus', nome: '7 de Paus', imagem: 'src/Cartas/7p.png'},
    { valor: '8', naipe: 'Paus', nome: '8 de Paus', imagem: 'src/Cartas/8p.png'},
    { valor: '9', naipe: 'Paus', nome: '9 de Paus', imagem: 'src/Cartas/9p.png'},
    { valor: '10', naipe: 'Paus', nome: '10 de Paus', imagem: 'src/Cartas/10p.png'},
    { valor: 'J', naipe: 'Paus', nome: 'Valete de Paus', imagem: 'src/Cartas/JP.png'},
    { valor: 'Q', naipe: 'Paus', nome: 'Dama de Paus', imagem: 'src/Cartas/QP.png'},
    { valor: 'K', naipe: 'Paus', nome: 'Rei de Paus', imagem: 'src/Cartas/KP.png'},
    { valor: 'A', naipe: 'Ouros', nome: 'Ás de Ouros', imagem: 'src/Cartas/AO.png'},
    { valor: '2', naipe: 'Ouros', nome: '2 de Ouros', imagem: 'src/Cartas/2o.png'},
    { valor: '3', naipe: 'Ouros', nome: '3 de Ouros', imagem: 'src/Cartas/3o.png'},
    { valor: '4', naipe: 'Ouros', nome: '4 de Ouros', imagem: 'src/Cartas/4o.png'},
    { valor: '5', naipe: 'Ouros', nome: '5 de Ouros', imagem: 'src/Cartas/5o.png'},
    { valor: '6', naipe: 'Ouros', nome: '6 de Ouros', imagem: 'src/Cartas/6o.png'},
    { valor: '7', naipe: 'Ouros', nome: '7 de Ouros', imagem: 'src/Cartas/7o.png'},
    { valor: '8', naipe: 'Ouros', nome: '8 de Ouros', imagem: 'src/Cartas/8o.png'},
    { valor: '9', naipe: 'Ouros', nome: '9 de Ouros', imagem: 'src/Cartas/9o.png'},
    { valor: '10', naipe: 'Ouros', nome: '10 de Ouros', imagem: 'src/Cartas/10o.png'},
    { valor: 'J', naipe: 'Ouros', nome: 'Valete de Ouros', imagem: 'src/Cartas/JO.png'},
    { valor: 'Q', naipe: 'Ouros', nome: 'Dama de Ouros', imagem: 'src/Cartas/QO.png'},
    { valor: 'K', naipe: 'Ouros', nome: 'Rei de Ouros', imagem: 'src/Cartas/KO.png'},
    { valor: 'A', naipe: 'Espadas', nome: 'Ás de Espadas', imagem: 'src/Cartas/AE.png'},
    { valor: '2', naipe: 'Espadas', nome: '2 de Espadas', imagem: 'src/Cartas/2e.png'},
    { valor: '3', naipe: 'Espadas', nome: '3 de Espadas', imagem: 'src/Cartas/3e.png'},
    { valor: '4', naipe: 'Espadas', nome: '4 de Espadas', imagem: 'src/Cartas/4e.png'},
    { valor: '5', naipe: 'Espadas', nome: '5 de Espadas', imagem: 'src/Cartas/5e.png'},
    { valor: '6', naipe: 'Espadas', nome: '6 de Espadas', imagem: 'src/Cartas/6e.png'},
    { valor: '7', naipe: 'Espadas', nome: '7 de Espadas', imagem: 'src/Cartas/7e.png'},
    { valor: '8', naipe: 'Espadas', nome: '8 de Espadas', imagem: 'src/Cartas/8e.png'},
    { valor: '9', naipe: 'Espadas', nome: '9 de Espadas', imagem: 'src/Cartas/9e.png'},
    { valor: '10', naipe: 'Espadas', nome: '10 de Espadas', imagem: 'src/Cartas/10e.png'},
    { valor: 'J', naipe: 'Espadas', nome: 'Valete de Espadas', imagem: 'src/Cartas/JE.png'},
    { valor: 'Q', naipe: 'Espadas', nome: 'Dama de Espadas', imagem: 'src/Cartas/QE.png'},
    { valor: 'K', naipe: 'Espadas', nome: 'Rei de Espadas', imagem: 'src/Cartas/KE.png'},
    { valor: 'A', naipe: 'Copas', nome: 'Ás de Copas', imagem: 'src/Cartas/AC.png'},
    { valor: '2', naipe: 'Copas', nome: '2 de Copas', imagem: 'src/Cartas/2c.png'},
    { valor: '3', naipe: 'Copas', nome: '3 de Copas', imagem: 'src/Cartas/3c.png'},
    { valor: '4', naipe: 'Copas', nome: '4 de Copas', imagem: 'src/Cartas/4c.png'},
    { valor: '5', naipe: 'Copas', nome: '5 de Copas', imagem: 'src/Cartas/5c.png'},
    { valor: '6', naipe: 'Copas', nome: '6 de Copas', imagem: 'src/Cartas/6c.png'},
    { valor: '7', naipe: 'Copas', nome: '7 de Copas', imagem: 'src/Cartas/7c.png'},
    { valor: '8', naipe: 'Copas', nome: '8 de Copas', imagem: 'src/Cartas/8c.png'},
    { valor: '9', naipe: 'Copas', nome: '9 de Copas', imagem: 'src/Cartas/9c.png'},
    { valor: '10', naipe: 'Copas', nome: '10 de Copas', imagem: 'src/Cartas/10c.png'},
    { valor: 'J', naipe: 'Copas', nome: 'Valete de Copas', imagem: 'src/Cartas/JC.png'},
    { valor: 'Q', naipe: 'Copas', nome: 'Dama de Copas', imagem: 'src/Cartas/QC.png'},
    { valor: 'K', naipe: 'Copas', nome: 'Rei de Copas', imagem: 'src/Cartas/KC.png'}
];

const cartasFastPlay = [
    { valor: '10', naipe: 'Paus', nome: '10 de Paus', imagem: 'src/Cartas/10p.png'},
    { valor: 'J', naipe: 'Paus', nome: 'Valete de Paus', imagem: 'src/Cartas/JP.png'},
    { valor: 'Q', naipe: 'Paus', nome: 'Dama de Paus', imagem: 'src/Cartas/QP.png'},
    { valor: 'K', naipe: 'Paus', nome: 'Rei de Paus', imagem: 'src/Cartas/KP.png'},
    { valor: '10', naipe: 'Ouros', nome: '10 de Ouros', imagem: 'src/Cartas/10o.png'},
    { valor: 'J', naipe: 'Ouros', nome: 'Valete de Ouros', imagem: 'src/Cartas/JO.png'},
    { valor: 'Q', naipe: 'Ouros', nome: 'Dama de Ouros', imagem: 'src/Cartas/QO.png'},
    { valor: 'K', naipe: 'Ouros', nome: 'Rei de Ouros', imagem: 'src/Cartas/KO.png'},
    { valor: '10', naipe: 'Espadas', nome: '10 de Espadas', imagem: 'src/Cartas/10e.png'},
    { valor: 'J', naipe: 'Espadas', nome: 'Valete de Espadas', imagem: 'src/Cartas/JE.png'},
    { valor: 'Q', naipe: 'Espadas', nome: 'Dama de Espadas', imagem: 'src/Cartas/QE.png'},
    { valor: 'K', naipe: 'Espadas', nome: 'Rei de Espadas', imagem: 'src/Cartas/KE.png'},
    { valor: '10', naipe: 'Copas', nome: '10 de Copas', imagem: 'src/Cartas/10c.png'},
    { valor: 'J', naipe: 'Copas', nome: 'Valete de Copas', imagem: 'src/Cartas/JC.png'},
    { valor: 'Q', naipe: 'Copas', nome: 'Dama de Copas', imagem: 'src/Cartas/QC.png'},
    { valor: 'K', naipe: 'Copas', nome: 'Rei de Copas', imagem: 'src/Cartas/KC.png'}
];

// =========================================================
// === FUNÇÕES DE CRIAÇÃO DE EMBED COM DESCRIÇÕES =========
// =========================================================

function criarEmbedCopas(carta, cartasRestantes) {
    const embed = new EmbedBuilder();

    const titulos = {
        'A': 'ASSIMILAÇÃO SENSITIVA - ÁS DE COPAS',
        '2': 'ASSIMILAÇÃO REATIVA - 2 DE COPAS',
        '3': 'ASSIMILAÇÃO SENSORIAL - 3 DE COPAS',
        '4': 'ASSIMILAÇÃO VIGOROSA - 4 DE COPAS',
        '5': 'ASSIMILAÇÃO PERSUASIVA - 5 DE COPAS',
        '6': 'ASSIMILAÇÃO BRUTAL - 6 DE COPAS',
        '7': 'ASSIMILAÇÃO PERSPICAZ - 7 DE COPAS',
        '8': 'ASSIMILAÇÃO REGENERATIVA - 8 DE COPAS',
        '9': 'ASSIMILAÇÃO SILVESTRE - 9 DE COPAS',
        '10': 'ASSIMILAÇÃO OPRESSORA - 10 DE COPAS',
        'J': 'ASSIMILAÇÃO ESGUIA - VALETE DE COPAS',
        'Q': 'ASSIMILAÇÃO INDOMAVEL - DAMA DE COPAS',
        'K': 'ASSIMILAÇÃO PRIMORDIAL - REI DE COPAS'
    };

    const descricoes = {
        'A': `<:AS:1422741535048470598> – Sensibilidade
Gasta um ponto de Determinação <:PD:1423112067464040510> para sentir a presença de criaturas assimiladas em até 30 metros pelo restante da cena.

<:AS:1422741535048470598><:AS:1422741535048470598> – Consciência
Mantenha um dado adicional sempre que o Infectado realizar um teste que inclua Percepção.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Discernimento
Adicione <:AA:1423017100192256073> à face de um dado mantido que já tenha pelo menos <:AA:1423017100192256073> em testes de Ação do Infectado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Presciência: <:BA:1423110545657298995> __Assimilação 3+ __
No começo da sessão, o jogador rola dois dados do tipo que escolher, anotando o resultado para substituí-los por quaisquer dados do mesmo tipo rolados posteriormente por qualquer pessoa ao longo da sessão de jogo, incluindo o Assimilador, uma vez cada dado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Complicar: <:BA:1423110545657298995> __Assimilação 5+ __
Sempre que alguém realizar um teste na presença do Infectado, você pode gastar um ponto de Determinação para escolher um dado para ser rolado novamente, substituindo o resultado anterior.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Vidência: <:BA:1423110545657298995> __Assimilação 7+ __
O Infectado consegue prever Crises (pag. XX). No momento em que seria ativada, o Assimilador adia o seu efeito em até 24 horas, dando oportunidade para o Infectado adotar contramedidas efetivas que possam cancelá-la antes que aconteça.`,
        '2': `<:AS:1422741535048470598> – Ligeiro
Recebe um ponto em Reação – pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Rápido
Sempre que o Infectado realizar um teste que inclua *__Reação__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Preciso
Sempre que o Infectado realizar um teste que inclua *__Reação__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Alígero: <:BA:1423110545657298995>__Assimilação 3+__
Sempre que o Infectado realizar um teste que inclua*__Reação__*, substitua qualquer quantidade de <:AA:1423017100192256073> por <:AS:1422741535048470598> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Hábil: <:BA:1423110545657298995>__Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Reação__*, você adiciona um <:AS:1422741535048470598> ao resultado. Pode ser ativado em conjunto com **__Rápido__**, acumulando os efeitos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Celeridade: <:BA:1423110545657298995>__Assimilação 7+ __
Sempre que o Infectado realizar um teste que inclua *__Reação__*, substitua todos os <:QU:1423145549560942612>  por <:LG:1423145531076645025>  na pilha de dados.`,
        '3': `<:AS:1422741535048470598> – Perceptivo
Recebe um ponto em *__Percepção__*– pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Alerta
Sempre que o Infectado realizar um teste que inclua *__Percepção__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Detalhista
Sempre que o Infectado realizar um teste que inclua *__Percepção__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Meticuloso: <:BA:1423110545657298995> __Assimilação 3+ __
Sempre que o Infectado realizar um teste que inclua *__Percepção__*, substitua qualquer quantidade de <:AA:1423017100192256073> por <:AS:1422741535048470598> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Arguto: <:BA:1423110545657298995> __Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Percepção__*, você adiciona <:AS:1422741535048470598> ao resultado. Pode ser ativado com **Alerta**, acumulando os efeitos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Intuitivo: <:BA:1423110545657298995> __Assimilação 7+__
inclua *__Percepção__*, substitua todos os <:QU:1423145549560942612> por <:LG:1423145531076645025> na pilha de dados.`,
        '4': `<:AS:1422741535048470598> – Resoluto
Recebe um ponto em *__Resolução__* – pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Resistente
Sempre que o Infectado realizar um teste que inclua *__Resolução__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Firme
Sempre que o Infectado realizar um teste que inclua *__Resolução__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Vigoroso: <:BA:1423110545657298995> __Assimilação 3+__
Sempre que o Infectado realizar um teste que inclua *__Resolução__*, você pode substituir qualquer número de <:AA:1423017100192256073> no resultado por <:AS:1422741535048470598>.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Persistente: <:BA:1423110545657298995> __Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Resolução__*, adicione <:AS:1422741535048470598> ao resultado. Pode ser ativado em conjunto com **Resistente**, acumulando os efeitos

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Inabalável: <:BA:1423110545657298995> __Assimilação 7+__
Sempre que o Infectado realizar um teste que inclua *__Resolução__*, substitua todos os <:QU:1423145549560942612> por <:LG:1423145531076645025> na pilha de dados.`,
        '5': `<:AS:1422741535048470598>– Influente
Recebe um ponto em *__Influência__* – pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Persuasivo
Sempre que o Infectado realizar um teste que inclua *__Influência__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Convincente
Sempre que o Infectado realizar um teste que inclua *__Influência__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Magnético: <:BA:1423110545657298995> __Assimilação 3+__
Sempre que o Infectado realizar um teste que inclua *__Influência__*, você pode substituir qualquer número de <:AA:1423017100192256073> no resultado por <:AS:1422741535048470598>.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598>– Carismático: <:BA:1423110545657298995> __Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Influência__*, adicione <:AS:1422741535048470598> ao resultado. Pode ser ativado com **Persuasivo**, acumulando os efeitos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Majestoso: <:BA:1423110545657298995> __Assimilação 7+__
Sempre que o Infectado realizar um teste que inclua *__Influência__*, substitua todos os <:QU:1423145549560942612> por <:LG:1423145531076645025> na pilha de dado.`,
        '6': `<:AS:1422741535048470598> – Brutal
Recebe um ponto em *__Potência__* – pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Robusto
Sempre que o Infectado realizar um teste que inclua *__Potência__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Pujante
Sempre que o Infectado realizar um teste que inclua *__Potência__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Potente: <:BA:1423110545657298995> __Assimilação 3+__
Sempre que o Infectado realizar um teste que inclua *__Potência__*, você pode substituir qualquer número de <:AA:1423017100192256073> no resultado por <:AS:1422741535048470598>.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Agressivo: <:BA:1423110545657298995> __Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Potência__*, adicione <:AS:1422741535048470598> ao resultado. Pode ser ativado em conjunto com **Robusto**, acumulando os efeitos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Devastador <:BA:1423110545657298995> __Assimilação 7+__
Sempre que o Infectado realizar um teste que inclua *__Potência__*, substitua todos os <:QU:1423145549560942612> por <:LG:1423145531076645025> na pilha de dados.`,
        '7': `<:AS:1422741535048470598> – Sagaz
Recebe um ponto em *__Sagacidade__* – pode ultrapassar o limite máximo.

<:AS:1422741535048470598><:AS:1422741535048470598> – Mente Assimilada
Sempre que o Infectado realizar um teste que inclua *__Sagacidade__*, você pode usar um ponto de Assimilação <:PA:1423143615068115206> e para adicionar <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Perfeccionista
Sempre que o Infectado realizar um teste que inclua *__Sagacidade__*, anule <:AP:1423017120073125990> no resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Solerte: <:BA:1423110545657298995> __Assimilação 3+__
Sempre que o Infectado realizar um teste que inclua *__Sagacidade__* você pode substituir qualquer número de <:AA:1423017100192256073> no resultado por <:AS:1422741535048470598>.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Potência Mental: <:BA:1423110545657298995> __Assimilação 5+__
Sempre que o Infectado realizar um teste que inclua *__Sagacidade__*, adicione <:AS:1422741535048470598> ao resultado. Pode ser ativado em conjunto com **Mente Assimilada**, acumulando os efeitos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Genialidade: <:BA:1423110545657298995> __Assimilação 7+__ 
Sempre que o Infectado realizar um teste que inclua *__Sagacidade__*, substitua todos os <:QU:1423145549560942612> por <:LG:1423145531076645025> na pilha de dados.`,
        '8': `<:AS:1422741535048470598> – Resistente
Ignora a penalidade do <:SA:1423452896141512866> Nível de Saúde 4 (Lacerado).

<:AS:1422741535048470598><:AS:1422741535048470598> – Resiliente
Pode se regenerar sem ajuda médica mesmo quando reduzido ao <:SA:1423452896141512866> Nível 2 de Saúde (Arrebentado) no Tempo de Recuperação
de uma semana.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Vigoroso
Recebe um ponto de Saúde <:SM:1423452861236379770> adicional em cada <:SA:1423452896141512866> Nível de Saúde.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Restauração: <:BA:1423110545657298995> __Assimilação 3+__
Ao concluir uma recuperação, dobre os pontos de Saúde <:SM:1423452861236379770> regenerados.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Recuperação: <:BA:1423110545657298995> __Assimilação 5+ __
Regenera uma quantidade de pontos de Saúde <:SM:1423452861236379770> igual à soma de *__Resolução__* e *__Potência__* após cada cena.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Reintegração: <:BA:1423110545657298995> __Assimilação 7+__
É capaz de se regenerar completamente em apenas um dia desde que não perca seu último ponto de Saúde <:SM:1423452861236379770>, incluindo partes perdidas do corpo e sequelas ou cicatrizes.`,
        '9': `<:AS:1422741535048470598> – Sintonia Natural
Recebe um ponto em __Biologia__ – pode ultrapassar o limite máximo.

<:AS:1422741535048470598> – Cura Verde
Pode gastar um ponto de Determinação <:PD:1423112067464040510> para reavivar toda vegetação morta ou severamente danificada que esteja a até cinco metros, restaurando seu estado saudável original.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Fotossíntese
Realiza fotossíntese completa que o torna esverdeado. Não precisa consumir alimentos. Basta o consumo habitual de água, contato direto com
o solo e exposição à luz solar por duas horas diárias.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Animalismo: <:BA:1423110545657298995> __Assimilação 3+__
Sempre que o Infectado realizar um teste para influenciar o comportamento de animais, adicione <:AS:1422741535048470598><:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Refúgio Natural: <:BA:1423110545657298995> __Assimilação 5+__
Estabelece um Refúgio Vivo em áreas naturais que equivale a um Refúgio de Nível 4 (pag. XX) e se fortalece com a presença contínua do Infectado. Plantas e animais adaptam o ambiente para conforto, proteção e recuperação. Leve em consideração a Região em que se encontra ao investir os pontos de Refúgio.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Gênese: <:BA:1423110545657298995> __Assimilação 7+__
Gaste todos seus pontos de Assimilação <:PA:1423143615068115206> e para fazer com que a flora e fauna locais cresçam violentamente em um raio de um quilômetro por ponto gasto. Enquanto durar a cena, as plantas e animais se movem e obedecem à vontade do Infectado. Qualquer teste da flora ou fauna rola <:HX:1423454726657151047> para cada ponto de Assimilação <:PA:1423143615068115206> e gasto na ativação e mantém dois dados.`,
        '10': `<:AS:1422741535048470598> – Aproveitador
Sempre que o Infectado realizar um teste que inclua *__Influência__*, adicione <:AA:1423017100192256073> ao resultado se o alvo estiver em posição de inferioridade ou dúvida.

<:AS:1422741535048470598><:AS:1422741535048470598> – Sugestão
Gaste um ponto de Assimilação <:PA:1423143615068115206> para forçar um alvo hesitante a seguir uma sugestão simples, sem colocá-lo em risco e sem machucar pessoas importantes para ele.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Condicionamento
Após um teste bem-sucedido que inclua *__Influência__*, o Infectado pode repetir a mesma frase ou comando para outro alvo da cena repetindo o resultado sem rolar novo teste.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Imposição: <:BA:1423110545657298995> __Assimilação 3+__
Mantenha um dado adicional em testes que incluam *__Influência__* em locais pacíficos.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Mesmerizar: <:BA:1423110545657298995> __Assimilação 5+__
Ao obter <:AS:1422741535048470598><:AS:1422741535048470598> ou mais em um teste que inclua *__Influência__*, pode impor uma condição narrativa ao alvo até o fim da cena – como intimidação, obediência, silêncio, vergonha ou outra condição que interfira no comportamento.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Dominância: <:BA:1423110545657298995> __Assimilação 7+__
Adiciona seus pontos de Expressão à Defesa de seu Refúgio`,
        'J': `<:AS:1422741535048470598> – Infiltrador
Sempre que o Infectado realizar um teste que inclua *__Furtividade__* em ambiente urbano ou construído, adicione <:AS:1422741535048470598> ao resultado.

<:AS:1422741535048470598><:AS:1422741535048470598> – Pulso Sombrio:
Gaste um ponto de Assimilação <:PA:1423143615068115206> para anular o resultado em um teste que inclua *__Furtividade__*. Role novamente e mantendo o novo resultado uma vez por teste.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Esguio
Após executar Ação de Fuga do Conflito, se o Infectado não for o único alvo viável de uma ativação de Ameaça, outro alvo deve ser escolhido.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Subterfúgio: <:BA:1423110545657298995> __Assimilação 3+__
O Infectado só precisa de <:AS:1422741535048470598> para ter êxito em qualquer teste que inclua *__Furtividade__* fora de Conflito.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Auxílio das Sombras: <:BA:1423110545657298995> __Assimilação 5+__
O Infectado adiciona à face de cada dado de *__Furtividade__* mantido — dados mantidos de outras Aptidões na mesma rolagem não recebem este benefício.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Ofuscação: <:BA:1423110545657298995> __Assimilação 7+__
O Infectado adiciona <:AS:1422741535048470598> à face de todos os dados em testes que incluam *__Furtividade__*.`,
        'Q': `<:AS:1422741535048470598> – Fôlego Raro
Adiciona <:AS:1422741535048470598> ao resultado em testes que incluam *__Atletismo__* com esforço contínuo – resistência, natação, escalada, etc.

<:AS:1422741535048470598><:AS:1422741535048470598> – Perseverança
Gaste um ponto de Assimilação <:PA:1423143615068115206> para manter clareza e força de vontade até o fim da cena ao entrar no estado de Suscetível (pag. XX), permitindo ao Infectado continuar usando pontos de Determinação <:PD:1423112067464040510>, mesmo que com isso reduza o Nível de Determinação e tenha que usar os pontos do Nível seguinte.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Disposição
Sempre que realizar um teste que inclua *__Atletismo__*, mantenha um dado adicional.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Obstinação: <:BA:1423110545657298995> __Assimilação 3+__
Ao obter <:AS:1422741535048470598><:AS:1422741535048470598> ou mais em um teste de *__Atletismo__*, recupera um ponto de Determinação <:PD:1423112067464040510> no fim da cena. Máximo de um ponto por cena.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Irredutível: <:BA:1423110545657298995> __Assimilação 5+__
Gaste dois pontos de Determinação <:PD:1423112067464040510> para ignorar qualquer penalidade decorrente da redução do <:SA:1423452896141512866> Nível de Saúde na rodada.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Intrépido: <:BA:1423110545657298995> __Assimilação 7+__
O Infectado é imune a qualquer efeito que geraria penalidades externas ou o impediria de agir normalmente.`,
        'K': `<:AS:1422741535048470598> – Prima
O primeiro ponto de Assimilação <:PA:1423143615068115206> utilizado pelo Infectado em cada cena de Conflito é gratuito.

<:AS:1422741535048470598><:AS:1422741535048470598> – Supressor
Gaste um ponto de Assimilação <:PA:1423143615068115206> para anular <:AP:1423017120073125990> no resultado de qualquer teste do Infectado em Conflito.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Subjugar
Em cenas de Conflito, ao executar Ação de Neutralizar Ameaça, se o Infectado tem maior <:BA:1423110545657298995> Nível de Assimilação que o alvo, aumente em <:AS:1422741535048470598><:AS:1422741535048470598>o resultado.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Proeza: <:BA:1423110545657298995> __Assimilação 3+__
Gasta dois pontos de Assimilação <:PA:1423143615068115206> para substituir o nível no *__Instinto__* selecionado para o teste pelo seu <:BA:1423110545657298995> Nível de Assimilação para definir a pilha de dados rolados.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Sinergia: <:BA:1423110545657298995> __Assimilação 5+__
Consegue pagar custos de pontos de Assimilação e utilizados por aliados.

<:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598><:AS:1422741535048470598> – Poder Inesgotável: <:BA:1423110545657298995> __Assimilação 7+__
Não gasta pontos de Assimilação <:PA:1423143615068115206> para as próprias ativações.`
    };

    embed.setTitle(titulos[carta.valor] || carta.nome.toUpperCase())
        .setFooter({ text: `Restam ${cartasRestantes} cartas de Copas` })
        .setImage(`attachment://${carta.imagem.split('/').pop()}`)
        .setColor(0xFF0000);

    if (descricoes[carta.valor]) {
        embed.setDescription(descricoes[carta.valor]);
    }

    return embed;
}

// =========================================================
// === HANDLERS DE CARTAS (GENÉRICOS) =====================
// =========================================================

async function puxarCarta(interaction, tipoCarta, deckType, cartasArray, titulo, cor, criarEmbedFunc = null) {
    try {
        const userId = interaction.user.id;
        const userName = interaction.user.username;
        const guildId = interaction.guild?.id;
        const guildName = interaction.guild?.name;

        let cartasDisponiveis = await getUserDeck(guildId, userId, deckType);

        if (cartasDisponiveis.length === 0) {
            cartasDisponiveis = [...cartasArray];
            await setUserDeck(guildId, userId, userName, guildName, deckType, cartasDisponiveis);
        }

        if (cartasDisponiveis.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(`${titulo} - Sem Cartas`)
                .setDescription(`Você não tem mais cartas disponíveis!\nUse \`/reset ${tipoCarta}\` para restaurar suas cartas.`)
                .setColor(cor);
            return interaction.editReply({ embeds: [embed] });
        }

        const indexAleatorio = Math.floor(Math.random() * cartasDisponiveis.length);
        const cartaSorteada = cartasDisponiveis.splice(indexAleatorio, 1)[0];

        await setUserDeck(guildId, userId, userName, guildName, deckType, cartasDisponiveis);

        const cartasRestantes = cartasDisponiveis.length;

        const embed = criarEmbedFunc ? criarEmbedFunc(cartaSorteada, cartasRestantes) : 
            new EmbedBuilder()
                .setTitle(`${titulo} - ${cartaSorteada.nome.toUpperCase()}`)
                .setFooter({ text: `Restam ${cartasRestantes} cartas de ${titulo}` })
                .setImage(`attachment://${cartaSorteada.imagem.split('/').pop()}`)
                .setColor(cor);

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send(`${interaction.user.tag} puxou uma carta de ${titulo} em ${guildName}: ${cartaSorteada.nome}`).catch(console.error);
        }

        return interaction.editReply({ embeds: [embed], files: [cartaSorteada.imagem] });
    } catch (error) {
        console.error(`Erro ao puxar carta de ${tipoCarta}:`, error);
        return interaction.editReply({ content: `❌ Ocorreu um erro ao puxar a carta de ${tipoCarta}.` });
    }
}

async function resetarCarta(interaction, tipoCarta, deckType, cartasArray, titulo) {
    try {
        const userId = interaction.user.id;
        const userName = interaction.user.username;
        const guildId = interaction.guild?.id;
        const guildName = interaction.guild?.name;

        await setUserDeck(guildId, userId, userName, guildName, deckType, [...cartasArray]);

        const logChannel = interaction.guild.channels.cache.get(LOG_CHANNEL_ID);
        if (logChannel) {
            logChannel.send(`${interaction.user.tag} resetou suas cartas de ${titulo} em ${guildName}`).catch(console.error);
        }

        return interaction.editReply({ content: `✅ Suas cartas de ${titulo} foram restauradas! Você tem ${cartasArray.length} cartas novamente.` });
    } catch (error) {
        console.error(`Erro ao resetar cartas de ${tipoCarta}:`, error);
        return interaction.editReply({ content: `❌ Ocorreu um erro ao resetar as cartas de ${tipoCarta}.` });
    }
}

async function handleCopas(interaction) {
    return puxarCarta(interaction, 'copas', 'copas', cartasCopas, 'ASSIMILAÇÃO DE COPAS', 0xFF0000, criarEmbedCopas);
}

async function handlePaus(interaction) {
    const { criarEmbed: criarEmbedPaus } = require('./paus.js');
    return puxarCarta(interaction, 'paus', 'paus', cartasPaus, 'ASSIMILAÇÃO DE PAUS', 0x580068, (carta, restantes) => criarEmbedPaus(carta, restantes));
}

async function handleOuros(interaction) {
    const { criarEmbed: criarEmbedOuros } = require('./ouros.js');
    return puxarCarta(interaction, 'ouros', 'ouros', cartasOuros, 'ASSIMILAÇÃO DE OUROS', 0xFFD700, (carta, restantes) => criarEmbedOuros(carta, restantes));
}

async function handleEspadas(interaction) {
    const { criarEmbed: criarEmbedEspadas } = require('./espadas.js');
    return puxarCarta(interaction, 'espadas', 'espadas', cartasEspadas, 'ASSIMILAÇÃO DE ESPADAS', 0x000000, (carta, restantes) => criarEmbedEspadas(carta, restantes));
}

async function handleBaralho(interaction) {
    return puxarCarta(interaction, 'baralho', 'completo', cartasBaralho, 'BARALHO COMPLETO', 0xFFFFFF);
}

async function handleFastPlay(interaction) {
    return puxarCarta(interaction, 'fastplay', 'fast', cartasFastPlay, 'FASTPLAY', 0xFFFFFF);
}

async function handleCopasReset(interaction) {
    return resetarCarta(interaction, 'copas', 'copas', cartasCopas, 'Copas');
}

async function handleOurosReset(interaction) {
    return resetarCarta(interaction, 'ouros', 'ouros', cartasOuros, 'Ouros');
}

async function handlePausReset(interaction) {
    return resetarCarta(interaction, 'paus', 'paus', cartasPaus, 'Paus');
}

async function handleEspadasReset(interaction) {
    return resetarCarta(interaction, 'espadas', 'espadas', cartasEspadas, 'Espadas');
}

async function handleBaralhoReset(interaction) {
    return resetarCarta(interaction, 'baralho', 'completo', cartasBaralho, 'Baralho Completo');
}

async function handleFastPlayReset(interaction) {
    return resetarCarta(interaction, 'fastplay', 'fast', cartasFastPlay, 'FastPlay');
}

async function handleAllReset(interaction) {
    await resetarCarta(interaction, 'fastplay', 'fast', cartasFastPlay, 'FastPlay');
    await resetarCarta(interaction, 'baralho', 'completo', cartasBaralho, 'Baralho Completo');
    await resetarCarta(interaction, 'espadas', 'espadas', cartasEspadas, 'Espadas');
    await resetarCarta(interaction, 'ouros', 'ouros', cartasOuros, 'Ouros')
    await resetarCarta(interaction, 'paus', 'paus', cartasPaus, 'Paus');
    await resetarCarta(interaction, 'copas', 'copas', cartasCopas, 'Copas');

        await new Promise(resolve => setTimeout(resolve, 5000));

        return interaction.reply("Todas as cartas foram resetadas com sucesso!");
    }


// ------------------- BOT BASE E STATUS -------------------
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessageReactions, 
        GatewayIntentBits.DirectMessages, 
    ],
});

// =========================================================
// === MANIPULADORES DE ERRO CRÍTICOS (ESTABILIZAÇÃO) ======
// =========================================================

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ [ERRO GRAVE - REINICIALIZAÇÃO PREVENIDA] Unhandled Rejection:', reason);
});

client.on('error', (error) => {
    console.error('❌ [ERRO DO CLIENTE DISCORD]', error);
});


const statuses = [
    { name: 'Assimilação RPG', type: ActivityType.Playing },
    { name: 'Lendo o PDF - Tá lindo né?', type: ActivityType.Watching },
    { name: 'Assimiladies - Seiva e Sangue', type: ActivityType.Watching },
];

let currentStatus = 0;

client.once('ready', async () => {
    console.log(`🎲 Bot conectado como ${client.user.tag}`);
    setClient(client);

    // Conecta ao banco de dados
    await conectarDB(); 

    client.user.setActivity(statuses[currentStatus]);
    setInterval(() => {
        currentStatus = (currentStatus + 1) % statuses.length;
        client.user.setActivity(statuses[currentStatus]);
    }, 5 * 60 * 1000);

    // =========================================================
    // === DEFINIÇÃO DOS COMANDOS SLASH (UNIFICADO) ============
    // =========================================================
    const commands = [
        //new SlashCommandBuilder().setName("criarficha").setDescription("Criar ficha de personagem"),
        //new SlashCommandBuilder().setName("fichas").setDescription("Visualizar fichas"),
        new SlashCommandBuilder().setName("skin").setDescription("Escolher seu set de dados personalizado"),
        new SlashCommandBuilder().setName("rolar").setDescription("Rolar dados")
            .addStringOption(option => option.setName('roll').setDescription('Exemplo: 3d10').setRequired(true)),

        // COMANDOS DE CARTAS (PUXAR ANTIGO)
        /*new SlashCommandBuilder().setName("copas").setDescription("Comando de Copas (a.c)"),
        new SlashCommandBuilder().setName("ouros").setDescription("Comando de Ouros (a.o)"),
        new SlashCommandBuilder().setName("espadas").setDescription("Comando de Espadas (a.e)"),
        new SlashCommandBuilder().setName("baralho").setDescription("Comando de Baralho (a.b)"),
        new SlashCommandBuilder().setName("fastplay").setDescription("Comando Fastplay (a.f)"),*/

        // COMANDO DE RESET UNIFICADO
        new SlashCommandBuilder().setName("reset").setDescription("Reseta um dos baralhos de cartas.")
            .addStringOption(option => option.setName('baralho')
                .setDescription('O baralho que você deseja resetar.')
                .setRequired(true)
                .addChoices(
                    { name: 'ASSIMILAÇÕES EVOLUTIVAS (Copas)', value: 'copas' },
                    { name: 'ASSIMILAÇÕES ADAPTATIVAS (Ouros)', value: 'ouros' },
                    { name: 'ASSIMILAÇÕES INOPORTUNAS (Espadas)', value: 'espadas' },
                    { name: 'ASSIMILAÇÕES SINGULARES (Paus)', value: 'paus' },
                    { name: 'Baralho Completo', value: 'baralho' },
                    { name: 'Baralho Fastplay', value: 'fastplay' },
                    { name: 'All', value: 'all' },
                )),

        // COMANDO DE CARTAS (Novo)
        new SlashCommandBuilder().setName("cartas").setDescription("Puxa um dos baralhos de cartas.")
            .addStringOption(option => option.setName('baralho')
                .setDescription('O baralho que você deseja puxar.')
                .setRequired(true)
                .addChoices(
                    { name: 'ASSIMILAÇÕES EVOLUTIVAS (Copas)', value: 'copas' },
                    { name: 'ASSIMILAÇÕES ADAPTATIVAS (Ouros)', value: 'ouros' },
                    { name: 'ASSIMILAÇÕES INOPORTUNAs (Espadas)', value: 'espadas' },
                    { name: 'ASSIMILAÇÕES SINGULARES (Paus)', value: 'paus' },
                    { name: 'Baralho Completo', value: 'baralho' },
                    { name: 'Baralho Fastplay', value: 'fastplay' },
                )),
        
        new SlashCommandBuilder().setName("help").setDescription("Exibe a ajuda do bot (a.h)"),
    ].map(cmd => cmd.toJSON());

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        console.log("🔄 Registrando comandos (slash)...");
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log("✅ Comandos registrados.");
    } catch (err) {
        console.error("Erro ao registrar comandos:", err);
    }
});



// ------------------- WEBHOOK UTILITY -------------------

async function getOrCreateWebhook(channel) {
    if (!channel || ![ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread].includes(channel.type)) {
        throw new Error("Webhooks só podem ser usados em canais de texto ou threads.");
    }

    try {
        const webhooks = await channel.fetchWebhooks();
        let botWebhook = webhooks.find(wh => wh.owner.id === channel.client.user.id);

        if (botWebhook) {
            return botWebhook;
        } else {
            return await channel.createWebhook({
                name: 'Dados-Assimilados Roll',
                avatar: channel.client.user.displayAvatarURL(),
                reason: 'Webhook para enviar rolagem com contador unificado.'
            });
        }
    } catch (error) {
        console.error("ERRO CRÍTICO DE WEBHOOK: Verifique se o bot tem a permissão 'Gerenciar Webhooks'", error.message);
        throw new Error("O bot não tem a permissão 'Gerenciar Webhooks' para enviar a rolagem.");
    }
}


// ------------------- MEMÓRIA TEMP E UTILS (FICHA) -------------------
const fichasEmCriacao = new Map();

function getStatusSaude(valorSaude) {
    const saude = parseInt(valorSaude);
    switch (saude) {
        case 5:
            return "Infectado Saudável";
        case 4:
            return "Infectado ferido";
        case 3:
            return "Infectado com -<:0_:1349702526189961227> ou <:2_:1349702910208114688>";
        case 2:
            return "Infectado com -<:0_:1349702526189961227>";
        case 1:
            return "Infectado com -<:0_:1349702526189961227><:0_:1349702526189961227>";
        case 0:
            return "Infectado Morto";
        default:
            return "Valor inválido";
    }
}


function createFichaEmbed(ficha) {
    const statusSaude = getStatusSaude(ficha.saude);
    return new EmbedBuilder()
        .setTitle(`📜 Ficha de ${ficha.nome}`)
        .setColor("Aqua")
        .addFields(
            { name: "🧍 Nome", value: ficha.nome || "-", inline: true },
            { name: "🌱 Geração", value: ficha.geracao || "-", inline: true },
            { name: "📖 Evento Marcante", value: ficha.evento || "-", inline: false },
            { name: "🏛️ Posição Social", value: ficha.posicao || "-", inline: true },
            { name: "🔺 Determinação", value: ficha.determinacao || "-", inline: true },
            { name: "🔻 Assimilação", value: ficha.assimilacao || "-", inline: true },
            { name: "❤️ Saúde", value: `${ficha.saude || "-"} - **${statusSaude}**`, inline: true },
            { name: "📝 Propósitos", value: `**Individuais:** ${ficha.proposito || "-"}\n**Relacionais:** ${ficha.relacionais || "-"}`, inline: false },
            { name: "🛡️ Instintos", value: `**Reação:** ${ficha.reacao || "-"} | **Percepção:** ${ficha.percepcao || "-"} | **Sagacidade:** ${ficha.sagacidade || "-"}\n**Potência:** ${ficha.potencia || "-"} | **Influência:** ${ficha.influencia || "-"} | **Resolução:** ${ficha.resolucao || "-"}`, inline: false },
            { name: "📚 Conhecimentos", value: `**Agrário:** ${ficha.agrario || "-"} | **Biológico:** ${ficha.biologico || "-"} | **Exato:** ${ficha.exato || "-"}\n**Medicina:** ${ficha.medicina || "-"} | **Social:** ${ficha.social || "-"} | **Artístico:** ${ficha.artistico || "-"}`, inline: false },
            { name: "🛠️ Práticas", value: `**Esportivas:** ${ficha.esportivas || "-"} | **Ferramentas:** ${ficha.ferramentas || "-"} | **Ofícios:** ${ficha.oficios || "-"}\n**Armas:** ${ficha.armas || "-"} | **Veículos:** ${ficha.veiculos || "-"} | **Infiltração:** ${ficha.infiltracao || "-"}`, inline: false },
            { name: "🎒 Equipamentos", value: ficha.inventario || "-", inline: false },
            { name: "✨ Características", value: ficha.habs || "-", inline: false },
            { name: "🌀 Assimilações", value: ficha.assimilado || "-", inline: false },
            { name: "📓 Anotações", value: ficha.obs || "-", inline: false }
        )
        .setFooter({ text: `Criado por ${ficha.userName}` })
        .setTimestamp(ficha.criadoEm instanceof Date ? ficha.criadoEm : new Date());
}

// ------------------- EVENTO DE INTERAÇÕES (TODOS OS COMANDOS) -------------------
client.on(Events.InteractionCreate, async (interaction) => {
    const guildId = interaction.guild?.id;

    if (interaction.isChatInputCommand()) {

        // =========================================================
        // === COMANDO /rolar           ============================
        // =========================================================

        if (interaction.commandName === "rolar") {
            if (!interaction.guildId || !interaction.channel) {
                return interaction.reply({ content: '⚠️ Este comando deve ser usado em um canal de servidor.', ephemeral: true });
            }

            const rollContent = interaction.options.getString('roll');
            const source = {
                type: 'interaction',
                interaction: interaction,
                roll: rollContent
            };

            await interaction.deferReply({ ephemeral: true });

            const resultado = await handleDiceRoll(client, source);

            if (!resultado || !resultado.dados || resultado.dados.startsWith('Comando de rolagem inválido') || resultado.dados.startsWith('Mano...')) {
                return interaction.editReply(resultado.dados || '⚠️ Erro interno ao processar a rolagem.').catch(console.error);
            }

            const username = interaction.member ? interaction.member.displayName : interaction.user.username;

            const webhookConfig = {
                username: `Rolagem de ${username}`, 
                avatarURL: interaction.user.displayAvatarURL({ dynamic: true }),
            };

            try {
                const webhook = await getOrCreateWebhook(interaction.channel);

                await webhook.send({
                    content: `${resultado.dados}`, 
                    ...webhookConfig
                });

                if (resultado.contador) {
                    await webhook.send({
                        content: `${resultado.contador}`,
                        ...webhookConfig
                    });
                }

                await interaction.deleteReply().catch(e => console.log('Erro ao deletar deferReply:', e.message));

            } catch (error) {
                console.error("Erro ao enviar rolagem via Webhook (Requer Gerenciar Webhooks):", error.message);

                await interaction.editReply({ 
                    content: `⚠️ O Webhook falhou (Bot precisa de **Gerenciar Webhooks**). A rolagem será enviada com citação.`,
                    ephemeral: true
                }).catch(console.error);

                await interaction.followUp({
                    content: `**Dados de ${username} (${rollContent}):**\n${resultado.dados}\n\n**Contador:**\n${resultado.contador || 'Contador não disponível.'}`,
                }).catch(console.error);
            }
            return;
        }

        // =========================================================
        // === COMANDO /skin           =============================
        // =========================================================

        if (interaction.commandName === "skin") {
            await interaction.deferReply({ ephemeral: true });

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId("select_skin")
                .setPlaceholder("Escolha um Set de Dados!")
                .addOptions([
                    { label: 'Black & White with Blood', description: 'Preto e Branco, com toques de Sangue.', value: 'bw' },
                    { label: 'Red & Golden', description: 'Vermelho e Dourado.', value: 'rg' },
                    { label: 'Blue Storm & White', description: 'Azul Tempestade e Branco.', value: 'wb' },
                    { label: 'Orgulho Pride', description: 'Cores do Orgulho LGBTQIA+.', value: 'pd' },
                    { label: 'Default (Padrão)', description: 'Set de dados Padrão.', value: 'default' },
                ]);

            const row = new ActionRowBuilder().addComponents(selectMenu);

            return interaction.editReply({
                content: '🎲 Escolha seu set de dados personalizado:',
                components: [row],
                ephemeral: true
            });
        }

        // =========================================================
        // === COMANDOS DE CARTAS (PUXAR - TRATAMENTO DEFINITIVO DE ERRO) ===
        // =========================================================
        if (interaction.commandName === "cartas") {
             // Mapeia o valor da opção para o handler de puxar
            const cardsHandlers = {
                'copas': handleCopas,
                'ouros': handleOuros,
                'espadas': handleEspadas,
                'paus': handlePaus,
                'baralho': handleBaralho,
                'fastplay': handleFastPlay,
            };

            let deferSuccessful = false;

            // 1. Defer Reply com try/catch para estabilidade
            try {
                await interaction.deferReply({ ephemeral: false });
                deferSuccessful = true;
            } catch (error) {
                if (error.code === 10062) {
                    console.log(`[AVISO 10062] Tentativa de deferReply para /cartas falhou (Interação expirada).`);
                    return; // ABORTA
                }
                throw error;
            }

            if (deferSuccessful) {
                    // 2. Obtém a opção
                const deckType = interaction.options.getString('baralho');
                const handler = cardsHandlers[deckType];

                    // 3. Executa o reset handler
                if (handler) {
                        // Mensagem de "Aguarde" ANTES de chamar a função lenta.
                        // O editReply final será feito DENTRO do handleReset do módulo.
                    await interaction.editReply(`🃏 carta ${deckType.toUpperCase()} sorteada:`);

                    return handler(interaction); 
                } else {
                    return interaction.editReply(`⚠️ Tipo de baralho inválido: \`${deckType}\`.`);
                }
            }
            return;
        }
        
        /*const cardCommands = {
            'copas': handleCopas,
            'ouros': handleOuros,
            'espadas': handleEspadas,
            'baralho': handleBaralho,
            'fastplay': handleFastPlay
        };

        if (cardCommands[interaction.commandName]) {
            let deferSuccessful = false;

            // 1. Tenta deferir a interação (3 SEGUNDOS DE PRAZO!)
            try {
                await interaction.deferReply({ ephemeral: false });
                deferSuccessful = true; // SÓ é true se a linha acima não falhar
            } catch (error) {
                // Erro 10062: Interação expirou -> Aborta e previne o crash InteractionNotReplied
                if (error.code === 10062) {
                    console.log(`[AVISO 10062] Tentativa de deferReply para /${interaction.commandName} falhou (Interação expirada). Comando abortado.`);
                    return; //Está sendo retornado direto, o comando mesmo funcionando.
                }
                throw error; 
            }

            // 2. Chama o handler SOMENTE se o deferimento foi bem-sucedido.
            if (deferSuccessful) {
                // O handler externo DEVE USAR APENAS interaction.editReply()!!!!!.
                return cardCommands[interaction.commandName](interaction);
            }
            return;
        }*/

        // =========================================================
        // === NOVO COMANDO /reset (CENTRALIZADO) ==================
        // =========================================================
        if (interaction.commandName === "reset") {
             // Mapeia o valor da opção para o handler de reset
            const resetHandlers = {
                'copas': handleCopasReset,
                'ouros': handleOurosReset,
                'espadas': handleEspadasReset,
                'paus': handlePausReset,
                'baralho': handleBaralhoReset,
                'fastplay': handleFastPlayReset,
                'all': handleAllReset
            };

            let deferSuccessful = false;

            // 1. Defer Reply com try/catch para estabilidade
            try {
                await interaction.deferReply({ ephemeral: true });
                deferSuccessful = true;
            } catch (error) {
                if (error.code === 10062) {
                    console.log(`[AVISO 10062] Tentativa de deferReply para /reset falhou (Interação expirada).`);
                    return; // ABORTA
                }
                throw error;
            }

            if (deferSuccessful) {
                // 2. Obtém a opção
                const deckType = interaction.options.getString('baralho');
                const handler = resetHandlers[deckType];

                // 3. Executa o reset handler
                if (handler) {
                    // Mensagem de "Aguarde" ANTES de chamar a função lenta.
                    // O editReply final será feito DENTRO do handleReset do módulo.
                    await interaction.editReply(`🔄 Resetando seu baralho de **${deckType.toUpperCase()}**. Aguarde um momento...`);

                    return handler(interaction); 
                } else {
                    return interaction.editReply(`⚠️ Tipo de baralho inválido: \`${deckType}\`.`);
                }
            }
            return;
        }


        // =========================================================
        // === COMANDO DE AJUDA (MANTIDO) ==========================
        // =========================================================

        if (interaction.commandName === "help") {
            await handleHelp(interaction); 
            return;
        }

        // =========================================================
        // === COMANDO /criarficha E /fichas (MANTIDO) =============
        // =========================================================
        // Criar fichas está quebrado, porém a consulta funciona normal
        // > Possivel integração com o Nero (Ou seja, sem nescessidade de concertar)
        if (interaction.commandName === "criarficha") {
            if (!guildId) return interaction.reply({ content: "⚠️ Este comando só funciona em servidores.", ephemeral: true });

            const userId = interaction.user.id;

            if (fichasEmCriacao.has(userId)) {
                clearTimeout(fichasEmCriacao.get(userId).timeout);
                fichasEmCriacao.delete(userId);
            }

            fichasEmCriacao.set(userId, {
                etapa: 1,
                dados: {},
                timeout: setTimeout(() => {
                    fichasEmCriacao.delete(userId);
                    interaction.followUp({ content: `⏱️ ${interaction.user}, sua sessão de ficha expirou. Recomece com /criarficha.`, ephemeral: true }).catch(e => console.log('Erro ao enviar timeout followUp:', e.message));
                }, 30 * 60 * 1000)
            });
            const embed = new EmbedBuilder().setTitle("📜 Ficha Assimilada").setDescription("Crie sua ficha assimilada!").setColor("DarkRed");
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("etapa1").setLabel("Criar").setStyle(ButtonStyle.Success)
            );
            return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });

        }
        if (interaction.commandName === "fichas") {
            if (!guildId) return interaction.reply({ content: "⚠️ Este comando só funciona em servidores.", ephemeral: true });

            await interaction.deferReply({ ephemeral: true });

            const fichas = await colecao.find({}).toArray();
            if (fichas.length === 0) {
                return interaction.editReply({ content: "📂 Nenhuma ficha encontrada neste servidor.", ephemeral: true });
            }

            const usuariosUnicos = [...new Set(fichas.map(f => f.userId))];

            const userOptions = usuariosUnicos.map(uid => ({
                label: fichas.find(f => f.userId === uid)?.userName || `Usuário Desconhecido (${uid})`,
                value: uid
            })).slice(0, 25);

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectUser")
                    .setPlaceholder("👤 Escolha um usuário")
                    .addOptions(userOptions)
            );

            return interaction.editReply({ content: "Selecione um usuário para ver as fichas dele:", components: [row] });
        }
    }


    // ======== SELEÇÃO DE SKIN (Select Menu) - Com Try/Catch (MANTIDO) ========
    if (interaction.isStringSelectMenu() && interaction.customId === "select_skin") {
        await interaction.deferUpdate();
        const skinId = interaction.values[0];
        let skinName = '';

        switch (skinId) {
            case 'bw':
                skinName = 'Black & White with Blood';
                break;
            case 'rg':
                skinName = 'Red & Golden';
                break;
            case 'wb':
                skinName = 'Blue Storm & White';
                break;
            case 'pd':
                skinName = 'Orgulho Pride';
                break;
            default:
                skinName = 'Default';
        }

        try {
            await setUserSkin(
                interaction.guild.id,
                interaction.guild.name,
                interaction.user.id,
                interaction.user.username,
                skinId
            );

            return interaction.editReply({
                content: `${interaction.user} escolheu o Set **${skinName}** para jogar 🎲`,
                components: []
            });

        } catch (error) {
            console.error(`Erro ao salvar a skin para ${interaction.user.tag}:`, error);

            return interaction.editReply({
                content: `⚠️ Erro ao salvar sua escolha de skin (**${skinName}**). Tente novamente mais tarde.`,
                components: []
            });
        }
    }

    // Comandos de interação de Ficha (Select/Button/Modal) (MANTIDO) RETIRADO EDITAR
    if (interaction.isStringSelectMenu() && (interaction.customId === "selectUser" || interaction.customId === "selectFicha") || 
        (interaction.isButton() && (interaction.customId.startsWith("deleteFicha_") || interaction.customId === "fichas_voltar" || interaction.customId.startsWith("etapa"))) ||
        (interaction.isModalSubmit() && interaction.customId.startsWith("fichaEtapa"))
    ) {

        // ======== SELEÇÃO DE USUÁRIO (FICHA - Select Menu) ========
        if (interaction.isStringSelectMenu() && interaction.customId === "selectUser") {
            await interaction.deferUpdate();
            const userId = interaction.values[0];
            const fichasUsuario = await colecao.find({ userId: userId }).toArray();

            const fichaOptions = fichasUsuario.map(f => ({
                label: f.nome,
                value: f._id.toString()
            }));

            if (fichaOptions.length > 0) {
                const row = new ActionRowBuilder().addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId("selectFicha")
                        .setPlaceholder("📜 Escolha a ficha")
                        .addOptions(fichaOptions)
                );
                return interaction.editReply({ content: `Fichas encontradas para **${fichasUsuario[0].userName}**:`, components: [row] });
            } else {
                return interaction.editReply({ content: "⚠️ Nenhuma ficha encontrada para este usuário.", components: [] });
            }
        }

        // ======== SELEÇÃO DE FICHA ESPECÍFICA (FICHA - Select Menu) ========
        if (interaction.isStringSelectMenu() && interaction.customId === "selectFicha") {
            await interaction.deferUpdate();
            const fichaId = interaction.values[0];

            if (!ObjectId.isValid(fichaId)) {
                return interaction.editReply({ content: "⚠️ ID da ficha inválido.", components: [] });
            }

            const ficha = await colecao.findOne({ _id: new ObjectId(fichaId) });

            if (!ficha) {
                return interaction.editReply({ content: "⚠️ Ficha não encontrada.", components: [] });
            }

            const embed = createFichaEmbed(ficha);

            const isOwner = ficha.userId === interaction.user.id;

            const buttons = [
                isOwner ? new ButtonBuilder().setCustomId(`deleteFicha_${fichaId}`).setLabel("Deletar").setStyle(ButtonStyle.Danger) : null,
                new ButtonBuilder().setCustomId("fichas_voltar").setLabel("Voltar").setStyle(ButtonStyle.Primary)
            ].filter(btn => btn !== null); 

            const row = new ActionRowBuilder().addComponents(buttons); 

            return interaction.editReply({ embeds: [embed], components: [row], content: `Ficha de **${ficha.nome}**:` });
        }


        // ======== BOTÕES DE ETAPAS (FICHA - Button) ========
        if (interaction.isButton() && interaction.customId.startsWith("etapa")) {
            const userId = interaction.user.id;
            const ficha = fichasEmCriacao.get(userId);
            if (!ficha) return interaction.reply({ content: "⚠️ Sua sessão expirou ou não foi iniciada.", ephemeral: true });

            await interaction.deferUpdate();

            const etapa = parseInt(interaction.customId.replace("etapa", ""));
            let modal = new ModalBuilder().setCustomId(`fichaEtapa${etapa}`).setTitle(`Criar Ficha - Etapa ${etapa}/10`);

            if (etapa === 1) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("nome").setLabel("Nome").setStyle(TextInputStyle.Short).setPlaceholder('Maycon Motoca').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("geracao").setLabel("Geração").setStyle(TextInputStyle.Short).setPlaceholder('Pos-Colapso').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("evento").setLabel("Evento Marcante").setStyle(TextInputStyle.Short).setPlaceholder('Unico sobrevivente Massacre BR-101').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("posicao").setLabel("Posição Social").setStyle(TextInputStyle.Short).setPlaceholder('Desbravador de Novos Caminhos').setRequired(true))
                );
            } else if (etapa === 2) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("proposito").setLabel("Propósitos Individuais").setStyle(TextInputStyle.Paragraph).setPlaceholder('1- Encontrar uma reserva de Gasolina').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("relacionais").setLabel("Propósitos Relacionais").setStyle(TextInputStyle.Paragraph).setPlaceholder('1- Proteger os caçadores do grupo').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("determinacao").setLabel("Determinação").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('09').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("assimilacao").setLabel("Assimilação").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('01').setRequired(true))
                );
            } else if (etapa === 3) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("reacao").setLabel("Reação").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("percepcao").setLabel("Percepção").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("sagacidade").setLabel("Sagacidade").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 4) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("potencia").setLabel("Potência").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("influencia").setLabel("Influência").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("resolucao").setLabel("Resolução").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 5) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("agrario").setLabel("Agrário").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("biologico").setLabel("Biológico").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("exato").setLabel("Exato").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 6) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("medicina").setLabel("Medicina").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("social").setLabel("Social").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("artistico").setLabel("Artístico").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 7) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("esportivas").setLabel("Esportivas").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("ferramentas").setLabel("Ferramentas").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("oficios").setLabel("Ofícios").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 8) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("armas").setLabel("Armas").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("veiculos").setLabel("Veículos").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("infiltracao").setLabel("Infiltração").setStyle(TextInputStyle.Short).setMaxLength(2).setPlaceholder('0').setRequired(true))
                );
            } else if (etapa === 9) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("inventario").setLabel("Equipamentos").setStyle(TextInputStyle.Paragraph).setPlaceholder('1- Faca de Cozinha (1d6), 2- 20 Metros de Corda').setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("habs").setLabel("Características").setStyle(TextInputStyle.Paragraph).setPlaceholder('Ex: Letal, Noturna, Olfato Aguçado').setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("assimilado").setLabel("Assimilações").setStyle(TextInputStyle.Paragraph).setPlaceholder('Ass. Evolutiva 1/Ass. Adaptativa 2').setRequired(false))
                );
            } else if (etapa === 10) {
                modal.addComponents(
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("obs").setLabel("Anotações/História").setStyle(TextInputStyle.Paragraph).setPlaceholder('Qualquer anotação relevante para o seu personagem').setRequired(false)),
                    new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId("saude").setLabel("Saúde (5 a 0)").setStyle(TextInputStyle.Short).setMaxLength(1).setPlaceholder('5').setRequired(true))
                );
            } else {
                return interaction.editReply({ content: "⚠️ Etapa inválida ou não implementada.", components: [] });
            }

            await interaction.showModal(modal);

            return;
        }

        // ======== SUBMISSÃO DO MODAL (FICHA - ModalSubmit) ========
        if (interaction.isModalSubmit() && interaction.customId.startsWith("fichaEtapa")) {
            const userId = interaction.user.id;
            const guildId = interaction.guild?.id;
            const fichaState = fichasEmCriacao.get(userId);
            if (!fichaState) return interaction.reply({ content: "⚠️ Sua sessão de ficha expirou.", ephemeral: true });

            await interaction.deferUpdate();

            const etapa = parseInt(interaction.customId.replace("fichaEtapa", ""));

            const fields = {};
            for (const component of interaction.components) {
                for (const item of component.components) {
                    fields[item.customId] = item.value;
                }
            }

            Object.assign(fichaState.dados, fields);

            const proximaEtapa = etapa + 1;

            if (proximaEtapa <= 10) {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId(`etapa${proximaEtapa}`).setLabel(`Continuar (Etapa ${proximaEtapa}/10)`).setStyle(ButtonStyle.Success)
                );
                return interaction.editReply({ content: `✅ Etapa ${etapa} completa. Clique para iniciar a Etapa ${proximaEtapa}.`, components: [row] });

            } else if (proximaEtapa === 11) {
                const novaFicha = {
                    ...fichaState.dados,
                    userId: userId,
                    userName: interaction.user.username,
                    guildId: guildId,
                    criadoEm: new Date()
                };

                const saudeValor = parseInt(novaFicha.saude);
                if (isNaN(saudeValor) || saudeValor < 0 || saudeValor > 5) {
                    fichasEmCriacao.delete(userId);
                    return interaction.editReply({ content: "❌ Ficha cancelada: O valor de Saúde deve ser um número entre 0 e 5.", components: [] });
                }
                novaFicha.saude = saudeValor;

                await addFicha(guildId, userId, interaction.user.username, interaction.guild?.name, fichaState.dados);

                fichasEmCriacao.delete(userId);
                clearTimeout(fichaState.timeout);

                const embed = createFichaEmbed(novaFicha);

                return interaction.editReply({ 
                    content: `🎉 Ficha **${novaFicha.nome}** criada com sucesso!`, 
                    embeds: [embed], 
                    components: [] 
                });
            }
        }

        // ======== BOTÃO DELETAR FICHA (FICHA - Button) ======== TODO: Atualizar para novo schema
        if (interaction.isButton() && interaction.customId.startsWith("deleteFicha_")) {
            return interaction.reply({ content: "⚠️ Funcionalidade temporariamente desabilitada durante migração do banco de dados.", ephemeral: true });
        }

        // ======== BOTÃO VOLTAR (FICHA - Button) ========
        if (interaction.isButton() && interaction.customId === "fichas_voltar") {
            await interaction.deferUpdate();

            const fichas = await colecao.find({}).toArray();
            if (fichas.length === 0) {
                 return interaction.editReply({ content: "📂 Nenhuma ficha encontrada neste servidor.", embeds: [], components: [] });
            }

            const usuariosUnicos = [...new Set(fichas.map(f => f.userId))];

            const userOptions = usuariosUnicos.map(uid => ({
                label: fichas.find(f => f.userId === uid)?.userName || `Usuário Desconhecido (${uid})`,
                value: uid
            })).slice(0, 25);

            const row = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId("selectUser")
                    .setPlaceholder("👤 Escolha um usuário")
                    .addOptions(userOptions)
            );

            return interaction.editReply({ content: "Selecione um usuário para ver as fichas dele:", embeds: [], components: [row] });
        }
    }
});

startServer();
setStartBotFn(() => client.login(process.env.DISCORD_TOKEN));