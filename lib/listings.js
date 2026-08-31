// =====================================================================
// REAL LISTINGS DATA
// Pulled from the live booking site: https://sgwayss.holidayfuture.com
// These are real, bookable properties. Since that site calculates nightly
// price dynamically (only after picking check-in/check-out dates), no
// fixed price is stored here — each listing links out to its real page
// on the booking engine for live rates, availability, and checkout.
// =====================================================================

export const CATEGORIES = [
  { slug: "homes", label: "Homes", available: true },
  { slug: "vibes", label: "Vibes", available: false },
  { slug: "services", label: "Services", available: false },
  { slug: "long-term", label: "Long-term", available: false },
  { slug: "commercial", label: "Commercial", available: false },
];

const SHARED_POLICIES = {
  checkIn: "4:00 PM",
  checkOut: "11:00 AM",
  pets: "Not allowed",
  smoking: "Not allowed inside",
  cancellation: [
    "100% refund up to 30 days before arrival",
    "50% refund up to 14 days before arrival",
  ],
};

export const LISTINGS = [
  {
    id: "stylish-suite-northwest",
    title: "Stylish Suite in NorthWest",
    type: "Guest Suite",
    location: "Manor Park, Northwest DC, Washington, DC",
    guests: 3,
    beds: 1,
    baths: 1,
    rating: 4.9,
    description:
      "Experience the best of Washington DC in this beautifully designed suite, perfectly blending style and comfort. Featuring a private entrance, cozy living area, a plush bed with luxurious linens, a modern bathroom, and a gourmet kitchenette. Enjoy high-speed WiFi, a flat-screen TV with streaming services, in-unit laundry, and secure entry. Just steps from picturesque Manor Park, with easy access to Downtown DC, the National Mall, Georgetown, and public transportation.",
    amenities: [
      "Free WiFi",
      "Kitchen",
      "Air conditioning",
      "Washing Machine",
      "Street parking",
      "Flat-screen TV",
      "Streaming services",
      "In-unit laundry",
    ],
    photo_url:
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-9xJ6FQ7ZuFTEeb2zE2L1OqjLj--1rms9Df37x0szbvx8-6722967049bce?width=1280&quality=70&format=webp&v=2",
    photo_gallery: [
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-9xJ6FQ7ZuFTEeb2zE2L1OqjLj--1rms9Df37x0szbvx8-6722967049bce?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-hXYKlbjeNKyTJxRNE3WlA1nEMdz1pMl7gZTItr-qOjY-672286c1cabed?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-bBRmzQ7Sm5FA4edItlZIO4euoInjlVeXH1tTxqeiDKg-672286c02dcdd?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-8--wFUzk69syRLhLQ08OhmJig53Dgqkzgu02G0XEWqTs-6722966f0fd29?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-322668-IL--8x5s1i----rxHY35-rt043rIQhWpXN-Kihy3NAz8w-6722966d94abb?width=1280&quality=70&format=webp&v=2",
    ],
    policies: SHARED_POLICIES,
    bookingUrl: "https://sgwayss.holidayfuture.com/listings/322668",
  },
  {
    id: "dc-presidential-suite-northwest",
    title: "DC Presidential Suite in NorthWest",
    type: "Townhouse",
    location: "Uptown Manor Park, Northwest DC, Washington, DC",
    guests: 6,
    beds: 3,
    baths: 3,
    rating: 4.6,
    description:
      "Experience the perfect blend of comfort, convenience, and community in this beautiful 3-bedroom family-friendly home in Uptown Manor Park, Northwest DC. Ideal for families, groups, and business travelers, with a modern kitchen, spacious living and dining areas, private parking, and an optional basement guest suite for extra guests. Minutes from the Capitol, the White House, Union Station, the Smithsonian, and DC's best restaurants and parks.",
    amenities: [
      "Kitchen",
      "Air conditioning",
      "Washing Machine",
      "Street parking",
      "Private parking (fee applies)",
      "Wireless internet",
      "Optional basement guest suite",
    ],
    photo_url:
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-1VqpVKKGAu3V9ffFqJl6lxT5bVeuCiIhzTBcJqs--tQU-67453ffbeb4bb?width=1280&quality=70&format=webp&v=2",
    photo_gallery: [
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-1VqpVKKGAu3V9ffFqJl6lxT5bVeuCiIhzTBcJqs--tQU-67453ffbeb4bb?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-Z2rP5v52ozciV8Y7-Rcr9fYCFcIOmjhfFnRAijAXXXk-67455ead6555f?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-pZAulkhnNBdLv9yZ8tNfUyfYi3xOwOEGMpYaDE--4Y6E-67453ffa44b77?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-pwIQdquD5Y1vCknyHckTDXz-c37KwV3uVWMlLHhFcpE-67455eac38230?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-333272-9LR6-gjNtZAyyUFoF3Mpd-WJHzstziDZXbKkqql3tVM-6744fe72a2b1f?width=1280&quality=70&format=webp&v=2",
    ],
    policies: SHARED_POLICIES,
    bookingUrl: "https://sgwayss.holidayfuture.com/listings/333272",
  },
  {
    id: "comfortable-1br-se-dc",
    title: "Comfortable 1BR in SE DC",
    type: "Apartment",
    location: "Southeast DC, Washington, DC",
    guests: 3,
    beds: 1,
    baths: 1,
    rating: null,
    description:
      "A comfortable 1-bedroom apartment in Southeast Washington, DC, in a quiet residential area — well positioned for guests who want to experience the city while staying outside the higher-priced downtown areas. Includes a full kitchen, private living area, bedroom, and bathroom, making it a practical choice for weekend visitors, business travelers, couples, and longer stays.",
    amenities: [
      "Kitchen",
      "Air conditioning",
      "Wireless internet",
      "Hair dryer",
      "Heating",
    ],
    photo_url:
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-ufYsVGegXjFTY5ZCXL3Yve4beXEGtmvXoOGgd8b2rwU-6a8dedaf25f1c?width=1280&quality=70&format=webp&v=2",
    photo_gallery: [
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-ufYsVGegXjFTY5ZCXL3Yve4beXEGtmvXoOGgd8b2rwU-6a8dedaf25f1c?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-Nn6qBo0houCtGqnjmdGoTQMhF1UffElcaUUzst9ldOM-6a8df54037eb3?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-9yfPdCxzNazYJwnTlpb8KVc1lRRiGOlgThtWHc4BJ84-6a8df53f7cd27?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-5aDfB2DpLK-ez1VDsvmHENVZrOnMb1vLJyIN8m1TGps-6a8df53ecf39c?width=1280&quality=70&format=webp&v=2",
      "https://bookingenginecdn.hostaway.com/listing/119152-584601-ThKyKHTnmTEv7YzmUjUsip-jORelL-f0gEg3rCOyEjk-6a8df53e167d1?width=1280&quality=70&format=webp&v=2",
    ],
    policies: SHARED_POLICIES,
    bookingUrl: "https://sgwayss.holidayfuture.com/listings/584601",
  },
];

export function getListingById(id) {
  return LISTINGS.find((listing) => listing.id === id) || null;
}
