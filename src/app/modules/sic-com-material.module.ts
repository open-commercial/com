import {
  MatListModule, MatIconModule, MatInputModule, MatToolbarModule,
  MatProgressSpinnerModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
  MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
  MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule
} from '@angular/material';
import {NgModule} from '@angular/core';

@NgModule({
  imports: [MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule],
  exports: [MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule]
})
export class SicComMaterialModule {}
