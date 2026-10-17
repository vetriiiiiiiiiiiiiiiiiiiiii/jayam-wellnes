// Shape Prisma records like the old Mongo documents so the frontend keeps working.
// Every record exposes both `id` and `_id`.

const withId = (obj) => (obj ? { ...obj, _id: obj.id } : obj);

// Relations to load whenever a product is returned to the client
const productInclude = {
  images: { orderBy: { position: "asc" } },
  specs: { orderBy: { position: "asc" } },
  variants: { orderBy: { position: "asc" } },
  bundleItems: { select: { id: true } },
};

const serializeProduct = (product) => {
  if (!product) return product;
  const { bundleItems, images, specs, variants, ...rest } = product;
  return withId({
    ...rest,
    images: (images || []).map(withId),
    specs: (specs || []).map(withId),
    variants: (variants || []).map(withId),
    relatedToIds: (bundleItems || []).map((p) => p.id),
  });
};

const serializeOrder = (order) =>
  order ? withId({ ...order, items: (order.items || []).map(withId) }) : order;

const serializeUser = (user) => {
  if (!user) return user;
  const { password, ...rest } = user;
  return withId({ ...rest, addresses: (rest.addresses || []).map(withId) });
};

const serializeReview = (review) => {
  if (!review) return review;
  const { product, ...rest } = review;
  const obj = withId(rest);
  // Admin views expect `productId` to be the populated product
  if (product) obj.productId = serializeProduct(product);
  return obj;
};

const serializeCart = (cart) => {
  if (!cart) return cart;
  return withId({
    ...cart,
    items: (cart.items || []).map(({ product, ...item }) =>
      withId({ ...item, productId: product ? serializeProduct(product) : item.productId })
    ),
  });
};

module.exports = {
  withId,
  productInclude,
  serializeProduct,
  serializeOrder,
  serializeUser,
  serializeReview,
  serializeCart,
};
