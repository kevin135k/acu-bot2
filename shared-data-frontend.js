// This file attaches the shared data to window for the frontend.
import { POINT_LOCATIONS, TANGYE_RULES, ZHONGSHI_RULES, YUANLUO_RULES } from './shared-data.js';

if (typeof window !== 'undefined') {
  window.POINT_LOCATIONS = POINT_LOCATIONS;
  window.TANGYE_RULES = TANGYE_RULES;
  window.ZHONGSHI_RULES = ZHONGSHI_RULES;
  window.YUANLUO_RULES = YUANLUO_RULES;
}
