import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { HorizontalHeaderComponent } from './horizontal-header.component';

export default {
  title: 'HorizontalHeaderComponent',
  component: HorizontalHeaderComponent,
  decorators: [
    moduleMetadata({
      imports: []
    })
  ]
} as Meta<HorizontalHeaderComponent>;

const Template: Story<HorizontalHeaderComponent> = (
  args: HorizontalHeaderComponent
) => ({
  component: HorizontalHeaderComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {};
