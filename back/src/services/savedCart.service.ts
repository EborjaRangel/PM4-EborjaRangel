import { SavedCart } from "../entities/SavedCart";
import { SavedCartRepository } from "../repositories/savedCart.repository";
import { ClientError } from "../utils/errors";
import { assertCartItemsShape } from "../utils/validateCartItems";

export const getSavedCartByClientUserIdService = async (
  clientUserId: string
): Promise<SavedCart | null> => {
  const id = (clientUserId ?? "").toString().trim();
  if (!id) {
    throw new ClientError("clientUserId es obligatorio.", 400);
  }

  return await SavedCartRepository.findOne({
    where: { clientUserId: id },
  });
};

export const upsertSavedCartService = async (
  clientUserId: string,
  items: unknown[]
): Promise<SavedCart> => {
  const id = (clientUserId ?? "").toString().trim();
  if (!id) {
    throw new ClientError("clientUserId es obligatorio.", 400);
  }

  assertCartItemsShape(items);

  let row = await SavedCartRepository.findOne({
    where: { clientUserId: id },
  });

  if (!row) {
    row = SavedCartRepository.create({
      clientUserId: id,
      items,
    });
  } else {
    row.items = items;
  }

  return await SavedCartRepository.save(row);
};
