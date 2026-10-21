import { Currency, Unit } from '../store/useAppStore';

export type FuelGrade = 'Regular' | 'Midgrade' | 'Premium' | 'Diesel';

/**
 * Official weekly average fuel prices per covered city.
 *
 * Sources (fetched Oct 20, 2026):
 * - US cities: U.S. EIA weekly retail survey, week ending Oct 19, 2026.
 *   Regular is the EIA city series. Midgrade/Premium use EIA national grade
 *   spreads (+$0.60 / +$1.00 over Regular) because EIA does not publish those
 *   grades by city. Diesel is the EIA PADD-district average for the city's
 *   district, except Los Angeles, which uses the California series.
 * - Canadian cities: Natural Resources Canada weekly average retail prices
 *   (cents/litre converted to $/L). Mississauga is not surveyed by NRCan, so
 *   it uses Toronto's numbers (same GTA market).
 *
 * To refresh: update `averages` and `weekEnding` from the latest EIA / NRCan
 * weekly releases and commit. No API key is required.
 */
export interface CityPriceInfo {
  city: string;
  state: string;
  currency: Currency;
  unit: Unit;
  source: string;
  weekEnding: string;
  averages: Record<FuelGrade, number>;
  aliases: string[];
  zipPrefixes: string[];
}

export const CITY_PRICES: CityPriceInfo[] = [
  {
    city: 'Seattle',
    state: 'WA',
    currency: 'USD',
    unit: 'Gallon',
    source: 'EIA weekly retail survey',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 5.528, Midgrade: 6.128, Premium: 6.528, Diesel: 7.24 },
    aliases: ['seattle', 'tacoma', 'bellevue'],
    zipPrefixes: ['981', '980'],
  },
  {
    city: 'New York',
    state: 'NY',
    currency: 'USD',
    unit: 'Gallon',
    source: 'EIA weekly retail survey',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 4.25, Midgrade: 4.85, Premium: 5.25, Diesel: 5.91 },
    aliases: ['new york', 'nyc', 'manhattan', 'brooklyn', 'queens', 'bronx'],
    zipPrefixes: ['100', '101', '112', '113', '104'],
  },
  {
    city: 'Los Angeles',
    state: 'CA',
    currency: 'USD',
    unit: 'Gallon',
    source: 'EIA weekly retail survey',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 6.02, Midgrade: 6.62, Premium: 7.02, Diesel: 8.091 },
    aliases: ['los angeles', 'la', 'hollywood', 'santa monica'],
    zipPrefixes: ['900', '901', '902'],
  },
  {
    city: 'Chicago',
    state: 'IL',
    currency: 'USD',
    unit: 'Gallon',
    source: 'EIA weekly retail survey',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 4.705, Midgrade: 5.305, Premium: 5.705, Diesel: 6.26 },
    aliases: ['chicago'],
    zipPrefixes: ['606', '607', '608'],
  },
  {
    city: 'Houston',
    state: 'TX',
    currency: 'USD',
    unit: 'Gallon',
    source: 'EIA weekly retail survey',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 3.71, Midgrade: 4.31, Premium: 4.71, Diesel: 5.81 },
    aliases: ['houston'],
    zipPrefixes: ['770', '771', '772'],
  },
  {
    city: 'Toronto',
    state: 'ON',
    currency: 'CAD',
    unit: 'Liter',
    source: 'Natural Resources Canada weekly averages',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 1.771, Midgrade: 1.979, Premium: 2.083, Diesel: 2.611 },
    aliases: ['toronto', 'scarborough', 'north york', 'etobicoke'],
    zipPrefixes: ['m'],
  },
  {
    city: 'Mississauga',
    state: 'ON',
    currency: 'CAD',
    unit: 'Liter',
    source: 'Natural Resources Canada weekly averages (Toronto)',
    weekEnding: 'Oct 19, 2026',
    averages: { Regular: 1.771, Midgrade: 1.979, Premium: 2.083, Diesel: 2.611 },
    aliases: ['mississauga'],
    zipPrefixes: ['l4', 'l5'],
  },
  {
    city: 'Vancouver',
    state: 'BC',
    currency: 'CAD',
    unit: 'Liter',
    source: 'Natural Resources Canada weekly averages',
    weekEnding: 'Oct 20, 2026',
    averages: { Regular: 2.055, Midgrade: 2.234, Premium: 2.318, Diesel: 2.946 },
    aliases: ['vancouver', 'burnaby', 'richmond'],
    zipPrefixes: ['v'],
  },
];

