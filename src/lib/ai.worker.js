import { pipeline, TextStreamer, env } from '@huggingface/transformers';
env.allowLocalModels = false;
try { env.backends.onnx.wasm.numThreads = 1; } catch { /* older builds */ }

let gen = null, cfgs = [], at = -1, modelId = null;
const post = (m) => self.postMessage(m);
const fmt = (e) => (typeof e === 'number' ? `the AI runtime crashed (code ${e}), usually a memory or hardware limit` : e?.message || String(e));

// navigator.gpu can exist while no usable GPU adapter does, which crashes the runtime.
async function gpuUsable() {
  try { return !!self.navigator?.gpu && !!(await self.navigator.gpu.requestAdapter()); } catch { return false; }
}

async function build(i, progress_callback) {
  try { await gen?.dispose?.(); } catch { /* ignore */ }
  gen = null;
  const [device, dtype] = cfgs[i];
  gen = await pipeline('text-generation', modelId, { device, dtype, progress_callback });
  at = i;
}

const run = (id, messages) => gen(messages, {
  max_new_tokens: 380, do_sample: true, temperature: 0.7, top_p: 0.9,
  streamer: new TextStreamer(gen.tokenizer, {
    skip_prompt: true, skip_special_tokens: true,
    callback_function: (token) => post({ type: 'token', id, token }),
  }),
});

self.onmessage = async ({ data }) => {
  const { type, id } = data;
  try {
    if (type === 'load') {
      modelId = data.modelId;
      cfgs = [...(data.webgpu && (await gpuUsable()) ? [['webgpu', 'q4']] : []), ['wasm', 'q8'], ['wasm', 'q4']];
      const errs = [];
      for (let i = 0; i < cfgs.length; i++) {
        try { await build(i, (p) => post({ type: 'progress', progress: p })); return post({ type: 'ready', id, device: cfgs[i][0] }); }
        catch (e) { errs.push(`${cfgs[i].join('/')}: ${fmt(e)}`); }
      }
      throw new Error(errs.join(' | '));
    }
    if (type === 'generate') {
      if (!gen) throw new Error('The model is not loaded.');
      const errs = [];
      for (let i = at; i < cfgs.length; i++) {
        try {
          if (i !== at) await build(i);
          const out = await run(id, data.messages);
          const last = out[0].generated_text;
          return post({ type: 'done', id, text: Array.isArray(last) ? last.at(-1).content : last, device: cfgs[at][0] });
        } catch (e) { errs.push(`${cfgs[i].join('/')}: ${fmt(e)}`); }
      }
      throw new Error(errs.join(' | '));
    }
  } catch (e) {
    post({ type: 'error', id, message: fmt(e) });
  }
};
