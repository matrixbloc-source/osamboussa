import React from "react";
import {useNavigate} from "react-router-dom";

const CITIES = ["Paris","Marseille","Lyon","Bordeaux","Toulouse","Nice","Lille","Strasbourg"];

export default function Villes(){
  const nav = useNavigate();
  return (
    <section style={{padding:24,maxWidth:900,margin:"80px auto"}}>
      <h2 className="pf" style={{fontSize:28}}>Villes</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginTop:12}}>
        {CITIES.map(c=>(
          <div key={c} onClick={()=>nav(`/vendeurs?city=${encodeURIComponent(c)}`)} style={{cursor:"pointer",background:"#111",padding:18,borderRadius:10,border:"1px solid rgba(201,168,76,.06)"}}>
            <div style={{fontWeight:700}}>{c}</div>
            <div style={{color:"#9A9A8A",fontSize:13}}>Voir les vendeurs</div>
          </div>
        ))}
      </div>
    </section>
  );
}
