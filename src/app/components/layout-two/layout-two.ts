import { CdkDrag, DragDropModule } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-layout-two',
  imports: [DragDropModule],
  templateUrl: './layout-two.html',
  styleUrl: './layout-two.scss',
})
export class LayoutTwo implements AfterViewInit, OnDestroy {
  @ViewChild('boundary', { static: true }) boundary!: ElementRef<HTMLElement>;
  // Access the CDK internal reference
  @ViewChild(CdkDrag, { static: true }) cdkDrag!: CdkDrag;

  private resizeObserver?: ResizeObserver;
  private currentSlotIndex = 0;
  dragPosition = { x: 0, y: 0 };

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updatePosition();
    });
    this.resizeObserver.observe(this.boundary.nativeElement);

    // Ensure initial placement
    setTimeout(() => this.updatePosition(), 0);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  updatePosition() {
    if (!this.boundary || !this.cdkDrag) return;

    const parentRect = this.boundary.nativeElement.getBoundingClientRect();
    const rectW = 80;
    const rectH = 160;

    // Calculate current points
    const snapPoints = this.getSnapPoints(parentRect, rectW, rectH);
    const target = snapPoints[this.currentSlotIndex];

    // 1. Manually sync the CDK's internal "free drag" pointer
    this.dragPosition = { x: target.x, y: target.y };

    // 2. IMPORTANT: Manually move the element's internal DragRef
    // This overrides the CDK's cached pixel offset immediately.
    this.cdkDrag._dragRef.setFreeDragPosition({ x: target.x, y: target.y });

    this.cdr.detectChanges();
  }

  getSnapPoints(parent: DOMRect, rectW: number, rectH: number) {
    return [
      { x: 0, y: 0 }, // 0: TL
      { x: parent.width - rectW, y: 0 }, // 1: TR
      { x: 0, y: parent.height - rectH }, // 2: BL
      { x: parent.width - rectW, y: parent.height - rectH }, // 3: BR
      { x: 0, y: parent.height / 2 - rectH / 2 }, // 4: ML
      { x: parent.width - rectW, y: parent.height / 2 - rectH / 2 }, // 5: MR
    ];
  }

  snapPosition = (point: { x: number; y: number }) => {
    const parent = this.boundary.nativeElement.getBoundingClientRect();
    const snapPoints = this.getSnapPoints(parent, 80, 160);
    const localX = point.x - parent.left;
    const localY = point.y - parent.top;

    let bestDist = Infinity;
    let bestIndex = 0;

    snapPoints.forEach((p, i) => {
      const dist = Math.hypot(p.x - localX, p.y - localY);
      if (dist < bestDist) {
        bestDist = dist;
        bestIndex = i;
      }
    });

    this.currentSlotIndex = bestIndex;
    const winner = snapPoints[bestIndex];

    return { x: winner.x + parent.left, y: winner.y + parent.top };
  };
}
