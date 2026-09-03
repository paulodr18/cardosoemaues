import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { CnjProcesso } from './api.models';

/**
 * Consulta de processos no backend push (GET /cnj/processo/{numero}),
 * que por sua vez consulta a API pública DataJud do CNJ e enriquece
 * com a última movimentação registrada no banco do escritório.
 */
@Injectable({ providedIn: 'root' })
export class ProcessoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** A consulta ao CNJ pode ser lenta; margem generosa antes de desistir. */
  private static readonly TIMEOUT_MS = 30_000;

  /**
   * Com contingência disponível, o backend recebe menos tempo: uma EC2
   * desligada não recusa a conexão, apenas não responde — esperar 30 s
   * estouraria o timeout do usuário antes de tentarmos o fallback.
   */
  private static readonly TIMEOUT_COM_FALLBACK_MS = 10_000;

  /**
   * Consulta um processo pelo número CNJ.
   *
   * Dentro da janela em que o backend fica desligado vai direto à
   * contingência; fora dela tenta o backend e, se ele não responder
   * (rede/timeout), recorre à contingência. Sem contingência configurada,
   * comporta-se como antes.
   * @param numeroProcesso número já normalizado (20 dígitos, sem máscara)
   */
  consultarProcesso(numeroProcesso: string): Observable<CnjProcesso[]> {
    const contingencia = environment.contingencia?.url;
    if (!contingencia) {
      return this.consultarEm(this.baseUrl, numeroProcesso, ProcessoService.TIMEOUT_MS);
    }
    if (this.foraDoHorarioComercial()) {
      return this.consultarEm(contingencia, numeroProcesso, ProcessoService.TIMEOUT_MS);
    }
    return this.consultarEm(this.baseUrl, numeroProcesso, ProcessoService.TIMEOUT_COM_FALLBACK_MS).pipe(
      catchError((err) =>
        this.backendIndisponivel(err)
          ? this.consultarEm(contingencia, numeroProcesso, ProcessoService.TIMEOUT_MS)
          : throwError(() => err)
      )
    );
  }

  /**
   * Indica se estamos na janela em que a EC2 do backend fica desligada.
   * Avalia a hora em Belém (America/Belem, UTC-3 sem horário de verão),
   * independentemente do fuso do visitante. Suporta janela que cruza a
   * meia-noite (ex.: 17h → 8h).
   */
  foraDoHorarioComercial(agora: Date = new Date()): boolean {
    const { inicioHora, fimHora } = environment.contingencia;
    const hora = Number(
      new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Belem', hour: 'numeric', hourCycle: 'h23' })
        .formatToParts(agora)
        .find(parte => parte.type === 'hour')?.value
    );
    return inicioHora > fimHora
      ? hora >= inicioHora || hora < fimHora
      : hora >= inicioHora && hora < fimHora;
  }

  private consultarEm(base: string, numeroProcesso: string, timeoutMs: number): Observable<CnjProcesso[]> {
    return this.http
      .get<CnjProcesso[]>(`${base}/cnj/processo/${numeroProcesso}`)
      .pipe(timeout(timeoutMs));
  }

  /** Backend fora do ar: falha de rede (status 0, inclui CORS/conexão) ou timeout. */
  private backendIndisponivel(err: unknown): boolean {
    return (err instanceof HttpErrorResponse && err.status === 0) || err instanceof TimeoutError;
  }

  /**
   * Extrai um número de processo CNJ de um texto livre.
   * Aceita o formato com máscara (NNNNNNN-NN.NNNN.N.NN.NNNN), com
   * separadores parciais/espaços, ou os 20 dígitos puros.
   * @returns os 20 dígitos normalizados, ou null se não encontrar
   */
  extrairNumeroProcesso(texto: string): string | null {
    // 1) Padrão com máscara (tolerante a separadores ausentes)
    const mascarado = texto.match(/\d{7}\s*-?\s*\d{2}\s*\.?\s*\d{4}\s*\.?\s*\d\s*\.?\s*\d{2}\s*\.?\s*\d{4}/);
    if (mascarado) {
      const digitos = mascarado[0].replace(/\D/g, '');
      if (digitos.length === 20) return digitos;
    }
    // 2) Mensagem cujos dígitos somam exatamente 20 (número colado com ruído)
    const somenteDigitos = texto.replace(/\D/g, '');
    if (somenteDigitos.length === 20) return somenteDigitos;

    return null;
  }

  /**
   * Indica se o processo é da Justiça do Trabalho.
   *
   * No padrão CNJ (Res. 65/2008) NNNNNNN-DD.AAAA.J.TR.OOOO, o dígito J
   * identifica o segmento da Justiça; 5 = Justiça do Trabalho (TRTs/TST).
   * @param numero os 20 dígitos normalizados
   */
  ehTrabalhista(numero: string): boolean {
    return /^\d{20}$/.test(numero) && numero.charAt(13) === '5';
  }

  /**
   * Formata 20 dígitos no padrão CNJ NNNNNNN-DD.AAAA.J.TR.OOOO
   * (mesma regra do backend).
   */
  formatarNumeroProcesso(numero: string): string {
    if (!/^\d{20}$/.test(numero)) return numero;
    return `${numero.slice(0, 7)}-${numero.slice(7, 9)}.${numero.slice(9, 13)}.${numero.slice(13, 14)}.${numero.slice(14, 16)}.${numero.slice(16, 20)}`;
  }

  /** Formata data ISO do backend para DD/MM/AAAA (com hora quando houver). */
  formatarData(iso: string | undefined | null, comHora = false): string {
    if (!iso) return '—';
    const data = new Date(iso);
    if (isNaN(data.getTime())) return iso;
    const dd = String(data.getDate()).padStart(2, '0');
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    const aaaa = data.getFullYear();
    if (!comHora) return `${dd}/${mm}/${aaaa}`;
    const hh = String(data.getHours()).padStart(2, '0');
    const min = String(data.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${aaaa} às ${hh}:${min}`;
  }
}
