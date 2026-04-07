function mapProductToSearch(product) {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    categoryNames: product.Categories
      ? product.Categories.map(c => c.name)
      : []
  };
}

module.exports = mapProductToSearch;
