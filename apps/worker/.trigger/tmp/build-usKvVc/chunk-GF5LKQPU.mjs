import { task } from "./chunk-BNK46XDO.mjs";
import { __name, init_esm } from "./chunk-CEVTQX7C.mjs";
import { getOrganizationById, updateOrganization } from "./chunk-OQADXJ3N.mjs";
import { classifyOrganization } from "./chunk-PG3NES3I.mjs";

// src/jobs/classification/classify-organization.ts
init_esm();
var classifyOrganizationTask = task({
  id: "classify-organization",
  retry: {
    maxAttempts: 3,
  },
  run: /* @__PURE__ */ __name(async (payload) => {
    const { organizationId } = payload;
    const org = await getOrganizationById(organizationId);
    if (!org) {
      throw new Error(`Organization ${organizationId} not found`);
    }
    console.log(`Classifying organization: ${org.name}`);
    const result = await classifyOrganization({
      name: org.name,
      url: org.url || void 0,
    });
    console.log("Classification result:", result);
    if (result.confidence > 0.7) {
      await updateOrganization(organizationId, {
        isImpact: result.isImpact,
      });
    }
    return {
      organizationId,
      name: org.name,
      isImpact: result.isImpact,
      confidence: result.confidence,
      reason: result.reason,
    };
  }, "run"),
});

export { classifyOrganizationTask };
//# sourceMappingURL=chunk-GF5LKQPU.mjs.map
