const translations = {
    it: {
        study_library: "Studia",
        search_questions: "Cerca domande...",
        filter_by_area: "Filtra per area",
        filter_by_level: "Filtra per livello",
        all_areas: "Tutte le aree",
        all_levels: "Tutti i livelli",
        no_questions_found: "Nessuna domanda trovata.",
        reflection_prompt: "Stimolo di riflessione",
        active_recall_prompt: "Richiamo attivo",
        learning_outcome: "Obiettivo didattico",
        didactic_note: "Nota didattica",
        key_concepts: "Concetti chiave",
        related_lessons: "Lezioni correlate",
        tags: "Tag",
        close: "Chiudi"
    },
    en: {
        study_library: "Study",
        search_questions: "Search questions...",
        filter_by_area: "Filter by area",
        filter_by_level: "Filter by level",
        all_areas: "All areas",
        all_levels: "All levels",
        no_questions_found: "No questions found.",
        reflection_prompt: "Reflection prompt",
        active_recall_prompt: "Active recall",
        learning_outcome: "Learning outcome",
        didactic_note: "Didactic note",
        key_concepts: "Key concepts",
        related_lessons: "Related lessons",
        tags: "Tags",
        close: "Close"
    }
};
let currentLang = 'it';
export function t(key) { return translations[currentLang][key] || key; }
export function setLanguage(lang) { if (translations[lang]) currentLang = lang; }