import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../environments/environment';

type Area = 'previdenciario' | 'trabalhista' | 'consumidor';

/** Uma dor concreta do cliente e o direito que pode estar associado a ela. */
export interface Situacao {
  /** Área responsável — não é exibida; define o número de WhatsApp do CTA. */
  area: Area;
  /** Pergunta na primeira pessoa do leitor — é o título do card. */
  pergunta: string;
  /** Informação sobre o direito, em tom informativo (sem promessa de resultado). */
  direito: string;
  icone: string;
}

/**
 * Seção orientada à dor do cliente: em vez de apresentar o escritório, a
 * página apresenta situações em que o visitante se reconhece e informa o
 * direito relacionado, numa grade única sem divisão por área — a área só
 * define para qual WhatsApp o card leva.
 *
 * Limite editorial: 6 cards, pergunta com até 8 palavras e direito em uma
 * frase. Situações além disso entram em `outrasSituacoes`, não em novos cards.
 *
 * Redação informativa por exigência do Provimento 205/2021 da OAB
 * (sem promessa de resultado, valores ou apelo de urgência).
 */
@Component({
  selector: 'app-situacoes',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './situacoes.html',
  styleUrl: './situacoes.scss',
})
export class SituacoesComponent {
  readonly situacoes: Situacao[] = [
    {
      area: 'previdenciario',
      icone: 'healing',
      pergunta: 'Está doente e não consegue trabalhar?',
      direito: 'Quem contribui para o INSS pode ter direito ao auxílio por incapacidade.',
    },
    {
      area: 'previdenciario',
      icone: 'block',
      pergunta: 'O INSS negou ou cortou seu benefício?',
      direito: 'A decisão pode ser revista por recurso ou na Justiça.',
    },
    {
      area: 'previdenciario',
      icone: 'calculate',
      pergunta: 'A aposentadoria veio menor do que esperava?',
      direito: 'Erros de cálculo são comuns. Uma revisão pode corrigir o valor.',
    },
    {
      area: 'trabalhista',
      icone: 'work_off',
      pergunta: 'Foi demitido e não recebeu tudo?',
      direito: 'Férias, 13º, FGTS e multa fazem parte da rescisão. Vale conferir antes de assinar.',
    },
    {
      area: 'trabalhista',
      icone: 'badge',
      pergunta: 'Trabalhou sem carteira assinada?',
      direito: 'O vínculo pode ser reconhecido na Justiça, com os direitos de todo o período.',
    },
    {
      area: 'consumidor',
      icone: 'report',
      pergunta: 'Seu nome foi negativado por engano?',
      direito: 'A negativação indevida deve ser retirada e pode gerar indenização.',
    },
  ];

  /**
   * Situações que saíram dos seis cards para não poluir a seção; aparecem no
   * card de fechamento (largura total), com CTA para o atendimento geral.
   */
  readonly outrasSituacoes =
    'pensão por morte, BPC/LOAS, horas extras, acidente de trabalho e plano de saúde';

  /** WhatsApp do atendimento geral para quem não se encontrou nos cards. */
  get linkWhatsappGeral(): string {
    const mensagem = 'Olá! Vim pelo site da Cardoso & Maués e gostaria de uma orientação sobre a minha situação.';
    return `https://wa.me/${environment.whatsapp.geral}?text=${encodeURIComponent(mensagem)}`;
  }

  /**
   * WhatsApp da equipe responsável pela área, com a situação já na mensagem.
   * Trabalhista tem número próprio; as demais áreas vão ao atendimento geral.
   */
  linkWhatsapp(situacao: Situacao): string {
    const numero = situacao.area === 'trabalhista' ? environment.whatsapp.trabalhista : environment.whatsapp.geral;
    const mensagem =
      `Olá! Vim pelo site da Cardoso & Maués e me identifiquei com a situação: "${situacao.pergunta}" ` +
      'Gostaria de uma orientação.';
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }
}
