import { SlideTemplate } from '../../template';
import { slideTitle, slideSubtitle, steps } from './slides';

export function SubAgentPatternsSlide() {
  return (
    <SlideTemplate title={slideTitle} subtitle={slideSubtitle} steps={steps} />
  );
}
