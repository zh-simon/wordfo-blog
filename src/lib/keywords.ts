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
  x: number;
  y: number;
  size: number;
  rotate: number;
  color: number;
}

// 紧凑画布：宽度贴住侧栏，高度压成一个更扁的矩形块
const CLOUD_W = 184;
const CLOUD_H = 124;

// 字号跨度拉大，形成大小分明的层次
const SIZES = [30, 24, 20, 17, 15, 13, 12, 11, 10, 9];
// 部分词竖排、部分轻微倾斜，错落而不散乱
const ANGLES = [0, -90, 0, 90, 0, -8, 6, 0, -5, 0];
// 低饱和配色，深浅主题下都能看清
const COLORS = ['#2e7d5b', '#a63d40', '#8a6d3b', '#3a6ea5', '#6b4c9a', '#2e7d5b', '#a63d40', '#8a6d3b', '#3a6ea5', '#6b4c9a'];

export function getWordCloud(posts: CollectionEntry<'posts'>[]): CloudWord[] {
  const keywords = getKeywords(posts);
  if (keywords.length === 0) return [];

  // 固定种子伪随机，构建可复现
  let seed = 20261126;
  const rand = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;

  const placed: (CloudWord & { w: number; h: number })[] = [];

  keywords.forEach(([word, count], rank) => {
    const size = SIZES[rank];
    const rotate = ANGLES[rank];
    const rad = Math.abs(rotate) * Math.PI / 180;
    const vertical = Math.abs(rotate) === 90;
    // 旋转后的外接矩形：竖排时宽高互换
    const w = (vertical ? size * 1.2 : word.length * size * 0.94) + 1;
    const h = (vertical ? word.length * size * 0.94 : size * 1.2) + 1;

    let best = { x: 0, y: 0, score: Infinity };
    for (let attempt = 0; attempt < 600; attempt++) {
      const x = Math.floor(rand() * Math.max(1, CLOUD_W - w));
      const y = Math.floor(rand() * Math.max(1, CLOUD_H - h));
      let overlap = 0;
      for (const p of placed) {
        const ox = Math.max(0, Math.min(x + w, p.x + p.w) - Math.max(x, p.x));
        const oy = Math.max(0, Math.min(y + h, p.y + p.h) - Math.max(y, p.y));
        overlap += ox * oy;
      }
      // 零重叠是硬约束，其次越靠近中心越好，词才会真正挤成一团
      if (overlap > 0) continue;
      const cx = x + w / 2 - CLOUD_W / 2;
      const cy = y + h / 2 - CLOUD_H / 2;
      const score = cx * cx + cy * cy;
      if (score < best.score) best = { x, y, score };
      if (Math.abs(cx) < 12 && Math.abs(cy) < 12) break;
    }

    placed.push({ word, count, x: best.x, y: best.y, size, rotate, color: COLORS[rank], w, h });
  });

  return placed;
}
