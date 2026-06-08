export const obesityFacts = [
  {
    icon: '❤️',
    title: 'Srdce',
    fact: 'Obezita zvyšuje riziko infarktu až o 300%. Každých 5 kg navyše zvyšuje krvný tlak o 2–3 mmHg.',
  },
  {
    icon: '🧠',
    title: 'Mozog',
    fact: 'Ľudia s obezitou majú o 35% vyššie riziko Alzheimerovej choroby. Tuk produkuje zápalové látky, ktoré poškodzujú mozog.',
  },
  {
    icon: '🦴',
    title: 'Kĺby',
    fact: 'Pri každom kroku nesú kolená záťaž 3–5× väčšiu ako je tvoja váha. Každý kg navyše = 3–5 kg záťaže na kolenách.',
  },
  {
    icon: '😴',
    title: 'Spánok',
    fact: 'Obezita je hlavnou príčinou spánkového apnoe – prestávanie dýchania počas spánku, ktoré poškodzuje srdce.',
  },
  {
    icon: '🩸',
    title: 'Diabetes',
    fact: 'Obezita spôsobuje 90% prípadov cukrovky 2. typu. Schudnutie 7% telesnej hmotnosti znižuje riziko o 58%.',
  },
  {
    icon: '🫁',
    title: 'Pľúca',
    fact: 'Každých 10 kg tuku stláča bránicu a znižuje kapacitu pľúc o 5–10%. Schudnutie = hlbší nádych.',
  },
  {
    icon: '⚡',
    title: 'Energia',
    fact: 'Tukové tkanivo produkuje zápalové cytokíny – chemické látky, ktoré ťa robia unavenými a spomaľujú myslenie.',
  },
  {
    icon: '🔬',
    title: 'Rakovina',
    fact: 'Obezita je spojená s 13 typmi rakoviny. Nadbytočný tuk zvyšuje produkciu estrogénu a inzulínu – hormónov rastu nádorov.',
  },
]

export const motivationalQuotes = [
  {
    text: 'Tvoje telo dokáže takmer čokoľvek. Je to tvoja myseľ, ktorú musíš presvedčiť.',
    author: 'Neznámy',
  },
  {
    text: 'Bolestivé je dnes. Ľutovanie bolí navždy.',
    author: 'Neznámy',
  },
  {
    text: 'Nezačínaš odznova. Začínaš s múdrosťou.',
    author: 'Neznámy',
  },
  {
    text: 'Každý krok, ktorý urobíš, ťa dostane bližšie k cieľu alebo ďalej od neho. Vyber si.',
    author: 'Neznámy',
  },
  {
    text: 'Rok od teraz budeš ľutovať, že si nezačal dnes.',
    author: 'Karen Lamb',
  },
  {
    text: 'Sila nepochádza z toho, čo dokážeš. Pochádza z prekonania toho, čo si myslel, že nedokážeš.',
    author: 'Rikki Rogers',
  },
  {
    text: 'Tvoje telo ťa počúva. Hovor mu dobré veci.',
    author: 'Neznámy',
  },
  {
    text: 'Disciplína je pamätanie na to, čo chceš.',
    author: 'David Campbell',
  },
  {
    text: 'Každý deň sa rozhodneš. Každý deň vyhrá buď ty alebo výhovorka.',
    author: 'Neznámy',
  },
  {
    text: 'Schudnúť 1 kg neznamená nič. Schudnúť 1 kg každý mesiac po dobu roka? To zmení život.',
    author: 'Neznámy',
  },
]

export const weightLossHealthBenefits = [
  { kg: 1, benefit: 'Zníženie tlaku na kĺby o 3–5 kg pri každom kroku' },
  { kg: 2, benefit: 'Znateľné zníženie krvného tlaku' },
  { kg: 3, benefit: 'Pokles LDL cholesterolu (zlý cholesterol)' },
  { kg: 5, benefit: 'Zníženie rizika cukrovky 2. typu o 50%' },
  { kg: 7, benefit: 'Výrazné zlepšenie spánku a energie' },
  { kg: 10, benefit: 'Zníženie rizika infarktu o 20%' },
  { kg: 15, benefit: 'Výrazné zlepšenie pohyblivosti kĺbov' },
  { kg: 20, benefit: 'Dramatické zníženie zápalov v tele' },
]

export function getHealthBenefitsAchieved(lostKg: number) {
  return weightLossHealthBenefits.filter((b) => lostKg >= b.kg)
}

export function getNextHealthMilestone(lostKg: number) {
  return weightLossHealthBenefits.find((b) => lostKg < b.kg)
}
