const assets = "./xy/poi/";
// 标签不设 size：SDK 按文字自适应宽高，textOffset 为左右 / 上下留白，文字水平垂直居中。
const defaults = {
  building: { color: "bffcf0", offset: [21, 10] },
  camera: { color: "ffddaa", offset: [21, 11] },
  device: { color: "dfdbff", offset: [21, 10] },
};

export function campusPoiStyles(overrides = {}) {
  return Object.fromEntries(Object.entries(defaults).map(([kind, label]) => [kind, {
    icon: { url: `${assets}${kind}.svg`, size: [34, 42], ...overrides[kind]?.icon },
    label: { backgroundUrl: `${assets}label.svg`, textOffset: [10, 4], fontSize: 13, align: "Center", ...label, ...overrides[kind]?.label },
  }]));
}
