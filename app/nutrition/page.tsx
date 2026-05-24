'use client'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/useAuth'
import AppShell from '@/components/AppShell'
import Loader from '@/components/Loader'
import dynamic from 'next/dynamic'

const BarcodeScanner = dynamic(() => import('@/components/BarcodeScanner'), { ssr: false })

// ─── Types ───────────────────────────────────────────────────────────────────
interface FoodItem  { name:string; he:string; cal:number; p:number; c:number; f:number; per:string }
interface FoodEntry extends FoodItem { qty:number }
interface Recipe    { id:string; name:string; foods:FoodEntry[] }
interface PhotoFood { name:string; grams:number; cal:number; p:number; c:number; f:number }
type Meal = 'Breakfast'|'Lunch'|'Dinner'|'Snacks'
type Log  = Record<Meal, FoodEntry[]>

// ─── Food Database ────────────────────────────────────────────────────────────
const FOODS: FoodItem[] = [
  // Proteins
  {name:'Chicken Breast (grilled)',   he:'חזה עוף צלוי',      cal:165,p:31,c:0, f:4,  per:'100g'},
  {name:'Turkey Breast',              he:'חזה הודו',           cal:157,p:30,c:0, f:3,  per:'100g'},
  {name:'Tuna (canned in water)',     he:'טונה בקופסה',        cal:116,p:26,c:0, f:1,  per:'100g'},
  {name:'Salmon (baked)',             he:'סלמון אפוי',         cal:208,p:28,c:0, f:10, per:'100g'},
  {name:'Shrimp (cooked)',            he:'שרימפס',             cal:99, p:24,c:0, f:0,  per:'100g'},
  {name:'Tilapia (baked)',            he:'טילפיה',             cal:96, p:20,c:0, f:2,  per:'100g'},
  {name:'Cod (baked)',                he:'בקלה',               cal:82, p:18,c:0, f:1,  per:'100g'},
  {name:'Ground Beef 90%',            he:'בשר טחון 90%',       cal:176,p:26,c:0, f:8,  per:'100g'},
  {name:'Sirloin Steak',              he:'סטייק סירלוין',      cal:207,p:26,c:0, f:11, per:'100g'},
  {name:'Ground Turkey 93%',          he:'הודו טחון',          cal:170,p:22,c:0, f:9,  per:'100g'},
  {name:'Whole Eggs',                 he:'ביצים',              cal:155,p:13,c:1, f:11, per:'100g'},
  {name:'Egg Whites',                 he:'חלבוני ביצה',        cal:52, p:11,c:1, f:0,  per:'100g'},
  {name:'Greek Yogurt (plain)',       he:'יוגורט יווני',       cal:89, p:10,c:4, f:5,  per:'100g'},
  {name:'Cottage Cheese',             he:'קוטג׳',              cal:98, p:11,c:3, f:4,  per:'100g'},
  {name:'Mozzarella',                 he:'מוצרלה',             cal:280,p:20,c:2, f:22, per:'100g'},
  {name:'Cheddar Cheese',             he:'צ׳דר',               cal:403,p:25,c:1, f:33, per:'100g'},
  {name:'Milk (whole)',               he:'חלב מלא',            cal:61, p:3, c:5, f:3,  per:'100ml'},
  {name:'Milk (skim)',                he:'חלב דל שומן',        cal:34, p:3, c:5, f:0,  per:'100ml'},
  {name:'Whey Protein Shake',         he:'שייק חלבון',         cal:120,p:25,c:3, f:2,  per:'30g scoop'},
  {name:'Tofu (firm)',                he:'טופו',               cal:76, p:8, c:2, f:4,  per:'100g'},
  {name:'Tempeh',                     he:'טמפה',               cal:193,p:19,c:9, f:11, per:'100g'},
  {name:'Edamame',                    he:'אדמאמה',             cal:121,p:11,c:9, f:5,  per:'100g'},
  {name:'Black Beans (cooked)',       he:'שעועית שחורה',       cal:132,p:9, c:24,f:1,  per:'100g'},
  {name:'Chickpeas (cooked)',         he:'חומוס',              cal:164,p:9, c:27,f:3,  per:'100g'},
  {name:'Lentils (cooked)',           he:'עדשים',              cal:116,p:9, c:20,f:0,  per:'100g'},
  // Carbs
  {name:'White Rice (cooked)',        he:'אורז לבן',           cal:130,p:3, c:28,f:0,  per:'100g'},
  {name:'Brown Rice (cooked)',        he:'אורז מלא',           cal:111,p:3, c:23,f:1,  per:'100g'},
  {name:'Oats (dry)',                 he:'שיבולת שועל',        cal:389,p:17,c:66,f:7,  per:'100g'},
  {name:'Pasta (cooked)',             he:'פסטה',               cal:158,p:6, c:31,f:1,  per:'100g'},
  {name:'Quinoa (cooked)',            he:'קינואה',             cal:120,p:4, c:22,f:2,  per:'100g'},
  {name:'Sweet Potato',              he:'בטטה',               cal:86, p:2, c:20,f:0,  per:'100g'},
  {name:'Potato (boiled)',            he:'תפוח אדמה',          cal:87, p:2, c:20,f:0,  per:'100g'},
  {name:'White Bread',                he:'לחם לבן',            cal:265,p:9, c:49,f:3,  per:'100g'},
  {name:'Whole Wheat Bread',          he:'לחם מלא',            cal:247,p:13,c:41,f:3,  per:'100g'},
  {name:'Pita Bread',                 he:'פיתה',               cal:275,p:9, c:56,f:1,  per:'100g'},
  {name:'Tortilla (flour)',           he:'טורטייה',            cal:303,p:8, c:50,f:8,  per:'100g'},
  {name:'Granola',                    he:'גרנולה',             cal:489,p:11,c:66,f:20, per:'100g'},
  {name:'Banana',                     he:'בננה',               cal:89, p:1, c:23,f:0,  per:'1 medium'},
  {name:'Apple',                      he:'תפוח',               cal:52, p:0, c:14,f:0,  per:'100g'},
  {name:'Orange',                     he:'תפוז',               cal:47, p:1, c:12,f:0,  per:'100g'},
  {name:'Mango',                      he:'מנגו',               cal:60, p:1, c:15,f:0,  per:'100g'},
  {name:'Strawberries',               he:'תות שדה',            cal:32, p:1, c:8, f:0,  per:'100g'},
  {name:'Blueberries',                he:'אוכמניות',           cal:57, p:1, c:14,f:0,  per:'100g'},
  {name:'Grapes',                     he:'ענבים',              cal:67, p:1, c:17,f:0,  per:'100g'},
  {name:'Watermelon',                 he:'אבטיח',              cal:30, p:1, c:8, f:0,  per:'100g'},
  {name:'Pineapple',                  he:'אננס',               cal:50, p:1, c:13,f:0,  per:'100g'},
  // Fats
  {name:'Olive Oil',                  he:'שמן זית',            cal:884,p:0, c:0, f:100,per:'100ml'},
  {name:'Avocado',                    he:'אבוקדו',             cal:160,p:2, c:9, f:15, per:'100g'},
  {name:'Peanut Butter',              he:'חמאת בוטנים',        cal:588,p:25,c:20,f:50, per:'100g'},
  {name:'Almonds',                    he:'שקדים',              cal:579,p:21,c:22,f:50, per:'100g'},
  {name:'Cashews',                    he:'קשיו',               cal:553,p:18,c:30,f:44, per:'100g'},
  {name:'Walnuts',                    he:'אגוזי מלך',          cal:654,p:15,c:14,f:65, per:'100g'},
  {name:'Chia Seeds',                 he:'זרעי צ׳יה',          cal:486,p:17,c:42,f:31, per:'100g'},
  {name:'Flaxseeds',                  he:'זרעי פשתן',          cal:534,p:18,c:29,f:42, per:'100g'},
  {name:'Butter',                     he:'חמאה',               cal:717,p:1, c:0, f:81, per:'100g'},
  {name:'Coconut Oil',                he:'שמן קוקוס',          cal:862,p:0, c:0, f:100,per:'100ml'},
  // Vegetables
  {name:'Broccoli (steamed)',         he:'ברוקולי מאודה',      cal:34, p:3, c:7, f:0,  per:'100g'},
  {name:'Spinach (raw)',              he:'תרד',                cal:23, p:3, c:4, f:0,  per:'100g'},
  {name:'Kale (raw)',                 he:'קייל',               cal:49, p:4, c:9, f:1,  per:'100g'},
  {name:'Cucumber',                   he:'מלפפון',             cal:15, p:1, c:4, f:0,  per:'100g'},
  {name:'Tomato',                     he:'עגבנייה',            cal:18, p:1, c:4, f:0,  per:'100g'},
  {name:'Bell Pepper',                he:'פלפל',               cal:31, p:1, c:6, f:0,  per:'100g'},
  {name:'Mushrooms (raw)',            he:'פטריות',             cal:22, p:3, c:3, f:0,  per:'100g'},
  {name:'Onion',                      he:'בצל',                cal:40, p:1, c:9, f:0,  per:'100g'},
  {name:'Carrot',                     he:'גזר',                cal:41, p:1, c:10,f:0,  per:'100g'},
  {name:'Cauliflower',                he:'כרובית',             cal:25, p:2, c:5, f:0,  per:'100g'},
  {name:'Zucchini',                   he:'קישוא',              cal:17, p:1, c:3, f:0,  per:'100g'},
  {name:'Asparagus',                  he:'אספרגוס',            cal:20, p:2, c:4, f:0,  per:'100g'},
  {name:'Green Beans',                he:'שעועית ירוקה',       cal:31, p:2, c:7, f:0,  per:'100g'},
  {name:'Celery',                     he:'סלרי',               cal:16, p:1, c:3, f:0,  per:'100g'},
  {name:'Lettuce (romaine)',          he:'חסה',                cal:15, p:1, c:3, f:0,  per:'100g'},
]

