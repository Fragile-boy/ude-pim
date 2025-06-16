import service from "@/plugins/service";

export const getScoreCategories = () => {
  return service.get("/scoreCategories/all");
};