// import i18n from "i18next"
// import detector from "i18next-browser-languagedetector"
// import backend from "i18next-http-backend"
// import { initReactI18next } from "react-i18next"
//
// i18n
//   .use(detector)
//   .use(backend)
//   .use(initReactI18next) // passes i18n down to react-i18next
//   .init({
//     lng: "en",
//     fallbackLng: "en",
//     saveMissing: false,
//     interpolation: {
//       escapeValue: false // react already safes from xss
//     },
//     defaultNS: 'phala',
//     fallbackNS: 'translation',
//     keySeparator: false,
//     nsSeparator: false
//   })
//
// export default i18n

const NextI18Next = require('next-i18next').default
const { localeSubpaths } = require('next/config').default().publicRuntimeConfig
const path = require('path')

module.exports = new NextI18Next({
    otherLanguages: ['zh'],
    localeSubpaths,
    localePath: path.resolve('./public/locales'),
    lng: "en",
    fallbackLng: "en",
    saveMissing: false,
    interpolation: {
        escapeValue: false // react already safes from xss
    },
    defaultNS: 'phala',
    fallbackNS: 'translation',
    keySeparator: false,
    nsSeparator: false
})
