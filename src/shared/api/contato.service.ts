import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { environment } from '../../environments/environment';
import { Contato, MensagemResposta } from './api.models';

/**
 * Envio de mensagens de contato ao backend push (POST /contato).
 * Usado pelo chatbot para captura de lead quando o visitante
 * prefere deixar uma mensagem para o escritório.
 */
@Injectable({ providedIn: 'root' })
export class ContatoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  private static readonly TIMEOUT_MS = 20_000;

  enviarContato(contato: Contato): Observable<MensagemResposta> {
    return this.http
      .post<MensagemResposta>(`${this.baseUrl}/contato`, contato)
      .pipe(timeout(ContatoService.TIMEOUT_MS));
  }
}
