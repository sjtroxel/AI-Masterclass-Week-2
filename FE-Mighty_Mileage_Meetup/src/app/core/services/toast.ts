import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private nextId = 0;
  private toastsSignal = signal<Toast[]>([]);

  toasts = this.toastsSignal.asReadonly();

  success(message: string): void {
    this.add(message, 'success');
  }

  error(message: string): void {
    this.add(message, 'error');
  }

  dismiss(id: number): void {
    this.toastsSignal.update((ts) => ts.filter((t) => t.id !== id));
  }

  private add(message: string, type: 'success' | 'error'): void {
    const id = this.nextId++;
    this.toastsSignal.update((ts) => [...ts, { id, message, type }]);
    setTimeout(() => this.dismiss(id), 4000);
  }
}
