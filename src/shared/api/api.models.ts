/**
 * Modelos espelhando os DTOs do backend push
 * (br.com.judicial.automacao.push.entity.dto).
 */

/** Retorno de GET /cnj/processo/{numeroProcesso} — CnjProcessoDTO. */
export interface CnjProcesso {
  numeroProcesso?: string;
  classe?: string;
  sistema?: string;
  formato?: string;
  tribunal?: string;
  dataAjuizamento?: string;
  grau?: string;
  orgaoJulgador?: string;
  ultimaMovimentacao?: MovimentoCnj;
  ultimaMovimentacaoBanco?: MovimentacaoBanco;
  movimentacaoSincronizada?: boolean;
  assuntos?: Assunto[];
}

export interface MovimentoCnj {
  nome?: string;
  dataHora?: string;
  codigo?: number;
  descricaoSignificado?: string;
}

export interface MovimentacaoBanco {
  id?: number;
  descricao?: string;
  dataHora?: string;
  descricaoSignificado?: string;
}

export interface Assunto {
  codigo?: number;
  nome?: string;
}

/** Payload de POST /contato — ContatoDTO. */
export interface Contato {
  nome: string;
  email: string;
  telefone?: string;
  mensagem: string;
}

/** Resposta de sucesso dos endpoints de contato. */
export interface MensagemResposta {
  mensagem?: string;
  erro?: string;
  campos?: Record<string, string>;
}
