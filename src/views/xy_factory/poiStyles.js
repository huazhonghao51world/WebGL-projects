const assets = "./xy/poi/";
const defaults = {
  building: { color: "bffcf0", size: [102, 27], offset: [21, 10] },
  camera: { color: "ffddaa", size: [77, 26], offset: [21, 11] },
  device: { color: "dfdbff", size: [112, 28], offset: [21, 10] },
};

export function campusPoiStyles(overrides = {}) {
  return Object.fromEntries(Object.entries(defaults).map(([kind, label]) => [kind, {
    icon: { url: `${assets}${kind}.svg`, size: [34, 42], ...overrides[kind]?.icon },
    label: { backgroundUrl: `${assets}label.svg`, textOffset: [7, 4], fontSize: 13, ...label, ...overrides[kind]?.label },
  }]));
}
