import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnDemandContentService } from './on-demand-content.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  providers: [OnDemandContentService],
  imports: [CommonModule, HttpClientModule]
})
export class ContentModelModule {}
