# XY 园区 POI 样式

业务点位的坐标和类型由 `campus.js` 维护，`sceneAdapter.js` 调用项目公共 `createPOIs`，由 TwinSDK 在本地场景中创建实体。这个接口是前端封装，不是 HTTP 点位服务，也无需随场景包重新发布。对同一批点可以统一配置 `style`，单个点也可以通过 `item.style` 覆盖。公共接口示例：

```js
await createPOIs([{ location: [12, 4, 8], customId: 'site-a', label: '巡检点 A' }], {
  style: {
    icon: { url: './xy/poi/camera.svg', size: [34, 42] },
    label: {
      backgroundUrl: './xy/poi/label.svg',
      size: [96, 26], offset: [21, 11], textOffset: [7, 4],
      color: 'ffddaa', fontSize: 13, align: 'Left',
    },
  },
});
```

XY 默认应用建筑、监控、设备三类 SVG。在站点 `config.json` 的 `cases.xy` 下可设置 `poiStyles`；同目录的 `xy-scene.local.json` 也可以直接设置 `poiStyles`。只填需要覆盖的属性即可，例如：

```json
{
  "poiStyles": {
    "camera": {
      "icon": { "url": "https://assets.example.com/poi/camera.svg", "size": [34, 42] },
      "label": { "backgroundUrl": "./xy/poi/label.svg", "offset": [24, 8], "fontSize": 13 }
    }
  }
}
```

- 资源字段填 HTTP(S) 图片链接或相对于页面的链接。可选 `icon.activeUrl` 为交互状态图标；`icon.visible`、`label.visible` 可分别控制图标和标签。跨域资源需允许浏览器 CORS 读取；HTTPS 页面使用 HTTPS 图片。SVG 需以图片类型提供。
- `label.offset: [x, y]` 以图标底边中心的场景锚点为原点，定位标签背景左下角，向右、向上为正，单位为 CSS 像素。`label.textOffset: [x, y]` 控制标签内文字横向留白、上边距；`label.color` 为不带 `#` 的十六进制颜色。更新后刷新页面即可查看。
- 建筑和监控沿用已交付的园区坐标。设备没有真实坐标，设备与健康面板可临时显示一个明确标注的「设备演示点」，不计入真实设备数据。