export interface StationInfo {
  name: string;
  address: string;
  city: string; // must match a CityPriceInfo.city
  distance: number; // miles from the search point
  offset: number; // spread vs the city average, in the city's native unit
  grades: FuelGrade[];
}

const ALL: FuelGrade[] = ['Regular', 'Midgrade', 'Premium', 'Diesel'];
const NO_DIESEL: FuelGrade[] = ['Regular', 'Midgrade', 'Premium'];

export const STATIONS: StationInfo[] = [
  // Seattle, WA
  { name: 'Costco', address: '4401 4th Ave S', city: 'Seattle', distance: 2.4, offset: -0.12, grades: ALL },
  { name: 'Arco', address: '1201 Madison St', city: 'Seattle', distance: 0.8, offset: -0.06, grades: NO_DIESEL },
  { name: 'Safeway Gas', address: '3820 Rainier Ave S', city: 'Seattle', distance: 3.1, offset: -0.03, grades: ALL },
  { name: 'Chevron', address: '601 Westlake Ave N', city: 'Seattle', distance: 1.2, offset: 0.02, grades: ALL },
  { name: '76', address: '2701 Rainier Ave S', city: 'Seattle', distance: 2.8, offset: 0.04, grades: ALL },
  { name: 'Shell', address: '1000 Mercer St', city: 'Seattle', distance: 1.5, offset: 0.06, grades: ALL },
  { name: 'BP', address: '1650 S Columbian Way', city: 'Seattle', distance: 3.6, offset: 0.05, grades: NO_DIESEL },

  // New York, NY
  { name: 'Costco', address: '517 E River Plaza', city: 'New York', distance: 4.2, offset: -0.11, grades: ALL },
  { name: 'Speedway', address: '901 E Tremont Ave', city: 'New York', distance: 3.4, offset: -0.05, grades: ALL },
  { name: 'Gulf', address: '3260 Atlantic Ave', city: 'New York', distance: 4.8, offset: -0.02, grades: NO_DIESEL },
  { name: 'Mobil', address: '145 W Fordham Rd', city: 'New York', distance: 3.9, offset: 0.01, grades: ALL },
  { name: 'BP', address: '107-10 Queens Blvd', city: 'New York', distance: 4.5, offset: 0.03, grades: ALL },
  { name: 'Exxon', address: '572 W 235th St', city: 'New York', distance: 5.1, offset: 0.05, grades: NO_DIESEL },
  { name: 'Shell', address: '248-02 Northern Blvd', city: 'New York', distance: 5.6, offset: 0.06, grades: ALL },

  // Los Angeles, CA
  { name: 'Costco', address: '1345 N Montebello Blvd', city: 'Los Angeles', distance: 4.6, offset: -0.13, grades: ALL },
  { name: 'Arco', address: '3700 W Sunset Blvd', city: 'Los Angeles', distance: 1.9, offset: -0.07, grades: NO_DIESEL },
  { name: 'Sinclair', address: '8800 S Sepulveda Blvd', city: 'Los Angeles', distance: 4.1, offset: -0.02, grades: ALL },
  { name: 'Mobil', address: '7870 Melrose Ave', city: 'Los Angeles', distance: 2.2, offset: 0.02, grades: ALL },
  { name: '76', address: '1400 Vine St', city: 'Los Angeles', distance: 1.4, offset: 0.04, grades: ALL },
  { name: 'Chevron', address: '901 N Fairfax Ave', city: 'Los Angeles', distance: 2.6, offset: 0.06, grades: ALL },
  { name: 'Shell', address: '10711 Santa Monica Blvd', city: 'Los Angeles', distance: 3.3, offset: 0.07, grades: NO_DIESEL },

  // Chicago, IL
  { name: 'Costco', address: '2746 S Ashland Ave', city: 'Chicago', distance: 3.8, offset: -0.12, grades: ALL },
  { name: 'Speedway', address: '449 E Pershing Rd', city: 'Chicago', distance: 2.9, offset: -0.05, grades: ALL },
  { name: 'Marathon', address: '2638 W Fulton St', city: 'Chicago', distance: 2.1, offset: -0.02, grades: ALL },
  { name: 'Citgo', address: '3659 W Ogden Ave', city: 'Chicago', distance: 3.2, offset: 0.0, grades: NO_DIESEL },
  { name: 'Mobil', address: '43 E Chicago Ave', city: 'Chicago', distance: 0.9, offset: 0.03, grades: ALL },
  { name: 'BP', address: '1647 W Howard St', city: 'Chicago', distance: 4.4, offset: 0.05, grades: ALL },
  { name: 'Shell', address: '634 W Jackson Blvd', city: 'Chicago', distance: 1.1, offset: 0.06, grades: NO_DIESEL },

  // Houston, TX
  { name: "Buc-ee's", address: '28000 Highway 290', city: 'Houston', distance: 5.4, offset: -0.1, grades: ALL },
  { name: 'Murphy USA', address: '10411 S Main St', city: 'Houston', distance: 3.7, offset: -0.07, grades: ALL },
  { name: 'Costco', address: '1150 Bunker Hill Rd', city: 'Houston', distance: 4.9, offset: -0.09, grades: ALL },
  { name: 'Valero', address: '3702 Old Spanish Trl', city: 'Houston', distance: 2.3, offset: -0.03, grades: ALL },
  { name: 'Chevron', address: '2615 Southwest Fwy', city: 'Houston', distance: 1.8, offset: 0.02, grades: NO_DIESEL },
  { name: 'Exxon', address: '7111 Harrisburg Blvd', city: 'Houston', distance: 2.7, offset: 0.04, grades: ALL },
  { name: 'Shell', address: '1901 Allen Pkwy', city: 'Houston', distance: 1.2, offset: 0.05, grades: ALL },

  // Toronto, ON
  { name: 'Costco', address: '50 Queen Elizabeth Blvd', city: 'Toronto', distance: 3.4, offset: -0.055, grades: ALL },
  { name: 'Pioneer', address: '1535 Danforth Ave', city: 'Toronto', distance: 2.1, offset: -0.03, grades: NO_DIESEL },
  { name: 'Ultramar', address: '2460 Danforth Ave', city: 'Toronto', distance: 2.6, offset: -0.02, grades: NO_DIESEL },
  { name: 'Canadian Tire Gas+', address: '825 Eglinton Ave E', city: 'Toronto', distance: 3.9, offset: -0.015, grades: ALL },
  { name: 'Esso', address: '2148 Bloor St W', city: 'Toronto', distance: 3.1, offset: 0.005, grades: ALL },
  { name: 'Petro-Canada', address: '1235 Bay St', city: 'Toronto', distance: 0.9, offset: 0.015, grades: ALL },
  { name: 'Shell', address: '901 Bayview Ave', city: 'Toronto', distance: 2.4, offset: 0.025, grades: ALL },

  // Mississauga, ON
  { name: 'Costco', address: '3180 Laird Rd', city: 'Mississauga', distance: 3.2, offset: -0.055, grades: ALL },
  { name: 'Pioneer', address: '6430 Winston Churchill Blvd', city: 'Mississauga', distance: 2.7, offset: -0.03, grades: NO_DIESEL },
  { name: 'Canadian Tire Gas+', address: '3020 Argentia Rd', city: 'Mississauga', distance: 3.5, offset: -0.015, grades: ALL },
  { name: 'Esso', address: '6680 Dixie Rd', city: 'Mississauga', distance: 2.2, offset: 0.005, grades: ALL },
  { name: 'Husky', address: '1225 Eglinton Ave E', city: 'Mississauga', distance: 1.9, offset: 0.01, grades: ALL },
  { name: 'Petro-Canada', address: '5980 Hurontario St', city: 'Mississauga', distance: 1.4, offset: 0.015, grades: ALL },
  { name: 'Shell', address: '3455 Glen Erin Dr', city: 'Mississauga', distance: 2.9, offset: 0.025, grades: NO_DIESEL },

  // Vancouver, BC
  { name: 'Costco', address: '915 Expo Blvd', city: 'Vancouver', distance: 1.6, offset: -0.06, grades: ALL },
  { name: 'Super Save Gas', address: '6890 Fraser St', city: 'Vancouver', distance: 3.3, offset: -0.035, grades: NO_DIESEL },
  { name: 'Esso', address: '2991 Main St', city: 'Vancouver', distance: 1.8, offset: -0.01, grades: ALL },
  { name: 'Petro-Canada', address: '1150 W Broadway', city: 'Vancouver', distance: 1.5, offset: 0.01, grades: ALL },
  { name: 'Husky', address: '2590 Commercial Dr', city: 'Vancouver', distance: 2.2, offset: 0.015, grades: ALL },
  { name: 'Chevron', address: '2505 W 4th Ave', city: 'Vancouver', distance: 2.8, offset: 0.03, grades: ALL },
  { name: 'Shell', address: '1502 W 41st Ave', city: 'Vancouver', distance: 3.7, offset: 0.04, grades: NO_DIESEL },
];
