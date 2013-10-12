var WriteboxChooser = {};

WriteboxChooser.build = function(dialogID, feature, selectedCallback) {
  this.dialogID = dialogID;
  this.selectedCallback = selectedCallback;

  // init variables
  this.currentStorage = 'dropbox';
  this.currentFile = {
    dropbox: {id:'/', name:'Dropbox'},
    drive: {id:'root', name:'Google Drive'}
  };
  this.currentFolderNavList = {
    dropbox: [],
    drive:[]
  };

  // init component
  this._emptyFileList('dropbox');
  this._emptyFileList('drive');
  this._buildEventHandler();
  //this.buildNavigator();

  // restore previous status
  this._loadChooserStatus();
  //if (localStorage.currentFileID) {
  //  this.currentFileID = JSON.parse(localStorage.currentFileID)
  //}
  //if (localStorage.currentStorage) {
  //  this.currentStorage = localStorage.currentStorage;
  //}

  // change component with feature
  if (feature === 'open') {
    //this.buildOpenUI();
  } else if (feature === 'save') {
    //this.buildSaveUI();
  }
  this._switchStorage(this.currentStorage);
};

WriteboxChooser._saveChooserStatus = function() {
  localStorage.chooser = JSON.stringify({
    storage: this.currentStorage,
    file: this.currentFile,
    folderNavList: this.currentFolderNavList
  });
  //localStorage.currentFileID = JSON.stringify(this.currentFileID);
  //localStorage.currentStorage = this.currentStorage;
};

WriteboxChooser._loadChooserStatus = function() {
  if (localStorage.chooser) {
    var chooserStatus = JSON.parse(localStorage.chooser);
    this.currentStorage = chooserStatus.storage;
    this.currentFile = chooserStatus.file;
    this.currentFolderNavList = chooserStatus.folderNavList;
  }
  //localStorage.currentFileID = JSON.stringify(this.currentFileID);
  //localStorage.currentStorage = this.currentStorage;
};

WriteboxChooser._buildEventHandler = function() {
  var self = this;

  // side menu click event (switching storage)
  $(self.dialogID + ' .chooser-storagelist').unbind();
  $(self.dialogID + ' .chooser-storagelist').click(function() {
    var li = this;

    if ($(li).attr("data-storage") === 'dropbox') {
      self._switchStorage('dropbox');
    } else if ($(li).attr("data-storage") === 'drive') {
      self._switchStorage('drive');
    } else if ($(li).attr("data-storage") === 'local') {
      self._switchStorage('local');
    }
  });
};


WriteboxChooser._switchStorage = function(storage) {
  this.currentStorage = storage;

  // switch filelist elem
  $(this.dialogID + ' .chooser-filelist').hide();
  $(this.dialogID + ' .chooser-filelist[data-storage=' + this.currentStorage + ']').show();

  // switch selection mark
  $(this.dialogID + ' .chooser-storagelist').removeClass("selection");
  $(this.dialogID + ' .chooser-storagelist[data-storage=' + this.currentStorage + ']').addClass("selection");

  if (storage === 'dropbox' || storage === 'drive') {
    if ($(this.dialogID + ' .chooser-filelist[data-storage=' + this.currentStorage + '] li').size() === 0) {
      this._choose(this.currentStorage,
                   this.currentFile[this.currentStorage].id,
                   this.currentFile[this.currentStorage].name);
    } else {
      var navList = this.currentFolderNavList[this.currentStorage];
      this._buildFileNavigatorUI(navList);
    }
  } else if (storage === 'local') {
    this._buildLocalFileListUI();
  }
};

WriteboxChooser.buildOpenUI = function() {
    /*
    $("#exproler-title").text("Select text file..");
    $("li[data-attr=local]").show();
    $("#file-save-form").hide();
    */
};

