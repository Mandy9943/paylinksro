"use server";
import { revalidatePath } from "next/cache";

export const revalidatePaymentLink = async (slug: string) => {
  revalidatePath(`/p/${slug}`);
};
