import { Holiday } from "./types";

export const WEEK_DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

/**
 * Fixed-date holidays (month is 0-indexed).
 * Covers major US, Indian, and international observances.
 * CalendarGrid renders a coloured dot + tooltip for each match.
 */
export const HOLIDAYS: Holiday[] = [
  /* ── January ── */
  { month: 0,  day: 1,  label: "New Year's Day",        color: "gold"   },
  { month: 0,  day: 14, label: "Makar Sankranti",        color: "amber"  },
  { month: 0,  day: 15, label: "Martin Luther King Jr.", color: "blue"   },
  { month: 0,  day: 26, label: "Republic Day (India)",   color: "orange" },

  /* ── February ── */
  { month: 1,  day: 14, label: "Valentine's Day",        color: "pink"   },

  /* ── March ── */
  { month: 2,  day: 8,  label: "International Women's Day", color: "purple" },
  { month: 2,  day: 17, label: "St. Patrick's Day",      color: "green"  },
  { month: 2,  day: 25, label: "Holi",                   color: "rainbow"},

  /* ── April ── */
  { month: 3,  day: 1,  label: "April Fool's Day",       color: "yellow" },
  { month: 3,  day: 14, label: "Ambedkar Jayanti",       color: "blue"   },
  { month: 3,  day: 22, label: "Earth Day",              color: "green"  },

  /* ── May ── */
  { month: 4,  day: 1,  label: "Labour Day",             color: "red"    },
  { month: 4,  day: 12, label: "Mother's Day",           color: "pink"   },

  /* ── June ── */
  { month: 5,  day: 5,  label: "World Environment Day", color: "green"  },
  { month: 5,  day: 15, label: "Father's Day",           color: "blue"   },
  { month: 5,  day: 21, label: "World Music Day",        color: "purple" },

  /* ── July ── */
  { month: 6,  day: 4,  label: "Independence Day (US)",  color: "red"    },

  /* ── August ── */
  { month: 7,  day: 15, label: "Independence Day (India)", color: "orange" },

  /* ── September ── */
  { month: 8,  day: 1,  label: "Labour Day (US)",        color: "blue"   },
  { month: 8,  day: 5,  label: "Teachers' Day (India)",  color: "teal"   },

  /* ── October ── */
  { month: 9,  day: 2,  label: "Gandhi Jayanti",         color: "gold"   },
  { month: 9,  day: 31, label: "Halloween",              color: "orange" },

  /* ── November ── */
  { month: 10, day: 1,  label: "Diwali (approx)",        color: "gold"   },
  { month: 10, day: 11, label: "Veterans Day",           color: "red"    },
  { month: 10, day: 27, label: "Thanksgiving",           color: "amber"  },

  /* ── December ── */
  { month: 11, day: 25, label: "Christmas",              color: "red"    },
  { month: 11, day: 31, label: "New Year's Eve",         color: "gold"   },
];

/** Map color names → actual CSS values used in the dot */
export const HOLIDAY_COLORS: Record<string, string> = {
  gold:    "#f59e0b",
  amber:   "#d97706",
  blue:    "#3b82f6",
  orange:  "#f97316",
  pink:    "#ec4899",
  purple:  "#8b5cf6",
  green:   "#22c55e",
  yellow:  "#eab308",
  red:     "#ef4444",
  teal:    "#14b8a6",
  rainbow: "#a855f7",
};