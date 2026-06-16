import React from "react";

export default function About(){
  const vals=[
    {ic:"🤲",t:"Artisanat authentique",d:"Chaque spécialité est préparée et assemblée à la main selon des traditions culinaires transmises de génération en génération."},
    {ic:"🌿",t:"Épices naturelles",d:"Nous sélectionnons les meilleures épices importées directement des Comores."},
    {ic:"❤️",t:"Fait avec amour",d:"Une passion familiale transmise de génération en génération."},
    {ic:"❄️",t:"Couscouma surgelé",d:"Galette artisanale pré-cuite, prête à réchauffer pour un goût authentique."},
  ];
  return(
    <div style={{minHeight:"100vh",paddingTop:130,paddingBottom:72,background:"#0A0A0A"}}>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:60,animation:"fadeUp .8s ease"}}>
          <p className="lbl" style={{marginBottom:14}}>✦ Notre histoire</p>
          <h2 className="pf" style={{fontSize:"clamp(32px,5vw,54px)",color:"#F5F0E8",lineHeight:1.15,marginBottom:16}}>
            L'art culinaire artisanal<br/><span className="gold-text">élevé au rang du luxe</span>
          </h2>
          <div className="divg" style={{maxWidth:180,margin:"0 auto"}}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:52,alignItems:"center",marginBottom:64}}>
          <div>
            <p style={{color:"#9A9A8A",fontSize:16,lineHeight:1.85,marginBottom:18}}>
              O'SAMBOUSSA est une marketplace culinaire artisanale ouverte aux saveurs africaines, asiatiques et de l'océan Indien. Notre objectif est de faire découvrir des spécialités authentiques du monde entier à travers des produits préparés avec soin et passion.
            </p>
            <p style={{color:"#9A9A8A",fontSize:16,lineHeight:1.85}}>
              Nos vendeurs préparent leurs spécialités selon des recettes traditionnelles transmises de génération en génération. Chaque produit incarne l'authenticité et la richesse culinaire des grandes traditions du monde.
            </p>
          </div>
          <div style={{position:"relative",borderRadius:16,overflow:"hidden",height:340}}>
            <img src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1400&q=80" alt="O'Samboussa" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            <div style={{position:"absolute",inset:0,background:"linear-gradient(0deg,rgba(10,10,10,.6) 0%,transparent 60%)"}}/>
            <div style={{position:"absolute",bottom:20,left:20}}>
              <span className="pf gold-shimmer" style={{fontSize:18,fontWeight:700,letterSpacing:2}}>O'SAMBOUSSA</span>
              <p style={{color:"rgba(245,240,232,.6)",fontSize:10,letterSpacing:3,marginTop:3}}>DEPUIS 2019</p>
            </div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:20}}>
          {vals.map(v=>(
            <div key={v.t} style={{background:"#161616",border:"1px solid rgba(201,168,76,.1)",borderRadius:14,padding:26,transition:"all .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.4)";e.currentTarget.style.transform="translateY(-4px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.1)";e.currentTarget.style.transform="none";}}>
              <span style={{fontSize:32,display:"block",marginBottom:14}}>{v.ic}</span>
              <h4 className="pf" style={{color:"#F5F0E8",fontSize:17,marginBottom:8}}>{v.t}</h4>
              <p style={{color:"#6B6B6B",fontSize:12,lineHeight:1.7}}>{v.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
