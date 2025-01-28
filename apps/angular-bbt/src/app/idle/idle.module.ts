import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IdlenessService } from './idleness.service';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [IdlenessService]
})
export class IdleModule {}
