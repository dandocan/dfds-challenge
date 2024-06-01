import { CreateVoyageBody } from "~/pages";

export async function createVoyage(requestBody: CreateVoyageBody) {
  const route = "/api/voyage/create";

  const response = await fetch(route, {
    method: "POST",
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error("Request failed");
  }
  return true;
}
