import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { SituacoesComponent } from './situacoes';
import { environment } from '../../environments/environment';

describe('SituacoesComponent', () => {
  let fixture: ComponentFixture<SituacoesComponent>;
  let component: SituacoesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SituacoesComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(SituacoesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renderiza um card por situação, com CTA para o WhatsApp', () => {
    const total = component.situacoes.length;
    const host = fixture.nativeElement as HTMLElement;
    const cards = host.querySelectorAll('.situacao-card');
    const ctas = host.querySelectorAll<HTMLAnchorElement>('.situacao-card a.cta');

    expect(cards.length).toBe(total);
    expect(ctas.length).toBe(total);
    ctas.forEach(a => expect(a.href).toMatch(/^https:\/\/wa\.me\/\d+\?text=/));
  });

  it('roteia trabalhista para o número trabalhista e o restante para o geral', () => {
    const porArea = (area: string) => component.situacoes.find(s => s.area === area)!;

    expect(component.linkWhatsapp(porArea('trabalhista')))
      .toContain(`wa.me/${environment.whatsapp.trabalhista}?`);
    expect(component.linkWhatsapp(porArea('previdenciario')))
      .toContain(`wa.me/${environment.whatsapp.geral}?`);
    expect(component.linkWhatsapp(porArea('consumidor')))
      .toContain(`wa.me/${environment.whatsapp.geral}?`);
  });

  it('leva a situação escolhida na mensagem do WhatsApp', () => {
    const s = component.situacoes[0];
    const url = new URL(component.linkWhatsapp(s));
    expect(url.searchParams.get('text')).toContain(s.pergunta);
  });
});
