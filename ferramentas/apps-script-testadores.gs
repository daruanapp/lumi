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

  if (!ligarColetaVerificada(form)) {
    Logger.log('ATENÇÃO: não consegui ligar a coleta verificada pela API. ' +
               'Ajuste na tela antes de divulgar (ver corrigirColetaDeEmail).');
  }
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


/**
 * O e-mail precisa vir da conta logada, e não digitado: o convite do Play só
 * abre na conta que está na Play Store do aparelho, e endereço digitado à mão
 * diverge dela o tempo todo — é a causa mais comum de convite que "não abre".
 *
 * O Forms tem três modos de coleta, e `setCollectEmail(true)` — a API antiga —
 * entrega o do meio: "Resposta do participante", que é justamente uma caixa
 * para digitar. O modo verificado tem método próprio, mais novo, então tenta
 * esse primeiro e avisa se não existir nesta versão do Apps Script.
 */
function ligarColetaVerificada(form) {
  const temApi = typeof form.setEmailCollectionType === 'function' &&
                 FormApp.EmailCollectionType &&
                 FormApp.EmailCollectionType.VERIFIED;

  if (temApi) {
    form.setEmailCollectionType(FormApp.EmailCollectionType.VERIFIED);
    return true;
  }

  form.setCollectEmail(true);
  return false;
}


/**
 * Conserta um formulário que já nasceu com a coleta errada. Rode uma vez e
 * confira na tela depois.
 */
