export const CHART_COLORS = {
  // Existing
  PRIMARY: "#3c70ff",
  SECONDARY: "#36a2eb",

  QUANTITY: "#36A2EB",
  EFFICIENCY: "#4CAF50",
  TIMELINESS: "#FFCE56",
  AVERAGE: "#8884d8",

  PIE_PALETTE: ["#3c70ff", "#36a2eb", "#4CAF50", "#FFCE56", "#FF7F50"],

  LINE: "#3c70ff",
  SCATTER: "#8884d8",

  // 🔹 NEW: Audit Log Action Colors
  AUDIT_ACTIONS: {
    CREATE: "#4CAF50",      // Green → creation / positive
    UPDATE: "#36A2EB",      // Blue → modification
    DELETE: "#E53935",      // Red → destructive
    ARCHIVE: "#8D6E63",     // Brown → storage
    DEACTIVATE: "#FB8C00",  // Orange → restricted
    REACTIVATE: "#43A047",  // Green → recovery
    LOGIN: "#5C6BC0",       // Indigo → access
    LOGOUT: "#9E9E9E",      // Gray → neutral
    REGISTER: "#26A69A",    // Teal → onboarding
    SYSTEM: "#BDBDBD",      // Light gray → system-generated
  },

  // 🔹 Optional fallback palette for unknown actions
  AUDIT_FALLBACK: [
    "#3c70ff",
    "#36a2eb",
    "#4CAF50",
    "#FFCE56",
    "#FF7F50",
    "#8884d8",
  ],
};

export default CHART_COLORS;
