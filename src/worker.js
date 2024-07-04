import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

class MyPipeline {
  static task = 'question-answering';
  static model = 'Xenova/distilbert-base-cased-distilled-squad';
  static instance = null;

  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      try {
        this.instance = await pipeline(this.task, this.model, { progress_callback });
        self.postMessage({ status: 'ready' });  // Inform the main thread that the model is ready
      } catch (error) {
        console.error('Error loading the model:', error);
        self.postMessage({
          status: 'error',
          error: error.message,
        });
      }
    }
    return this.instance;
  }
}

self.addEventListener('message', async (event) => {
  let answerer = await MyPipeline.getInstance(x => {
    self.postMessage({ status: 'progress', ...x });
  });

  if (answerer) {
    try {
      let output = await answerer(event.data.question, event.data.context);
      self.postMessage({
        status: 'complete',
        output: output.answer,
        score: output.score,
      });
    } catch (error) {
      console.error('Error during question answering:', error);
      self.postMessage({
        status: 'error',
        error: error.message,
      });
    }
  } else {
    self.postMessage({
      status: 'error',
      error: 'Model could not be loaded',
    });
  }
});
