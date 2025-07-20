const useMapHelpers = () => {
  const mapHelpers = {
    getCrimeColor(category: string) {
      switch (category.toLowerCase()) {
        case "violent-crime":
          return "#dc2626";
        case "burglary":
          return "#ea580c";
        case "robbery":
          return "#d97706";
        case "theft-from-the-person":
          return "#ca8a04";
        case "vehicle-crime":
          return "#65a30d";
        case "other-theft":
          return "#059669";
        case "criminal-damage-arson":
          return "#0891b2";
        case "drugs":
          return "#7c3aed";
        case "public-order":
          return "#c026d3";
        case "anti-social-behaviour":
          return "#e11d48";
        default:
          return "#6b7280";
      }
    },
  };
  return mapHelpers;
};

export default useMapHelpers;
