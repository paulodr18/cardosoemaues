import { Component, ElementRef, ViewChild, signal, inject, afterRenderEffect } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';
import { ProcessoService } from '../api/processo.service';
import { ContatoService } from '../api/contato.service';
import { CnjProcesso, MensagemResposta } from '../api/api.models';

/** Tipos de mensagem renderizados no chat. */
export interface ChatMessage {
  sender: 'user' | 'bot';
  kind: 'text' | 'processos' | 'whatsapp';
  time: string;
  text?: string;
  processos?: CnjProcesso[];
  whatsappUrl?: string;
}

export interface QuickReply {
  label: string;
  action: ChatAction;
}

type ChatAction = 'consultar' | 'whatsapp' | 'lead' | 'menu' | 'honorarios';

/** Estados do fluxo de conversa. */
type ChatState =
  | 'menu'
  | 'aguardando_numero'
  | 'consultando'
  | 'lead_nome'
  | 'lead_email'
  | 'lead_telefone'
  | 'lead_mensagem'
  | 'enviando_lead';

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatIconModule],
  templateUrl: './chatbox.html',
  styleUrl: './chatbox.scss'
})
export class ChatboxComponent {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;

  private readonly processoService = inject(ProcessoService);
  private readonly contatoService = inject(ContatoService);

  // Estado reativo (signals — obrigatório com zoneless change detection)
  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([]);
  readonly isTyping = signal(false);
  readonly quickReplies = signal<QuickReply[]>([]);
  newMessage = '';

  private state: ChatState = 'menu';

  /** Dados coletados no fluxo de captura de contato. */
  private lead = { nome: '', email: '', telefone: '', mensagem: '' };

  /**
   * Contexto usado para escolher o número de WhatsApp no handoff.
   * `trabalhista` liga quando o processo consultado é da Justiça do Trabalho
   * (dígito J do número CNJ, ou tribunal TRT/TST na resposta) ou quando o
   * usuário menciona termos trabalhistas; zera ao voltar ao menu.
   */
  private contexto = { trabalhista: false, numeroProcesso: null as string | null };

  /** Termos que indicam demanda trabalhista no texto livre do usuário. */
  private static readonly REGEX_TRABALHISTA =
    /\btrabalh|\bclt\b|\btrt\b|\btst\b|rescis|reclamat[oó]ria|horas? extras?|\bfgts\b|demiss|justa causa|aviso pr[eé]vio|empregad|carteira assinada/i;

  /** Respiro acima da mensagem quando ela é alinhada pelo topo. */
  private static readonly MARGEM_SCROLL_PX = 12;

  private static readonly MENU_PADRAO: QuickReply[] = [
    { label: 'Consultar processo', action: 'consultar' },
    { label: 'Falar no WhatsApp', action: 'whatsapp' },
    { label: 'Deixar mensagem', action: 'lead' },
  ];

