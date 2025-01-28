import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { TitleBarComponent } from './title-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';

import { BackButtonComponent } from '../back-button/back-button.component';

export default {
  title: 'TitleBarComponent',
  component: TitleBarComponent,
  decorators: [
    moduleMetadata({
      imports: [MatToolbarModule, MatIconModule],
      declarations: [BackButtonComponent]
    })
  ]
} as Meta<TitleBarComponent>;

const Template: Story<TitleBarComponent> = (args: TitleBarComponent) => ({
  component: TitleBarComponent,
  props: args,
  template: `
  <shared-title-bar>
    <span left><shared-back-button backTo="/"></shared-back-button></span>
    <span title>Title</span>
    <span right><button mat-raised-button>Quit</button></span>
  </shared-title-bar>`
});

export const Primary = Template.bind({});
Primary.args = {
  show: false,
  showIfMobile: false
};
