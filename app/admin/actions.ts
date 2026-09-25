"use server";

import { revalidatePath } from "next/cache";

// Chamado pelo painel depois de salvar/excluir produtos para que a home
// mostre as mudanças na hora, sem esperar o revalidate de 60s.
export async function revalidateHome() {
  revalidatePath("/");
}