WriteboxChooser.buildSaveUI = function() {
    /*
    $("#exproler-title").text("Save as..");
    $("li[data-attr=local]").hide();
    $("li[data-attr=dropbox]").click();
    $("#file-saveas-form").show();
    $("#file-saveas-form input").focus();
    $("#file-saveas-button").click(function() {
      self.fileSelectedCallback(self.path,$("#file-name-input").val());
    });
    */
};


WriteboxChooser._emptyFileList = function(storage) {
  $(this.dialogID + ' .chooser-filelist[data-storage=' + storage + ']').empty();
};

WriteboxChooser._showLoadingMessage = function() {
  var li = document.createElement('li');
  $(li)
    .addClass('loading')
    .text('Loading..');
  $(this.dialogID + ' .chooser-filelist[data-storage=' + this.currentStorage + ']').append(li);
};

WriteboxChooser._addEmptyFolderMessage = function() {
  var li = document.createElement('li');
  $(li)
    .text('No text file');
  $(this.dialogID + ' .chooser-filelist[data-storage=' + this.currentStorage + ']').append(li);
};

WriteboxChooser._choose = function(storage, fileID, fileName) {
  var self = this;

  if (storage === 'dropbox' || storage === 'drive') {
    self._emptyFileList(storage);
    self._showLoadingMessage();

    var navList = self._addNavigator(fileID, fileName);
    self._buildFileNavigatorUI(navList);

    var accessAPI = (storage === 'dropbox') ? api2.dropbox : api2.drive;
    accessAPI.getFiles({
      query: fileID,
      success: function(files) {
        self._buildCloudFileListUI(storage, files);
        self.currentFile[storage] = {id: fileID, name: fileName};
        self._saveChooserStatus();

        if (files.length === 0) {
          self._addEmptyFolderMessage();
        }
      },
      error: function() {
        // need to handle error
      }
    });
  } else if (storage === 'local') {
     // need to integrate local file management

  }
};

WriteboxChooser._buildCloudFileListUI = function(storage, files) {
  var self = this;

  self._emptyFileList(storage);
  var fileList = $(this.dialogID + ' .chooser-filelist[data-storage=' + storage + ']');
  // folder
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (f.type === 'folder') {
      var li = self._createCloudFileListItem(f);
      $(fileList).append(li);
    }
  }

  // file
  for (var i = 0; i < files.length; i++) {
    var f = files[i];
    if (f.type === 'file') {
      if (f.mimeType.substring(0,4) === "text" || f.mimeType === "application/octet-stream") {
        var li = self._createCloudFileListItem(f);
        $(fileList).append(li);
      }
    }
  }
};

WriteboxChooser._createCloudFileListItem = function(obj) {
  var self = this;

  var icon = document.createElement("img");
  if (obj.type === 'folder') {
    $(icon).attr("src","/image/folder.png");
  } else {
    $(icon).attr("src","/image/file.png");
  }

  var li = document.createElement("li");
  $(li)
    .attr("data-objtype",obj.type)
    .attr("data-fileid", obj.fileID)
    .attr("data-filestorage",obj.storage)
    .addClass(obj.type)
    .append(icon)
    .append(obj.fileName);

  $(li).click(function() {
    var type = $(this).attr('data-objtype');
    var storage = $(this).attr('data-filestorage');
    var fileID = $(this).attr('data-fileid');
    var fileName = $(this).text();

    if (type === 'folder') {
      self._choose(storage, fileID, fileName);
    } else {
      console.log('selected:' + storage + ' : ' + fileID);
      self.selectedCallback(storage, fileID, fileName);
    }
  });

  return li;
};

var searchFolderID = function(list, folderID) {
  var found = -1;
  for (var i = 0;i < list.length;i++) {
    if (list[i].folderID === folderID) {
      found = i;
      break;
    }
  }
  return found;
};
WriteboxChooser._addNavigator = function(folderID, folderName) {
  var self = this;
  var navList = self.currentFolderNavList[self.currentStorage];

  var i = searchFolderID(navList, folderID);
  if (i === -1) {
    navList.push({
      folderID: folderID,
      folderName: folderName
    });    
  } else {
    navList.splice(i+1, navList.length-(i+1));
  }

  return navList;
};

