import { PrismaClient, Industry, Platform, AdGoal, AdStyle } from '@prisma/client'

const prisma = new PrismaClient()

const templates = [
  {
    name: 'Beauty Product Launch',
    description: 'Perfekt fuer neue Kosmetik- und Hautpflegeprodukte',
    industry: Industry.BEAUTY,
    platform: Platform.TIKTOK,
    goal: AdGoal.SALES,
    style: AdStyle.CASUAL,
    duration: 30,
    hookTemplates: [
      'POV: Du hast endlich [Produkt] entdeckt...',
      'Okay aber warum redet niemand ueber [Produkt]?',
      'Das ist der Grund warum meine Haut jetzt so aussieht',
      'Ich habe [Produkt] 30 Tage getestet und...',
      'Mein ehrliches Review nach [X] Wochen',
    ],
    ctaTemplates: [
      'Link in Bio fuer [X]% Rabatt',
      'Klick auf den Link bevor es ausverkauft ist',
      'Probier es selbst - du wirst es nicht bereuen',
    ],
  },
  {
    name: 'Fitness Transformation',
    description: 'Fuer Fitness-Programme, Supplements und Equipment',
    industry: Industry.FITNESS,
    platform: Platform.INSTAGRAM_REELS,
    goal: AdGoal.LEADS,
    style: AdStyle.EMOTIONAL,
    duration: 45,
    hookTemplates: [
      'Von [Problem] zu [Ergebnis] in [Zeitraum]',
      'Das hat mein Coach mir nie gesagt...',
      'Hoer auf [falsche Methode] zu machen',
      'Der Fehler den 90% im Gym machen',
      'So habe ich [X] kg in [Y] Wochen verloren',
    ],
    ctaTemplates: [
      'Kostenloses Erstgespraech - Link in Bio',
      'Starte deine Transformation heute',
      'Die ersten 100 bekommen [Bonus]',
    ],
  },
  {
    name: 'SaaS Demo',
    description: 'Fuer Software-Produkte und Apps',
    industry: Industry.SAAS,
    platform: Platform.YOUTUBE_SHORTS,
    goal: AdGoal.APP_INSTALL,
    style: AdStyle.EDUCATIONAL,
    duration: 30,
    hookTemplates: [
      'Diese App hat mir [X] Stunden pro Woche gespart',
      'Warum nutzt nicht jeder [Produkt]?',
      'Der Produktivitaets-Hack den ich dir verschwiegen habe',
      'Ich habe [X] Tools getestet - nur dieses nutze ich',
      'Automatisiere [Problem] in 2 Minuten',
    ],
    ctaTemplates: [
      'Teste es 14 Tage kostenlos',
      'Download-Link in der Bio',
      'Sichere dir den Fruebucher-Rabatt',
    ],
  },
  {
    name: 'Food & Beverage',
    description: 'Fuer Restaurants, Lieferdienste und Lebensmittel',
    industry: Industry.FOOD,
    platform: Platform.TIKTOK,
    goal: AdGoal.SALES,
    style: AdStyle.HUMOROUS,
    duration: 15,
    hookTemplates: [
      'Der beste [Gericht] in [Stadt] - keine Diskussion',
      'Ich habe [X] [Gerichte] probiert damit du es nicht musst',
      'POV: Du bestellst zum ersten Mal bei [Brand]',
      'Warum haben mir das meine Freunde verschwiegen?',
      'Das Rezept das meine Oma nie verraten wollte',
    ],
    ctaTemplates: [
      'Bestell jetzt mit Code [X] fuer 20% Rabatt',
      'Link in Bio - du wirst es nicht bereuen',
      'Probier es bevor es viral geht',
    ],
  },
  {
    name: 'Lokale Dienstleistung',
    description: 'Fuer Handwerker, Salons, Studios und lokale Services',
    industry: Industry.LOCAL_SERVICE,
    platform: Platform.INSTAGRAM_REELS,
    goal: AdGoal.LEADS,
    style: AdStyle.PROFESSIONAL,
    duration: 30,
    hookTemplates: [
      'Endlich ein [Dienstleistung] in [Stadt] dem ich vertraue',
      'Suchst du einen zuverlaessigen [Beruf] in [Region]?',
      'Das hat mein [Beruf] letzte Woche fuer mich gemacht',
      'Bevor du [Dienstleistung] buchst - lies das',
      '[X] Dinge die ein guter [Beruf] tut',
    ],
    ctaTemplates: [
      'Kostenloses Angebot anfordern - Link in Bio',
      'Schreib uns eine DM fuer einen Termin',
      'Erste Beratung gratis - jetzt buchen',
    ],
  },
  {
    name: 'Event Promotion',
    description: 'Fuer Konzerte, Workshops, Konferenzen und Events',
    industry: Industry.EVENTS,
    platform: Platform.TIKTOK,
    goal: AdGoal.AWARENESS,
    style: AdStyle.GENZ,
    duration: 15,
    hookTemplates: [
      'Das passiert wenn du zu [Event] kommst',
      'POV: Du bist auf dem besten Event des Jahres',
      'Nur noch [X] Tickets verfuegbar',
      'Jeder redet ueber [Event] - und das zurecht',
      'Das musst du diesen [Monat] erleben',
    ],
    ctaTemplates: [
      'Tickets jetzt sichern - Link in Bio',
      'Wer kommt mit? Tagge deine Crew',
      'Early Bird endet [Datum]',
    ],
  },
  {
    name: 'E-Commerce Produkt',
    description: 'Allgemeine Vorlage fuer Online-Shops',
    industry: Industry.ECOMMERCE,
    platform: Platform.TIKTOK,
    goal: AdGoal.SALES,
    style: AdStyle.CASUAL,
    duration: 30,
    hookTemplates: [
      'TikTok hat mich dazu gebracht [Produkt] zu kaufen',
      'Der TikTok-Trend der sein Geld wert ist',
      'Unboxing meiner Bestellung von [Brand]',
      'Ich bin besessen von diesem [Produkt]',
      'Das Produkt das mein [Problem] geloest hat',
    ],
    ctaTemplates: [
      'Link in Bio + Code [X] fuer Rabatt',
      'Sichere dir deins bevor es weg ist',
      'Shop-Link findest du in meiner Bio',
    ],
  },
]

