import React from "react";

export default function Contact(){
  const contacts=[
    {
      icon:"📞",label:"Téléphone",value:"+33 6 63 98 23 27",sub:"Réponse rapide · 7j/7",
      href:"tel:+33663982327",btnText:"📞 Appeler maintenant",
      col:"#4ADE80",btnStyle:{background:"linear-gradient(135deg,#166534,#22c55e)",color:"#fff"},
    },
    {
      icon:"✉️",label:"Email",value:"lalaprods@outlook.fr",sub:"Réponse sous 24h",
      href:"mailto:lalaprods@outlook.fr",btnText:"✉️ Envoyer un email",
      col:"#C9A84C",btnStyle:{background:"linear-gradient(135deg,#8A6E2F,#C9A84C,#E8D5A3)",color:"#0A0A0A"},
    },
    {
      icon:"📸",label:"Instagram",value:"@osamboussa_marseille",sub:"Suivez nos actualités",
      href:"https://www.instagram.com/osamboussa_marseille?igsh=ZW81emM5MzkyNGZ4&utm_source=qr",btnText:"📸 Voir l'Instagram",
      col:"#E1306C",btnStyle:{background:"linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045)"},
    },
    {
      icon:"👻",label:"Snapchat",value:"@osamboussa_marseille",sub:"Stories & coulisses",
      href:"https://snapchat.com/t/NfubQfhK",btnText:"👻 Ajouter sur Snap",
      col:"#FFFC00",btnStyle:{background:"linear-gradient(135deg,#FFFC00,#FFE600,#FFD700)",color:"#000"},
    },
  ];

  return(
    <div style={{minHeight:"100vh",paddingTop:130,paddingBottom:72,background:"#0A0A0A"}}>
      <div style={{maxWidth:680,margin:"0 auto",padding:"0 24px"}}>

        <div style={{textAlign:"center",marginBottom:52,animation:"fadeUp .8s ease"}}>
          <p className="lbl" style={{marginBottom:14}}>✦ Restons en contact</p>
          <h2 className="pf" style={{fontSize:"clamp(30px,5vw,48px)",color:"#F5F0E8",marginBottom:12}}>
            <span className="gold-text">Contactez-nous</span>
          </h2>
          <div className="divg" style={{maxWidth:160,margin:"0 auto 16px"}}/>
          <p style={{color:"#6B6B6B",fontSize:14,lineHeight:1.7}}>
            Commandez, posez vos questions ou suivez-nous sur les réseaux.
          </p>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:16,marginBottom:32}}>
          {contacts.map((c,i)=>(
            <div key={i} style={{
              background:"rgba(255,255,255,.03)",
              backdropFilter:"blur(12px)",
              border:"1px solid rgba(201,168,76,.15)",
              borderRadius:16,overflow:"hidden",
              transition:"all .3s",
              animation:`fadeUp .6s ease ${i*.12}s both`,
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.45)";e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 36px rgba(0,0,0,.4)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(201,168,76,.15)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}}>
              <div style={{height:2,background:`linear-gradient(90deg,transparent,${c.col},transparent)`}}/>
              <div style={{padding:"22px 24px",display:"flex",gap:18,alignItems:"center",flexWrap:"wrap"}}>
                <div style={{
                  width:52,height:52,borderRadius:14,flexShrink:0,
                  background:`rgba(255,255,255,.05)`,border:`1px solid ${c.col}30`,
                  display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,
                }}>
                  {c.icon}
                </div>
                <div style={{flex:1,minWidth:140}}>
                  <p style={{color:"#6B6B6B",fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:3}}>{c.label}</p>
                  <p style={{color:"#F5F0E8",fontSize:16,fontWeight:600,marginBottom:2}}>{c.value}</p>
                  <p style={{color:"#6B6B6B",fontSize:12}}>{c.sub}</p>
                </div>
                <a href={c.href} target={c.href.startsWith("http")?"_blank":"_self"} rel="noreferrer"
                  style={{
                    ...c.btnStyle,
                    padding:"11px 20px",borderRadius:10,
                    fontSize:12,fontWeight:700,letterSpacing:.8,textTransform:"uppercase",
                    textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,
                    transition:"all .3s",whiteSpace:"nowrap",flexShrink:0,
                    boxShadow:"0 4px 16px rgba(0,0,0,.3)",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.04)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.4)";}}
                  onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.3)";}}>
                  {c.btnText}
                </a>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background:"rgba(201,168,76,.04)",
          border:"1px solid rgba(201,168,76,.12)",
          borderRadius:14,padding:"26px 24px",textAlign:"center",
          position:"relative",overflow:"hidden",
        }}>
          <div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,rgba(201,168,76,.4),transparent)"}}/>
          <p className="pf gold-text" style={{fontSize:19,marginBottom:12}}>Horaires de disponibilité</p>
          <p style={{color:"#6B6B6B",fontSize:13,lineHeight:2.1}}>
            Lun – Ven : 10h → 21h<br/>
            Sam – Dim : 10h → 22h<br/>
            <span style={{color:"#C9A84C",fontWeight:500}}>Livraison disponible 7j/7 partout en France</span>
          </p>
        </div>

      </div>
    </div>
  );
}