WriteboxChooser._buildFileNavigatorUI = function(navList) {
  var self = this;

  $(self.dialogID + ' .chooser-navigator').empty();
  for (var i = 0;i < navList.length;i++) {
    // Add folder navigation
    var span = document.createElement("span");
    $(span)
      .attr("data-folderid", navList[i].folderID)
      .append(navList[i].folderName);

    $(span).click(function() {
      self._choose(self.currentStorage, $(this).attr("data-folderid"), $(this).text());
    });

    if (i > 0) {
      $(self.dialogID + ' .chooser-navigator')
        .append(" > ")
        .append(span);
    } else {
      $(self.dialogID + ' .chooser-navigator')
        .append(" ")
        .append(span);
    }
  }
};

WriteboxChooser._buildLocalFileListUI = function() {
  var ul = $(this.dialogID + ' .chooser-filelist[data-storage=local]')
  $(ul).empty();
  
  var li_count = 0;
  var pool = textStorage.getPool(), ordered = [];
  for (var i=pool.length-1; i>=0; i-=1) {
    var item = pool[i];
    if (item.id === undefined) {
      item.editing_status = 'editing';
      item.id = 'localid-' + (new Date()).getTime() + ' ' + Math.floor(Math.random()*255+1);
      localStorage.pool = JSON.stringify(pool);
    }
    var li = this._createLocalFileListItem(item.id, item.name, item.contents, item.exit_time, i);
    $(ul).append(li);
    li_count += 1;
  }
  
  if (li_count > 0) {
    // $("#rollback-button img").removeClass("disable");
  } else {
    // $("#rollback-button img").addClass("disable");
  }

  $(this.dialogID + ' .chooser-storagelist[data-storage=local]').text('Local (' + pool.length + ')')
};

WriteboxChooser._createLocalFileListItem = function(fileID, fileName, contents, exitTime, index) {
  var li = document.createElement("li"),
      container = document.createElement("div"),
      name = document.createElement("div"),
      modified = document.createElement("div"),
      deletebutton = document.createElement("button");

  var icon = document.createElement("img");
  $(icon).attr("src","/image/file.png");

  var title = "";
  if (fileName !== "") {
    title = fileName;
  } else {
    title = contents.substr(0,30);
  }

  $(name)
    .addClass("file")
    .attr("data-i",index)
    .append(title);
  $(modified)
    .addClass("local-file-modified")
    .append(mydate.getWhen(new Date(Date.parse(exitTime))));
  $(deletebutton)
    .attr('data-fileid', fileID)
    .append("Discard");

  $(container)
    .append(name)
    .append(deletebutton)
    .append(modified);

  $(name).click(function() {
    //rollback(parseInt($(this).attr("data-i")));
    $(".dialog-bg").click();
  });

  $(deletebutton).click(function() {
    $(li).slideUp(200,function() {
      $(li).remove();
    });
    var pool = textStorage.getPool();
    for (var i = 0;i < pool.length;i++) {
      if (pool[i].id === $(deletebutton).attr('data-textid')) {
        console.log(pool[i].contents);
        pool.splice(i,1);
        break;
      }
    }
    textStorage.savePool(pool);
    //$("#exproler-dialog li[data-attr=local]").text("Local (" + pool.length + ")")
  });

  $(li).append(container);

  return li;
};


/*
var dpexp = {};

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
  $(self.nav).text("/");
  
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
*/
/*
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
*/
/*
dpexp._exproler = function(path_str, firsttime) {
  localStorage.currentpath = path_str;

  var self = this;
  self.path = path_str;

  $(self.list).empty();
  $(self.list).append("<li class='loading'>Loading..</li>");

  api.exproler({
    path: path_str,
    success: function(result) {
      self._createExprolerUI(result);
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
*/
/*
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
*/

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