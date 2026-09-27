import type { Itinerary } from '../types/itinerary';

export function generateMockItinerary(prompt = "", preferences: any = {}): Itinerary {
  const lowercasePrompt = prompt.toLowerCase();
  
  let destination = "Tokyo, Japan";
  let duration = 4;
  let currency = "USD";
  let estimatedCost = 1450;
  
  if (lowercasePrompt.includes("paris") || lowercasePrompt.includes("france")) {
    destination = "Paris, France";
    duration = 5;
    estimatedCost = 1850;
    currency = "EUR";
  } else if (lowercasePrompt.includes("bali") || lowercasePrompt.includes("indonesia")) {
    destination = "Bali, Indonesia";
    duration = 4;
    estimatedCost = 850;
    currency = "USD";
  } else if (lowercasePrompt.includes("iceland") || lowercasePrompt.includes("reykjavik")) {
    destination = "Reykjavik, Iceland";
    duration = 5;
    estimatedCost = 2100;
    currency = "USD";
  } else if (lowercasePrompt.includes("york") || lowercasePrompt.includes("nyc")) {
    destination = "New York City, USA";
    duration = 3;
    estimatedCost = 1600;
    currency = "USD";
  } else if (lowercasePrompt.includes("rome") || lowercasePrompt.includes("italy")) {
    destination = "Rome, Italy";
    duration = 4;
    estimatedCost = 1350;
    currency = "EUR";
  }

  return {
    tripTitle: `${duration}-Day Immersive Journey to ${destination}`,
    destination: destination,
    durationDays: duration,
    estimatedTotalCost: estimatedCost,
    currency: currency,
    summary: `A carefully crafted ${duration}-day travel experience featuring handpicked local hidden gems, iconic landmarks, authentic dining, and optimal daily pacing based on your request: "${prompt || 'General Exploration'}"`,
    travelTips: [
      "Purchase a local IC transport card at the arrival airport for seamless train & bus transit.",
      "Keep local cash handy for traditional street food vendors and small boutique shops.",
      "Book major landmark tickets online 2-3 weeks in advance to skip long entrance queues.",
      "Download offline maps (Google Maps or Maps.me) before heading out daily."
    ],
    days: Array.from({ length: duration }, (_, dIndex) => {
      const dayNum = dIndex + 1;
      return {
        dayNumber: dayNum,
        theme: getDayTheme(destination, dayNum),
        title: getDayTitle(destination, dayNum),
        stops: [
          {
            id: `day-${dayNum}-stop-1`,
            time: "09:00 AM",
            title: getStopTitle(destination, dayNum, 1),
            description: getStopDesc(destination, dayNum, 1),
            category: "sights",
            location: getStopLocation(destination, dayNum, 1),
            estimatedCost: Math.round(estimatedCost * 0.08),
            durationMinutes: 120,
            tips: "Arrive right at opening time to capture stunning photographs with minimal crowds.",
            mapQuery: getStopTitle(destination, dayNum, 1) + " " + destination,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-2`,
            time: "12:30 PM",
            title: getStopTitle(destination, dayNum, 2),
            description: getStopDesc(destination, dayNum, 2),
            category: "food",
            location: getStopLocation(destination, dayNum, 2),
            estimatedCost: Math.round(estimatedCost * 0.05),
            durationMinutes: 90,
            tips: "Try their seasonal chef specialty. Highly rated by local food critics.",
            mapQuery: getStopTitle(destination, dayNum, 2) + " " + destination,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-3`,
            time: "03:00 PM",
            title: getStopTitle(destination, dayNum, 3),
            description: getStopDesc(destination, dayNum, 3),
            category: "shopping",
            location: getStopLocation(destination, dayNum, 3),
            estimatedCost: Math.round(estimatedCost * 0.06),
            durationMinutes: 105,
            tips: "Great spot for picking up unique handcrafted souvenirs.",
            mapQuery: getStopTitle(destination, dayNum, 3) + " " + destination,
            completed: false,
          },
          {
            id: `day-${dayNum}-stop-4`,
            time: "07:00 PM",
            title: getStopTitle(destination, dayNum, 4),
            description: getStopDesc(destination, dayNum, 4),
            category: "food",
            location: getStopLocation(destination, dayNum, 4),
            estimatedCost: Math.round(estimatedCost * 0.09),
            durationMinutes: 120,
            tips: "Reservations recommended for dinner. Enjoy the ambient local vibe.",
            mapQuery: getStopTitle(destination, dayNum, 4) + " " + destination,
            completed: false,
          }
        ]
      };
    }),
    packingList: [
      {
        category: "Essentials",
        items: ["Passport & ID", "Universal power adapter", "Comfortable walking sneakers", "Reusable water bottle"]
      },
      {
        category: "Clothing",
        items: ["Light jacket / windbreaker", "Layerable shirts", "Rain umbrella or poncho", "Casual evening attire"]
      },
      {
        category: "Tech & Travel",
        items: ["Portable battery bank", "Noise-canceling headphones", "Travel insurance documents"]
      }
    ]
  };
}

