import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { provideZonelessChangeDetection } from '@angular/core';

import { ChatboxComponent, ChatMessage } from './chatbox';
import { ProcessoService } from '../api/processo.service';
import { CnjProcesso } from '../api/api.models';

/** Processo com todos os blocos preenchidos — o card mais alto que o chat renderiza. */
const PROCESSO_COMPLETO: CnjProcesso = {
  numeroProcesso: '10019432120254013904',
  classe: 'Procedimento Comum Cível',
  tribunal: 'TRF1',
  grau: 'G1',
  orgaoJulgador: 'Vara Federal Civel e Criminal da SSJ de Maraba',
  dataAjuizamento: '20250115000000',
  assuntos: [
    { codigo: 1, nome: 'Aposentadoria por Invalidez' },
    { codigo: 2, nome: 'Concessao de Beneficio Previdenciario' },
  ],
  ultimaMovimentacao: {
    nome: 'Ato ordinatorio praticado',
    dataHora: '2025-07-03T09:05:00',
    descricaoSignificado: 'Providencia de rotina praticada pela secretaria da vara.',
  },
  ultimaMovimentacaoBanco: {
    id: 1,
    descricao: 'Peticao intermediaria protocolada pelo escritorio',
    dataHora: '2025-07-05T14:20:00',
    descricaoSignificado: 'Manifestacao juntada aos autos pelo advogado responsavel.',
  },
  movimentacaoSincronizada: true,
};

describe('ChatboxComponent', () => {
  let component: ChatboxComponent;
  let fixture: ComponentFixture<ChatboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatboxComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChatboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * Regressao: a .messages-area precisa de min-height: 0 para rolar.
   *
   * Como flex item em coluna ela nasce com min-height: auto e, sem a
   * sobrescrita, cresce junto com o conteudo — o overflow-y nunca ativa e a
   * resposta fica cortada pelo overflow: hidden da janela, dando a impressao
   * de que o chatbot nao respondeu.
   */
  describe('rolagem da area de mensagens', () => {
    /** Conversa terminando no card de processo, como apos uma consulta real. */
    function conversaComCardDeProcesso(): ChatMessage[] {
      return [
        { sender: 'bot', kind: 'text', time: '10:00', text: 'Ola! Como posso ajudar?' },
        { sender: 'user', kind: 'text', time: '10:01', text: 'Consultar processo' },
        { sender: 'bot', kind: 'text', time: '10:01', text: 'Informe o numero do processo.' },
        { sender: 'user', kind: 'text', time: '10:02', text: '1001943-21.2025.4.01.3904' },
        { sender: 'bot', kind: 'text', time: '10:02', text: 'Encontrei! Aqui estao as informacoes:' },
        { sender: 'bot', kind: 'processos', time: '10:02', processos: [PROCESSO_COMPLETO] },
      ];
    }

    /** Aguarda o afterRenderEffect do autoscroll concluir. */
    async function renderizar() {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
    }

    function elemento(seletor: string): HTMLElement {
      return fixture.nativeElement.querySelector(seletor) as HTMLElement;
    }

    beforeEach(async () => {
      component.isOpen.set(true);
      component.messages.set(conversaComCardDeProcesso());
      await renderizar();
    });

    it('mantem a area de mensagens dentro da altura da janela do chat', () => {
      const janela = elemento('.chat-window');
      const area = elemento('.messages-area');

      expect(area.clientHeight).toBeGreaterThan(0);
      expect(area.clientHeight).toBeLessThanOrEqual(janela.clientHeight);
    });

    it('ativa o scroll interno quando o conteudo excede a area visivel', () => {
      const area = elemento('.messages-area');

      expect(area.scrollHeight).toBeGreaterThan(area.clientHeight);
    });

    it('nao empurra as barras de input e quick replies fora da janela', async () => {
      component.quickReplies.set([{ label: 'Consultar outro processo', action: 'consultar' }]);
      await renderizar();

      const janela = elemento('.chat-window').getBoundingClientRect();
      const input = elemento('.input-area').getBoundingClientRect();
      const chips = elemento('.quick-replies').getBoundingClientRect();

      // Tolerancia de 1px para arredondamento de subpixel do layout.
      expect(input.bottom).toBeLessThanOrEqual(janela.bottom + 1);
      expect(chips.bottom).toBeLessThanOrEqual(janela.bottom + 1);
      expect(input.height).toBeGreaterThan(0);
    });

    it('alinha o topo da resposta quando ela e mais alta que a area visivel', () => {
      const area = elemento('.messages-area');
      const card = fixture.nativeElement.querySelectorAll('.message-row');
      const ultima = card[card.length - 1] as HTMLElement;

      expect(ultima.offsetHeight).toBeGreaterThan(area.clientHeight);

      // Topo do card visivel: rolar ate o fim esconderia o numero do processo.
      // Medido por offsetTop porque a janela anima com transform: scale().
      const esperado = ultima.offsetTop - 12;
      expect(esperado).toBeLessThan(area.scrollHeight - area.clientHeight);
      expect(Math.abs(area.scrollTop - esperado)).toBeLessThanOrEqual(2);
    });

    it('rola ate o fim quando as respostas sao curtas', async () => {
      component.messages.set(
        Array.from({ length: 20 }, (_, i): ChatMessage => ({
          sender: i % 2 === 0 ? 'bot' : 'user',
          kind: 'text',
          time: '10:00',
          text: `Mensagem curta numero ${i + 1}`,
        }))
      );
      await renderizar();

      const area = elemento('.messages-area');
      const scrollMaximo = area.scrollHeight - area.clientHeight;

      expect(scrollMaximo).toBeGreaterThan(0);
      expect(Math.abs(area.scrollTop - scrollMaximo)).toBeLessThanOrEqual(2);
    });
  });
});

