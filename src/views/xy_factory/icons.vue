<template>
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="paths[name] || paths.overview" /></svg>
</template>

<script>
const paths = {
  overview: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  building: "M3 21h18M6 21V5l12-2v18M9 8h1m4 0h1m-6 4h1m4 0h1m-6 4h1m4 0h1m-4 5v-2h2v2",
  camera: "M3 6h13v12H3zM16 10l5-3v10l-5-3",
  device: "M6 6h12v12H6zM9 9h6v6H9zM3 9h3m-3 6h3m12-6h3m-3 6h3M9 3v3m6-3v3m-6 12v3m6-3v3",
  alarm: "M5 17h14l-2-3V9A5 5 0 0 0 7 9v5l-2 3Zm5 3a2 2 0 0 0 4 0",
  warehouse: "M3 21V8l9-5 9 5v13M3 21h18M7 21v-9h10v9M7 16h10",
  energy: "m13 2-9 12h7l-1 8 10-12h-7l1-8Z",
  safety: "M12 3 4 6v5c0 5 3 8 8 10 5-2 8-5 8-10V6l-8-3Zm-3 9 2 2 4-4",
  production: "M3 21h18V9l-7 4V8l-7 4V4H3v17Zm4-4h2m3 0h2m3 0h2",
  layout: "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  environment: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z",
  assistant: "m12 3 2.5 6.5 6.5 2.5-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Zm7 0v4m-2-2h4",
  search: "M15.5 15.5 21 21M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z",
  chevron: "m9 6 6 6-6 6",
  target: "M12 3v4m0 10v4M3 12h4m10 0h4m-3 0a6 6 0 1 1-12 0 6 6 0 0 1 12 0Zm-5 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
  measure: "m3 15 12-12 6 6L9 21l-6-6Zm7-7 2 2m1-5 2 2m-8 4 2 2m-5 1 2 2",
  position: "m4 10 16-6-6 16-3-7-7-3Z",
  route: "M7 20h10a3 3 0 0 0 0-6H7a3 3 0 0 1 0-6h10M4 20a2 2 0 1 0 4 0 2 2 0 0 0-4 0ZM16 8a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z",
  panel: "M3 5h18v14H3zM9 5v14m6-14v14",
  info: "M12 11v5m0-8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  product: "M21 8 12 3 3 8v8l9 5 9-5V8ZM3 8l9 5 9-5M12 13v8",
  arrow: "M4 12h15m-5-5 5 5-5 5",
};
export default { name: "XYIcon", props: { name: String }, data: () => ({ paths }) };
</script>
