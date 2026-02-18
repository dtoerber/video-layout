import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  Renderer2,
  ViewChild,
  inject,
} from '@angular/core';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ResizeService } from './resize.service';

@Component({
  selector: 'app-layout-one',
  imports: [MatButtonModule, MatIconModule, MatButtonToggleModule, DecimalPipe, AsyncPipe],
  templateUrl: './layout-one.html',
  styleUrls: ['./layout-one.scss', './grid.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutOne implements AfterViewInit, OnDestroy {
  protected readonly resizeService = inject(ResizeService);
  private readonly renderer = inject(Renderer2);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  @ViewChild('videoSection') private readonly videoSection!: ElementRef<HTMLElement>;

  protected renderedWidth = 0;
  protected renderedHeight = 0;
  protected selectedSize = '';

  private readonly resizeObserver = new ResizeObserver(([entry]) => {
    this.ngZone.run(() => {
      this.renderedWidth = Math.round(entry.contentRect.width);
      this.renderedHeight = Math.round(entry.contentRect.height);
      this.cdr.markForCheck();
    });
  });

  ngAfterViewInit(): void {
    this.resizeObserver.observe(this.videoSection.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver.disconnect();
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
    this.selectedSize = '*';

    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      this.resizeService.updateWidth(e.clientX - offsetLeft);
    });

    this.mouseUpListener = this.renderer.listen('document', 'mouseup', () => {
      this.stopResizing();
    });
  }

  setVideoSize(size: string): void {
    if (size === '*') {
      const custom = this.resizeService.customWidth;
      if (custom !== null) {
        this.resizeService.updateWidth(custom);
      }
    } else {
      const presets: Record<string, number> = {
        S: this.maxVideoWidth * 0.5,
        M: this.maxVideoWidth * 0.75,
        L: window.innerWidth,
      };
      this.resizeService.updateWidth(presets[size] ?? this.maxVideoWidth);
    }
    this.selectedSize = size;
  }

  private stopResizing(): void {
    this.resizeService.saveCustomWidth();
    this.mouseMoveListener?.();
    this.mouseUpListener?.();
    this.mouseMoveListener = undefined;
    this.mouseUpListener = undefined;
  }
}
