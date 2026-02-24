import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PosMachine, ConfigPayload } from '../../core/models/pos-machine.model';

@Component({
  selector: 'app-config-modal',
  templateUrl: './config-modal.component.html',
  styleUrls: ['./config-modal.component.scss'],
})
export class ConfigModalComponent implements OnInit {
  @Input() machine!: PosMachine;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ConfigPayload>();

  configForm!: FormGroup;

  networks = ['Visa / Mastercard', 'ZimSwitch', 'All Networks'];
  currencies = ['USD', 'ZIG', 'Multi-currency'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.configForm = this.fb.group({
      mid: [
        this.machine.mid || this.generateId('MID'),
        [Validators.required, Validators.minLength(3)],
      ],
      tid: [
        this.machine.tid || this.generateId('TID'),
        [Validators.required, Validators.minLength(3)],
      ],
      account: [this.machine.account || '', Validators.required],
      network: [this.machine.network || 'All Networks', Validators.required],
      currency: [this.machine.currency || 'USD', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      return;
    }
    this.saved.emit(this.configForm.value as ConfigPayload);
  }

  close(): void {
    this.closed.emit();
  }

  isInvalid(field: string): boolean {
    const ctrl = this.configForm.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  private generateId(prefix: string): string {
    return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
  }
}
