import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { combineLatest, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  startWith,
  takeUntil,
} from 'rxjs/operators';
import { PosService } from '../../core/services/pos.service';
import { PosMachine } from '../../core/models/pos-machine.model';

@Component({
  selector: 'app-machines',
  templateUrl: './machines.component.html',
  styleUrls: ['./machines.component.scss'],
})
export class MachinesComponent implements OnInit, OnDestroy {
  machines: PosMachine[] = [];
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(private posService: PosService) {}

  ngOnInit(): void {
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
        const q = (query ?? '').toLowerCase();
        // Only show configured/deployed
        this.machines = machines
          .filter((m) => m.status !== 'pending')
          .filter(
            (m) =>
              !q ||
              m.serial.toLowerCase().includes(q) ||
              m.merchant.toLowerCase().includes(q) ||
              m.model.toLowerCase().includes(q) ||
              (m.mid ?? '').toLowerCase().includes(q)
          );
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
