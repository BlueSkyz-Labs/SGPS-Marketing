export function findUnpublishedProductNameLeaks(products, outputs) {
  const unpublishedProducts = products.filter((product) => !product.public);

  return outputs.flatMap(({ path, contents }) =>
    unpublishedProducts
      .filter((product) =>
        contents.toLocaleLowerCase().includes(product.name.toLocaleLowerCase()),
      )
      .map((product) => `${path}: ${product.name}`),
  );
}
