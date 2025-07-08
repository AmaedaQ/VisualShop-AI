const db = require('../config/db');

const VALID_EVENT_TYPES = new Set(['view', 'add_to_cart', 'purchased', 'review', 'order']);

const Interaction = {
  create: async ({ user_id = null, visitor_id = null, item_id, event_type, metadata = null }) => {
    // Validate event type
    if (!VALID_EVENT_TYPES.has(event_type)) {
      throw new Error(`Invalid event type: ${event_type}`);
    }

    // Ensure either user_id or visitor_id is set
    if (!user_id && !visitor_id) {
      throw new Error('Either user_id or visitor_id must be provided');
    }

    // Ensure metadata is properly formatted
    const formattedMetadata = metadata ? JSON.stringify(metadata) : null;

    const [result] = await db.pool.execute(
      `INSERT INTO interactions (user_id, visitor_id, item_id, event_type, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      [user_id, visitor_id, item_id, event_type, formattedMetadata]
    );
    return result;
  }
};

module.exports = Interaction;