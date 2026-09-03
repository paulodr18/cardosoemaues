import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-about',
  imports: [MatIcon],
  templateUrl: './about.html',
  styleUrl: './about.scss'
})
export class About {
  readonly whatsapp = environment.whatsapp;

  /** Mesmos números do chatbot: geral (Previdenciário) e trabalhista. */
  linkWhatsapp(numero: string): string {
    const mensagem = 'Olá! Vim pelo site da Cardoso & Maués e gostaria de agendar uma consulta.';
    return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
  }
}
