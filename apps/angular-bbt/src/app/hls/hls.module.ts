import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HlsVideoDirective } from './hls-video/hls-video.directive';

@NgModule({
  declarations: [HlsVideoDirective],
  exports: [HlsVideoDirective],
  imports: [CommonModule]
})
export class HlsModule {}
