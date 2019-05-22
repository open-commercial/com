import {Injectable} from '@angular/core';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material';

@Injectable()
export class AvisoService {

  constructor(private snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string, duration: number = 3500) {
    const config = new MatSnackBarConfig();
    config.duration = duration;
    config.verticalPosition = 'top';
    return this.snackBar.open(message, action, config);
  }
}
