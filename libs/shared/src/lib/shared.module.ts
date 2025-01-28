import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatToolbarModule } from '@angular/material/toolbar';
import { HorizontalHeaderComponent } from './horizontal-header/horizontal-header.component';
import { ThumbnailCardComponent } from './thumbnail-card/thumbnail-card.component';
import { ContentInfoCardComponent } from './content/content-info-card.component';
import { ContentInfoTileComponent } from './content-info-tile/content-info-tile.component';
import { TitleBarComponent } from './title-bar/title-bar.component';
import { SecondsByMagnitudePipe } from './seconds-by-magnitude.pipe';
import { PrettyBytesPipe } from './pretty-bytes.pipe';
import { ParseIntPipe } from './parse-int.pipe';
import { ScrollToDirective } from './scroll-to.directive';

@NgModule({
  declarations: [
    HorizontalHeaderComponent,
    ThumbnailCardComponent,
    ContentInfoCardComponent,
    ContentInfoTileComponent,
    SecondsByMagnitudePipe,
    PrettyBytesPipe,
    ParseIntPipe,
    ScrollToDirective,
    TitleBarComponent
  ],
  exports: [
    HorizontalHeaderComponent,
    ThumbnailCardComponent,
    ContentInfoCardComponent,
    ContentInfoTileComponent,
    SecondsByMagnitudePipe,
    ParseIntPipe,
    PrettyBytesPipe,
    ScrollToDirective,
    TitleBarComponent
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatToolbarModule
  ]
})
export class SharedComponentsModule {}
