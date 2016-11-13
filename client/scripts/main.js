/* eslint-disable */
var editor = ace.edit('editor');
editor.setTheme('ace/theme/xcode');
editor.getSession().setMode('ace/mode/c_cpp');
editor.$blockScrolling = Infinity;
document.getElementById('editor').style.fontSize = '18px';
var clientId = '961636068343-3aehjbc272hsf1ikr798b7j6t0k6pkpk.apps.googleusercontent.com';

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

function getParam(name) {
  var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function start() {
  $.ajax({
    url: "/api/auth/verify",
    type: "POST",
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'bearer ' + getParam('auth'));
    },
    success: function (payload) {
      token = payload.token;
      user = payload.user;
      activeProject = _.find(user.projects, { id: getParam('project') });
      getFileTree();
    }
  });
}

function getFileTree() {
  $.ajax({
    url: "/api/git/tree?owner=" + activeProject.githubRepoOwner + "&repo=" + activeProject.githubRepoName,
    type: "GET",
    beforeSend: function (xhr) {
      xhr.setRequestHeader('Authorization', 'bearer ' + token);
    },
    success: function (payload) {
      // translate flat hierachy to folder style
      files = _.map(payload.tree, function (tree) {
        var splitter = tree.path.split('/');
        tree.id = splitter.pop();
        tree.parent = splitter.length == 0 ? '#' : splitter.pop();
        tree.text = tree.id;
        return tree;
      });
      $('#navigation')
        .on('changed.jstree', function (e, data) {
          selected = data.instance.get_node(_.head(data.selected)).original;
        })
        .jstree({
          'core': {
            'data': files
          }
        });
    }
  });
}

var openBtn = document.getElementById('open_button');
openBtn.classList.add('visible');
openBtn.addEventListener('click', function () {
  if (selected) {
    $.ajax({
      url: "/api/mapping?repo=" + activeProject.githubRepoName + "&files=" + selected.id,
      type: "GET",
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'bearer ' + token);
      },
      success: function (payload) {
        activeFile = selected;
        if (payload[selected.id] === null) {
          // if no mapping, call realtime to create file
          $.ajax({
            url: "/api/git/file?repo=" + activeProject.githubRepoName + "&owner=" + activeProject.githubRepoOwner + "&path=" + selected.id,
            type: "GET",
            beforeSend: function (xhr) {
              xhr.setRequestHeader('Authorization', 'bearer ' + token);
            },
            success: function (payload) {
              activeFile.content = atob(payload.content);
              createFile();
            }
          });
        } else {
          // get mapping, load real time id
          loadFile(payload[selected.id]);
        }
      }
    });
  }
});

function createFile() {
  // Create a new document, add it to the URL
  realtimeUtils.createRealtimeFile(selected.id, function (createResponse) {
    var mappings = {};
    mappings[selected.id] = createResponse.id
    $.ajax({
      url: "/api/mapping?repo=" + activeProject.githubRepoName,
      type: "PUT",
      data: mappings,
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'bearer ' + token);
      },
      success: function (payload) {
        realtimeUtils.load(createResponse.id, onFileLoaded, onFileInitialize);
      }
    });
  });
}

function loadFile(id) {
  realtimeUtils.load(id.replace('/', ''), onFileLoaded, onFileInitialize);
}

// The first time a file is opened, it must be initialized with the
// document structure. This function will add a collaborative string
// to our model at the root.
function onFileInitialize(model) {
  var string = model.createString();
  string.setText(activeFile.content);
  model.getRoot().set('collabString', string);
}

// After a file has been initialized and loaded, we can access the
// document. We will wire up the data model to the UI.
function onFileLoaded(doc) {
  collaborativeString = doc.getModel().getRoot().get('collabString');
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

var pushBtn = document.getElementById('push_button');
pushBtn.classList.add('visible');
pushBtn.addEventListener('click', function () {
  if (activeFile) {
    $.ajax({
      url: "/api/git/file?repo=" + activeProject.githubRepoName + '&owner=' + activeProject.githubRepoOwner + '&path=' + activeFile.id,
      type: "PUT",
      data: { content: collaborativeString.getText() },
      beforeSend: function (xhr) {
        xhr.setRequestHeader('Authorization', 'bearer ' + token);
      },
      success: function (payload) {}
    });
  }
});
