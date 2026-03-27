import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';

export interface ColumnDef {
  key: string;
  label: string;
  visible: boolean;
}

export interface SectionHeader {
  kind: 'section';
  label: string;
  count: number;
}

export interface PlayerRow {
  kind: 'player';
  name: string;
  position: string;
  team: string;
  gamesPlayed: number;
  passingYards?: number;
  rushingYards?: number;
  touchdowns: number;
  yardsPerCarry?: number;
  rating?: number;
  status: 'Active' | 'Injured' | 'Suspended';
}

export type TableRow = SectionHeader | PlayerRow;

const QB_DATA: PlayerRow[] = [
  { kind: 'player', name: 'Patrick Mahomes', position: 'QB', team: 'Kansas City Chiefs', gamesPlayed: 17, passingYards: 4183, touchdowns: 27, rating: 101.5, status: 'Active' },
  { kind: 'player', name: 'Josh Allen', position: 'QB', team: 'Buffalo Bills', gamesPlayed: 16, passingYards: 4306, touchdowns: 29, rating: 99.8, status: 'Active' },
  { kind: 'player', name: 'Lamar Jackson', position: 'QB', team: 'Baltimore Ravens', gamesPlayed: 17, passingYards: 3678, touchdowns: 24, rating: 102.7, status: 'Active' },
  { kind: 'player', name: 'Joe Burrow', position: 'QB', team: 'Cincinnati Bengals', gamesPlayed: 10, passingYards: 2309, touchdowns: 15, rating: 94.2, status: 'Injured' },
  { kind: 'player', name: 'Justin Herbert', position: 'QB', team: 'Los Angeles Chargers', gamesPlayed: 17, passingYards: 4144, touchdowns: 25, rating: 96.3, status: 'Active' },
  { kind: 'player', name: 'Dak Prescott', position: 'QB', team: 'Dallas Cowboys', gamesPlayed: 12, passingYards: 2860, touchdowns: 20, rating: 95.7, status: 'Injured' },
  { kind: 'player', name: 'Jalen Hurts', position: 'QB', team: 'Philadelphia Eagles', gamesPlayed: 17, passingYards: 3858, touchdowns: 23, rating: 98.1, status: 'Active' },
  { kind: 'player', name: 'Trevor Lawrence', position: 'QB', team: 'Jacksonville Jaguars', gamesPlayed: 17, passingYards: 4016, touchdowns: 21, rating: 92.4, status: 'Active' },
];

const RB_DATA: PlayerRow[] = [
  { kind: 'player', name: 'Saquon Barkley', position: 'RB', team: 'Philadelphia Eagles', gamesPlayed: 16, rushingYards: 1844, touchdowns: 13, yardsPerCarry: 5.1, status: 'Active' },
  { kind: 'player', name: 'Derrick Henry', position: 'RB', team: 'Baltimore Ravens', gamesPlayed: 16, rushingYards: 1520, touchdowns: 16, yardsPerCarry: 4.8, status: 'Active' },
  { kind: 'player', name: 'Josh Jacobs', position: 'RB', team: 'Green Bay Packers', gamesPlayed: 17, rushingYards: 1329, touchdowns: 11, yardsPerCarry: 4.6, status: 'Active' },
  { kind: 'player', name: 'James Cook', position: 'RB', team: 'Buffalo Bills', gamesPlayed: 16, rushingYards: 1122, touchdowns: 10, yardsPerCarry: 4.9, status: 'Active' },
  { kind: 'player', name: 'Breece Hall', position: 'RB', team: 'New York Jets', gamesPlayed: 15, rushingYards: 1033, touchdowns: 9, yardsPerCarry: 4.5, status: 'Active' },
  { kind: 'player', name: "De'Von Achane", position: 'RB', team: 'Miami Dolphins', gamesPlayed: 13, rushingYards: 906, touchdowns: 8, yardsPerCarry: 5.4, status: 'Active' },
  { kind: 'player', name: 'Tony Pollard', position: 'RB', team: 'Tennessee Titans', gamesPlayed: 14, rushingYards: 798, touchdowns: 7, yardsPerCarry: 4.3, status: 'Active' },
  { kind: 'player', name: 'Christian McCaffrey', position: 'RB', team: 'San Francisco 49ers', gamesPlayed: 6, rushingYards: 523, touchdowns: 5, yardsPerCarry: 4.7, status: 'Injured' },
];