function getDayTheme(dest: string, day: number) {
  if (day === 1) return "Arrival & Historic Foundations";
  if (day === 2) return "Cultural Immersion & Local Flavors";
  if (day === 3) return "Modern Wonders & Shopping";
  if (day === 4) return "Scenic Vistas & Sunset Farewell";
  return "Hidden Secrets & Relaxed Exploration";
}

function getDayTitle(dest: string, day: number) {
  if (dest.includes("Tokyo")) {
    return ["Asakusa Heritage & Sky Views", "Shinjuku Lights & Izakaya Crawl", "Harajuku Pop Culture & Shibuya Crossing", "Ginza Luxury & Hamarikyu Gardens"][day - 1] || "Tokyo Neighborhood Quest";
  }
  if (dest.includes("Paris")) {
    return ["Eiffel Tower & Seine Cruise", "Louvre Museum & Le Marais", "Montmartre & Sacré-Cœur Artist Quarter", "Versailles Palace Day Trip", "Latin Quarter & Luxembourg Gardens"][day - 1] || "Parisian Wandering";
  }
  return `Exploring Highlights of ${dest} - Part ${day}`;
}

function getStopTitle(dest: string, day: number, stopNum: number) {
  if (dest.includes("Tokyo")) {
    const stops = [
      ["Senso-ji Temple", "Asakusa Kagetsu Ramen", "Nakamise Shopping Street", "Tokyo Skytree Sunset Deck"],
      ["Meiji Jingu Shrine", "Harajuku Crepes & Takeshita Street", "Shibuya Crossing & Hachiko", "Omoide Yokocho Izakaya"],
      ["Tsukiji Outer Fish Market", "Sushi Dai Omakase", "Ginza Shopping District", "Roppongi Hills View"],
      ["Akihabara Electric Town", "Maid Cafe or Kanda Curry", "Animate Main Store", "Robot Dining & Bar"]
    ];
    return (stops[day - 1] && stops[day - 1][stopNum - 1]) || `Local Attraction ${stopNum}`;
  }
  if (dest.includes("Paris")) {
    const stops = [
      ["Eiffel Tower Lawn Walk", "Café de Flore Lunch", "Champ de Mars Stroll", "Bateaux Parisiens Seine Cruise"],
      ["Louvre Museum Masterpieces", "Angelina Hot Chocolate & Bistro", "Le Marais Vintage Boutiques", "Le Petit Marche Dinner"],
      ["Sacré-Cœur Basilica", "Montmartre Artist Square", "Place du Tertre Cafe", "Moulin Rouge Evening View"]
    ];
    return (stops[day - 1] && stops[day - 1][stopNum - 1]) || `Parisian Landmark ${stopNum}`;
  }
  return `${dest} Famous Highlight #${(day - 1) * 4 + stopNum}`;
}

function getStopDesc(dest: string, day: number, stopNum: number) {
  return `Experience the unique charm, architecture, and cultural atmosphere of this iconic location. Perfect for immersing yourself into ${dest}'s vibrant lifestyle.`;
}

function getStopLocation(dest: string, day: number, stopNum: number) {
  return `${dest} Central District`;
}
