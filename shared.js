const { POINT_LOCATIONS, POINT_NAMES_REGEX, TANGYE_RULES, ZHONGSHI_RULES, YUANLUO_RULES } = require('./lib/rules.js');

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    POINT_LOCATIONS,
    POINT_NAMES_REGEX,
    TANGYE_RULES,
    ZHONGSHI_RULES,
    YUANLUO_RULES
  };
} else if (typeof window !== 'undefined') {
  window.POINT_LOCATIONS = POINT_LOCATIONS;
  window.POINT_NAMES_REGEX = POINT_NAMES_REGEX;
  window.TANGYE_RULES = TANGYE_RULES;
  window.ZHONGSHI_RULES = ZHONGSHI_RULES;
  window.YUANLUO_RULES = YUANLUO_RULES;
}
