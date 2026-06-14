import React from "react";

export default function Home({setPage,addToCart,components}){
  const {Hero,Stats,PacksSection,MarseilleSection,DeliverySection,PhoneSection,SnapchatSection,ProductsPage,Reviews} = components;
  return (
    <>
      <Hero setPage={setPage}/>
      <Stats/>
      <PacksSection setPage={setPage}/>
      <MarseilleSection/>
      <DeliverySection/>
      <PhoneSection/>
      <SnapchatSection/>
      <ProductsPage addToCart={addToCart}/>
      <Reviews/>
    </>
  );
}
