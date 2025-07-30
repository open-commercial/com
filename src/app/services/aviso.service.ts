import { Injectable } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar, MatLegacySnackBarConfig as MatSnackBarConfig } from '@angular/material/legacy-snack-bar';

@Injectable()
export class AvisoService {

  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string = '', duration: number = 3500) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.verticalPosition = 'top';
    return this.snackBar.open(message, action, config);
  }
}
