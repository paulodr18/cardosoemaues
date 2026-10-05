/**
 * Ambiente de TESTE contra o backend push hospedado na EC2 (AWS).
 * Aplicado via `ng serve --configuration ec2` (fileReplacements no angular.json).
 *
 * Serve para validar o frontend rodando localmente (http://localhost:4200)
 * contra o backend real, sem alterar o environment.ts de desenvolvimento.
 *
 * O backend libera CORS para http://localhost:4200
 * (ver CorsConfig / cors.allowed-origins no projeto push).
 */
export const environment = {
  production: false,

  /**
   * Base URL do backend push na EC2, porta 8080.
   * Equivalente ao DNS público ec2-3-21-252-227.us-east-2.compute.amazonaws.com.
   * Usa-se o IP para bater com a origem já liberada no CORS do backend.
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
