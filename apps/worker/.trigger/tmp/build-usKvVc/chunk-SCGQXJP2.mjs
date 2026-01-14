import {
  computeContentHashSync,
  updateOrganization
} from "./chunk-OQADXJ3N.mjs";
import {
  task
} from "./chunk-BNK46XDO.mjs";
import {
  __name,
  init_esm
} from "./chunk-CEVTQX7C.mjs";

// src/jobs/scraping/scrape-org-batch.ts
init_esm();
var scrapeOrgBatch = task({
  id: "scrape-org-batch",
  retry: {
    maxAttempts: 2
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { organizations } = payload;
    console.log(`Scraping ${organizations.length} organization career pages`);
    const jinaApiKey = process.env.JINA_API_KEY;
    if (!jinaApiKey) {
      throw new Error("JINA_API_KEY not configured");
    }
    let updated = 0;
    let unchanged = 0;
    let errors = 0;
    for (const org of organizations) {
      try {
        const response = await fetch(`https://r.jina.ai/${org.careerPageUrl}`, {
          headers: {
            Authorization: `Bearer ${jinaApiKey}`
          }
        });
        if (!response.ok) {
          console.error(
            `Failed to scrape ${org.careerPageUrl}: ${response.status}`
          );
          errors++;
          continue;
        }
        const content = await response.text();
        const newContentHash = computeContentHashSync(content);
        if (newContentHash === org.contentHash) {
          unchanged++;
          continue;
        }
        await updateOrganization(org.id, {
          contentHash: newContentHash
        });
        updated++;
      } catch (error) {
        console.error(`Error scraping org ${org.id}:`, error);
        errors++;
      }
    }
    return {
      total: organizations.length,
      updated,
      unchanged,
      errors
    };
  }, "run")
});

export {
  scrapeOrgBatch
};
//# sourceMappingURL=chunk-SCGQXJP2.mjs.map
