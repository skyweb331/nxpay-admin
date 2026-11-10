import type { AutocompleteOption } from "@/components/Form";

/** ISO 3166-1 alpha-2. Availability is enforced by the API (BLOCKED_COUNTRIES / BLOCKED_US_STATES). */
const COUNTRY_CODES =
  "AD AE AG AI AL AM AO AR AT AU AW AX AZ BA BB BD BE BG BH BJ BL BM BN BO BQ BR BS BT BW BZ CA CH CI CK CL CM CO CR CV CW CY CZ DE DJ DK DM DO DZ EC EE EG ES FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HU ID IE IL IM IN IS IT JE JM JO JP KE KG KH KI KM KN KR KW KY KZ LA LC LI LK LR LS LT LU LV MA MC MD ME MF MG MH MK MN MO MQ MR MS MT MU MV MW MX MY MZ NA NC NE NG NI NL NO NP NR NZ OM PA PE PF PG PH PK PL PM PR PS PT PW PY QA RE RO RS RW SA SB SC SE SG SI SK SL SM SN SR ST SV SX SZ TC TD TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG US UY UZ VA VC VG VI VN VU WF WS XK YT ZA ZM".split(
    " ",
  );

const names = new Intl.DisplayNames(["en"], { type: "region" });

export const countryName = (code?: string | null) => (code ? (names.of(code.toUpperCase()) ?? code) : "—");

export const COUNTRY_OPTIONS: AutocompleteOption[] = COUNTRY_CODES.map((code) => ({
  value: code,
  label: countryName(code),
})).sort((a, b) => a.label.localeCompare(b.label));

export const US_STATES: AutocompleteOption[] = Object.entries({
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
}).map(([value, label]) => ({ value, label }));
