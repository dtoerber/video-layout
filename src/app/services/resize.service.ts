import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResizeService {
  readonly videoWidth = signal<number>(640);
  readonly videoHeight = computed(() => (this.videoWidth() * 9) / 16);

  updateWidth(newWidth: number): void {
    this.videoWidth.set(Math.max(200, newWidth));
  }
}
