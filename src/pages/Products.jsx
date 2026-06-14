import React from "react";

export default function Products({addToCart,components}){
  const {ProductsPage} = components;
  return <ProductsPage addToCart={addToCart}/>;
}
