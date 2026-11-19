import { createElement, type ComponentType } from 'react';
import type { VoteTopicId } from './vote-topics';
import { VoteFrame } from './vote-ui';

/**
 * 把一頁 demo 包上底部的投票列（1～5 分）。slides.ts 用：
 *   render: withVote(ProjectsDemo, 'projects')
 * 被包的 demo 根容器高度上限 640（投票列與間距佔 ~110）。
 */
export function withVote(Demo: ComponentType, topic: VoteTopicId): ComponentType {
  function Voted() {
    return createElement(VoteFrame, { Demo, topic });
  }
  Voted.displayName = `withVote(${topic})`;
  return Voted;
}
