/*
 * Automação do teste fechado do Lumi.
 *
 * Onde isto roda: na planilha de respostas do Google Forms, em
 * Extensões → Apps Script. Não faz parte do site — mora aqui só para ficar
 * versionado junto com a página /teste/.
 *
 * Instalação:
 *   1. Cole este arquivo inteiro no editor do Apps Script.
 *   2. Confira as três constantes abaixo.
 *   3. Ícone de relógio (Acionadores) → Adicionar acionador:
 *        função .............. aoReceberResposta
 *        origem do evento .... Da planilha
 *        tipo de evento ...... Ao enviar formulário
 *   4. Autorize. O aviso "app não verificado" é esperado: o script é seu.
 *      Avançado → Acessar projeto sem verificação.
 *
 * No formulário, ligue Configurações → Coletar e-mails → Verificado. Assim o
 * endereço gravado é o da conta Google logada, e não o que a pessoa digitou —
 * que é a origem da maior parte dos convites que "não abrem".
 */

const DONO = 'daruan.app@gmail.com';
const LINK_OPTIN = 'https://play.google.com/apps/testing/com.daruanapp.lumi';
const ASSINATURA = '— Daruan, Lumi';


/**
 * Dispara a cada resposta nova. Confirma para quem se inscreveu e avisa o dono.
 */
function aoReceberResposta(e) {
  const dados = e.namedValues;

  // O título das colunas muda com o idioma do Forms e com o texto das
  // perguntas, então procura por padrão em vez de fixar o nome.
  const email = primeiroValor(dados, /mail/i);
  if (!email) return;

  const nome = primeiroValor(dados, /nome|chamar/i);

  MailApp.sendEmail({
    to: email,
    subject: 'Recebemos sua inscrição no teste do Lumi',
    htmlBody:
      '<p>' + (nome ? 'Oi, ' + escapar(nome) + '!' : 'Oi!') + '</p>' +
      '<p>Sua inscrição chegou. Vou adicionar seu e-mail à lista de testadores e ' +
      'te mando o link para aceitar o convite assim que liberar — normalmente em ' +
      'até 24 horas.</p>' +
      '<p><b>Um pedido:</b> o Google exige que os testadores fiquem com o app ' +
      'instalado por 14 dias seguidos. Se alguém desinstala no meio, a contagem ' +
      'recomeça para todo mundo. Então siga só se puder deixar instalado nesse ' +
      'período.</p>' +
      '<p>' + ASSINATURA + '</p>'
  });

  MailApp.sendEmail({
    to: DONO,
    subject: 'Novo testador do Lumi: ' + email,
    body:
      (nome || '(sem nome)') + ' <' + email + '>\n\n' +
      SpreadsheetApp.getActiveSpreadsheet().getUrl()
  });
}


/**
 * Avisa quem ainda não foi avisado. Rode na mão, depois de adicionar os
 * pendentes na lista de testadores do Play Console.
 *
 * A coluna "Avisado em" é o que impede alguém de receber o mesmo e-mail duas
 * vezes se a função rodar de novo.
 */
function avisarPendentes() {
  const aba = SpreadsheetApp.getActiveSheet();
  const dados = aba.getDataRange().getValues();
  if (dados.length < 2) {
    Logger.log('Nenhuma resposta na planilha.');
    return;
  }

  const cabecalho = dados[0];
  const colEmail = cabecalho.findIndex(function (c) { return /mail/i.test(c); });
  if (colEmail === -1) {
    Logger.log('Não achei a coluna de e-mail. Ligue "Coletar e-mails" no formulário.');
    return;
  }

  let colAviso = cabecalho.findIndex(function (c) { return /avisado/i.test(c); });
  if (colAviso === -1) {
    colAviso = cabecalho.length;
    aba.getRange(1, colAviso + 1).setValue('Avisado em');
  }

  let enviados = 0;
  for (let i = 1; i < dados.length; i++) {
    const email = String(dados[i][colEmail] || '').trim();
    if (!email || dados[i][colAviso]) continue;

    MailApp.sendEmail({
      to: email,
      subject: 'Seu acesso ao teste do Lumi está liberado',
      htmlBody:
        '<p>Pronto: seu e-mail já está na lista de testadores.</p>' +
        '<p><a href="' + LINK_OPTIN + '">Toque aqui para aceitar o convite</a> e ' +
        'depois instale pela Play Store, usando a mesma conta Google deste ' +
        'e-mail.</p>' +
        '<p>Se a página disser que você não é testador, espere alguns minutos e ' +
        'tente de novo — a lista leva um tempo para propagar.</p>' +
        '<p>Lembrete: por favor, deixe instalado por 14 dias.</p>' +
        '<p>' + ASSINATURA + '</p>'
    });

    aba.getRange(i + 1, colAviso + 1).setValue(new Date());
    enviados++;
  }

  Logger.log(enviados + ' aviso(s) enviado(s). Cota restante hoje: ' +
             MailApp.getRemainingDailyQuota());
}


/**
 * Lembrete do meio do teste — o que salva a contagem dos 14 dias. Envia para
 * todo mundo que já foi avisado. Rode na mão por volta do sétimo dia.
 */
function lembrarDeNaoDesinstalar() {
  const aba = SpreadsheetApp.getActiveSheet();
  const dados = aba.getDataRange().getValues();
  const cabecalho = dados[0];

  const colEmail = cabecalho.findIndex(function (c) { return /mail/i.test(c); });
  const colAviso = cabecalho.findIndex(function (c) { return /avisado/i.test(c); });
  if (colEmail === -1 || colAviso === -1) {
    Logger.log('Rode avisarPendentes() antes: não há ninguém avisado ainda.');
    return;
  }

  const destinatarios = [];
  for (let i = 1; i < dados.length; i++) {
    const email = String(dados[i][colEmail] || '').trim();
    if (email && dados[i][colAviso]) destinatarios.push(email);
  }

  if (!destinatarios.length) {
    Logger.log('Ninguém avisado ainda.');
    return;
  }

  // Todos em cópia oculta: os testadores não precisam ver o e-mail uns dos outros.
  MailApp.sendEmail({
    to: DONO,
    bcc: destinatarios.join(','),
    subject: 'Lumi: continua instalado aí?',
    htmlBody:
      '<p>Oi! Passando só para agradecer e pedir uma coisa pequena.</p>' +
      '<p>O teste precisa de todo mundo com o app instalado por 14 dias seguidos. ' +
      'Se você desinstalou, dá para reinstalar pela Play Store com a mesma conta e ' +
      'a contagem volta.</p>' +
      '<p>Achou algo estranho no app? Responda este e-mail — é exatamente para isso ' +
      'que o teste existe.</p>' +
      '<p>' + ASSINATURA + '</p>'
  });

  Logger.log('Lembrete enviado para ' + destinatarios.length + ' pessoa(s).');
}


/** Primeiro valor não vazio cuja coluna casa com o padrão. */
function primeiroValor(dados, padrao) {
  const chave = Object.keys(dados).find(function (k) { return padrao.test(k); });
  return chave ? String(dados[chave][0] || '').trim() : '';
}


/** Evita que um nome com < ou & quebre o HTML do e-mail. */
function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
