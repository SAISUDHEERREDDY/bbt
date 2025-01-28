import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ContentCardComponent } from './content-card.component';

export default {
  title: 'ContentCardComponent',
  component: ContentCardComponent,
  decorators: [
    moduleMetadata({
      imports: []
    })
  ]
} as Meta<ContentCardComponent>;

const Template: Story<ContentCardComponent> = (args: ContentCardComponent) => ({
  component: ContentCardComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {
  content: {
    descname: 'descname',
    full_path: 'full_path',
    thumbpath:
      'http://hs.home.pugina.com/opt/VA/content/thumbnails/Connecting_Matters_Final_720pEE1.png',

    type: 'video',
    duration: '1:26',
    count: 3,
    file_base: 'file_base',
    size: '3m',
    passkey: false
  }
};
