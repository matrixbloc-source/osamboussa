import React from "react";

export default function Commande({cart,setCart,components}){
  const {CommandePage} = components;
  return <CommandePage cart={cart} setCart={setCart}/>;
}
