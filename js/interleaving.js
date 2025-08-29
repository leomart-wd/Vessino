export function getInterleavedQuestions(allQuestions, subjects, types, count) {
    // Mix by subject and type (e.g. macro_area and question type)
    const subjectGroups = subjects.map(subject => allQuestions.filter(q => q.macro_area === subject));
    const typeGroups = types.map(type => allQuestions.filter(q => q.type === type));
    // Interleave: alternate from each group
    let mixed = [];
    for (let i = 0; i < count; i++) {
        if (subjectGroups[i % subjectGroups.length][i]) mixed.push(subjectGroups[i % subjectGroups.length][i]);
        if (typeGroups[i % typeGroups.length][i]) mixed.push(typeGroups[i % typeGroups.length][i]);
    }
    // Remove duplicates, limit to count
    return [...new Set(mixed)].slice(0, count);
}