const SECTION_DATA: TableRow[] = [
  { kind: 'section', label: 'Quarterbacks', count: QB_DATA.length },
  ...QB_DATA,
  { kind: 'section', label: 'Running Backs', count: RB_DATA.length },
  ...RB_DATA,
];

const PLAYER_COUNT = QB_DATA.length + RB_DATA.length;

@Component({
  selector: 'app-draggable-columns-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatTooltipModule, DragDropModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './table.html',
  styleUrls: ['./table.scss'],
})
export class Table {
  readonly dataSource = SECTION_DATA;
  readonly playerCount = PLAYER_COUNT;

  columns = signal<ColumnDef[]>([
    { key: 'name', label: 'Player', visible: true },
    { key: 'position', label: 'Pos', visible: true },
    { key: 'team', label: 'Team', visible: true },
    { key: 'gamesPlayed', label: 'GP', visible: true },
    { key: 'passingYards', label: 'Pass Yds', visible: true },
    { key: 'rushingYards', label: 'Rush Yds', visible: true },
    { key: 'touchdowns', label: 'TDs', visible: true },
    { key: 'yardsPerCarry', label: 'YPC', visible: true },
    { key: 'rating', label: 'Rating', visible: true },
    { key: 'status', label: 'Status', visible: true },
  ]);

  /** Keys of visible columns, in order — drives mat-table's [displayedColumns] */
  displayedColumns = computed(() =>
    this.columns()
      .filter((c) => c.visible)
      .map((c) => c.key),
  );

  /** Only the visible column definitions (for header rendering) */
  visibleColumns = computed(() => this.columns().filter((c) => c.visible));

  draggedIndex = signal<number | null>(null);
  dragOverIndex = signal<number | null>(null);

  isSectionRow = (_: number, row: TableRow): boolean => row.kind === 'section';
  isPlayerRow = (_: number, row: TableRow): boolean => row.kind === 'player';

  // ── Drag handlers ──────────────────────────────────────────────────────────

  onDragStart(index: number): void {
    this.draggedIndex.set(index);
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    this.dragOverIndex.set(index);
  }

  onDragLeave(event: DragEvent): void {
    const th = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as Node | null;
    if (!relatedTarget || !th.contains(relatedTarget)) {
      this.dragOverIndex.set(null);
    }
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();
    const from = this.draggedIndex();
    if (from === null || from === dropIndex) {
      this.clearDragState();
      return;
    }
    const visible = this.visibleColumns();
    const reordered = [...visible];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(dropIndex, 0, moved);
    const hidden = this.columns().filter((c) => !c.visible);
    this.columns.set([...reordered, ...hidden]);
    this.clearDragState();
  }

  onDragEnd(): void {
    this.clearDragState();
  }

  private clearDragState(): void {
    this.draggedIndex.set(null);
    this.dragOverIndex.set(null);
  }

  // ── Column visibility toggle ───────────────────────────────────────────────

  toggleColumn(key: string): void {
    this.columns.update((cols) =>
      cols.map((c) => (c.key === key ? { ...c, visible: !c.visible } : c)),
    );
  }

  isDraggedCol(index: number): boolean {
    return this.draggedIndex() === index;
  }

  isDragOverCol(index: number): boolean {
    return this.dragOverIndex() === index && this.draggedIndex() !== index;
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  getCellValue(row: TableRow, key: string): string | number {
    if (row.kind !== 'player') return '';
    const val = (row as unknown as Record<string, string | number | undefined>)[key];
    return val ?? '—';
  }

  isNumeric(key: string): boolean {
    return ['gamesPlayed', 'passingYards', 'rushingYards', 'touchdowns', 'yardsPerCarry', 'rating'].includes(key);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }
}
