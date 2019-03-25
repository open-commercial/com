import {
  MatListModule, MatIconModule, MatInputModule, MatToolbarModule,
  MatProgressSpinnerModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
  MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
  MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
  MatCheckboxModule
} from '@angular/material';
import {NgModule} from '@angular/core';

@NgModule({
  imports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatCheckboxModule
  ],
  exports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatCheckboxModule
  ]
})
export class SicComMaterialModule {}
