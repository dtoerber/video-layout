import { CdkDragEnd, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, computed, ElementRef, signal, ViewChild } from '@angular/core';

type SnapSlot =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'middle-left'
  | 'middle-right';

const ALL_SLOTS: SnapSlot[] = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
];

@Component({
  selector: 'app-layout-three',
  standalone: true,
  imports: [DragDropModule, CommonModule],
  templateUrl: './layout-three.html',
  styleUrl: './layout-three.scss',
})
export class LayoutThree {
  @ViewChild('boundary') boundary!: ElementRef<HTMLElement>;
  @ViewChild('dragItem') dragItem!: ElementRef<HTMLElement>;
  currentSlot: SnapSlot = 'middle-right';
  dragging = signal(false);
  dragSize = signal({ width: 0, height: 0 });
  dropTargets = computed(() =>
    this.dragging() ? ALL_SLOTS.filter((s) => s !== this.currentSlot) : [],
  );

  constructor(private cdr: ChangeDetectorRef) {}

  onDragStarted() {
    const el = this.dragItem.nativeElement;
    this.dragSize.set({ width: el.offsetWidth, height: el.offsetHeight });
    this.dragging.set(true);
  }

  onDragEnded(event: CdkDragEnd) {
    this.dragging.set(false);
    const parentRect = this.boundary.nativeElement.getBoundingClientRect();
    const elementRect = event.source.element.nativeElement.getBoundingClientRect();

    const centerX = elementRect.left + elementRect.width / 2 - parentRect.left;
    const centerY = elementRect.top + elementRect.height / 2 - parentRect.top;

    this.currentSlot = this.calculateNearestSlot(
      centerX,
      centerY,
      parentRect.width,
      parentRect.height,
    );

    // Reset everything so CSS takes over
    event.source.reset();
    this.cdr.detectChanges();
  }

  private calculateNearestSlot(x: number, y: number, w: number, h: number): SnapSlot {
    const isLeft = x < w / 2;
    const buffer = h * 0.2;
    const midY = h / 2;

    if (y > midY - buffer && y < midY + buffer) return isLeft ? 'middle-left' : 'middle-right';
    if (y < midY) return isLeft ? 'top-left' : 'top-right';
    return isLeft ? 'bottom-left' : 'bottom-right';
  }
}
