import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { getStringItem } from '@/utils/storage';

import en_US from './lang/en_US';
import vi_VN from './lang/vi_VN';

import { LocalEnum, StorageEnum } from '#/enum';

const defaultLng = getStringItem(StorageEnum.I18N) || (LocalEnum.vi_VN as string);
i18n
   .use(LanguageDetector)
   .use(initReactI18next)
   .init({
      debug: true,
      lng: defaultLng,
      fallbackLng: LocalEnum.vi_VN,
      interpolation: {
         escapeValue: false,
      },
      resources: {
         en_US: { translation: en_US },
         vi_VN: { translation: vi_VN },
      },
   });

export default i18n;
export const { t } = i18n;
