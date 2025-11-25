import { Component, OnInit } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, NavigationEnd, Event } from '@angular/router'; // 1. Importar Router
import { filter } from 'rxjs/operators';
import { PartnerModalComponent } from '../partner-modal/partner-modal';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar implements OnInit {
  menuItems = [
    { label: 'Início', link: '/' }, // Dica: use '/' para home se estiver usando roteamento
    { label: 'Sobre', link: '#sobre' },
    { label: 'Serviços', link: '#servicos' },
    { label: 'Contato', link: '#contato' },
  ];

  isMobileMenuOpen = false;

  // Variável para controlar se a navbar deve ser azul
  isBlueTheme = false;

  // Lista de rotas onde a navbar deve ser AZUL SÓLIDA
  // Adicione aqui as URLs dos seus componentes de fundo claro
  blueThemeRoutes = ['/login', '/cadastro', '/parceiro', '/dashboard'];

  constructor(
    private dialog: MatDialog,
    private router: Router // 2. Injetar Router
  ) {}

  ngOnInit() {
    // 3. Verificar a rota atual ao carregar
    this.checkRoute(this.router.url);

    // 4. Verificar a rota sempre que o usuário navegar
    this.router.events.pipe(
      filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkRoute(event.url);
    });
  }

  // Função que define se aplica o tema azul
  checkRoute(url: string) {
    // Verifica se a URL atual está na lista ou começa com algum dos caminhos
    // Ex: '/login' tornará true.
    this.isBlueTheme = this.blueThemeRoutes.some(route => url.includes(route));
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  openPartnerModal() {
    if (this.isMobileMenuOpen) this.toggleMobileMenu();

    this.dialog.open(PartnerModalComponent, {
      width: '600px',
      maxWidth: '95vw',
      autoFocus: false
    });
  }
}
