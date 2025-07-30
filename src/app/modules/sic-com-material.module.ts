import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
import { MatLegacyChipsModule as MatChipsModule } from '@angular/material/legacy-chips';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatCheckboxModule, MatCardModule
  ],
  exports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatCheckboxModule, MatCardModule
  ]
})
export class SicComMaterialModule {}
