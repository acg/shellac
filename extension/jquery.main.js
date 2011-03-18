; (function($) {

var extension_name = "Shellac";
var base_url = "http://127.0.0.1:8783";
var actions = {};
var parent_menu;


$(document).ready(function() {

  var uri = window.location.pathname;

  if (uri == '/background.html')
    init_background();
  else if (uri == '/popup.html')
    init_popup();

});


function init_background()
{
  parent_menu = chrome.contextMenus.create({
    title: extension_name,
    contexts: ['all']
  });

  ajax('/config/', {}, {
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      setup(data);
    }
  });
}


function init_popup()
{
  $('#server').html(base_url);
  $('#server').attr('href',base_url);

  ajax('/config/', {}, {
    type: 'GET',
    dataType: 'json',
    success: function(config) {
      $('#status').html('running');
      $.each( config.actions, function(i,action) {
        var li = $('<li></li>');
        li.html(action.title)
        $('#actions').append(li);
      });
    },
    error: function(data) {
      $('#status').html('error');
    }
  });
}


function setup(config)
{
  var context_onclick = function(info, tab) {
    var action = actions[info.menuItemId];
    var data = { action: action.name };
    $.each( info, function(k,v) { data["info."+k] = v; } );
    $.each( tab, function(k,v) { data["tab."+k] = v; } );
    ajax('/action/', data, { type:'POST' });
  };

  $.each( config.actions, function(i,action) {
    var child_menu = chrome.contextMenus.create({
      title: action.title,
      onclick: context_onclick,
      parentId: parent_menu,
      contexts: action.contexts
    });
    actions[child_menu] = action;
  });
}


function ajax(uri,data,opts)
{
  if (uri == null)
    uri = '/';
  if (opts == null)
    opts = {};

  var defaults = {
    type: 'GET',
    url: base_url+uri,
    data: data,
    dataType: 'html',
    success: function(data) {
      console.log("HTTP success");
    },
    error: function(xhr,textStatus) {
      console.log("HTTP error.");
    }
  };

  $.ajax($.extend({},defaults,opts));
}


})(jQuery);

