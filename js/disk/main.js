// main

// Config
require.config({
    baseUrl: 'js/disk',
    paths: {
    	// set the paths for different shit here
        jquery: '../vendor/jquery-1.11.2.min',
        underscore: '../vendor/underscore-min'
    }
});

// Require and initialize the poisson disk
require(['app'], function(App){
	App.initialize();
});
