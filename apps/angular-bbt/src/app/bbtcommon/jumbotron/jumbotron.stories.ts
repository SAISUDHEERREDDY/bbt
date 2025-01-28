import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { JumbotronComponent } from './jumbotron.component';

export default {
  title: 'JumbotronComponent',
  component: JumbotronComponent,
  decorators: [
    moduleMetadata({
      imports: []
    })
  ]
} as Meta<JumbotronComponent>;

const Template: Story<JumbotronComponent> = (args: JumbotronComponent) => ({
  component: JumbotronComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {
  content: {
    name: 'name',

    rating: 5,
    description: 'here is the description of the jumbotron',
    type: 'video',
    showFade: true,
    previewOnly: false,
    descname: 'descname',
    timestamp: '00:00:00',
    duration: 30,
    longdesc: 'Here is a long description that should take up a lot of space'
  }
};