describe('ProcessoService (normalização de número CNJ)', () => {
  let service: ProcessoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProcessoService);
  });

  it('extrai número com máscara completa', () => {
    expect(service.extrairNumeroProcesso('Meu processo é 1001943-21.2025.4.01.3904, obrigado'))
      .toBe('10019432120254013904');
  });

  it('extrai número com 20 dígitos puros', () => {
    expect(service.extrairNumeroProcesso('10019432120254013904'))
      .toBe('10019432120254013904');
  });

  it('retorna null para texto sem número válido', () => {
    expect(service.extrairNumeroProcesso('quero saber do meu processo')).toBeNull();
    expect(service.extrairNumeroProcesso('123456')).toBeNull();
  });

  it('identifica processo da Justiça do Trabalho pelo dígito J (= 5)', () => {
    // NNNNNNN-DD.AAAA.J.TR.OOOO -> 0001234-56.2024.5.08.0001 (TRT8)
    expect(service.ehTrabalhista('00012345620245080001')).toBeTrue();
    // 4 = Justiça Federal (TRF1)
    expect(service.ehTrabalhista('00008323520184013202')).toBeFalse();
    // 8 = Justiça Estadual
    expect(service.ehTrabalhista('00012345620248140001')).toBeFalse();
    expect(service.ehTrabalhista('123')).toBeFalse();
  });

  it('formata 20 dígitos no padrão CNJ', () => {
    expect(service.formatarNumeroProcesso('10019432120254013904'))
      .toBe('1001943-21.2025.4.01.3904');
  });

  it('formata data ISO para DD/MM/AAAA', () => {
    expect(service.formatarData('2025-03-15T10:30:00')).toBe('15/03/2025');
    expect(service.formatarData(undefined)).toBe('—');
  });

  describe('janela de contingência (17h–8h em Belém, UTC-3)', () => {
    // Instantes em UTC; Belém = UTC-3 o ano inteiro.
    it('está fora do horário às 18h e às 07h59', () => {
      expect(service.foraDoHorarioComercial(new Date('2026-09-03T21:00:00Z'))).toBeTrue(); // 18:00
      expect(service.foraDoHorarioComercial(new Date('2026-09-03T20:00:00Z'))).toBeTrue(); // 17:00 (inicio)
      expect(service.foraDoHorarioComercial(new Date('2026-09-04T03:30:00Z'))).toBeTrue(); // 00:30
      expect(service.foraDoHorarioComercial(new Date('2026-09-04T10:59:00Z'))).toBeTrue(); // 07:59
    });

    it('está no horário comercial às 08h e às 16h59', () => {
      expect(service.foraDoHorarioComercial(new Date('2026-09-04T11:00:00Z'))).toBeFalse(); // 08:00 (fim)
      expect(service.foraDoHorarioComercial(new Date('2026-09-04T15:00:00Z'))).toBeFalse(); // 12:00
      expect(service.foraDoHorarioComercial(new Date('2026-09-04T19:59:00Z'))).toBeFalse(); // 16:59
    });
  });

  describe('fallback para a contingência', () => {
    const URL_CONTINGENCIA = 'https://exemplo.lambda-url.us-east-2.on.aws';
    const NUMERO = '00008323520184013202';
    let http: HttpTestingController;
    let urlOriginal: string;

    beforeEach(() => {
      http = TestBed.inject(HttpTestingController);
      urlOriginal = environment.contingencia.url;
      environment.contingencia.url = URL_CONTINGENCIA;
    });

    afterEach(() => {
      environment.contingencia.url = urlOriginal;
      http.verify();
    });

    it('fora da janela, tenta o backend e cai na contingência se ele não responder', () => {
      spyOn(service, 'foraDoHorarioComercial').and.returnValue(false);
      let resultado: unknown;
      service.consultarProcesso(NUMERO).subscribe(r => (resultado = r));

      // EC2 fora: erro de rede (status 0)
      http.expectOne(`${environment.apiUrl}/cnj/processo/${NUMERO}`)
        .error(new ProgressEvent('error'), { status: 0 });

      http.expectOne(`${URL_CONTINGENCIA}/cnj/processo/${NUMERO}`).flush([{ numeroProcesso: NUMERO }]);
      expect(resultado).toEqual([{ numeroProcesso: NUMERO }]);
    });

    it('fora da janela, erro de negócio do backend (400) NÃO aciona a contingência', () => {
      spyOn(service, 'foraDoHorarioComercial').and.returnValue(false);
      let erro: unknown;
      service.consultarProcesso(NUMERO).subscribe({ error: e => (erro = e) });

      http.expectOne(`${environment.apiUrl}/cnj/processo/${NUMERO}`)
        .flush({ erro: 'invalido' }, { status: 400, statusText: 'Bad Request' });

      http.expectNone(`${URL_CONTINGENCIA}/cnj/processo/${NUMERO}`);
      expect(erro).toBeTruthy();
    });

    it('dentro da janela, vai direto à contingência sem tentar o backend', () => {
      spyOn(service, 'foraDoHorarioComercial').and.returnValue(true);
      service.consultarProcesso(NUMERO).subscribe();

      http.expectNone(`${environment.apiUrl}/cnj/processo/${NUMERO}`);
      http.expectOne(`${URL_CONTINGENCIA}/cnj/processo/${NUMERO}`).flush([]);
    });

    it('sem contingência configurada, usa só o backend', () => {
      environment.contingencia.url = '';
      spyOn(service, 'foraDoHorarioComercial').and.returnValue(true);
      service.consultarProcesso(NUMERO).subscribe();

      http.expectOne(`${environment.apiUrl}/cnj/processo/${NUMERO}`).flush([]);
    });
  });
});
