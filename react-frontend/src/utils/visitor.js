// utils/visitor.js
export const getVisitorId = () => {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
      id = crypto.randomUUID(); // Generates a unique, persistent ID for guest
      localStorage.setItem('visitor_id', id);
    }
    return id;
  };
  