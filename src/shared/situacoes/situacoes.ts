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
      pergunta: 'Está doente e sem condições de trabalhar há meses?',
      direito:
        'Quem contribui para o INSS e fica incapacitado pode ter direito ao auxílio-doença ' +
        '(auxílio por incapacidade temporária) e, quando a incapacidade é permanente, à aposentadoria por incapacidade.',
    },
    {
      area: 'previdenciario',
      icone: 'block',
      pergunta: 'O INSS negou ou cortou o seu benefício?',
      direito:
        'A negativa administrativa não encerra o assunto: a decisão pode ser revista por recurso ' +
        'ou levada à Justiça, com a análise das provas médicas e do tempo de contribuição.',
    },
    {
      area: 'previdenciario',
      icone: 'calculate',
      pergunta: 'Contribuiu a vida toda e a aposentadoria veio menor do que esperava?',
      direito:
        'Períodos não computados e erros de cálculo são frequentes. Uma análise do seu histórico ' +
        'contributivo pode indicar se cabe revisão do valor.',
    },
    {
      area: 'previdenciario',
      icone: 'volunteer_activism',
      pergunta: 'Cuida de um idoso ou de uma pessoa com deficiência sem renda suficiente?',
      direito:
        'O BPC/LOAS garante um salário mínimo mensal a quem preenche os requisitos de renda familiar, ' +
        'mesmo sem nunca ter contribuído para o INSS.',
    },
    {
      area: 'previdenciario',
      icone: 'family_restroom',
      pergunta: 'Perdeu quem sustentava a casa?',
      direito:
        'Cônjuge, filhos e outros dependentes de quem era segurado do INSS podem ter direito à pensão por morte.',
    },
    {
      area: 'trabalhista',
      icone: 'work_off',
      pergunta: 'Foi demitido e não recebeu tudo o que devia?',
      direito:
        'Aviso prévio, férias proporcionais, 13º, saldo de salário, FGTS e a multa de 40% fazem parte ' +
        'da rescisão. Vale conferir o acerto antes de assinar.',
    },
    {
      area: 'trabalhista',
      icone: 'schedule',
      pergunta: 'Faz horas extras que não aparecem no pagamento?',
      direito:
        'Jornada além da contratada deve ser paga com adicional. Anotações próprias, mensagens e ' +
        'testemunhas ajudam a comprovar.',
    },
    {
      area: 'trabalhista',
      icone: 'personal_injury',
      pergunta: 'Sofreu um acidente ou adoeceu por causa do trabalho?',
      direito:
        'Acidente e doença ocupacional geram direitos como estabilidade após o afastamento e, ' +
        'conforme o caso, reparação pelos danos.',
    },
    {
      area: 'trabalhista',
      icone: 'badge',
      pergunta: 'Trabalhou sem carteira assinada?',
      direito:
        'O vínculo de emprego pode ser reconhecido na Justiça do Trabalho, com os direitos de todo o período.',
    },
    {
      area: 'consumidor',
      icone: 'report',
      pergunta: 'Seu nome foi negativado por uma dívida que não reconhece?',
      direito:
        'A negativação indevida deve ser retirada e pode gerar indenização por danos morais.',
    },
    {
      area: 'consumidor',
      icone: 'medical_services',
      pergunta: 'O plano de saúde negou um procedimento ou a operadora cobra o que você não contratou?',
      direito:
        'Negativas de cobertura e cobranças abusivas podem ser contestadas com base no Código de Defesa do Consumidor.',
    },
  ];

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
