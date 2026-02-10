import { ChangeDetectionStrategy, Component, inject, Renderer2 } from '@angular/core';
import { ResizeService } from '../../services/resize.service';

@Component({
  selector: 'app-layout-one',
  templateUrl: './layout-one.html',
  styleUrl: './layout-one.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutOne {
  protected readonly resizeService = inject(ResizeService);
  private readonly renderer = inject(Renderer2);

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

  private stopResizing(): void {
    this.mouseMoveListener?.();
    this.mouseUpListener?.();
    this.mouseMoveListener = undefined;
    this.mouseUpListener = undefined;
  }
}