function corrigirColetaDeEmail() {
  const url = PropertiesService.getScriptProperties().getProperty('FORM_EDITAR');
  if (!url) throw new Error('Rode configurar() primeiro.');

  if (ligarColetaVerificada(FormApp.openByUrl(url))) {
    Logger.log('Pronto: a coleta agora é verificada. Abra o formulário e ' +
               'confirme que a pergunta "E-mail" sumiu.\n' + url);
  } else {
    Logger.log('Esta versão do Apps Script não expõe setEmailCollectionType.\n' +
               'Ajuste na tela: ' + url + '\n' +
               'Configurações → Respostas → Coletar endereços de e-mail → Verificado.');
  }
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
  const email = emailDaResposta(e.namedValues);
  if (!email) return;

  const nome = primeiroValor(e.namedValues, /nome|chamar/i);

  enviar({
    para: email,
    assunto: 'Recebemos sua inscrição no teste do Lumi',
    paragrafos: [
      nome ? 'Oi, ' + nome + '!' : 'Oi!',
      'Sua inscrição chegou. Vou adicionar seu e-mail à lista de testadores e ' +
      'te mando o link para aceitar o convite assim que liberar — normalmente ' +
      'em até 24 horas.',
      'Um pedido: o Google exige que os testadores fiquem com o app instalado ' +
      'por 14 dias seguidos. Se alguém desinstala no meio, a contagem recomeça ' +
      'para todo mundo.',
      // Pedir o resgate agora é o que faz o próximo e-mail — o que traz o link,
      // o que não pode ser perdido — chegar na caixa de entrada.
      'Se esta mensagem caiu no spam, marque como "não é spam" e responda ' +
      'qualquer coisa: é por aqui que o convite vai chegar.',
      ASSINATURA
    ]
  });

  enviar({
    para: DONO,
    assunto: 'Novo testador do Lumi: ' + email,
    paragrafos: [
      (nome || '(sem nome)') + ' <' + email + '>',
      PropertiesService.getScriptProperties().getProperty('PLANILHA_URL')
    ]
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

  const colEmail = colunaEmail(dados);
  let colAviso = coluna(dados[0], /avisado/i);
  if (colAviso === -1) {
    colAviso = dados[0].length;
    aba.getRange(1, colAviso + 1).setValue('Avisado em');
  }

  let enviados = 0;
  for (let i = 1; i < dados.length; i++) {
    const email = String(dados[i][colEmail] || '').trim();
    if (!email || dados[i][colAviso]) continue;

    enviar({
      para: email,
      assunto: 'Seu convite para testar o Lumi',
      paragrafos: [
        'Pronto: seu e-mail já está na lista de testadores.',
        // O endereço à mostra, em vez de "toque aqui": lê melhor no texto puro
        // e evita a construção que os filtros mais associam a isca.
        'Abra este link para aceitar o convite:',
        LINK_OPTIN,
        'Depois é só instalar pela Play Store, usando a mesma conta Google ' +
        'deste e-mail.',
        'Se a página disser que você não é testador, espere alguns minutos e ' +
        'tente de novo — a lista leva um tempo para propagar.',
        'Lembrete: por favor, deixe instalado por 14 dias.',
        ASSINATURA
      ]
    });

    aba.getRange(i + 1, colAviso + 1).setValue(new Date());
    enviados++;
  }

  Logger.log(enviados + ' aviso(s) enviado(s). Cota de e-mail restante hoje: ' +
             GmailApp.getRemainingDailyQuota());
}


/**
 * Lembrete do meio do teste — é o que de fato segura a contagem dos 14 dias.
 * Envia para todo mundo que já foi avisado. Rode por volta do sétimo dia.
 */
function lembrarDeNaoDesinstalar() {
  const aba = abaRespostas();
  const dados = aba.getDataRange().getValues();
  const colEmail = colunaEmail(dados);
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
  enviar({
    para: DONO,
    bcc: destinatarios.join(','),
    assunto: 'Lumi: continua instalado aí?',
    paragrafos: [
      'Oi! Passando para agradecer e pedir uma coisa pequena.',
      'O teste precisa de todo mundo com o app instalado por 14 dias seguidos. ' +
      'Se você desinstalou, dá para reinstalar pela Play Store com a mesma conta ' +
      'e a contagem volta.',
      'Achou algo estranho no app? Responda este e-mail — é exatamente para isso ' +
      'que o teste existe.',
      ASSINATURA
    ]
  });

  Logger.log('Lembrete enviado para ' + destinatarios.length + ' pessoa(s).');
}


/* ------------------------------------------------------------------ envio */

/**
 * Manda a mesma mensagem em texto puro e em HTML.
 *
 * As duas versões não são capricho. Mensagem só-HTML, sem nome de remetente e
 * sem endereço de resposta é o retrato de automação disparada de conta pessoal,
 * e é assim que ela vai parar no spam. Gerar as duas partes do mesmo array
 * garante ainda que elas nunca divirjam entre si — divergir é outro sinal ruim,
 * porque é o que faz quem quer esconder conteúdo do filtro.
 *
 * O replyTo tem o motivo mais forte: resposta de gente de verdade é o sinal
 * positivo mais pesado que uma caixa de entrada conhece, e o pedido de resposta
 * no primeiro e-mail existe justamente para provocá-lo antes do segundo, que é
 * o que traz o link e não pode se perder.
 *
 * Usa GmailApp, e não MailApp, para a mensagem sair como e-mail de verdade da
 * conta: fica em Enviados e a resposta do testador cai na conversa certa.
 */
function enviar(opcoes) {
  const texto = opcoes.paragrafos.join('\n\n');
  const html = opcoes.paragrafos
    .map(function (p) { return '<p>' + emHtml(p) + '</p>'; })
    .join('\n');

  GmailApp.sendEmail(opcoes.para, opcoes.assunto, texto, {
    htmlBody: html,
    name: 'Lumi',
    replyTo: DONO,
    bcc: opcoes.bcc || ''
  });
}


/** Escapa e transforma URL solta em link, para as duas versões baterem. */
function emHtml(texto) {
  return escapar(texto).replace(/(https?:\/\/\S+)/g, '<a href="$1">$1</a>');
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


/**
 * Achar a coluna de e-mail pelo conteúdo, e não só pelo cabeçalho: trocar a
 * coleta de "resposta do participante" para verificada deixa para trás a coluna
 * antiga, vazia e com nome igualmente parecido com "e-mail". Vence a que de
 * fato tem endereços.
 */
function colunaEmail(dados) {
  const cabecalho = dados[0];
  let melhor = -1;
  let melhorNota = -1;

  for (let c = 0; c < cabecalho.length; c++) {
    const titulo = String(cabecalho[c]);
    if (!/mail/i.test(titulo)) continue;

    let n = 0;
    for (let i = 1; i < dados.length; i++) {
      if (ehEmail(dados[i][c])) n++;
    }

    // O conteúdo manda; o nome só desempata enquanto a planilha está vazia.
    const nota = n * 1000 + (/endere|address|^\s*e-?mail\s*$/i.test(titulo) ? 1 : 0);
    if (nota > melhorNota) { melhor = c; melhorNota = nota; }
  }
  return melhor;
}


/** Mesma ideia, no evento do acionador: vence a resposta que é um endereço. */
function emailDaResposta(dados) {
  const chaves = Object.keys(dados).filter(function (k) { return /mail/i.test(k); });

  for (const chave of chaves) {
    const valor = String(dados[chave][0] || '').trim();
    if (ehEmail(valor)) return valor;
  }
  return '';
}


/**
 * Endereço inteiro e sozinho, não "contém arroba". A coleta verificada cria
 * uma pergunta de consentimento cujo texto é "Registrar fulano@exemplo.com
 * como o e-mail a ser incluído na minha resposta" — casa com /mail/ no título
 * e tem arroba no valor, e viraria destinatário se o teste fosse frouxo.
 */
function ehEmail(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(valor || '').trim());
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
