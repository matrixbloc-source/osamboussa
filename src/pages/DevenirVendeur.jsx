import React, {useState} from "react";
import { motion } from 'framer-motion';
import UploadField from "../components/market/UploadField.jsx";

export default function DevenirVendeur(){
  const [form,setForm]=useState({shop:"",vendor:"",city:"",tel:"",wa:"",email:"",desc:"",address:"",types:"",hours:"",delivery:false,pickup:false});
  const [logo,setLogo]=useState(null);
  const [photos,setPhotos]=useState([]);
  const [errors,setErrors]=useState({});
  const [success,setSuccess]=useState(false);
  const [loading,setLoading]=useState(false);

  const validate = ()=>{
    const e = {};
    if(!form.shop.trim()) e.shop = "Nom du commerce requis";
    if(!form.vendor.trim()) e.vendor = "Votre nom requis";
    if(!form.city.trim()) e.city = "Ville requise";
    if(!form.tel.trim()) e.tel = "Téléphone requis";
    if(!form.email.trim()) e.email = "Email requis";
    if(!form.email.includes('@')) e.email = "Email invalide";
    if(!form.desc.trim()) e.desc = "Description requise";
    if(!form.types.trim()) e.types = "Spécialités requises";
    if(!logo) e.logo = "Logo requis";
    if(photos.length===0) e.photos = "Photos requises";
    if(!form.delivery && !form.pickup) e.modes = "Mode de livraison requis";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const submit= async (e)=>{
    e.preventDefault();
    if(!validate()) return;
    setLoading(true);
    await new Promise(resolve=>setTimeout(resolve,1000));
    console.log('Candidature vendeur',form,logo,photos);
    setSuccess(true);
    setLoading(false);
    setTimeout(()=>{
      setForm({shop:"",vendor:"",city:"",tel:"",wa:"",email:"",desc:"",address:"",types:"",hours:"",delivery:false,pickup:false});
      setLogo(null);
      setPhotos([]);
      setSuccess(false);
    },2500);
  };

  return (
    <motion.section initial={{opacity:0, y:10}} animate={{opacity:1,y:0}} transition={{duration:0.45}} style={{padding:'24px',maxWidth:'900px',margin:"80px auto"}}>
      {success && (
        <motion.div initial={{opacity:0,y:-8}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{background:'linear-gradient(135deg,rgba(74,222,128,.15),rgba(201,168,76,.15))',border:'1px solid #4ADE80',borderRadius:12,padding:16,marginBottom:16,color:'#4ADE80',textAlign:'center'}}>
          <div style={{fontWeight:700}}>✔ Candidature envoyée avec succès !</div>
          <div style={{fontSize:13,marginTop:4}}>Nous vous contacterons dans les 48 heures.</div>
        </motion.div>
      )}
      <div style={{background:'#0D0D0D',border:'1px solid rgba(201,168,76,.06)',borderRadius:14,padding:'24px'}}>
        <h2 className="pf" style={{fontSize:'clamp(24px, 5vw, 32px)',color:'#E8D5A3',marginBottom:6}}>Devenir vendeur Osamboussa</h2>
        <p style={{color:'#9A9A8A',marginBottom:18,fontSize:'14px'}}>Rejoignez notre sélection premium. * = Champs obligatoires</p>
        <form onSubmit={submit} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))',gap:14}}>
          
          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Nom du commerce *</label>
            <input placeholder="Ex: Samboussa du Marché" value={form.shop} onChange={e=>setForm({...form,shop:e.target.value})} style={{padding:10,borderColor:errors.shop?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.shop && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.shop}</div>}
          </div>

          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Votre nom *</label>
            <input placeholder="Prénom Nom" value={form.vendor} onChange={e=>setForm({...form,vendor:e.target.value})} style={{padding:10,borderColor:errors.vendor?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.vendor && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.vendor}</div>}
          </div>

          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Ville *</label>
            <input placeholder="Ex: Paris" value={form.city} onChange={e=>setForm({...form,city:e.target.value})} style={{padding:10,borderColor:errors.city?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.city && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.city}</div>}
          </div>

          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Téléphone *</label>
            <input placeholder="+33 6..." value={form.tel} onChange={e=>setForm({...form,tel:e.target.value})} style={{padding:10,borderColor:errors.tel?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.tel && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.tel}</div>}
          </div>

          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>WhatsApp</label>
            <input placeholder="Même numéro ou différent" value={form.wa} onChange={e=>setForm({...form,wa:e.target.value})} style={{padding:10,fontSize:'14px'}} />
          </div>

          <div>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Email *</label>
            <input placeholder="contact@email.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{padding:10,borderColor:errors.email?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.email && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.email}</div>}
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Adresse</label>
            <input placeholder="Rue, numéro" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} style={{padding:10,fontSize:'14px'}} />
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Spécialités *</label>
            <input placeholder="Ex: Traditionnel, Fromage, Bœuf, Poulet" value={form.types} onChange={e=>setForm({...form,types:e.target.value})} style={{padding:10,borderColor:errors.types?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.types && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.types}</div>}
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Horaires</label>
            <input placeholder="Ex: Lun–Dim 10:00–22:00" value={form.hours} onChange={e=>setForm({...form,hours:e.target.value})} style={{padding:10,fontSize:'14px'}} />
          </div>

          <div style={{gridColumn:'1 / -1'}}>
            <label style={{fontSize:12,color:'#9A9A8A',display:'block',marginBottom:6}}>Description *</label>
            <textarea placeholder="Décrivez votre commerce, vos spécialités et ce qui vous rend unique..." value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} style={{minHeight:100,padding:10,borderColor:errors.desc?'#FF6B6B':'rgba(201,168,76,.2)',fontSize:'14px'}} />
            {errors.desc && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.desc}</div>}
          </div>

          <div style={{gridColumn:'1 / -1',display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))',gap:12}}>
            <div>
              <UploadField label="Upload logo *" multiple={false} onChange={files=>setLogo(files[0]||null)} />
              {logo && <div style={{color:'#4ADE80',fontSize:12,marginTop:6}}>✔ Logo sélectionné ({logo.name})</div>}
              {errors.logo && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.logo}</div>}
            </div>
            <div>
              <UploadField label="Upload photos *" multiple={true} onChange={files=>setPhotos(files)} />
              {photos.length>0 && <div style={{color:'#4ADE80',fontSize:12,marginTop:6}}>✔ {photos.length} photo(s) sélectionnée(s)</div>}
              {errors.photos && <div style={{color:'#FF6B6B',fontSize:11,marginTop:4}}>{errors.photos}</div>}
            </div>
          </div>

          <div style={{gridColumn:'1 / -1',display:'flex',flexWrap:'wrap',gap:12}}>
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={form.delivery} onChange={e=>setForm({...form,delivery:e.target.checked})}/> 
              <span style={{fontSize:13}}>Livraison disponible</span>
            </label>
            <label style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={form.pickup} onChange={e=>setForm({...form,pickup:e.target.checked})}/> 
              <span style={{fontSize:13}}>Retrait sur place</span>
            </label>
          </div>
          {errors.modes && <div style={{color:'#FF6B6B',fontSize:11,gridColumn:'1 / -1'}}>{errors.modes}</div>}

          <div style={{gridColumn:'1 / -1',display:'flex',justifyContent:'flex-end',gap:12,marginTop:8,flexWrap:'wrap'}}>
            <button className="btn-o" type="button" onClick={()=>{setForm({shop:"",vendor:"",city:"",tel:"",wa:"",email:"",desc:"",address:"",types:"",hours:"",delivery:false,pickup:false});setLogo(null);setPhotos([]);setErrors({});}} style={{padding:'12px 18px',borderRadius:10,fontSize:'14px',minWidth:'120px'}}>Réinitialiser</button>
            <button className="btn-g" type="submit" disabled={loading} style={{padding:'12px 18px',borderRadius:10,fontSize:'14px',minWidth:'160px',opacity:loading?0.6:1,cursor:loading?'not-allowed':'pointer'}}>
              {loading ? 'Envoi...' : 'Envoyer candidature'}
            </button>
          </div>
        </form>
      </div>
    </motion.section>
  );
}

