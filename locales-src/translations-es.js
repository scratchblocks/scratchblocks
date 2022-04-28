import languages from "../locales/forums.js"
export default function init(scratchblocks) {
  scratchblocks.loadLanguages(languages)
}
init.languages = languages
