import service from "@/plugins/service";

export const getScoreCategories = () => {
  return service.get("/scoreCategories/all");
};

export const getScoreCategoriesList = ()=>{
  return service.get("/scoreCategories");
}

export const addScoreCategory = (obj) => {
  return service.post("/scoreCategories", obj);
}

export const deleteScoreCategory = (id) => {
  return service.delete(`/scoreCategories/${id}`);
}

export const updateScoreCategory = (obj) => {
  return service.put(`/scoreCategories`, obj);
}