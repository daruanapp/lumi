/*
 * Automação do teste fechado do Lumi.
 *
 * Não faz parte do site: roda no Google Apps Script, na conta Google de quem
 * publica o app. Mora aqui para ficar versionado junto com a página /teste/,
 * que é o outro lado da mesma coisa.
 *
 * Como usar:
 *   1. Abra https://script.google.com → Novo projeto.
 *   2. Cole este arquivo inteiro, substituindo o conteúdo padrão.
 *   3. Confira as constantes logo abaixo.
 *   4. Selecione a função `configurar` e clique em Executar.
 *      Vai pedir autorização; o aviso "app não verificado" é esperado, o script
 *      é seu — Avançado → Acessar projeto sem verificação.
 *   5. Copie o link impresso no registro de execução e cole no botão
 *      "Quero testar" de teste/index.html.
 *
 * `configurar` cria a planilha, cria o formulário, conecta os dois e instala o
 * acionador. Rodar de novo não duplica nada: ela para se já houver configuração.
 */

const DONO = 'daruan.app@gmail.com';
const LINK_OPTIN = 'https://play.google.com/apps/testing/com.daruanapp.lumi';
const ASSINATURA = '— Daruan, Lumi';


/* ------------------------------------------------------------------ setup */

/**
 * Cria formulário + planilha + acionador. Rode uma vez, na mão.
 */
function configurar() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('PLANILHA_ID')) {
    Logger.log('Já configurado. Links:\n' + linksSalvos());
    return;
  }

  const planilha = SpreadsheetApp.create('Lumi — inscrições no teste fechado');

  const form = FormApp.create('Ajude a testar o Lumi');
  form.setDescription(
    'O Lumi está em teste fechado antes de ir para a Play Store. Preencha para ' +
    'entrar na lista de testadores.\n\n' +
    'Importante: o Google exige que os testadores fiquem com o app instalado por ' +
    '14 dias seguidos. Se alguém desinstala no meio, a contagem recomeça para ' +
    'todo mundo — então só siga se puder deixar instalado nesse período.'
  );

  // O e-mail precisa vir da conta logada, não digitado: o convite do Play só
  // abre na conta que está na Play Store do aparelho, e endereço digitado à mão
  // é a causa mais comum de convite que "não funciona".
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(true);
  form.setAllowResponseEdits(false);

  form.addTextItem()
      .setTitle('Como podemos te chamar?')
      .setHelpText('Só o primeiro nome já basta.')
      .setRequired(false);

  form.addCheckboxItem()
      .setTitle('Confirme antes de enviar')
      .setChoiceValues(['Posso deixar o app instalado por 14 dias seguidos'])
      .setRequired(true);

  form.setConfirmationMessage(
    'Inscrição recebida! Você vai receber um e-mail de confirmação agora e, em ' +
    'até 24 horas, o link para aceitar o convite. Obrigado por ajudar. 🙏'
  );

  form.setDestination(FormApp.DestinationType.SPREADSHEET, planilha.getId());

  ScriptApp.newTrigger('aoReceberResposta')
           .forSpreadsheet(planilha.getId())
           .onFormSubmit()
           .create();

  props.setProperties({
    PLANILHA_ID: planilha.getId(),
    FORM_PUBLICO: form.getPublishedUrl(),
    FORM_EDITAR: form.getEditUrl(),
    PLANILHA_URL: planilha.getUrl()
  });

  Logger.log('Pronto.\n' + linksSalvos());
  Logger.log(
    '\nConfira uma coisa na tela do formulário, em Configurações → Respostas: ' +
    'a coleta de e-mail deve estar como "Verificado". A API liga a coleta, mas o ' +
    'nome dessa opção já mudou de lugar mais de uma vez.'
  );
}


function linksSalvos() {
  const p = PropertiesService.getScriptProperties().getProperties();
  return 'Link para divulgar (vai no botão da página): ' + p.FORM_PUBLICO +
         '\nEditar o formulário: ' + p.FORM_EDITAR +
         '\nPlanilha de respostas: ' + p.PLANILHA_URL;
}


/* --------------------------------------------------------------- operação */

/**
 * Dispara a cada resposta nova. Confirma para quem se inscreveu e avisa o dono.
 */
