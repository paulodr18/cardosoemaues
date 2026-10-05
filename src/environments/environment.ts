/**
 * Ambiente de DESENVOLVIMENTO (padrão do `ng serve`).
 * Em produção este arquivo é substituído por environment.prod.ts
 * (ver fileReplacements no angular.json).
 */
export const environment = {
  production: false,

  /** Base URL do backend push (Spring Boot) rodando localmente. */
  apiUrl: 'http://localhost:8080',

  /**
   * Números de WhatsApp do escritório para handoff do chatbot, no formato
   * internacional sem símbolos (55 + DDD + celular com 9 dígitos).
   * O chatbot escolhe o número pelo contexto da conversa — ver
   * ChatboxComponent.montarUrlWhatsapp().
   */
  whatsapp: {
    /** Atendimento geral: todos os processos que não são trabalhistas. */
    geral: '5591992962708',
    /** Processos trabalhistas (Justiça do Trabalho). */
    trabalhista: '5591987345606',
  },

  /**
   * Contingência da consulta processual para o período em que a EC2 do
   * backend fica desligada: Function URL da Lambda em
   * push/lambda-contingencia (mesmo contrato GET /cnj/processo/{numero}).
   * Usada direto na janela abaixo e como fallback se o backend não responder.
   * Vazio = desabilitada. Preencher após o deploy.sh (sem barra final).
   */
  contingencia: {
    url: '',
    /** Janela em horário de Belém (America/Belem): de inicioHora até fimHora. */
    inicioHora: 17,
    fimHora: 8,
  },
};
