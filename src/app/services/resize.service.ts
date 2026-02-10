import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ResizeService {
  // Using a signal for high-performance reactivity
  videoWidth = signal<number>(640);

  calculateHeight(width: number): number {
    return (width * 9) / 16;
  }

  updateWidth(newWidth: number): void {
    if (newWidth > 200) {
      // Minimum width boundary
      this.videoWidth.set(newWidth);
    }
  }
}
