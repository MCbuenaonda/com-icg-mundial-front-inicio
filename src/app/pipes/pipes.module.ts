import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FechaEsPipe } from './fecha-es.pipe';
import { NombreConfederacionPipe } from './nombre-confederacion.pipe';

@NgModule({
  declarations: [FechaEsPipe, NombreConfederacionPipe],
  imports: [CommonModule],
  exports: [FechaEsPipe, NombreConfederacionPipe]
})
export class PipesModule {}
