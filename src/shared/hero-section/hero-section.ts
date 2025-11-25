import { Component} from '@angular/core';
import { CommonModule} from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero-section.html',
  styleUrls: ['./hero-section.scss']
})
export class HeroSectionComponent {

  // Variável para controlar o fade do poster
  isVideoLoaded = false;

  // Chamado automaticamente quando o vídeo tem dados suficientes para tocar
  onVideoLoad() {
    this.isVideoLoaded = true;
  }
}
