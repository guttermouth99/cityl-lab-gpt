import {
  classifyJob
} from "./chunk-PG3NES3I.mjs";
import {
  db,
  eq,
  getJobById,
  jobs
} from "./chunk-OQADXJ3N.mjs";
import {
  task
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/classification/classify-job.ts
init_esm();
var classifyJobTask = task({
  id: "classify-job",
  retry: {
    maxAttempts: 3
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { jobId } = payload;
    const job = await getJobById(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }
    console.log(`Classifying job: ${job.title}`);
    const result = await classifyJob({
      title: job.title,
      description: job.description,
      organizationName: job.organization?.name
    });
    console.log("Classification result:", result);
    await db.update(jobs).set({
      jobType: result.jobType,
      jobBranch: result.jobBranch,
      remoteType: result.remoteType,
      experienceLevel: result.experienceLevel,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(jobs.id, jobId));
    return {
      jobId,
      title: job.title,
      classification: result
    };
  }, "run")
});

export {
  classifyJobTask
};
//# sourceMappingURL=chunk-PDGO3WWF.mjs.map
