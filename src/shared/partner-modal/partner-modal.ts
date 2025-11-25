import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    ReactiveFormsModule,
    MatSnackBarModule
  ],
  templateUrl: './partner-modal.html',
  styleUrls: ['./partner-modal.scss']
})
export class PartnerModalComponent {
  partnerForm: FormGroup;
isSuccess: any;

  constructor(
    private dialogRef: MatDialogRef<PartnerModalComponent>,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.partnerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(14)]],
      profile: ['', Validators.required],
      message: ['']
    });
  }

  // Lógica da Máscara de Telefone: (XX) XXXXX-XXXX
  formatPhone(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove não-números

    // Limita tamanho
    if (value.length > 11) value = value.substring(0, 11);

    // Aplica a formatação
    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d*)/, '($1');
    }

    // Atualiza o valor sem disparar novo evento de input (loop prevention)
    this.partnerForm.get('phone')?.setValue(value, { emitEvent: false });
  }

  submitForm() {
    if (this.partnerForm.valid) {
      // 1. Simula envio (aqui entra sua lógica de backend)
      console.log(this.partnerForm.value);

      // 2. Fecha o modal
      this.close();

      // 3. Exibe o aviso discreto
      this.showSuccessToast();
    } else {
      // Se inválido, marca campos em vermelho
      this.partnerForm.markAllAsTouched();
    }
  }

  showSuccessToast() {
    this.snackBar.open('Proposta enviada com sucesso! Entraremos em contato.', 'OK', {
      duration: 5000, // 5 segundos
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['gold-snackbar'] // Classe definida no styles.scss global
    });
  }

  close() {
    this.dialogRef.close();
  }
}