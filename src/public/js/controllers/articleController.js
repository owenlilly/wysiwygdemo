mainApp.controller('articleController', function($sce){
    var self = this;

    self.article = $sce.trustAsHtml();

    
});