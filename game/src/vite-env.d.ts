/// <reference types="vite/client" />
declare module 'virtual:overrides' {
  const files: string[];
  export default files;
}
declare module '*.story?raw' {
  const src: string;
  export default src;
}
