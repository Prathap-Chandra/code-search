import asyncio

from retrieval.model_call import async_call_model, LLAMA_70B, call_model
import time
import multiprocessing as mp


class AysncIOProcessor:
  def __init__(self, concurrency = 100):
    self.concurrency = concurrency
  
  async def process(self, func, iterable):
    sem = asyncio.Semaphore(self.concurrency)

    async def concurrent_task(task):
      async with sem:
        return await task
    
    results = await asyncio.gather(*[concurrent_task(func(*i)) for i in iterable])
    return results


class MultiprocessingProcessor:
  def __init__(self, concurrency = 100):
    self.concurrency = concurrency
  
  def process(self, func, iterable):
    with mp.Pool(self.concurrency) as pool:
      results = pool.starmap(func, iterable)
      return results

async def foo(i):
  return i

if __name__ == "__main__":
  # processor = AysncIOProcessor(concurrency=10)
  processor = MultiprocessingProcessor(concurrency=10)

  tasks = [(LLAMA_70B, "hi") for i in range(30)]

  # Parallel
  start_time = time.time()
  # results = asyncio.run(processor.process(async_call_model, tasks))
  results = processor.process(call_model, tasks)
  print("Parallel took:", time.time() - start_time)

  # Serial  
  start_time = time.time()
  for task in tasks:
    call_model(*task)
  print("Serial took:", time.time() - start_time)

  # print(results)

