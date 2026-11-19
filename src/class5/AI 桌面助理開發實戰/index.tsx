import { SlideTemplate } from '../../template';
import { slideTitle, slideSubtitle, steps } from './slides';

export function AiDesktopAssistantSlide() {
  return (
    <SlideTemplate title={slideTitle} subtitle={slideSubtitle} steps={steps} />
  );
}
