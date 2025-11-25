import { Component, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  time: string; // Adicionamos o horário
}

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatInputModule, MatFormFieldModule, FormsModule, MatIconModule],
  templateUrl: './chatbox.html',
  styleUrl: './chatbox.scss'
})
export class ChatboxComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  isOpen = false;
  newMessage = '';
  messages: Message[] = [];

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    // Boas-vindas na primeira vez
    if (this.isOpen && this.messages.length === 0) {
      setTimeout(() => {
        this.addMessage('Olá! Sou a assistente virtual da <b>Cardoso & Maués</b>.<br>Como posso ajudar você hoje?', 'bot');
      }, 400);
    }
  }

  sendMessage() {
    if (!this.newMessage.trim()) return;

    const userMsg = this.newMessage.trim();
    this.addMessage(userMsg, 'user');
    this.newMessage = '';

    // Simula resposta
    setTimeout(() => {
      const botResponse = this.getBotResponse(userMsg);
      this.addMessage(botResponse, 'bot');
    }, 1000);
  }

  private addMessage(text: string, sender: 'user' | 'bot') {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    this.messages.push({
      text: text,
      sender: sender,
      time: timeStr
    });
  }

  private scrollToBottom() {
    try {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    } catch {}
  }

  private getBotResponse(userMsg: string): string {
    const lower = userMsg.toLowerCase();

    if (lower.includes('processo')) {
      return 'Para consultar seu processo, preciso que me informe o número (Ex: CNJ). Por segurança, posso te transferir para o WhatsApp?';
    }
    if (lower.includes('preço') || lower.includes('valor')) {
      return 'Os honorários dependem da complexidade do caso. Gostaria de agendar uma avaliação?';
    }

    return 'Entendi. Para um atendimento personalizado, recomendo falar com nossos advogados no WhatsApp.';
  }
}