const MEALS = ['Breakfast','Lunch','Dinner','Snacks'] as const

function macros(entries: FoodEntry[]) {
  return entries.reduce((acc,e)=>{
    const m = e.qty/100
    return {cal:acc.cal+e.cal*m, p:acc.p+e.p*m, c:acc.c+e.c*m, f:acc.f+e.f*m}
  },{cal:0,p:0,c:0,f:0})
}

export default function Nutrition() {
  const { loading, profile } = useAuth()
  const today = new Date().toDateString()
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Core state ─────────────────────────────────────────────────────────────
  const [log, setLog]     = useState<Log>({Breakfast:[],Lunch:[],Dinner:[],Snacks:[]})
  const [water, setWater] = useState(0)
  const [activeMeal, setActiveMeal] = useState<Meal|null>(null)
  const [modalTab, setModalTab]     = useState<'search'|'recipes'>('search')
  const [search, setSearch] = useState('')
  const [qty, setQty]       = useState('100')

  // ── Barcode ─────────────────────────────────────────────────────────────────
  const [scanning, setScanning]     = useState(false)
  const [scanned, setScanned]       = useState<FoodItem|null>(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError]   = useState('')

  // ── OFG live search ─────────────────────────────────────────────────────────
  const [ofgResults, setOfgResults] = useState<FoodItem[]>([])
  const [ofgLoading, setOfgLoading] = useState(false)

  // ── Recipes ─────────────────────────────────────────────────────────────────
  const [recipes, setRecipes]       = useState<Recipe[]>([])
  const [buildingRecipe, setBuildingRecipe] = useState(false)
  const [recipeName, setRecipeName] = useState('')
  const [recipeSearch, setRecipeSearch] = useState('')
  const [recipeItems, setRecipeItems]   = useState<FoodEntry[]>([])
  const [recipeQty, setRecipeQty]   = useState('100')

  // ── Photo analysis ──────────────────────────────────────────────────────────
  const [photoAnalyzing, setPhotoAnalyzing] = useState(false)
  const [photoPreview, setPhotoPreview]     = useState<string|null>(null)
  const [photoFoods, setPhotoFoods]         = useState<PhotoFood[]|null>(null)
  const [photoError, setPhotoError]         = useState('')

  // ── Persistence ─────────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('apex_nutrition') || '{}')
      if (s.date === today) { if (s.log) setLog(s.log); if (s.water) setWater(s.water) }
      setRecipes(JSON.parse(localStorage.getItem('apex_recipes') || '[]'))
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('apex_nutrition', JSON.stringify({ date: today, log, water }))
  }, [log, water])

  // ── OFG debounced search ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeMeal || modalTab !== 'search' || search.length < 2) { setOfgResults([]); return }
    setOfgLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res  = await fetch(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(search)}&json=1&page_size=8&fields=product_name,nutriments`)
        const data = await res.json()
        const localNames = new Set(FOODS.map(f => f.name.toLowerCase()))
        setOfgResults(
          (data.products || [])
            .filter((p: {product_name?:string; nutriments?:{'energy-kcal_100g'?:number}}) => p.product_name && p.nutriments?.['energy-kcal_100g'] && !localNames.has(p.product_name.toLowerCase()))
            .slice(0, 6)
            .map((p: {product_name:string; nutriments:Record<string,number>}) => ({
              name: p.product_name,
              he:   '',
              cal:  Math.round(p.nutriments['energy-kcal_100g'] || 0),
              p:    Math.round(p.nutriments['proteins_100g']     || 0),
              c:    Math.round(p.nutriments['carbohydrates_100g']|| 0),
              f:    Math.round(p.nutriments['fat_100g']          || 0),
              per:  '100g',
            }))
        )
      } catch {}
      setOfgLoading(false)
    }, 700)
    return () => { clearTimeout(timer); setOfgLoading(false) }
  }, [search, activeMeal, modalTab])

  if (loading) return <Loader />

  // ── Derived values ──────────────────────────────────────────────────────────
  const targetCals    = profile?.targetCalories || 2200
  const targetProtein = profile?.targetProtein  || 160
  const targetCarbs   = Math.round((targetCals*0.45)/4)
  const targetFat     = Math.round((targetCals*0.25)/9)
  const totals        = macros(Object.values(log).flat())
  const remaining     = targetCals - totals.cal
  const pct           = (v:number,t:number) => Math.min(Math.round(v/t*100),100)

  const q        = search.toLowerCase()
  const filtered = FOODS.filter(f => !search || f.name.toLowerCase().includes(q) || f.he.includes(search))

  // ── Actions ─────────────────────────────────────────────────────────────────
  const addFood = (food: FoodItem, amount = +qty || 100) => {
    if (!activeMeal) return
    setLog(prev => ({...prev, [activeMeal]: [...prev[activeMeal], {...food, qty: amount}]}))
    setSearch(''); setQty('100'); setActiveMeal(null)
    setScanned(null); setPhotoFoods(null); setPhotoPreview(null)
  }

  const removeFood = (meal: Meal, idx: number) =>
    setLog(prev => ({...prev, [meal]: prev[meal].filter((_,i) => i !== idx)}))

  const handleBarcode = async (barcode: string) => {
    setScanning(false); setScanLoading(true); setScanError(''); setScanned(null)
    try {
      const res  = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      const data = await res.json()
      if (data.status !== 1) { setScanError('Product not found.'); setScanLoading(false); return }
      const n = data.product.nutriments || {}
      setScanned({
        name: data.product.product_name || 'Unknown Product',
        he:   '',
        cal:  Math.round(n['energy-kcal_100g'] || 0),
        p:    Math.round(n['proteins_100g']     || 0),
        c:    Math.round(n['carbohydrates_100g']|| 0),
        f:    Math.round(n['fat_100g']          || 0),
        per:  '100g',
      })
    } catch { setScanError('Failed to fetch product.') }
    setScanLoading(false)
  }

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPhotoError(''); setPhotoFoods(null)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string
      setPhotoPreview(dataUrl)
      setPhotoAnalyzing(true)
      try {
        const base64    = dataUrl.split(',')[1]
        const mimeType  = file.type
        const res       = await fetch('/api/analyze-meal', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({imageBase64:base64, mimeType}) })
        const data      = await res.json()
        if (data.error) { setPhotoError(data.error); } else { setPhotoFoods(data.foods || []) }
      } catch { setPhotoError('Analysis failed. Check your connection.') }
      setPhotoAnalyzing(false)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const openModal = (meal: Meal) => {
    setActiveMeal(meal); setModalTab('search')
    setSearch(''); setQty('100'); setScanned(null)
    setPhotoFoods(null); setPhotoPreview(null); setPhotoError(''); setScanError('')
  }

  const saveRecipe = () => {
    if (!recipeName.trim() || recipeItems.length === 0) return
    const r: Recipe = { id: Date.now().toString(), name: recipeName.trim(), foods: recipeItems }
    const updated = [...recipes, r]
    setRecipes(updated)
    localStorage.setItem('apex_recipes', JSON.stringify(updated))
    setRecipeName(''); setRecipeItems([]); setRecipeSearch(''); setBuildingRecipe(false)
  }

  const deleteRecipe = (id: string) => {
    const updated = recipes.filter(r => r.id !== id)
    setRecipes(updated)
    localStorage.setItem('apex_recipes', JSON.stringify(updated))
  }

  const logRecipe = (recipe: Recipe) => {
    if (!activeMeal) return
    setLog(prev => ({...prev, [activeMeal]: [...prev[activeMeal], ...recipe.foods]}))
    setActiveMeal(null)
  }

  const recipeFiltered = FOODS.filter(f => !recipeSearch || f.name.toLowerCase().includes(recipeSearch.toLowerCase()) || f.he.includes(recipeSearch))

  return (
    <AppShell>
      <div style={{animation:'fadeUp 0.4s ease both'}}>

        {/* Header */}
        <div style={{marginBottom:28}}>
          <h1 style={{fontFamily:'var(--font-head)',fontSize:26,fontWeight:800,letterSpacing:'-0.5px'}}>Nutrition</h1>
          <p style={{color:'var(--text2)',fontSize:13,marginTop:4}}>
            {new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}
          </p>
        </div>

        {/* Macro ring */}
        <div style={{...card,marginBottom:16}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 3fr',gap:24,alignItems:'center'}}>
            <div style={{position:'relative',width:100,height:100,margin:'0 auto'}}>
              <svg width="100" height="100" viewBox="0 0 100 100" style={{transform:'rotate(-90deg)'}}>
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface3)" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none" stroke={remaining>=0?'var(--accent)':'var(--red)'} strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="264" strokeDashoffset={264*(1-Math.min(totals.cal/targetCals,1))}/>
              </svg>
              <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
                <div style={{fontFamily:'var(--font-head)',fontSize:17,fontWeight:800,color:remaining>=0?'var(--accent)':'var(--red)'}}>{Math.round(totals.cal)}</div>
                <div style={{fontSize:9,color:'var(--text3)',letterSpacing:'0.05em'}}>EATEN</div>
              </div>
            </div>
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:14}}>
                {[
                  {l:'Target',    v:targetCals,            c:'var(--text)'},
                  {l:'Remaining', v:Math.round(remaining), c:remaining>=0?'var(--green)':'var(--red)'},
                  {l:'Eaten',     v:Math.round(totals.cal),c:'var(--accent)'},
                ].map(s=>(
                  <div key={s.l} style={{textAlign:'center'}}>
                    <div style={{fontFamily:'var(--font-head)',fontSize:18,fontWeight:800,color:s.c}}>{s.v}</div>
                    <div style={{fontSize:10,color:'var(--text3)',letterSpacing:'0.04em',marginTop:2}}>KCAL</div>
                    <div style={{fontSize:10,color:'var(--text2)',marginTop:1}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[
                  {n:'Protein',v:totals.p,t:targetProtein,c:'var(--accent2)'},
                  {n:'Carbs',  v:totals.c,t:targetCarbs,  c:'var(--yellow)'},
                  {n:'Fat',    v:totals.f,t:targetFat,    c:'var(--accent3)'},
                ].map(m=>(
                  <div key={m.n}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:5}}>
                      <span style={{color:m.c,fontWeight:600}}>{m.n}</span>
                      <span style={{color:'var(--text3)'}}>{Math.round(m.v)}g / {m.t}g</span>
                    </div>
                    <div style={{height:3,background:'var(--surface3)',borderRadius:2,overflow:'hidden'}}>
                      <div style={{height:'100%',width:`${pct(m.v,m.t)}%`,background:m.c,borderRadius:2}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Meal cards */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:16}}>
          {MEALS.map(meal => {
            const entries = log[meal]; const mt = macros(entries)
            return (
              <div key={meal} style={card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                  <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>{meal}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    {entries.length>0 && <span style={{fontSize:12,fontWeight:700,color:'var(--accent)'}}>{Math.round(mt.cal)} kcal</span>}
                    <button onClick={()=>openModal(meal)} style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:7,padding:'4px 10px',fontSize:12,fontWeight:600,color:'var(--text2)',cursor:'pointer'}}>+ Add</button>
                  </div>
                </div>
                {entries.length===0
                  ? <div style={{textAlign:'center',padding:'16px 0',fontSize:12,color:'var(--text3)'}}>No foods logged</div>
                  : entries.map((e,i) => {
                      const m = e.qty/100
                      return (
                        <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:13,fontWeight:500,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{e.name}</div>
                            <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{e.qty}g · P:{Math.round(e.p*m)}g · C:{Math.round(e.c*m)}g · F:{Math.round(e.f*m)}g</div>
                          </div>
                          <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0,marginLeft:8}}>
                            <span style={{fontFamily:'var(--font-head)',fontSize:13,fontWeight:700}}>{Math.round(e.cal*m)}</span>
                            <button onClick={()=>removeFood(meal,i)} style={{background:'transparent',border:'none',fontSize:14,color:'var(--text3)',cursor:'pointer',lineHeight:1}}>×</button>
                          </div>
                        </div>
                      )
                    })
                }
              </div>
            )
          })}
        </div>

        {/* Water */}
        <div style={{...card,marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
            <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>Water</div>
            <div style={{fontSize:14,fontWeight:700,color:'var(--accent2)'}}>{(water/1000).toFixed(1)} L / 2.5 L</div>
          </div>
          <div style={{height:4,background:'var(--surface3)',borderRadius:2,overflow:'hidden',marginBottom:14}}>
            <div style={{height:'100%',width:`${Math.min(water/2500*100,100)}%`,background:'var(--accent2)',borderRadius:2}}/>
          </div>
          <div style={{display:'flex',gap:8}}>
            {[150,250,330,500].map(ml=>(
              <button key={ml} onClick={()=>setWater(w=>w+ml)}
                style={{flex:1,background:'var(--accent2-dim)',border:'1px solid rgba(87,200,255,0.2)',borderRadius:8,padding:'8px',fontSize:12,fontWeight:600,color:'var(--accent2)',cursor:'pointer'}}>
                +{ml} ml
              </button>
            ))}
          </div>
        </div>

        {/* My Recipes */}
        <div style={card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={label}>My Recipes</div>
            <button onClick={()=>setBuildingRecipe(true)}
              style={{background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:8,padding:'6px 14px',fontSize:12,fontWeight:600,color:'var(--text2)',cursor:'pointer'}}>
              + New Recipe
            </button>
          </div>
          {recipes.length===0
            ? <div style={{fontSize:12,color:'var(--text3)',textAlign:'center',padding:'16px 0'}}>No recipes saved. Create one to quickly log your regular meals.</div>
            : recipes.map(r => {
                const rt = macros(r.foods)
                return (
                  <div key={r.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600}}>{r.name}</div>
                      <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{r.foods.length} foods · {Math.round(rt.cal)} kcal · P:{Math.round(rt.p)}g</div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>deleteRecipe(r.id)} style={{background:'transparent',border:'none',fontSize:14,color:'var(--text3)',cursor:'pointer'}}>×</button>
                    </div>
                  </div>
                )
              })
          }
        </div>

      </div>

      {/* ── Add Food Modal ─────────────────────────────────────────────────── */}
      {activeMeal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:200,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setActiveMeal(null)}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth:560,maxHeight:'88vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:'var(--surface3)',borderRadius:2,margin:'0 auto 20px'}}/>

            {/* Modal header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
              <div style={{fontFamily:'var(--font-head)',fontSize:17,fontWeight:700}}>Add to {activeMeal}</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setScanning(true);setScanError('');setScanned(null)}}
                  style={actionBtn}>Scan Barcode</button>
                <button onClick={()=>fileRef.current?.click()}
                  style={actionBtn}>Analyze Photo</button>
                <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{display:'none'}}/>
              </div>
            </div>

            {/* Scanner */}
            {scanning && (
              <div style={{marginBottom:16}}>
                <BarcodeScanner onDetected={handleBarcode} onClose={()=>setScanning(false)}/>
              </div>
            )}
            {scanLoading && <div style={{textAlign:'center',padding:'16px 0',fontSize:13,color:'var(--text2)'}}>Looking up product...</div>}
            {scanError  && <div style={errBox}>{scanError}</div>}
            {scanned && (
              <div style={resultBox}>
                <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,marginBottom:3}}>{scanned.name}</div>
                <div style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>Per 100g · P:{scanned.p}g · C:{scanned.c}g · F:{scanned.f}g · {scanned.cal} kcal</div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <input value={qty} onChange={e=>setQty(e.target.value)} type="number"
                    style={{width:70,...inputStyle}} />
                  <span style={{fontSize:12,color:'var(--text3)'}}>g</span>
                  <button onClick={()=>addFood(scanned)} style={primaryBtn}>Add to {activeMeal}</button>
                </div>
              </div>
            )}

            {/* Photo analysis */}
            {photoPreview && (
              <div style={{marginBottom:16}}>
                <img src={photoPreview} alt="meal" style={{width:'100%',borderRadius:10,maxHeight:200,objectFit:'cover',marginBottom:12}}/>
                {photoAnalyzing && <div style={{textAlign:'center',fontSize:13,color:'var(--text2)'}}>Analyzing your meal...</div>}
                {photoError    && <div style={errBox}>{photoError}</div>}
                {photoFoods    && (
                  <div>
                    <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.07em',color:'var(--text3)',marginBottom:10}}>ESTIMATED FOODS</div>
                    {photoFoods.map((f,i)=>(
                      <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
                        <div>
                          <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
                          <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>~{f.grams}g · {f.cal} kcal · P:{f.p}g · C:{f.c}g · F:{f.f}g</div>
                        </div>
                        <button onClick={()=>{
                          if (!activeMeal) return
                          setLog(prev=>({...prev,[activeMeal]:[...prev[activeMeal],{name:f.name,he:'',cal:f.cal,p:f.p,c:f.c,f:f.f,per:`${f.grams}g`,qty:f.grams}]}))
                        }} style={{background:'var(--accent-dim)',border:'1px solid rgba(200,255,87,0.2)',color:'var(--accent)',borderRadius:7,padding:'5px 12px',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div style={{display:'flex',background:'var(--surface)',borderRadius:9,padding:3,gap:2,marginBottom:14,width:'fit-content'}}>
              {(['search','recipes'] as const).map(t=>(
                <button key={t} onClick={()=>setModalTab(t)} style={{padding:'6px 16px',borderRadius:6,fontSize:12,fontWeight:600,border:'none',background:modalTab===t?'var(--surface3)':'transparent',color:modalTab===t?'var(--text)':'var(--text2)',cursor:'pointer',textTransform:'capitalize'}}>
                  {t==='search'?'Search Foods':'My Recipes'}
                </button>
              ))}
            </div>

            {/* Search tab */}
            {modalTab==='search' && (
              <div>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search in English or Hebrew..."
                    style={{flex:1,...inputStyle}} autoFocus/>
                  <input value={qty} onChange={e=>setQty(e.target.value)} placeholder="100"
                    style={{width:70,...inputStyle,textAlign:'center'}} type="number"/>
                  <span style={{fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center'}}>g</span>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {filtered.map((f,i)=>(
                    <div key={i} onClick={()=>addFood(f)} style={foodRow}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
                        <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{f.per} · P:{f.p}g · C:{f.c}g · F:{f.f}g</div>
                      </div>
                      <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,color:'var(--accent)',marginLeft:12,flexShrink:0}}>
                        {Math.round(f.cal*(+qty||100)/100)}
                      </div>
                    </div>
                  ))}
                  {ofgLoading && <div style={{textAlign:'center',padding:'10px 0',fontSize:12,color:'var(--text3)'}}>Searching all foods...</div>}
                  {ofgResults.length>0 && (
                    <>
                      <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.07em',color:'var(--text3)',padding:'8px 0 4px'}}>MORE RESULTS</div>
                      {ofgResults.map((f,i)=>(
                        <div key={i} onClick={()=>addFood(f)} style={foodRow}>
                          <div>
                            <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
                            <div style={{fontSize:11,color:'var(--text3)',marginTop:1}}>{f.per} · P:{f.p}g · C:{f.c}g · F:{f.f}g</div>
                          </div>
                          <div style={{fontFamily:'var(--font-head)',fontSize:15,fontWeight:700,color:'var(--accent2)',marginLeft:12,flexShrink:0}}>
                            {Math.round(f.cal*(+qty||100)/100)}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* My Recipes tab */}
            {modalTab==='recipes' && (
              <div>
                {recipes.length===0
                  ? <div style={{textAlign:'center',padding:'24px 0',fontSize:13,color:'var(--text3)'}}>No recipes yet. Create one from the main page.</div>
                  : recipes.map(r=>{
                      const rt = macros(r.foods)
                      return (
                        <div key={r.id} onClick={()=>logRecipe(r)} style={{...foodRow,flexDirection:'column',alignItems:'flex-start',gap:6}}>
                          <div style={{fontFamily:'var(--font-head)',fontSize:14,fontWeight:700}}>{r.name}</div>
                          <div style={{fontSize:11,color:'var(--text3)'}}>{r.foods.length} ingredients · {Math.round(rt.cal)} kcal · P:{Math.round(rt.p)}g · C:{Math.round(rt.c)}g · F:{Math.round(rt.f)}g</div>
                        </div>
                      )
                    })
                }
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Recipe Builder Modal ────────────────────────────────────────────── */}
      {buildingRecipe && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:300,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setBuildingRecipe(false)}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'20px 20px 0 0',padding:24,width:'100%',maxWidth:560,maxHeight:'90vh',overflow:'auto'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:36,height:4,background:'var(--surface3)',borderRadius:2,margin:'0 auto 20px'}}/>
            <div style={{fontFamily:'var(--font-head)',fontSize:17,fontWeight:700,marginBottom:16}}>New Recipe</div>

            <input value={recipeName} onChange={e=>setRecipeName(e.target.value)} placeholder="Recipe name (e.g. My Oatmeal Bowl)"
              style={{width:'100%',...inputStyle,marginBottom:14}}/>

            {recipeItems.length>0 && (
              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.07em',color:'var(--text3)',marginBottom:8}}>INGREDIENTS</div>
                {recipeItems.map((e,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{fontSize:13}}>{e.name} <span style={{color:'var(--text3)',fontSize:11}}>({e.qty}g)</span></div>
                    <button onClick={()=>setRecipeItems(prev=>prev.filter((_,ii)=>ii!==i))} style={{background:'transparent',border:'none',color:'var(--text3)',cursor:'pointer',fontSize:14}}>×</button>
                  </div>
                ))}
              </div>
            )}

            <div style={{display:'flex',gap:8,marginBottom:10}}>
              <input value={recipeSearch} onChange={e=>setRecipeSearch(e.target.value)} placeholder="Add ingredient..."
                style={{flex:1,...inputStyle}}/>
              <input value={recipeQty} onChange={e=>setRecipeQty(e.target.value)} type="number" placeholder="100"
                style={{width:70,...inputStyle,textAlign:'center'}}/>
              <span style={{fontSize:12,color:'var(--text3)',display:'flex',alignItems:'center'}}>g</span>
            </div>

            <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:16,maxHeight:200,overflowY:'auto'}}>
              {recipeFiltered.slice(0,12).map((f,i)=>(
                <div key={i} onClick={()=>{setRecipeItems(prev=>[...prev,{...f,qty:+recipeQty||100}]);setRecipeSearch('')}}
                  style={foodRow}>
                  <div style={{fontSize:13,fontWeight:500}}>{f.name}</div>
                  <div style={{fontSize:11,color:'var(--text3)',flexShrink:0,marginLeft:8}}>{f.cal} kcal</div>
                </div>
              ))}
            </div>

            <button onClick={saveRecipe}
              style={{width:'100%',background:'var(--accent)',color:'#07070F',border:'none',borderRadius:9,padding:'13px',fontWeight:700,fontSize:14,cursor:'pointer'}}>
              Save Recipe
            </button>
          </div>
        </div>
      )}

    </AppShell>
  )
}

const card:      React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,padding:18}
const label:     React.CSSProperties = {fontSize:11,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' as const,color:'var(--text3)'}
const inputStyle:React.CSSProperties = {background:'var(--surface)',border:'1px solid var(--border2)',borderRadius:9,padding:'10px 13px',color:'var(--text)',fontSize:14,width:'100%'}
const primaryBtn:React.CSSProperties = {flex:1,background:'var(--accent)',color:'#07070F',border:'none',borderRadius:8,padding:'10px',fontSize:13,fontWeight:700,cursor:'pointer'}
const actionBtn: React.CSSProperties = {background:'var(--surface2)',border:'1px solid var(--border2)',borderRadius:8,padding:'7px 12px',fontSize:12,fontWeight:600,color:'var(--text2)',cursor:'pointer'}
const foodRow:   React.CSSProperties = {display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 12px',background:'var(--surface)',border:'1px solid var(--border)',borderRadius:10,cursor:'pointer'}
const resultBox: React.CSSProperties = {background:'var(--accent-dim)',border:'1px solid rgba(200,255,87,0.2)',borderRadius:12,padding:16,marginBottom:14}
const errBox:    React.CSSProperties = {background:'var(--red-dim)',border:'1px solid rgba(248,113,113,0.2)',borderRadius:9,padding:'10px 14px',fontSize:13,color:'var(--red)',marginBottom:12}
