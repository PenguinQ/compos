import type { VNode } from 'vue';

type CreateLoopKey = {
  id?: string;
  index: number;
  item?: VNode;
  prefix: string;
  suffix: string;
};

export default ({ id, index, item, prefix, suffix }: CreateLoopKey) => {
  if (item?.props?.key != null) return item.props.key;

  if (item?.props?.id) return item.props.id;

  if (id) return `${id}-${suffix}-${index}`;

  return `${prefix}-${suffix}-${index}`;
};