function aoReceberResposta(e) {
  const email = primeiroValor(e.namedValues, /mail/i);
  if (!email) return;

  const nome = primeiroValor(e.namedValues, /nome|chamar/i);

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
      'recomeça para todo mundo.</p>' +
      '<p>' + ASSINATURA + '</p>'
  });

  MailApp.sendEmail({
    to: DONO,
    subject: 'Novo testador do Lumi: ' + email,
    body: (nome || '(sem nome)') + ' <' + email + '>\n\n' +
          PropertiesService.getScriptProperties().getProperty('PLANILHA_URL')
  });
}


/**
 * Avisa quem ainda não foi avisado. Rode na mão, depois de adicionar os
 * pendentes na lista de testadores do Play Console.
 *
 * A coluna "Avisado em" é o que impede alguém de receber duas vezes se a função
 * rodar de novo.
 */
function avisarPendentes() {
  const aba = abaRespostas();
  const dados = aba.getDataRange().getValues();
  if (dados.length < 2) {
    Logger.log('Nenhuma inscrição ainda.');
    return;
  }

  const colEmail = coluna(dados[0], /mail/i);
  let colAviso = coluna(dados[0], /avisado/i);
  if (colAviso === -1) {
    colAviso = dados[0].length;
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

  Logger.log(enviados + ' aviso(s) enviado(s). Cota de e-mail restante hoje: ' +
             MailApp.getRemainingDailyQuota());
}


/**
 * Lembrete do meio do teste — é o que de fato segura a contagem dos 14 dias.
 * Envia para todo mundo que já foi avisado. Rode por volta do sétimo dia.
 */
function lembrarDeNaoDesinstalar() {
  const aba = abaRespostas();
  const dados = aba.getDataRange().getValues();
  const colEmail = coluna(dados[0], /mail/i);
  const colAviso = coluna(dados[0], /avisado/i);

  if (colAviso === -1) {
    Logger.log('Ninguém foi avisado ainda: rode avisarPendentes() antes.');
    return;
  }

  const destinatarios = [];
  for (let i = 1; i < dados.length; i++) {
    const email = String(dados[i][colEmail] || '').trim();
    if (email && dados[i][colAviso]) destinatarios.push(email);
  }

  if (!destinatarios.length) {
    Logger.log('Ninguém foi avisado ainda.');
    return;
  }

  // Todos em cópia oculta: um testador não precisa ver o e-mail dos outros.
  MailApp.sendEmail({
    to: DONO,
    bcc: destinatarios.join(','),
    subject: 'Lumi: continua instalado aí?',
    htmlBody:
      '<p>Oi! Passando para agradecer e pedir uma coisa pequena.</p>' +
      '<p>O teste precisa de todo mundo com o app instalado por 14 dias seguidos. ' +
      'Se você desinstalou, dá para reinstalar pela Play Store com a mesma conta e ' +
      'a contagem volta.</p>' +
      '<p>Achou algo estranho no app? Responda este e-mail — é exatamente para isso ' +
      'que o teste existe.</p>' +
      '<p>' + ASSINATURA + '</p>'
  });

  Logger.log('Lembrete enviado para ' + destinatarios.length + ' pessoa(s).');
}


/* ---------------------------------------------------------------- apoio */

/**
 * A aba de respostas é a que tem uma coluna de e-mail no cabeçalho — procurar
 * por isso evita depender do nome, que o Forms escolhe e traduz sozinho, e da
 * ordem, já que a planilha nasce com uma aba vazia ao lado.
 */
function abaRespostas() {
  const id = PropertiesService.getScriptProperties().getProperty('PLANILHA_ID');
  if (!id) throw new Error('Rode configurar() primeiro.');

  const abas = SpreadsheetApp.openById(id).getSheets();
  for (const aba of abas) {
    if (aba.getLastColumn() === 0) continue;
    const cabecalho = aba.getRange(1, 1, 1, aba.getLastColumn()).getValues()[0];
    if (coluna(cabecalho, /mail/i) !== -1) return aba;
  }
  throw new Error('Não achei a aba de respostas. Já houve alguma inscrição?');
}


function coluna(cabecalho, padrao) {
  return cabecalho.findIndex(function (c) { return padrao.test(c); });
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
