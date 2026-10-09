"use server";

import { revalidatePath } from "next/cache";

// TODO: replace the bodies with real persistence.
export async function updateReading(id: string, quantity: number) {
  console.log("update reading", id, quantity);
  revalidatePath("/properties/[id]", "page");
}

export async function deleteReading(id: string) {
  console.log("delete reading", id);
  revalidatePath("/properties/[id]", "page");
}