  constructor() {
    /**
     * Autoscroll da área de mensagens.
     *
     * Roda somente quando `messages`/`isTyping` mudam — e apenas no browser,
     * nunca no SSR. Substitui o antigo ngAfterViewChecked, que disparava em
     * TODO ciclo de change detection (inclusive ao digitar no input) e por
     * isso arrastava o usuário de volta ao fim da lista enquanto ele lia.
     */
    afterRenderEffect(() => {
      this.messages();
      this.isTyping();
      this.acompanharUltimaMensagem();
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen() && this.messages().length === 0) {
      setTimeout(() => {
        this.addBotText(
          'Olá! Sou a assistente virtual da Cardoso & Maués. Como posso ajudar você hoje?'
        );
        this.quickReplies.set(ChatboxComponent.MENU_PADRAO);
      }, 400);
    }
  }

  // ---------------------------------------------------------------
  // Entrada do usuário
  // ---------------------------------------------------------------

  sendMessage() {
    const texto = this.newMessage.trim();
    if (!texto || this.estaOcupado()) return;

    this.addUserText(texto);
    this.newMessage = '';
    this.quickReplies.set([]);

    if (ChatboxComponent.REGEX_TRABALHISTA.test(texto)) {
      this.contexto.trabalhista = true;
    }

    // "menu" / "cancelar" reinicia o fluxo em qualquer estado
    if (/^(menu|cancelar|voltar|in[ií]cio)$/i.test(texto)) {
      this.voltarAoMenu();
      return;
    }

    switch (this.state) {
      case 'aguardando_numero':
        this.tratarNumeroProcesso(texto);
        break;
      case 'lead_nome':
        this.tratarLeadNome(texto);
        break;
      case 'lead_email':
        this.tratarLeadEmail(texto);
        break;
      case 'lead_telefone':
        this.tratarLeadTelefone(texto);
        break;
      case 'lead_mensagem':
        this.tratarLeadMensagem(texto);
        break;
      default:
        this.tratarTextoLivre(texto);
    }
  }

  onQuickReply(reply: QuickReply) {
    if (this.estaOcupado()) return;
    this.addUserText(reply.label);
    this.quickReplies.set([]);
    this.executarAcao(reply.action);
  }

  private executarAcao(action: ChatAction) {
    switch (action) {
      case 'consultar':
        this.state = 'aguardando_numero';
        this.respostaBot(
          'Claro! Informe o número do seu processo. '
        );
        break;

      case 'whatsapp': {
        const url = this.montarUrlWhatsapp();
        const equipe = this.contexto.trabalhista ? 'nossa equipe trabalhista' : 'nossa equipe';
        this.respostaBot(`Perfeito! Clique no botão abaixo para continuar o atendimento com ${equipe} no WhatsApp.`, () => {
          this.addMessage({ sender: 'bot', kind: 'whatsapp', time: this.horaAtual(), whatsappUrl: url });
          this.quickReplies.set(ChatboxComponent.MENU_PADRAO);
        });
        break;
      }

      case 'lead':
        this.state = 'lead_nome';
        this.lead = { nome: '', email: '', telefone: '', mensagem: '' };
        this.respostaBot(
          'Vou registrar sua mensagem para nossa equipe. Para começar, qual é o seu nome?\n\n' +
          'Seus dados serão usados apenas para retornarmos o contato. ' +
          'Digite "cancelar" a qualquer momento para voltar ao menu.'
        );
        break;

      case 'honorarios':
        this.respostaBot(
          'Os honorários dependem da complexidade de cada caso. ' +
          'O ideal é agendar uma avaliação com nossa equipe — posso te transferir para o WhatsApp ou registrar sua mensagem.',
          () => this.quickReplies.set([
            { label: 'Falar no WhatsApp', action: 'whatsapp' },
            { label: 'Deixar mensagem', action: 'lead' },
            { label: 'Voltar ao menu', action: 'menu' },
          ])
        );
        break;

      case 'menu':
        this.voltarAoMenu();
        break;
    }
  }

  private tratarTextoLivre(texto: string) {
    const lower = texto.toLowerCase();

    // Se a mensagem já contém um número de processo, consulta direto
    const numero = this.processoService.extrairNumeroProcesso(texto);
    if (numero) {
      this.consultarProcesso(numero);
      return;
    }

    if (lower.includes('processo') || lower.includes('consulta') || lower.includes('andamento')) {
      this.executarAcao('consultar');
      return;
    }
    if (lower.includes('preço') || lower.includes('preco') || lower.includes('valor') || lower.includes('honorário') || lower.includes('honorario')) {
      this.executarAcao('honorarios');
      return;
    }
    if (lower.includes('whatsapp') || lower.includes('advogado') || lower.includes('atendente') || lower.includes('humano')) {
      this.executarAcao('whatsapp');
      return;
    }
    if (lower.includes('contato') || lower.includes('mensagem') || lower.includes('email') || lower.includes('e-mail')) {
      this.executarAcao('lead');
      return;
    }

    this.respostaBot(
      'Entendi! Posso te ajudar com as opções abaixo — ou, para um atendimento personalizado, fale com nossos advogados no WhatsApp.',
      () => this.quickReplies.set(ChatboxComponent.MENU_PADRAO)
    );
  }

  // ---------------------------------------------------------------
  // Fluxo: consulta de processo (GET /cnj/processo/{numero})
  // ---------------------------------------------------------------

  private tratarNumeroProcesso(texto: string) {
    const numero = this.processoService.extrairNumeroProcesso(texto);
    if (!numero) {
      this.respostaBot(
        'Não consegui identificar um número de processo válido. ' +
        'O formato esperado é 0000000-00.0000.0.00.0000 (ou os 20 dígitos, sem pontuação). ' +
        'Pode tentar novamente? Ou digite "cancelar" para voltar ao menu.'
      );
      return;
    }
    this.consultarProcesso(numero);
  }

  private consultarProcesso(numero: string) {
    this.state = 'consultando';
    this.isTyping.set(true);
    this.contexto.numeroProcesso = numero;
    if (this.processoService.ehTrabalhista(numero)) {
      this.contexto.trabalhista = true;
    }

    this.processoService.consultarProcesso(numero).subscribe({
      next: (processos) => {
        this.isTyping.set(false);
        if (processos?.some(p => /^T(RT|ST)/i.test(p.tribunal ?? ''))) {
          this.contexto.trabalhista = true;
        }
        if (!processos || processos.length === 0) {
          this.state = 'aguardando_numero';
          this.addBotText(
            `Não encontrei o processo ${this.processoService.formatarNumeroProcesso(numero)} na base pública do CNJ (DataJud). ` +
            'Verifique se o número está correto — processos em segredo de justiça ou muito recentes podem não constar na base. ' +
            'Quer tentar outro número?'
          );
          this.quickReplies.set([
            { label: 'Falar no WhatsApp', action: 'whatsapp' },
            { label: 'Voltar ao menu', action: 'menu' },
          ]);
          return;
        }

        this.state = 'menu';
        if (processos.length > 1) {
          this.addBotText(
            `Encontrei ${processos.length} registros para este processo (instâncias/tribunais diferentes). Veja abaixo:`
          );
        } else {
          this.addBotText('Encontrei! Aqui estão as informações do seu processo:');
        }
        this.addMessage({ sender: 'bot', kind: 'processos', time: this.horaAtual(), processos });
        this.quickReplies.set([
          { label: 'Consultar outro processo', action: 'consultar' },
          { label: 'Falar no WhatsApp', action: 'whatsapp' },
          { label: 'Voltar ao menu', action: 'menu' },
        ]);
      },
      error: (err) => {
        this.isTyping.set(false);
        this.state = 'aguardando_numero';
        this.addBotText(this.mensagemErroConsulta(err));
        this.quickReplies.set([
          { label: 'Falar no WhatsApp', action: 'whatsapp' },
          { label: 'Voltar ao menu', action: 'menu' },
        ]);
      },
    });
  }

  private mensagemErroConsulta(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      if (err.status === 400) {
        return 'O número informado não está em um formato válido. Confira e tente novamente no padrão 0000000-00.0000.0.00.0000.';
      }
      if (err.status === 0) {
        return 'Não consegui me conectar ao servidor. Verifique sua internet e tente novamente em instantes.';
      }
      return 'A consulta está temporariamente indisponível. Tente novamente em alguns minutos ou fale com nossa equipe no WhatsApp.';
    }
    // Timeout do rxjs ou erro inesperado
    return 'A consulta demorou mais que o esperado. Tente novamente em instantes ou fale com nossa equipe no WhatsApp.';
  }

