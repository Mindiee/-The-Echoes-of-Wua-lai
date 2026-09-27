import { useId, useState, type ReactNode } from 'react'
import { data } from '../data'
import { calculateActivity } from '../activity'

function Disclosure({title,children}:{title:string;children:ReactNode}) {
  const [open,setOpen]=useState(false)
  const id=useId()
  return <div className="method-item" data-open={open}>
    <h3><button aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}><span className="disclosure-arrow" aria-hidden="true">›</span>{title}</button></h3>
    <div className="disclosure" id={id} inert={!open} aria-hidden={!open}><div className="disclosure-inner">{children}</div></div>
  </div>
}

export function Method({visible}:{visible:boolean}) {
  return <section id="method" className="method page-section" aria-label="How it works" hidden={!visible}>
    <div className="method-content">
      <h1 className="sr-only">Method</h1>
      <div className="method-group"><h2>01 · HOW DATA BECOMES SOUND</h2>
        <Disclosure title="ACTIVITY DATA"><p>Place, category, day &amp; time</p></Disclosure>
        <Disclosure title="ACTIVITY DENSITY"><p>How active the neighborhood is</p></Disclosure>
        <Disclosure title="CATEGORY WEIGHT"><p>Different influence by activity type</p><table aria-label="Category weights"><thead><tr><th>Category</th><th>Total Places</th><th>Weight</th></tr></thead><tbody>{Object.entries(data.weights).map(([category,weight])=><tr key={category}><td>{category}</td><td>{data.places.filter(p=>p.category===category).length}</td><td>{weight.toFixed(1)}</td></tr>)}</tbody></table></Disclosure>
        <Disclosure title="SOUND INTENSITY"><p>Density × category influence</p><table aria-label="Sound intensity examples"><thead><tr><th>Day &amp; Time</th><th>Active Activities</th><th>Sound Intensity</th></tr></thead><tbody>{([[0,720,'Monday 12:00'],[3,720,'Thursday 12:00'],[5,720,'Saturday 12:00'],[5,1140,'Saturday 19:00'],[6,720,'Sunday 12:00']] as const).map(([day,minute,label])=>{const a=calculateActivity(data,day,minute);return <tr key={label}><td>{label}</td><td>{a.density}</td><td>{a.intensity.toFixed(1)}</td></tr>})}</tbody></table></Disclosure>
        <Disclosure title="GENERATIVE SOUND"><p>Data Transformed into Evolving Sound</p></Disclosure>
      </div>
      <div className="method-group"><h2>02 · HOW THE EXPERIENCE WORKS</h2>
        <Disclosure title="EXPLORE MAP"><p>Explore activities across Wua-lai</p></Disclosure>
        <Disclosure title="DISCOVER ACTIVITY"><p>Hover to reveal place and activity details</p></Disclosure>
        <Disclosure title="SELECT A PLACE"><p>Focus on an activity and its sound</p></Disclosure>
        <Disclosure title="LISTEN"><p>Experience the rhythm through sound</p></Disclosure>
      </div>
    </div>
  </section>
}
