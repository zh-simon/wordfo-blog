import type { CollectionEntry } from 'astro:content';

// 常见中文虚词、代词与泛化动词，不进入词云
const STOP = new Set(
  ('的 了 和 是 在 我 有 就 不 人 都 一 上 也 很 到 说 要 去 你 会 着 没 没有 看 好 自己 这 那 什么 如 但 他 她 它 我们 你们 他们 这个 那个 这些 那些 因为 所以 如果 可以 不能 可能 应该 需要 主要 已经 还是 只是 就是 不仅 而且 虽然 但是 对于 关于 通过 以及 或者 还有 这样 那样 如何 为什么 怎么 时候 之后 之前 现在 今天 昨天 明天 一下 一些 一样 一般 一种 一边 一点 有些 所有 一定 一次 一直 直接 然后 另外 比如 例如 等等 其实 尤其 特别 真正 非常 比较 更加 最 更 太 挺 才 又 再 还 已 正在 将 把 被 让 给 从 向 往 对 与 及 等 而 且 或 则 于 之 其 此 该 各 每 某 们 个 中 一个 问题 东西 事情 得到 进行 使用 存在 出现 他的 你的 我们的 其他 不用 具体 交给 了解 看出 找到 几点 分为 到达 前去 前者 后者 前额 几个 多少 这么 那么 怎样').split(/\s+/)
);

function tokenize(text: string): string[] {
  if (typeof Intl.Segmenter === 'function') {
    const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
    return [...segmenter.segment(text)]
      .filter((part) => part.isWordLike)
      .map((part) => part.segment);
  }
  return text.match(/[\u4e00-\u9fa5]{2,4}/g) ?? [];
}

// 去掉图片、链接与 Markdown 标记后，中文不足 4 字的文章视为没有正文
function hasBody(raw: string): boolean {
  const plain = raw
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#*`>_~\[\]()!|]/g, '');
  return (plain.match(/[\u4e00-\u9fa5]/g) ?? []).length >= 4;
}

export function getKeywords(posts: CollectionEntry<'posts'>[]): [string, number][] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    const raw = post.body ?? '';
    if (!hasBody(raw)) continue;

    const seen = new Set<string>();
    for (const word of tokenize(raw)) {
      if (!/^[\u4e00-\u9fa5]{2,4}$/.test(word)) continue;
      if (/^[一十][\u4e00-\u9fa5]{1,2}$/.test(word)) continue; // 一半、一张、十句等量词组合
      if (STOP.has(word)) continue;
      seen.add(word);
    }
    // 每篇文章每个词只计一次，突出跨文章反复出现的主题
    for (const word of seen) {
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10);
}

export interface CloudWord {
  word: string;
  count: number;
  size: number;
  rotate: number;
}

// 名次越高字号越大；角度轻微，保证词能紧贴在一起
const SIZES = [17, 15, 14, 13, 12, 12, 11, 11, 10, 10];
const ANGLES = [0, -5, 4, 0, -4, 5, 0, -3, 3, 0];

export function getWordCloud(posts: CollectionEntry<'posts'>[]): CloudWord[] {
  return getKeywords(posts).map(([word, count], rank) => ({
    word,
    count,
    size: SIZES[rank],
    rotate: ANGLES[rank],
  }));
}
