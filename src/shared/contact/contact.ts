import { Component } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  imports: [MatIcon],
  templateUrl: './contact.html',
  styleUrl: './contact.scss'
})
export class Contact {
  /** Mesmos números do chatbot e da seção Sobre. */
  readonly whatsapp = environment.whatsapp;

  /** 5591992962708 -> (91) 99296-2708 */
  formatarTelefone(numero: string): string {
    const m = /^55(\d{2})(\d{4,5})(\d{4})$/.exec(numero);
    return m ? `(${m[1]}) ${m[2]}-${m[3]}` : numero;
  }

  linkWhatsapp(numero: string): string {
    return `https://wa.me/${numero}`;
  }
}
