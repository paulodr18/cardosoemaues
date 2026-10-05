/**
 * Ambiente de PRODUÇÃO (aplicado via fileReplacements no build).
 */
export const environment = {
  production: true,

  /**
   * Base URL do backend push em produção (AWS).
   * EC2 com Elastic IP, porta 8080.
   *
   * ATENÇÃO (mixed content): por ser HTTP, só funciona se o site também
   * for servido em HTTP. Se o site for publicado em HTTPS, o navegador
   * bloqueia estas chamadas — nesse caso é preciso colocar TLS na frente
   * do backend (ex.: subdomínio api.cardosoemaues.com.br atrás de
   * ALB/CloudFront/nginx com certificado) e trocar esta URL.
   */
  apiUrl: 'http://3.21.252.227:8080',

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
