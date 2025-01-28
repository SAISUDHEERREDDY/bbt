import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { MobileKeypadComponent } from './mobile-keypad.component';
import { MatFormFieldModule } from '@angular/material/form-field';

export default {
  title: 'MobileKeypadComponent',
  component: MobileKeypadComponent,
  decorators: [
    moduleMetadata({
      imports: [MatFormFieldModule]
    })
  ]
} as Meta<MobileKeypadComponent>;

const Template: Story<MobileKeypadComponent> = (
  args: MobileKeypadComponent
) => ({
  component: MobileKeypadComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {};