async function main() {
  console.log('Seeding database...')

  // Create templates
  for (const template of templates) {
    await prisma.template.upsert({
      where: { name: template.name },
      update: template,
      create: {
        ...template,
        scriptStructure: {
          sections: ['hook', 'problem', 'solution', 'proof', 'cta'],
        },
        shotlistTemplate: {
          defaultShots: ['talking_head', 'product_shot', 'b_roll'],
        },
      },
    })
  }

  console.log(`Created ${templates.length} templates`)

  // Create demo brand and product for testing (if no users exist)
  const userCount = await prisma.user.count()

  if (userCount === 0) {
    console.log('Creating demo user, team, brand and product...')

    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@adspark.ai',
        name: 'Demo User',
        emailVerified: new Date(),
      },
    })

    const demoTeam = await prisma.team.create({
      data: {
        name: 'Demo Team',
        slug: 'demo-team',
        ownerId: demoUser.id,
        credits: 100,
      },
    })

    await prisma.teamMember.create({
      data: {
        teamId: demoTeam.id,
        userId: demoUser.id,
        role: 'OWNER',
      },
    })

    await prisma.creditLedger.create({
      data: {
        teamId: demoTeam.id,
        userId: demoUser.id,
        amount: 100,
        balance: 100,
        type: 'BONUS',
        description: 'Demo Credits',
      },
    })

    const demoBrand = await prisma.brand.create({
      data: {
        teamId: demoTeam.id,
        name: 'GlowUp Skincare',
        description: 'Premium Hautpflege fuer strahlende Haut',
        targetAudience: 'Frauen 25-45, interessiert an Hautpflege und Selbstfuersorge',
        tonality: ['locker', 'vertrauenswuerdig', 'trendy'],
        usps: ['100% natuerliche Inhaltsstoffe', '30 Tage Geld-zurueck-Garantie', 'Tierversuchsfrei'],
        noGos: ['Aggressive Verkaufssprache', 'Unrealistische Versprechen'],
        language: 'de',
        region: 'DE',
        industry: Industry.BEAUTY,
        websiteUrl: 'https://example.com',
      },
    })

    await prisma.product.create({
      data: {
        brandId: demoBrand.id,
        name: 'Vitamin C Serum',
        description: 'Unser meistverkauftes Vitamin C Serum fuer einen strahlenden Teint. Mit 15% Vitamin C und Hyaluronsaeure.',
        price: '34,90',
        currency: 'EUR',
        benefits: [
          'Reduziert dunkle Flecken',
          'Schuetzt vor freien Radikalen',
          'Foerdert die Kollagenproduktion',
          'Fuer alle Hauttypen geeignet',
        ],
        objections: [
          'Zu teuer',
          'Funktioniert Vitamin C wirklich?',
          'Wie lange dauert es bis ich Ergebnisse sehe?',
        ],
        reviews: [
          'Nach 2 Wochen sehe ich schon einen Unterschied!',
          'Endlich ein Serum das nicht klebt',
          'Meine Haut hat noch nie so gestrahlt',
        ],
      },
    })

    console.log('Demo data created!')
  }

  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
