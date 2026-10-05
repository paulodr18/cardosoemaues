import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.scss']
})
export class HeroSectionComponent {
  /**
   * Liga quando a imagem de fundo não carrega (arquivos em /hero ainda não
   * gerados, ou falha de rede): o hero passa a usar o gradiente do SCSS.
   */
  readonly imagemIndisponivel = signal(false);
}
