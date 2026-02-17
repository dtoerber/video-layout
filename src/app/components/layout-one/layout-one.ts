import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  NgZone,
  Renderer2,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ResizeService } from './resize.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-layout-one',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule, DecimalPipe],
  templateUrl: './layout-one.html',
  styleUrls: ['./layout-one.scss', './grid.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutOne {
  protected readonly resizeService = inject(ResizeService);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);

  private readonly videoSection = viewChild.required<ElementRef<HTMLElement>>('videoSection');

  protected readonly renderedWidth = signal(0);
  protected readonly renderedHeight = signal(0);

  private readonly resizeObserver = new ResizeObserver(([entry]) => {
    this.ngZone.run(() => {
      this.renderedWidth.set(Math.round(entry.contentRect.width));
      this.renderedHeight.set(Math.round(entry.contentRect.height));
    });
  });

  constructor() {
    afterNextRender(() => {
      this.resizeObserver.observe(this.videoSection().nativeElement);
    });
    this.destroyRef.onDestroy(() => this.resizeObserver.disconnect());
  }

  private get maxVideoWidth(): number {
    const spaceForColumns = window.innerWidth - 600;
    const heightConstraint = ((window.innerHeight - 38 - 200) * 16) / 9;
    return Math.min(spaceForColumns, heightConstraint);
  }

  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  startResizing(event: MouseEvent): void {
    event.preventDefault();

    const videoElement = (event.target as HTMLElement).closest('.video');
    if (!videoElement) return;

    const offsetLeft = videoElement.getBoundingClientRect().left;

    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      this.resizeService.updateWidth(e.clientX - offsetLeft);
    });

    this.mouseUpListener = this.renderer.listen('document', 'mouseup', () => {
      this.stopResizing();
    });
  }

  setVideoSize(size: string): void {
    const presets: Record<string, number> = {
      S: this.maxVideoWidth * 0.5,
      M: this.maxVideoWidth * 0.75,
      L: window.innerWidth,
      '*': this.resizeService.videoWidth(),
    };
    this.resizeService.updateWidth(presets[size] ?? this.maxVideoWidth);
  }

  private stopResizing(): void {
    this.mouseMoveListener?.();
    this.mouseUpListener?.();
    this.mouseMoveListener = undefined;
    this.mouseUpListener = undefined;
  }
}
