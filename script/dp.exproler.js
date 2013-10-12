var dpexp = {
  accessApi: api2.dropbox
};

dpexp.init = function(param) {
  var self = this;

  if (localStorage.currentpath) {
    self.path = localStorage.currentpath;
  } else {
    self.path = '/';
  }

  self.list = $(param.listID);
  self.nav = $(param.navigatorID);
  self.kind = param.kind;
  self.fileSelectedCallback = param.fileSelectedCallback;
  self.nav_stack = [];
  
  $(self.list).empty();
  self._buildNavigator(self.path);
  //$(self.nav).text("/");
  
  if (self.kind === "save-as") {
    $("#exproler-title").text("Save as..");
    $("li[data-attr=local]").hide();
    $("li[data-attr=dropbox]").click();
    $("#file-saveas-form").show();
    $("#file-saveas-form input").focus();
    $("#file-saveas-button").click(function() {
      self.fileSelectedCallback(self.path,$("#file-name-input").val());
    });
	  $("#file-saveas-form input").keypress(function(e) {
	    if (e.keyCode === 13) {
        self.fileSelectedCallback(self.path,$("#file-name-input").val());
	    }
	  });
  } else {
    $("#exproler-title").text("Select text file..");
    $("li[data-attr=local]").show();
    $("#file-saveas-form").hide();
  }

  self._exproler(self.path, true);
};

dpexp.changeService = function(service) {
  if (service === 'dropbox') {
    this.accessApi = api2.dropbox;
    this._exproler('/', false);
  } else if (service === 'drive') {
    this.accessApi = api2.drive;
    this._exproler('/', false);
  }
};

dpexp._createExprolerUI = function(result) {
  var self = this;

  $(self.list).empty();

  // folder
  for (key in result) {
    var f = result[key];
    if (f.is_dir) {
	    var li = self._createListObj(f);
	    $(self.list).append(li);
	  }
  }
  
  // file
  if (self.kind !== "save-as") {
	  for (key in result) {
	    var f = result[key];
	    if (!f.is_dir) {
//        var ext = f.path.substring(f.path.length-4, f.path.length)
        if (f.mime_type.substring(0,4) === "text" || f.mime_type === "application/octet-stream") {
  		    var li = self._createListObj(f);
	  	    $(self.list).append(li);
	  	  }
		  }
	  }
  }
  self._buildNavigator(self.path);
};

dpexp._exproler = function(path_str, firsttime) {
  localStorage.currentpath = path_str;

  var self = this;
  self.path = path_str;

  $(self.list).empty();
  //var cache = {}, cached_result = null;
  //if (localStorage.cache) {
  //  cache = JSON.parse(localStorage.cache);
  //} else {
  //  cache = {};
  //}
  //if (path_str in cache) {
  //  cached_result = cache[path_str];
  //  self._createExprolerUI(cached_result);
  //} else {
    $(self.list).append("<li class='loading'>Loading..</li>");
  //}

  this.accessApi.getFiles({
    path: path_str,
    success: function(result) {
      self._createExprolerUI(result);
      //cache[path_str] = result;
      //localStorage.cache = JSON.stringify(cache);
    },
    error: function() {
      if (firsttime) {
        self._exproler('/', false);
      } else {
        $(self.list).empty();
        $(self.list).append("<li class='error-msg'>Can't load file tree from Dropbox.</li>");        
      }
   	}
  });
};

dpexp._createListObj = function(f) {
  var self = this;
  var tree = f.path.split('/');
  var name = tree[tree.length-1];

  var icon = document.createElement("img");
  if (f.is_dir === true) {
    $(icon).attr("src","/image/folder.png");
  } else {
    $(icon).attr("src","/image/file.png");
  }

  var li = document.createElement("li");
  $(li)
    .attr("is_dir",f.is_dir)
    .attr("data-path", f.path)
    .attr("data-id", f.id)
    .addClass(f.is_dir === true ? "folder" : "file")
    .append(icon)
    .append(name);

  $(li).click(function() {
    var path_str = $(this).attr("data-path");
    if ($(this).attr("is_dir") === "true") {
      self._exproler(path_str, false);
    } else {
      var filename = $(this).text();
      self.fileSelectedCallback(path_str, filename);
    }
  });

  return li;
};

dpexp._buildNavigator = function(path_str) {
  var self = this;
  $(self.nav).empty();

  var tree = path_str.split('/');
  var path = "/";

  // Add root navigation
  var span = document.createElement("span");
  $(span)
    .attr("data-path", path)
    .append("Dropbox");
  $(span).click(function() {
    self._exproler($(this).attr("data-path"), false);
  });
  $(self.nav).append(span);

  // Add folder navigation
  for (var i = 0;i < tree.length;i++) {
    if (tree[i] !== "") {
      path += "/" + tree[i];

      var span = document.createElement("span");
      $(span)
        .attr("data-path", path)
        .append(tree[i]);
      $(span).click(function() {
        self._exproler($(this).attr("data-path"), false);
      });
    
      if(i > 0) {
        $(self.nav).append(" > ");
      }
      $(self.nav).append(span);
    }
  }
};
