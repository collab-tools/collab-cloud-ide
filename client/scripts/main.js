// Unamed imports of used Ace components
import 'brace/mode/javascript';
import 'brace/theme/monokai';

import ace from 'brace';
import bootstrap from 'bootstrap';
import diff from 'jsdiff';
import Vue from 'vue';
import AppView from './app.vue';


console.log(window.location.pathname);


// Render Vue Component
new Vue({
  el: '#app-container',
  render(createElement) {
    return createElement(AppView);
  }
});

const editor = ace.edit('editor');
editor.setTheme('ace/theme/monokai');
editor.getSession().setMode('ace/mode/javascript');
editor.$blockScrolling = Infinity;


if (!/^([0-9])$/.test(clientId[0])) {
  alert('Invalid Client ID - did you forget to insert your application Client ID?');
}
// Create a new instance of the realtime utility with your client ID.
var realtimeUtils = new utils.RealtimeUtils({ clientId: clientId });

authorize();

function authorize() {
  // Attempt to authorize
  realtimeUtils.authorize(function (response) {
    if (response.error) {
      // Authorization failed because this is the first time the user has used your application,
      // show the authorize button to prompt them to authorize manually.
      var button = document.getElementById('auth_button');
      button.classList.add('visible');
      button.addEventListener('click', function () {
        realtimeUtils.authorize(function (response) {
          start();
        }, true);
      });
    } else {
      start();
    }
  }, false);
}

function start() {
  // With auth taken care of, load a file, or create one if there
  // is not an id in the URL.
  var id = realtimeUtils.getParam('id');
  if (id) {
    // Load the document id from the URL
    realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
  } else {
    // Create a new document, add it to the URL
    realtimeUtils.createRealtimeFile('New Quickstart File', function (createResponse) {
      window.history.pushState(null, null, '?id=' + createResponse.id);
      realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
    });
  }
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {
  var string = model.createString();
  string.setText('Welcome to the Quickstart App!');
  model.getRoot().set('demo_string', string);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {
  var collaborativeString = doc.getModel().getRoot().get('demo_string');
  wireTextBoxes(collaborativeString);
}


// Connects the text boxes to the collaborative string
let ignore = false;

function wireTextBoxes(collaborativeString) {
  editor.getSession().setValue(collaborativeString.getText());
  editor.on('input', function () {
    if (!ignore)
      collaborativeString.setText(editor.getSession().getValue());
  })

  collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, function () {
    ignore = true;
    var pos = editor.session.selection.toJSON()
    editor.getSession().setValue(collaborativeString.getText());
    editor.session.selection.fromJSON(pos)
    ignore = false;
  });

  collaborativeString.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, function () {
    ignore = true;
    var pos = editor.session.selection.toJSON()
    editor.getSession().setValue(collaborativeString.getText());
    editor.session.selection.fromJSON(pos)
    ignore = false;
  });
}
