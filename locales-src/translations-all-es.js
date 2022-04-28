import languages from "../locales/all.js"
export default function init(scratchblocks) {
  scratchblocks.loadLanguages(languages)
}
init.languages = languages
