try {
    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) throw ("Can't load SpeechRecognition");

    var recognition = new SpeechRecognition();
    if (!recognition) throw ("Can't load recognition");
} catch (e) {
    console.log(e);
    $('.no-browser-support').show();
    $('.app').hide();
}
const noteTextarea = $('#note-textarea');
const instructions = $('#recording-instructions');
const notesList = $('ul#notes');

let $language = 'en';
let noteContent = '';

// Get all notes from previous sessions and display them.
const notes = getAllNotes();
renderNotes(notes);


/*-----------------------------
      Voice Recognition
------------------------------*/

/*
The continuous property of the SpeechRecognition interface,
controls whether continuous results are returned for each recognition,
or only a single result.

If false, the recording will stop after a few seconds of silence.
When true, the silence period is longer (about 15 seconds),
allowing us to keep recording even when the user pauses.
*/
recognition.continuous = false;
// recognition.lang = 'vi';
recognition.lang = $language;

// This block is called every time the Speech APi captures a line.
recognition.onresult = function (event) {

    // event is a SpeechRecognitionEvent object.
    console.log('on res:',event);

    // It holds all the lines we have captured so far.// We only need the current one.
    const current = event.resultIndex;

    // Get a transcript of what was said.
    const transcript = event.results[current][0].transcript;

};

recognition.onstart = function () {
    instructions.text('Voice recognition activated. Try speaking into the microphone.');
}

recognition.onspeechend = function () {
    instructions.text('You were quiet for a while so voice recognition turned itself off.');
}

recognition.onerror = function (event) {
    if (event.error === 'no-speech') {
        instructions.text('No speech was detected. Try again.');
    }
}


/*-----------------------------
      App buttons and input
------------------------------*/

$('#start-record-btn').on('click', function (e) {
    if (noteContent.length) {
        noteContent += ' ';
    }
    recognition.start();
});


$('#pause-record-btn').on('click', function (e) {
    recognition.stop();
    instructions.text('Voice recognition paused.');
});

// Sync the text inside the text area with the noteContent variable.
noteTextarea.on('input', function () {
    noteContent = $(this).val();
})

$('#save-note-btn').on('click', function (e) {
    recognition.stop();

    if (!noteContent.length) {
        instructions.text('Could not save empty note. Please add a message to your note.');
    } else {
        // Save note to localStorage.
        // The key is the dateTime with seconds, the value is the content of the note.
        saveNote(new Date().toLocaleString(), noteContent);

        // Reset variables and update UI.
        noteContent = '';
        renderNotes(getAllNotes());
        noteTextarea.val('');
        instructions.text('Note saved successfully.');
    }

})


notesList.on('click', function (e) {
    e.preventDefault();
    const target = $(e.target);

    // Listen to the selected note.
    if (target.hasClass('listen-note')) {
        const content = target.closest('.note').find('.content').text();
        readOutLoud(content);
    }

    // Delete note.
    if (target.hasClass('delete-note')) {
        const dateTime = target.siblings('.date').text();
        deleteNote(dateTime);
        target.closest('.note').remove();
    }
});


/*-----------------------------
      Speech Synthesis
------------------------------*/

function readOutLoud(message) {
    const speech = new SpeechSynthesisUtterance();
/*
    The SpeechSynthesisUtterance interface of the Web Speech API represents a speech request.
    It contains the content the speech service should read and information about how to read it
    (e.g. language, pitch and volume.)
*/
    console.log('SpeechSynthesisUtterance', speech);
    // Set the text and voice attributes.
    speech.text = message;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 0.1;

    window.speechSynthesis.speak(speech);
}


/*-----------------------------
      Helper Functions
------------------------------*/

function changeLanguage() {
    $language = $('#language-select').find('option:selected').val();
    recognition.lang = $language;
}

function renderNotes(notes) {
    let html = '';
    if (notes.length) {
        notes.forEach(function (note) {
            html += `<li class="note">
          <p class="header">
            <span class="date">${note.date}</span>
            <a href="#" class="listen-note" title="Listen to Note">Listen to Note</a>
            <a href="#" class="delete-note" title="Delete">Delete</a>
          </p>
          <p class="content">${note.content}</p>
        </li>`;
        });
    } else {
        html = '<li><p class="content">You don\'t have any notes yet.</p></li>';
    }
    notesList.html(html);
}


function saveNote(dateTime, content) {
    localStorage.setItem('note-' + dateTime, content);
}


function getAllNotes() {
    const notes = [];
    let key;

    for (let i = 0; i < localStorage.length; i++) {
        key = localStorage.key(i);
        console.log(i)
        console.log(key)

        if (key.substring(0, 5) === 'note-') {
            notes.push({
                date: key.replace('note-', ''),
                content: localStorage.getItem(localStorage.key(i))
            });
        }
    }
    console.log(notes)
    return notes;
}


function deleteNote(dateTime) {
    localStorage.removeItem('note-' + dateTime);
}