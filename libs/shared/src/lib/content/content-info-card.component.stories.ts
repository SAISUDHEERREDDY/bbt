import { moduleMetadata, Story, Meta } from '@storybook/angular';
import { ContentInfoCardComponent } from './content-info-card.component';
import { ThumbnailCardComponent } from '../thumbnail-card/thumbnail-card.component';
import { FlexLayoutModule } from '@angular/flex-layout';
export default {
  title: 'ContentInfoCardComponent',
  component: ContentInfoCardComponent,
  decorators: [
    moduleMetadata({
      imports: [FlexLayoutModule],
      declarations: [ContentInfoCardComponent, ThumbnailCardComponent]
    })
  ]
} as Meta<ContentInfoCardComponent>;

/*
moduleMetadata({
      //👇 Imports both components to allow component composition with storybook
      declarations: [PureTaskListComponent, TaskComponent],
      imports: [CommonModule],
    }),
    //👇 Wraps our stories with a decorator
    componentWrapperDecorator(story => `<div style="margin: 3em">${story}</div>`),
*/

const Template: Story<ContentInfoCardComponent> = (
  args: ContentInfoCardComponent
) => ({
  component: ContentInfoCardComponent,
  props: args
});

export const Video = Template.bind({});
Video.args = {
  name: 'Here is the text of the video and the name is long',
  thumbSrc: 'https://loremflickr.com/640/360',
  type: 'Video',
  info: '03:30',
  passkey: false
};

export const Presentation = Template.bind({});
Presentation.args = {
  name: 'This is a presentation',
  thumbSrc: 'https://loremflickr.com/640/360',
  type: 'Presentation',
  info: '03:30',
  passkey: false
};
