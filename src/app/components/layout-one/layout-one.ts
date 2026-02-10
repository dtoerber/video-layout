import { CommonModule } from '@angular/common';
import { Component, inject, Renderer2 } from '@angular/core';
import { ResizeService } from '../../services/resize.service';

@Component({
  selector: 'app-layout-one',
  imports: [CommonModule],
  templateUrl: './layout-one.html',
  styleUrl: './layout-one.scss',
})
export class LayoutOne {
  public resizeService = inject(ResizeService);
  private renderer = inject(Renderer2); // Used for clean event cleanup

  // Temporary listeners to be cleared later
  private mouseMoveListener?: () => void;
  private mouseUpListener?: () => void;

  startResizing(event: MouseEvent): void {
    event.preventDefault();

    // 1. Get the starting position of the video element
    const videoElement = (event.target as HTMLElement).closest('.video');
    if (!videoElement) return;

    const rect = videoElement.getBoundingClientRect();
    const offsetLeft = rect.left; // This is the 'anchor' point

    this.mouseMoveListener = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      // 2. New Width = Current Mouse X - Left edge of the video
      // This gives the absolute distance from the start of the box to the mouse
      const newWidth = e.clientX - offsetLeft;

      this.resizeService.updateWidth(newWidth);
    });

    this.mouseUpListener = this.renderer.listen('document', 'mouseup', () => {
      this.stopResizing();
    });
  }

  private stopResizing(): void {
    // 3. Clean up listeners to save memory and prevent ghost resizing
    if (this.mouseMoveListener) this.mouseMoveListener();
    if (this.mouseUpListener) this.mouseUpListener();
  }
}
