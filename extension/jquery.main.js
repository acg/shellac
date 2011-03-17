; (function($) {

var extension_name = "Shellac";
var base_url = "http://127.0.0.1:8783";
var actions = {};


$(document).ready(function() {

  ajax('/config/', {}, {
    type: 'GET',
    dataType: 'json',
    success: function(data) {
      setup(data);
    }
  });

});


function setup(config)
{
  var parent_id = chrome.contextMenus.create({
    title: extension_name,
    contexts: ['all']
  });

  var context_onclick = function(info, tab) {
    var action = actions[info.menuItemId];
    var data = { action: action.name };
    $.each( info, function(k,v) { data["info."+k] = v; } );
    $.each( tab, function(k,v) { data["tab."+k] = v; } );
    ajax('/action/', data, { type:'POST' });
  };

  $.each( config.actions, function(i,action) {
    var child_id = chrome.contextMenus.create({
      title: action.title,
      onclick: context_onclick,
      parentId: parent_id,
      contexts: action.contexts
    });
    actions[child_id] = action;
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

