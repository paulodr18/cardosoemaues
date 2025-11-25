import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-partner-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    FormsModule
  ],
  template: `
    <div class="modal-container">
      <!-- Cabeçalho do Modal -->
      <div class="modal-header">
        <h2>Parceria <span class="ampersand">&</span> <span class="gold-text">Cooperação</span></h2>
        <p>Una-se à nossa rede de excelência jurídica.</p>
        <button mat-icon-button class="close-btn" (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Formulário -->
      <form class="partner-form">
        <div class="row">
          <mat-form-field appearance="outline" class="full-width custom-field">
            <mat-label>Nome Completo / Escritório</mat-label>
            <input matInput placeholder="Ex: Dr. João Silva" required>
          </mat-form-field>
        </div>

        <div class="row double-col">
          <mat-form-field appearance="outline" class="custom-field">
            <mat-label>E-mail Corporativo</mat-label>
            <input matInput type="email" required>
          </mat-form-field>

          <mat-form-field appearance="outline" class="custom-field">
            <mat-label>WhatsApp / Telefone</mat-label>
            <input matInput type="tel" required>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="full-width custom-field">
            <mat-label>Perfil de Parceria</mat-label>
            <mat-select required>
              <mat-option value="correspondente">Advogado(a) Correspondente</mat-option>
              <mat-option value="contador">Contabilidade / Perícia</mat-option>
              <mat-option value="consultoria">Consultoria Empresarial</mat-option>
              <mat-option value="outro">Outro</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field appearance="outline" class="full-width custom-field">
            <mat-label>Mensagem ou Proposta</mat-label>
            <textarea matInput rows="4" placeholder="Descreva brevemente sua intenção..."></textarea>
          </mat-form-field>
        </div>

        <!-- Ações -->
        <div class="modal-actions">
          <button mat-button (click)="close()" type="button" class="btn-cancel">Cancelar</button>
          <button mat-raised-button class="btn-submit">Enviar Proposta</button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    /* Variáveis */
    $gold: #c5a059;
    $dark: #0f172a;
    $font-serif: 'Cinzel', serif;
    $font-sans: 'Montserrat', sans-serif;

    .modal-container {
      padding: 1.0rem;
      color: $dark;
      font-family: $font-sans;
      background: #fff;
      position: relative;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 2rem;
      position: relative;

      h2 {
        font-family: $font-serif;
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0;
        color: $dark;
        text-transform: uppercase;
        letter-spacing: 1px;

        .ampersand { color: $gold; font-weight: 400; }
        .gold-text { color: $gold; font-style: italic; font-family: 'Playfair Display', serif; text-transform: capitalize; }
      }

      p {
        font-size: 0.9rem;
        color: rgba(15, 23, 42, 0.6);
        margin-top: 0.5rem;
      }

      .close-btn {
        position: absolute;
        top: -20px;
        right: -10px;
        color: #999;
      }
    }

    /* Estilização dos Campos do Material */
    .full-width { width: 100%; }
    .row { margin-bottom: 0.5rem; }
    .double-col { display: flex; gap: 1rem; }

    /* Customizando a cor da borda do input para dourado */
    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__leading,
    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__notch,
    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled) .mdc-notched-outline__trailing {
      border-color: rgba(0, 0, 0, 0.2);
    }

    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__leading,
    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__notch,
    ::ng-deep .custom-field .mdc-text-field--outlined:not(.mdc-text-field--disabled).mdc-text-field--focused .mdc-notched-outline__trailing {
      border-color: $gold !important;
      border-width: 2px;
    }

    ::ng-deep .custom-field .mdc-floating-label--float-above {
      color: $gold !important;
    }

    /* Botões */
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;

      .btn-cancel {
        color: #666;
        font-family: $font-sans;
        text-transform: uppercase;
      }

      .btn-submit {
        background-color: $gold;
        color: #fff;
        font-family: $font-sans;
        font-weight: 600;
        text-transform: uppercase;
        padding: 0.5rem 2rem;
        letter-spacing: 1px;
        transition: 0.3s;

        &:hover { background-color: darken($gold, 10%); }
      }
    }

    @media (max-width: 600px) {
      .double-col { flex-direction: column; gap: 0; }
    }
  `]
})
export class PartnerModalComponent {
  constructor(private dialogRef: MatDialogRef<PartnerModalComponent>) {}
  close() { this.dialogRef.close(); }
}
