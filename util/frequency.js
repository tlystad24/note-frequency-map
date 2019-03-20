const scale = require('./scale');

function fromNote (note) { // Note object
    return calculate(note.name, note.octave, note.tuning);
}

// This function finds how much off the note is from either a defined one, or the closest one
function getCentsOffFromNote (name, octave, freq, rootNote) {
    let closestNoteName = name;
    let closestNoteOctave = octave
    // If no note is choosen, find the closest note
    if (closestNoteName === null || closestNoteOctave === null) {

        // First find the octave
        for (let i = -3; i < 40; i++) {
            let firstNote = calculate(scale[scale.length - 1], i - 1, rootNote);
            let lastNote = calculate([0], i + 2, rootNote);

            // Octave is not found, continue to next octave
            if (!(freq > firstNote && freq <= lastNote)) continue;

            // Octave was found, try to find the note.
            closestNoteOctave = i;

            // Find the closest note
            for (let i = 0; i < scale.length; i++) {
                let currentNoteFreq = calculate(scale[i], closestNoteOctave, rootNote);
                let centsDiff = centsDifference(currentNoteFreq, freq);
                if (centsDiff <= 50 && centsDiff > -50) {
                    closestNoteName = scale[i];
                    break;
                }
            }
            if (closestNoteName === null) continue;
        }
        
        // If the octave wasn't found
        if (closestNoteOctave === null) return false;
        // If the note wasn't found
        if (closestNoteName === null) return false;

    }
    return {
        note: {
            name: closestNoteName,
            octave: closestNoteOctave
        },
        cents: centsDifference(calculate(closestNoteName, closestNoteOctave, rootNote), freq)
    }
}

function centsDifference (f1, f2) {
	return 1200*(Math.log(f2/f1)/Math.log(2))
}

function transpose (note, octave, semitones) {
    let index = scale.indexOf(note.name) + semitones;
    let newOctave = note.octave;

    while (index < 0) {
        index += scale.length;
        newOctave--;
    }

    while (index > scale.length - 1) {
        index -= scale.length;
        newOctave++;
    }

    if (newOctave < 0) {
        return new Error(7, `This result in octave being "${octave}"`, string);
    }

    note.octave = newOctave;
    note.name = scale[index];
}

function getSemitonesFromNote (name1, octave1, name2, octave2) {
    let semitones = scale.indexOf(name1) - scale.indexOf(name2);
    let octaves = octave1 - octave2;
    return semitones + (octaves * scale.length);
}

function getSemitonesFromRoot (name, octave, rootNote) {
    return getSemitonesFromNote(name, octave, rootNote.name, rootNote.octave);
}

function getStepSize () {
    return Math.pow(2, 1/scale.length);
}

function calculate (name, octave, rootNote) {
    return rootNote.frequency * Math.pow(getStepSize(), getSemitonesFromRoot(name, octave, rootNote));
}

module.exports.fromNote = fromNote;
module.exports.transpose = transpose;
module.exports.getSemitonesFromNote = getSemitonesFromNote;
module.exports.getCentsOffFromNote = getCentsOffFromNote;