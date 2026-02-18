import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ResizeService {
  private readonly _videoWidth = new BehaviorSubject<number>(960);
  readonly videoWidth$ = this._videoWidth.asObservable();

  get videoWidth(): number {
    return this._videoWidth.value;
  }

  get videoHeight(): number {
    return (this._videoWidth.value * 9) / 16;
  }

  private _customWidth: number | null = null;

  get customWidth(): number | null {
    return this._customWidth;
  }

  updateWidth(newWidth: number): void {
    this._videoWidth.next(Math.max(200, newWidth));
  }

  saveCustomWidth(): void {
    this._customWidth = this._videoWidth.value;
  }
}