  // ---------------------------------------------------------------
  // Fluxo: captura de contato (POST /contato)
  // ---------------------------------------------------------------

  private tratarLeadNome(texto: string) {
    if (texto.length < 2 || texto.length > 100 || !/^[a-zA-ZÀ-ÿ\s]+$/.test(texto)) {
      this.respostaBot('Hmm, esse nome não parece válido — use apenas letras, por favor. Qual é o seu nome?');
      return;
    }
    this.lead.nome = texto;
    this.state = 'lead_email';
    this.respostaBot(`Prazer, ${texto.split(' ')[0]}! Qual é o seu e-mail para retorno?`);
  }

  private tratarLeadEmail(texto: string) {
    if (texto.length > 150 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
      this.respostaBot('Esse e-mail não parece válido. Pode conferir e digitar novamente?');
      return;
    }
    this.lead.email = texto;
    this.state = 'lead_telefone';
    this.respostaBot('Obrigada! Agora seu telefone com DDD (ex.: (91) 99999-9999) — ou digite "pular".');
  }

  private tratarLeadTelefone(texto: string) {
    if (/^pular$/i.test(texto)) {
      this.lead.telefone = '';
    } else if (/^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(texto)) {
      this.lead.telefone = texto;
    } else {
      this.respostaBot('Telefone inválido. Use o formato (91) 99999-9999 — ou digite "pular".');
      return;
    }
    this.state = 'lead_mensagem';
    this.respostaBot('Perfeito! Agora me conte, em poucas palavras, como podemos ajudar você.');
  }

  private tratarLeadMensagem(texto: string) {
    if (texto.length > 5000) {
      this.respostaBot('Sua mensagem ficou muito longa (máximo de 5000 caracteres). Pode resumir um pouco?');
      return;
    }
    this.lead.mensagem = texto;
    this.enviarLead();
  }

