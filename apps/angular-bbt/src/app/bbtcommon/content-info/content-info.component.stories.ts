import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ContentInfoComponent } from './content-info.component';

export default {
  title: 'ContentInfoComponent',
  component: ContentInfoComponent,
  decorators: [
    moduleMetadata({
      imports: []
    })
  ]
} as Meta<ContentInfoComponent>;

const Template: Story<ContentInfoComponent> = (args: ContentInfoComponent) => ({
  component: ContentInfoComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {
  content: {
    descname: 'descname',
    timestamp: '00:00:00',
    duration: 30,
    longdesc: 'Here is a long description that should take up a lot of space'
  }
};

export const LongDesc = Template.bind({});

LongDesc.args = {
  content: {
    descname: 'Here is a long descname that will probably have an ellipsis ',
    timestamp: '00:00:00',
    duration: 30,
    longdesc: 'Here is a long description that should take up a lot of space'
  }
};
