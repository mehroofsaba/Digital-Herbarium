// Models that run in the browser through Transformers.js, plus the built-in composer.
export const COMPOSER = 'composer';
export const MODELS = [
  { id: 'onnx-community/Qwen2.5-0.5B-Instruct', label: 'Qwen2.5 0.5B Instruct', size: '~400 MB, quickest' },
  { id: 'onnx-community/Qwen2.5-1.5B-Instruct', label: 'Qwen2.5 1.5B Instruct', size: '~1 GB, richer prose' },
  { id: 'HuggingFaceTB/SmolLM2-360M-Instruct', label: 'SmolLM2 360M Instruct', size: '~300 MB, lightest' },
  { id: COMPOSER, label: 'Built-in composer', size: 'instant, no download' },
];