  private enviarLead() {
    this.state = 'enviando_lead';
    this.isTyping.set(true);

    this.contatoService.enviarContato({
      nome: this.lead.nome,
      email: this.lead.email,
      telefone: this.lead.telefone || undefined,
      mensagem: this.lead.mensagem,
    }).subscribe({
      next: () => {
        this.isTyping.set(false);
        this.state = 'menu';
        this.addBotText(
          `Prontinho, ${this.lead.nome.split(' ')[0]}! Sua mensagem foi enviada para nossa equipe, ` +
          'que retornará o contato em breve. Posso ajudar em mais alguma coisa?'
        );
        this.quickReplies.set(ChatboxComponent.MENU_PADRAO);
      },
      error: (err) => {
        this.isTyping.set(false);
        this.state = 'lead_mensagem';
        const detalhe = err instanceof HttpErrorResponse && err.status === 400 && (err.error as MensagemResposta)?.campos
          ? ' Alguns dados não passaram na validação: ' + Object.values((err.error as MensagemResposta).campos!).join('; ') + '.'
          : '';
        this.addBotText(
          'Não consegui enviar sua mensagem agora.' + detalhe +
          ' Você pode tentar de novo em instantes ou falar direto com a equipe no WhatsApp.'
        );
        this.quickReplies.set([
          { label: 'Falar no WhatsApp', action: 'whatsapp' },
          { label: 'Voltar ao menu', action: 'menu' },
        ]);
      },
    });
  }

  // ---------------------------------------------------------------
  // Helpers de apresentação
  // ---------------------------------------------------------------

  formatarNumero(numero: string | undefined): string {
    return numero ? this.processoService.formatarNumeroProcesso(numero) : '—';
  }

  formatarData(iso: string | undefined, comHora = false): string {
    return this.processoService.formatarData(iso, comHora);
  }

  nomesAssuntos(processo: CnjProcesso): string {
    return (processo.assuntos ?? [])
      .map(a => a.nome)
      .filter((n): n is string => !!n)
      .join(', ');
  }

  private voltarAoMenu() {
    this.state = 'menu';
    this.contexto = { trabalhista: false, numeroProcesso: null };
    this.respostaBot('Sem problemas! Como posso ajudar?', () =>
      this.quickReplies.set(ChatboxComponent.MENU_PADRAO)
    );
  }

  /**
   * Monta o link de handoff. Processos trabalhistas vão para o número da
   * equipe trabalhista; todo o restante segue para o atendimento geral.
   * Quando houve consulta, o número do processo já vai na mensagem.
   */
  private montarUrlWhatsapp(): string {
    const numero = this.contexto.trabalhista ? environment.whatsapp.trabalhista : environment.whatsapp.geral;

    let mensagem = 'Olá! Vim pelo site da Cardoso & Maués e gostaria de falar com um advogado';
    if (this.contexto.numeroProcesso) {
      mensagem += ` sobre o processo ${this.processoService.formatarNumeroProcesso(this.contexto.numeroProcesso)}`;
    } else if (this.contexto.trabalhista) {
      mensagem += ' sobre uma questão trabalhista';
    }
    mensagem += '.';

    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }

  /** Bloqueia novo envio enquanto uma requisição está em andamento. */
  private estaOcupado(): boolean {
    return this.state === 'consultando' || this.state === 'enviando_lead';
  }

  /** Resposta do bot com indicador de digitação e callback opcional ao concluir. */
  private respostaBot(texto: string, aoConcluir?: () => void) {
    this.isTyping.set(true);
    setTimeout(() => {
      this.isTyping.set(false);
      this.addBotText(texto);
      aoConcluir?.();
    }, 700);
  }

  private addUserText(text: string) {
    this.addMessage({ sender: 'user', kind: 'text', time: this.horaAtual(), text });
  }

  private addBotText(text: string) {
    this.addMessage({ sender: 'bot', kind: 'text', time: this.horaAtual(), text });
  }

  private addMessage(msg: ChatMessage) {
    this.messages.update(list => [...list, msg]);
  }

  private horaAtual(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * Rola a área de mensagens para revelar a última resposta.
   *
   * Respostas mais altas que a área visível (típico do card de processo, que
   * traz classe, órgão julgador, assuntos e movimentações) são alinhadas pelo
   * TOPO: rolar até o fim mostraria o rodapé do card e esconderia justamente
   * o número do processo. Respostas curtas rolam até o fim, como num chat.
   */
  private acompanharUltimaMensagem() {
    const area = this.messagesContainer?.nativeElement;
    if (!area) return;

    const scrollMaximo = area.scrollHeight - area.clientHeight;
    if (scrollMaximo <= 0) return;

    const linhas = area.querySelectorAll<HTMLElement>('.message-row');
    const ultima = linhas.item(linhas.length - 1);

    if (ultima && ultima.offsetHeight > area.clientHeight) {
      /**
       * offsetTop, e não getBoundingClientRect(): a .chat-window anima com
       * transform: scale(), e o rect viria em coordenadas visuais escaladas,
       * que não se somam a scrollTop (coordenadas de layout). A área é
       * position: relative, então offsetTop já é relativo a ela.
       */
      const alvo = ultima.offsetTop - ChatboxComponent.MARGEM_SCROLL_PX;
      area.scrollTop = Math.max(0, Math.min(alvo, scrollMaximo));
      return;
    }

    area.scrollTop = scrollMaximo;
  }
}
