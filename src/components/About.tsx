import { useEffect, useRef, useState } from 'react'

const photographs = [
  ['CRAFT','craft.jpg','Silversmithing','Repoussé metalwork panels on the wall of Buddhist Art Gallery, Wat Muen San'],
  ['TEMPLE','temple.png','Faith & sacred','The first silver ordination hall, reflecting Wua-lai’s silversmithing heritage, Wat Srisuphan'],
  ['PEOPLE','people.png','Craft Community','A tradition once practiced within local households'],
  ['STREET','street.jpg','Street life','Where local life, craft, and commerce come together. Wualai Walking Street'],
  ['TOURISM','tourism.jpg','A destination shaped by local culture','Everyday craftsmanship woven into the life of the community. Local Craft Shop'],
]

export function About({visible}:{visible:boolean}) {
  const track=useRef<HTMLDivElement>(null)
  const [index,setIndex]=useState(0)
  const currentIndex=useRef(0)
  const move=(next:number) => {
    const root=track.current
    const target=Math.max(0,Math.min(5,next))
    const slide=root?.children[target] as HTMLElement | undefined
    if(root && slide) {
      currentIndex.current=target
      setIndex(target)
      const left=slide.offsetLeft-(root.clientWidth-slide.clientWidth)/2
      // WebKit can ignore a second smooth-scroll command while the first is active.
      // Stop the previous motion before beginning the new requested transition.
      root.scrollTo({left:root.scrollLeft,behavior:'auto'})
      requestAnimationFrame(()=>root.scrollTo({left,behavior:'smooth'}))
    }
  }
  useEffect(() => {
    const root=track.current
    if(!root || !visible) return
    const observer=new ResizeObserver(() => {
      const slide=root.children[currentIndex.current] as HTMLElement
      root.scrollTo({left:slide.offsetLeft-(root.clientWidth-slide.clientWidth)/2,behavior:'instant'})
    })
    observer.observe(root)
    return () => observer.disconnect()
  },[visible])
  return <section id="about" className="about page-section" aria-label="About Wua-lai" hidden={!visible}>
    <div ref={track} className="about-track" role="region" aria-label="Wua-lai photographs" aria-roledescription="carousel" tabIndex={0}
      onKeyDown={event => {
        const next=event.key==='ArrowRight'?index+1:event.key==='ArrowLeft'?index-1:event.key==='Home'?0:event.key==='End'?5:null
        if(next!==null){event.preventDefault();move(next)}
      }} onScroll={() => {
        const root=track.current!
        const middle=root.scrollLeft+root.clientWidth/2
        const distances=Array.from(root.children).map(child => Math.abs((child as HTMLElement).offsetLeft+(child as HTMLElement).offsetWidth/2-middle))
        currentIndex.current=distances.indexOf(Math.min(...distances))
        setIndex(currentIndex.current)
      }}>
      <article className="about-slide about-intro" data-current={index===0} aria-label="Introduction" aria-roledescription="slide">
        <h1>The Echoes of Wua-lai</h1>
        <p>Wua-lai, Chiang Mai, is a neighborhood deeply rooted in silver craftsmanship.</p>
        <p>One of its distinctive traditions is “Tong Lai,” a technique of hammering, chiseling, and engraving patterns onto sheets of silver, creating a rhythmic sound unique to the craft.</p>
        <p>These sounds emerge alongside the everyday activities of the neighborhood, creating a rhythm that changes throughout the day.</p>
        <p>This became the starting point for The Echoes of Wua-lai — an interactive experience that transforms activity data into sound…</p>
        <p className="about-ending">Every neighborhood has a rhythm.<br/>Wua-lai simply taught us how to listen.</p>
      </article>
      {photographs.map(([category,file,title,caption],i)=><figure className="about-slide" data-current={index===i+1} key={file} aria-roledescription="slide" aria-label={`${i+1} of 5: ${title}`}>
        <button className="photo-button" tabIndex={index===i+1 || Math.abs(index-i-1)===1 ? 0 : -1} aria-label={`View ${title}`} onClick={()=>move(i+1)}>
          <span className="photo-category">{category}</span>
          <img src={`${import.meta.env.BASE_URL}about/${file}`} alt={title} draggable={false}/>
        </button>
        <figcaption><h2>{title}</h2><p>{caption}</p></figcaption>
      </figure>)}
    </div>
    <span className="sr-only" aria-live="polite">{index===0?'Introduction':`${index} of 5: ${photographs[index-1][2]}`}</span>
  </section>
}
