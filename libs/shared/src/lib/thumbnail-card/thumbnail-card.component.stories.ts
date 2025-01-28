import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ThumbnailCardComponent } from './thumbnail-card.component';

export default {
  title: 'ThumbnailCardComponent',
  component: ThumbnailCardComponent,
  decorators: [
    moduleMetadata({
      imports: []
    })
  ]
} as Meta<ThumbnailCardComponent>;

const Template: Story<ThumbnailCardComponent> = (
  args: ThumbnailCardComponent
) => ({
  component: ThumbnailCardComponent,
  props: args
});

export const Primary = Template.bind({});
Primary.args = {};
