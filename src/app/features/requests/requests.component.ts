import { Component, OnInit, OnDestroy } from '@angular/core';
import { combineLatest, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, takeUntil } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

import { PosService } from '../../core/services/pos.service';
import { ToastService } from '../../core/services/toast.service';
import { PosMachine, PosStats, PosStatus, ConfigPayload } from '../../core/models/pos-machine.model';

type Filter = 'all' | PosStatus;

@Component({
  selector: 'app-requests',
  templateUrl: './requests.component.html',
  styleUrls: ['./requests.component.scss'],
})
export class RequestsComponent implements OnInit, OnDestroy {
  stats: PosStats = { total: 0, pending: 0, configured: 0, deployed: 0 };
  filteredMachines: PosMachine[] = [];
  activeFilter: Filter = 'all';

  searchControl = new FormControl('');

  // Config modal state
  selectedMachine: PosMachine | null = null;
  isModalOpen = false;

  // Deploy loading state
  deployingId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private posService: PosService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to stats
    this.posService.stats$
      .pipe(takeUntil(this.destroy$))
      .subscribe((stats) => (this.stats = stats));

    // Combine machines + search input reactively
    combineLatest([
      this.posService.machines$,
      this.searchControl.valueChanges.pipe(
        startWith(''),
        debounceTime(200),
        distinctUntilChanged()
      ),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([machines, query]) => {
        this.applyFilter(machines, query ?? '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  setFilter(filter: Filter): void {
    this.activeFilter = filter;
    this.applyFilter(
      this.posService['machinesSubject'].value,
      this.searchControl.value ?? ''
    );
  }

  private applyFilter(machines: PosMachine[], query: string): void {
    const q = query.toLowerCase();
    this.filteredMachines = machines.filter((m) => {
      const matchFilter = this.activeFilter === 'all' || m.status === this.activeFilter;
      const matchSearch =
        !q ||
        m.serial.toLowerCase().includes(q) ||
        m.merchant.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }

  openConfigModal(machine: PosMachine): void {
    this.selectedMachine = machine;
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedMachine = null;
  }

  onConfigSaved(payload: ConfigPayload): void {
    if (!this.selectedMachine) return;
    const id = this.selectedMachine.id;

    this.posService.configure(id, payload).subscribe({
      next: (machine) => {
        this.toast.success(`✓ ${machine.serial} configured successfully`);
        this.closeModal();
      },
      error: () => this.toast.error('Configuration failed. Please try again.'),
    });
  }

  deployMachine(machine: PosMachine): void {
    this.deployingId = machine.id;
    this.posService.deploy(machine.id).subscribe({
      next: (m) => {
        this.toast.success(`✓ ${m.serial} deployed to ${m.merchant}`);
        this.deployingId = null;
      },
      error: () => {
        this.toast.error('Deployment failed. Please try again.');
        this.deployingId = null;
      },
    });
  }
}
