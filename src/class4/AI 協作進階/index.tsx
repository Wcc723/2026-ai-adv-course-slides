import { SlideTemplate } from '../../template';
import { slideTitle, slideSubtitle, steps } from './slides';

export function AiCollaborationSlide() {
  return (
    <SlideTemplate title={slideTitle} subtitle={slideSubtitle} steps={steps} />
  );
}
