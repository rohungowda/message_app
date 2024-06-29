const Queue = require('bull');

const {handler} = require('./cache_jobs.js')

const cache_queue = new Queue('queue_1');


cache_queue.process(async (job) => {
    const response = await handler(job.data);
    return response
});



exports.cache_queue = cache_queue
