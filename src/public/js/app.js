const mainApp = angular.module('mainApp', ['ngMaterial', 'ngMdIcons'])
                        .config(function($mdIconProvider){
                            $mdIconProvider
                                .icon('menu', '/img/icons/menu.svg')
                                .icon('more_vert', '/img/icons/more_vert.svg')
                                .icon('search', '/img/icons/search.svg')
                                .icon('favorite', '/img/icons/favorite.svg');
                        })
                        .config(function($mdThemingProvider){
                            $mdThemingProvider.theme('default')
                                                .primaryPalette('blue')
                                                .accentPalette('yellow');
                        });