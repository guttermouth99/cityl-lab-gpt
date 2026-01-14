import { getOrganizationById, updateOrganization } from "@baito/db/queries";
import { classifyOrganization as classifyOrgLLM } from "@baito/llm";
import { task } from "@trigger.dev/sdk";

export const classifyOrganizationTask = task({
  id: "classify-organization",
  retry: {
    maxAttempts: 3,
  },
  run: async (payload: { organizationId: string }) => {
    const { organizationId } = payload;

    const org = await getOrganizationById(organizationId);
    if (!org) {
      throw new Error(`Organization ${organizationId} not found`);
    }

    console.log(`Classifying organization: ${org.name}`);

    // Use LLM to classify the organization
    const result = await classifyOrgLLM({
      name: org.name,
      url: org.url || undefined,
    });

    console.log("Classification result:", result);

    // Update the organization with classification
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
  },
});
