/* Civic Sparrow — site behaviour and learning tools.
   To receive contact messages and enquiries by email automatically, paste a form-handling URL
   (e.g. Formspree, Getform, Basin) into CS_CONFIG.formEndpoint. While it is empty, the visitor's
   email app opens with their message filled in, so no message is lost. */
window.CS_CONFIG = { formEndpoint: "", email: "hello@civicsparrow.com" };

(function(){
  "use strict";
  const $ = (s,c=document)=>c.querySelector(s), $$ = (s,c=document)=>Array.from(c.querySelectorAll(s));
  const CFG = window.CS_CONFIG;
  const store = { get(k,d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} } };
  const validEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  const bad = (el,b) => { const f = el.closest(".fld"); if (f) f.classList.toggle("bad", b); return b; };
  const say = (box,t,k="err",after=false) => { let m = $(".msg", box); if (!m){ m = document.createElement("div"); after ? box.appendChild(m) : box.prepend(m); } m.className = "msg msg-"+k; m.setAttribute("role", k==="err"?"alert":"status"); m.innerHTML = t; };
  async function send(data){
    if (!CFG.formEndpoint) return false;
    try{ const r = await fetch(CFG.formEndpoint, {method:"POST", headers:{"Content-Type":"application/json","Accept":"application/json"}, body:JSON.stringify(data)}); return r.ok; }catch(e){ return false; }
  }

  /* nav */
  const burger = $(".burger"), nav = $(".nav");
  burger?.addEventListener("click", () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  document.addEventListener("keydown", e => { if (e.key === "Escape"){ nav?.classList.remove("open"); burger?.setAttribute("aria-expanded", false); } });
  $$("[data-year]").forEach(e => e.textContent = new Date().getFullYear());

  /* cookie consent — Google Consent Mode v2 */
  const ck = $(".cookie"), choice = store.get("cs_consent", null);
  const apply = ok => { if (typeof gtag === "function") gtag("consent","update",{analytics_storage:ok?"granted":"denied",ad_storage:ok?"granted":"denied",ad_user_data:ok?"granted":"denied",ad_personalization:ok?"granted":"denied"}); };
  const st = $("#consent-status"), show = c => { if (st) st.textContent = c==="all" ? "Analytics and advertising cookies are allowed." : c==="essential" ? "Only essential storage is active." : "You haven't made a choice yet."; };
  if (choice) apply(choice==="all"); else ck?.classList.add("show"); show(choice);
  $$("[data-consent]").forEach(b => b.addEventListener("click", () => { store.set("cs_consent", b.dataset.consent); apply(b.dataset.consent==="all"); ck?.classList.remove("show"); show(b.dataset.consent); }));
  $$("[data-cookie-settings]").forEach(b => b.addEventListener("click", () => ck?.classList.add("show")));

  /* tabs (branches of government) */
  $$("[role=tablist]").forEach(tl => { const tabs = $$("[role=tab]", tl);
    tabs.forEach((t,i) => { t.addEventListener("click", () => tabs.forEach(x => { const on = x===t; x.setAttribute("aria-selected", on); x.tabIndex = on?0:-1; $("#"+x.getAttribute("aria-controls")).hidden = !on; }));
      t.addEventListener("keydown", e => { const k = e.key; if (["ArrowDown","ArrowRight","ArrowUp","ArrowLeft"].includes(k)){ e.preventDefault(); const n = tabs[(i + (k==="ArrowDown"||k==="ArrowRight"?1:-1) + tabs.length) % tabs.length]; n.focus(); n.click(); } }); }); });

  /* Bill of Rights explorer (plain-language summaries) */
  const AM = [
    ["First Amendment","Freedom of religion, speech, the press, peaceful assembly and the right to petition the government.","Example: you can write a letter to your local newspaper criticizing a public official, or join a peaceful protest."],
    ["Second Amendment","The right to keep and bear arms, connected in the text to a “well regulated Militia.”","Courts continue to decide how far this right extends and what regulations are allowed."],
    ["Third Amendment","The government cannot force people to house soldiers in peacetime without the owner's consent.","It responded directly to British practices before the Revolution and is rarely litigated today."],
    ["Fourth Amendment","Protection against unreasonable searches and seizures; warrants require probable cause.","Example: police generally need a warrant, based on evidence, to search someone's belongings."],
    ["Fifth Amendment","Rights including due process, protection from being tried twice for the same crime, and the right not to testify against yourself.","This is where the phrase “pleading the Fifth” comes from."],
    ["Sixth Amendment","The right to a speedy, public trial by an impartial jury, to know the charges, to confront witnesses and to have a lawyer.","If a defendant can't afford a lawyer in a serious criminal case, one must be provided."],
    ["Seventh Amendment","The right to a jury trial in many federal civil cases.","Civil cases are disputes between people or organizations, rather than criminal prosecutions."],
    ["Eighth Amendment","No excessive bail or fines, and no cruel and unusual punishment.","Courts interpret “cruel and unusual” by looking at evolving standards over time."],
    ["Ninth Amendment","Listing some rights in the Constitution does not mean people have no other rights.","It reminds readers that the Bill of Rights is not a complete list of every freedom."],
    ["Tenth Amendment","Powers not given to the federal government, nor denied to the states, belong to the states or the people.","This is a foundation of federalism — why states run schools, driver licensing and much more."]
  ];
  const ab = $("#amendments");
  if (ab){
    const nums = $(".amend-nums", ab);
    nums.innerHTML = AM.map((a,i)=>`<button type="button" data-a="${i}" aria-pressed="false" aria-label="${a[0]}">${i+1}</button>`).join("");
    const draw = i => { $$("button", nums).forEach(b=>b.setAttribute("aria-pressed", +b.dataset.a===i)); $("#am-title").textContent = AM[i][0]; $("#am-plain").textContent = AM[i][1]; $("#am-ex").textContent = AM[i][2]; };
    nums.addEventListener("click", e => { const b = e.target.closest("[data-a]"); if (b) draw(+b.dataset.a); }); draw(0);
  }

  /* civics quiz */
  const QZ = [
    ["How many members does the U.S. Senate have?",["50","100","435","538"],1,"Each of the 50 states elects two senators, for a total of 100."],
    ["How long is a U.S. senator's term?",["2 years","4 years","6 years","8 years"],2,"Senators serve six-year terms, staggered so about one-third of seats are elected every two years."],
    ["How many voting members are in the House of Representatives?",["100","270","435","500"],2,"The House has 435 voting members, apportioned among the states by population."],
    ["What is the minimum age to serve as President?",["25","30","35","40"],2,"Article II of the Constitution requires the President to be at least 35 years old."],
    ["What are the first ten amendments to the Constitution called?",["The Articles of Confederation","The Bill of Rights","The Federalist Papers","The Preamble"],1,"The Bill of Rights was ratified in 1791."],
    ["Which amendment set the voting age at 18?",["15th","19th","24th","26th"],3,"The 26th Amendment, ratified in 1971, lowered the voting age from 21 to 18."],
    ["Which branch of government interprets the laws?",["Legislative","Executive","Judicial","Administrative"],2,"The judicial branch, led by the Supreme Court, interprets laws and the Constitution."],
    ["How can Congress override a presidential veto?",["A simple majority in the House","A two-thirds vote in both chambers","A vote by the Supreme Court","A national referendum"],1,"A veto override needs a two-thirds vote in both the House and the Senate."],
    ["In what year was the U.S. Constitution signed?",["1776","1781","1787","1791"],2,"Delegates signed the Constitution in Philadelphia on September 17, 1787."],
    ["Which Supreme Court case established judicial review?",["Marbury v. Madison","Brown v. Board of Education","McCulloch v. Maryland","Gibbons v. Ogden"],0,"Marbury v. Madison (1803) confirmed the courts' power to strike down laws that conflict with the Constitution."]
  ];
  const qz = $("#quiz");
  if (qz){
    let i = 0, score = 0;
    const render = () => {
      if (i >= QZ.length){
        const msg = score >= 9 ? "Outstanding — you know your civics." : score >= 7 ? "Great work — just a few to review." : score >= 4 ? "A solid start. The units above will fill in the gaps." : "Everyone starts somewhere. Explore the units above and try again.";
        qz.innerHTML = `<div class="q-score"><span class="tag">Your result</span><div class="big">${score}/${QZ.length}</div><p class="lead">${msg}</p><button class="btn" type="button" id="q-again">Try again</button></div>`;
        $("#q-again").addEventListener("click", () => { i = 0; score = 0; render(); }); $("#q-again").focus(); return;
      }
      const [q, opts, ans, why] = QZ[i];
      qz.innerHTML = `<div class="q-top"><span>Question ${i+1} of ${QZ.length}</span><span>Score: ${score}</span></div><div class="q-bar"><i style="width:${i/QZ.length*100}%"></i></div>
        <h3 id="q-h" tabindex="-1">${q}</h3><div class="q-opts" role="group" aria-labelledby="q-h">${opts.map((o,k)=>`<button type="button" data-k="${k}">${o}</button>`).join("")}</div><div id="q-after" aria-live="polite"></div>`;
      $(".q-opts", qz).addEventListener("click", e => {
        const b = e.target.closest("[data-k]"); if (!b || b.disabled) return; const k = +b.dataset.k;
        $$(".q-opts button", qz).forEach(x => { x.disabled = true; if (+x.dataset.k === ans) x.classList.add("right"); });
        if (k === ans) score++; else b.classList.add("wrong");
        $("#q-after").innerHTML = `<div class="q-explain"><strong>${k===ans?"Correct.":"Not quite."}</strong> ${why}</div><p style="margin-top:16px"><button class="btn btn-sm" type="button" id="q-next">${i+1<QZ.length?"Next question":"See my score"}</button></p>`;
        $("#q-next").addEventListener("click", () => { i++; render(); $("#q-h")?.focus(); }); $("#q-next").focus();
      });
    };
    render();
  }

  /* glossary filter */
  const gi = $("#gloss-q");
  if (gi){
    const terms = $$(".term"), count = $("#gloss-count");
    const run = () => { const q = gi.value.trim().toLowerCase(); let n = 0; terms.forEach(t => { const on = !q || t.textContent.toLowerCase().includes(q); t.hidden = !on; if (on) n++; }); count.textContent = `${n} ${n===1?"term":"terms"}`; };
    gi.addEventListener("input", run); run();
  }

  /* newsletter */
  $$(".newsletter").forEach(f => f.addEventListener("submit", async e => {
    e.preventDefault(); const em = $("input[type=email]", f).value.trim(), box = f.parentElement;
    if (!validEmail(em)) return say(box, "Please enter a valid email address.", "err", true);
    if (await send({_subject:"Newsletter sign-up", type:"newsletter", email:em})){ say(box, "Thank you — you're subscribed. The next learning letter will arrive soon.", "ok", true); f.reset(); }
    else say(box, `Almost there — <a href="mailto:${CFG.email}?subject=${encodeURIComponent("Newsletter sign-up")}&body=${encodeURIComponent("Please add "+em+" to the Civic Sparrow learning letter.")}" style="color:inherit;font-weight:700">send us a quick email</a> to confirm your subscription.`, "info", true);
  }));

  /* contact & enquiry forms */
  $$("form[data-form]").forEach(cf => cf.addEventListener("submit", async e => {
    e.preventDefault(); $(".msg", cf)?.remove(); let ok = true; const g = n => $(`[name="${n}"]`, cf);
    if (bad(g("name"), g("name").value.trim().length < 2)) ok = false;
    if (bad(g("email"), !validEmail(g("email").value))) ok = false;
    if (g("topic") && bad(g("topic"), !g("topic").value)) ok = false;
    if (bad(g("message"), g("message").value.trim().length < 15)) ok = false;
    if (bad(g("agree"), !g("agree").checked)) ok = false;
    if (!ok) return say(cf, "Please check the highlighted fields.");
    const d = {}; $$("input,select,textarea", cf).forEach(el => { if (el.name && el.type !== "checkbox" && el.name !== "website") d[el.name] = el.value.trim(); });
    const label = cf.dataset.form === "enquiry" ? "Service enquiry" : "Website message";
    if (await send({_subject:`${label}: ${d.topic||""}`, ...d})){ cf.reset(); say(cf, "Thank you — your message has reached us. We reply within two business days.", "ok"); }
    else { say(cf, "Opening your email app so you can send this message to us…", "info");
      location.href = `mailto:${CFG.email}?subject=${encodeURIComponent(label+": "+(d.topic||""))}&body=${encodeURIComponent(Object.entries(d).map(([k,v])=>k[0].toUpperCase()+k.slice(1)+": "+v).join("\n"))}`; }
  }));
})();
