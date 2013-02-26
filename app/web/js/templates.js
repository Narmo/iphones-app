this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["_templates"] = this["Handlebars"]["_templates"] || {};

this["Handlebars"]["_templates"]["templates/article-preview.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += " data-image=\"";
  foundHelper = helpers.image;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.image; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"";
  return buffer;}

  buffer += "<article class=\"article article_preview\" data-post-id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" ";
  stack1 = depth0.image;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += ">\n	<div class=\"article__image-holder\"></div>\n	<i class=\"icon icon_comment icon_comment_dark\" data-trigger=\"show_comments:";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.comment_count;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment_count; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</i>\n	<h1 class=\"article__title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h1>\n	<h2 class=\"article__author\">";
  stack1 = depth0.author;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ", ";
  stack1 = depth0.date;
  stack2 = {};
  foundHelper = helpers.format_date;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:stack2,data:data}) : helperMissing.call(depth0, "format_date", stack1, {hash:stack2,data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h2>\n</article>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/article.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	<div class=\"article__content\">";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n	";
  return buffer;}

  buffer += "<article class=\"article\">\n	<div class=\"article__image-holder\"><img src=\"";
  foundHelper = helpers.image;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.image; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" class=\"article__image\" /></div>\n	<div class=\"article__add-comment\"><i class=\"icon icon_comment icon_comment_dark icon_comment_add\" data-trigger=\"add_comment:";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\"></i></div>\n	<h1 class=\"article__title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h1>\n	<h2 class=\"article__author\">";
  stack1 = depth0.author;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + ", ";
  stack1 = depth0.date;
  stack2 = {};
  foundHelper = helpers.format_date;
  stack1 = foundHelper ? foundHelper.call(depth0, stack1, {hash:stack2,data:data}) : helperMissing.call(depth0, "format_date", stack1, {hash:stack2,data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h2>\n	";
  stack1 = depth0.content;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</article>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/comment.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "<img src=\"http://www.gravatar.com/avatar/";
  foundHelper = helpers.hash;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.hash; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "?s=50\" class=\"comment__avatar-img\" />";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n		";
  stack1 = {};
  foundHelper = helpers.renderComment;
  stack1 = foundHelper ? foundHelper.call(depth0, depth0, {hash:stack1,data:data}) : helperMissing.call(depth0, "renderComment", depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + "\n	";
  return buffer;}

  buffer += "<div class=\"comment\" data-comment-id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">\n	<div class=\"comment__h\">\n		<span class=\"comment__avatar\">";
  stack1 = depth0.hash;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n		<h3 class=\"comment__author\">";
  stack1 = depth0.author;
  stack1 = stack1 == null || stack1 === false ? stack1 : stack1.name;
  stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
  buffer += escapeExpression(stack1) + "</h3>\n		<p class=\"comment__date\">";
  foundHelper = helpers.date;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.date; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</p>\n	</div>\n	<div class=\"comment__content\">";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n	";
  stack1 = depth0.children;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/comments-list.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n		";
  stack1 = {};
  foundHelper = helpers.renderComment;
  stack1 = foundHelper ? foundHelper.call(depth0, depth0, {hash:stack1,data:data}) : helperMissing.call(depth0, "renderComment", depth0, {hash:stack1,data:data});
  buffer += escapeExpression(stack1) + "\n	";
  return buffer;}

  buffer += "<h1>Комментарии</h1>\n<h2>";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h2>\n<div class=\"comments__list\">\n	";
  stack1 = depth0.comments;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/sheet.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n			<h3 class=\"sheet__h-title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</h3> \n		";
  return buffer;}

  buffer += "<section class=\"sheet\">\n	<header class=\"sheet__h\">\n		<span class=\"sheet__h-back\">";
  foundHelper = helpers.back_label;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.back_label; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n		";
  stack1 = depth0.title;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		<span class=\"sheet__h-opt\">";
  foundHelper = helpers.options;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.options; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</span>\n	</header>\n	<div class=\"sheet__scroller\">\n		<div class=\"sheet__content\">\n			";
  foundHelper = helpers.content;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.content; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</div>\n	</div>\n</section>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/tile.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	<h3 class=\"tiles__subtitle\">";
  foundHelper = helpers.subtitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.subtitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n	";
  return buffer;}

function program3(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n	<i class=\"tiles__comments icon icon_comment\" data-trigger=\"show_comments:";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.comment_count;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment_count; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</i>\n	";
  return buffer;}

  buffer += "<div class=\"tiles__item\" data-feed-id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">\n	<h2 class=\"tiles__title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h2>\n	";
  stack1 = depth0.subtitle;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	";
  stack1 = depth0.allowComments;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(3, program3, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n	";
  foundHelper = helpers.tileAddon;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.tileAddon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</div>";
  return buffer;};

this["Handlebars"]["_templates"]["templates/tiles.hbs"] = function (Handlebars,depth0,helpers,partials,data) {
  helpers = helpers || Handlebars.helpers; data = data || {};
  var buffer = "", stack1, stack2, foundHelper, functionType="function", escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = "", stack1, stack2, foundHelper;
  buffer += "\n		<div class=\"tiles__item\" data-feed-id=\"";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\" data-image=\"";
  foundHelper = helpers.image;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.image; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">\n			<h2 class=\"tiles__title\">";
  foundHelper = helpers.title;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.title; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h2>\n			";
  stack1 = depth0.subtitle;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(2, program2, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n			";
  stack1 = depth0.allowComments;
  stack2 = {};
  stack1 = helpers['if'].call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(4, program4, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n			";
  foundHelper = helpers.tileAddon;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.tileAddon; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n		</div>\n	";
  return buffer;}
function program2(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n			<h3 class=\"tiles__subtitle\">";
  foundHelper = helpers.subtitle;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.subtitle; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</h3>\n			";
  return buffer;}

function program4(depth0,data) {
  
  var buffer = "", stack1, foundHelper;
  buffer += "\n			<i class=\"icon icon_comment\" data-trigger=\"show_comments:";
  foundHelper = helpers.id;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.id; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">";
  foundHelper = helpers.comment_count;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment_count; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "</i>\n			";
  return buffer;}

  buffer += "<section class=\"tiles ";
  foundHelper = helpers.classNames;
  if (foundHelper) { stack1 = foundHelper.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.classNames; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1) + "\">\n	";
  stack1 = depth0.tiles;
  stack2 = {};
  stack1 = helpers.each.call(depth0, stack1, {hash:stack2,inverse:self.noop,fn:self.program(1, program1, data),data:data});
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "\n</section>";
  return buffer;};