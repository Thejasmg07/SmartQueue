import Token from "../models/Token.js";

/**
 * Utility to generate a safely incremented token ID specific to a service.
 * Looks at ALL tokens ever created (including completed/skipped) to find
 * the true max and avoid collisions after history clears.
 * @param {ObjectId} serviceId - The MongoDB _id of the service.
 * @returns {String} e.g., 'A101'
 */
export const generateNextTokenId = async (serviceId) => {
  // Sort by creation time descending — the latest token has the highest number
  const lastToken = await Token.findOne({ serviceId })
    .sort({ createdAt: -1 })
    .select("tokenId")
    .lean();

  if (!lastToken) return "A101";

  const match = lastToken.tokenId.match(/^A(\d+)$/);
  if (!match) return "A101";

  const next = parseInt(match[1], 10) + 1;
  return `A${next}`;
};
