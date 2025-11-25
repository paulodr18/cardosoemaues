import { Component, signal } from '@angular/core';
import { ChatboxComponent } from "../shared/chatbox/chatbox";
import { Navbar } from "../shared/navbar/navbar";
import { About } from "../shared/about/about";
import { Service } from "../shared/service/service";
import { Footer } from "../shared/footer/footer";
import { Contact } from "../shared/contact/contact";
import { HeroSectionComponent } from "../shared/hero-section/hero-section";
import { Parceria } from "../shared/parceria/parceria";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ChatboxComponent,
    Navbar,
    About,
    Service,
    Footer,
    Contact,
    HeroSectionComponent,
    Parceria
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']    // <── CORRIGIDO
})
export class App {
  protected readonly title = signal('landing-page');
}
