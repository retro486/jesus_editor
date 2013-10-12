var api = {};
api.host = "";

// @param path, success, error
api.loadText = function(p) {
  $.ajax({
    type: "GET", url: this.host + "/api/data", data: {path:p.path}, dataType: "json",
    success: function(json) {
      p.success(json.result);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/data <<< ERROR: " + textStatus);
      p.error();
    }
  });
};

// @param path, contents, success, error
api.uploadText = function(p) {
  $.ajax({
    type: "POST", url: this.host + "/api/data", data: {path:p.path, contents:p.contents}, dataType: "json",
    success: function(json) {
      p.success();
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/data <<< ERROR: " + textStatus);
      p.error();
    }
  });
};

// @param sucess, error
api.getLoginUser = function(p) {
  $.ajax({
    type: "GET", url: this.host + "/api/account", data: {}, dataType: "json",
    success: function(json) {
      p.success(json);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/data <<< ERROR: " + textStatus);
      p.error();
    }
  });
};

// @param path, success, error
api.exproler = function(p) {
  $.ajax({
    type: "GET", url: this.host + "/api/exproler", data: {path:p.path}, dataType: "json",
    success: function(json) {
      p.success(json.result);
      console.log(json.result);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/data <<< ERROR: " + textStatus);
      p.error();
    }
  });
};

api.login = function() {
  location.href = this.host + "/login";
};

api.loginWithNewTab = function(callback) {
  var bg = chrome.extension.getBackgroundPage();
  bg.openLoginPage({
    loginUrl: this.host + "/login",
    callbackUrl: this.host,
    callback: function() {
      callback();
    }
  });
};

api.logout = function(p) {
  $.ajax({
    type: "GET", url: this.host + "/api/logout", data: {path:p.path}, dataType: "json",
    success: function(json) {
      p.success();
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/logout <<< ERROR: " + textStatus);
      p.error();
    }
  });
};

// @param data_type, path, success, error
api.getMetaData = function(p) {
  $.ajax({
    type: "GET", url: this.host + "/api/data/" + p.data_type, data: {path:p.path}, dataType: "json",
    success: function(json) {
      p.success(json.result);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      console.log("GET:/api/data <<< ERROR: " + textStatus);
      p.error();
    }
  });
};