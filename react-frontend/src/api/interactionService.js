
import axios from 'axios';
import { getVisitorId } from '../utils/visitor';

const API_BASE_URL = 'http://localhost:5000'; // Backend URL

export const logInteraction = async (item_id, event_type, metadata = {}, userId = null) => {
  // Get visitorId
  const visitorId = getVisitorId();
  
  // Prepare data for backend (intellicart-db)
  const backendData = {
    item_id,
    event_type,
    metadata,
  };

  try {
    // Send to backend (intellicart-db)
    await axios.post(`${API_BASE_URL}/api/interactions`, backendData, {
      headers: {
        'x-visitor-id': visitorId
      }
    });
    console.log(`Logged ${event_type} interaction for item ${item_id} in intellicart-db`);
  } catch (err) {
    console.error('Interaction logging failed:', err);
  }
};