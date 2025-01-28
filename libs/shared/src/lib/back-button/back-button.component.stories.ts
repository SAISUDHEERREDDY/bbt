import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { BackButtonComponent } from './back-button.component';

export default {
  title: 'BackButtonComponent',
  component: BackButtonComponent,
  decorators: [
    moduleMetadata({
      declarations: [BackButtonComponent]
    })
  ]
} as Meta<BackButtonComponent>;

const Template: Story<BackButtonComponent> = (args: BackButtonComponent) => ({
  component: BackButtonComponent,
  props: args
});

export const BackRoot = Template.bind({});
BackRoot.args = {
  backTo: '/'
};

export const BackVod = Template.bind({});
BackVod.args = {
  backTo: '/vod'
};
