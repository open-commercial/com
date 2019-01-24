import {
  MatListModule, MatIconModule, MatInputModule, MatToolbarModule,
  MatProgressSpinnerModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
  MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
  MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
  MatPaginatorModule, MatPaginatorIntl
} from '@angular/material';
import {NgModule} from '@angular/core';

function getEspanolPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Items por página:';
  paginatorIntl.nextPageLabel = 'Página Siguiente';
  paginatorIntl.previousPageLabel = 'Página Anterior';
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) { return `0 de ${length}`; }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };

  return paginatorIntl;
}

@NgModule({
  imports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatPaginatorModule
  ],
  exports: [
    MatToolbarModule, MatProgressSpinnerModule, MatListModule, MatIconModule,
    MatInputModule, MatButtonModule, MatSnackBarModule, MatDialogModule,
    MatAutocompleteModule, MatTooltipModule, MatExpansionModule, MatSelectModule,
    MatMenuModule, MatChipsModule, MatButtonToggleModule, MatStepperModule, MatRadioModule,
    MatPaginatorModule
  ],
  providers: [
    { provide: MatPaginatorIntl, useValue: getEspanolPaginatorIntl() }
  ]
})
export class SicComMaterialModule {}
