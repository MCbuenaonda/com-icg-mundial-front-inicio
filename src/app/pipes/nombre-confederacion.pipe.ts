import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nombreConfederacion'
})
export class NombreConfederacionPipe implements PipeTransform {
  transform(value: number | string | null | undefined): string {
    if (value === null || value === undefined) return 'Desconocida';
    const id = typeof value === 'string' ? parseInt(value, 10) : value;
    switch (id) {
      case 1:
        return 'UEFA';
      case 2:
        return 'CONMEBOL';
      case 3:
        return 'CONCACAF';
      case 4:
        return 'CAF';
      case 5:
        return 'OFC';
      case 6:
        return 'AFC';
      default:
        return 'Desconocida';
    }
  }
}
