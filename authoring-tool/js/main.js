
$(function() {
    "use strict";

/**** INDEX   -------------------------------------------------------

    - VARIABLES
    - FUNCTONS
        - saveScenario(): post scenario to backend
        - createScenario(): create scenario array
        - addElement(): adding Elements to the Scenario
        - droppable(): drop functionality
        - sortable(): make it possible to rearrange elements
        - addScreen(): add new screen to the scenario
        - updateScreenNUmber(): update screen number when screens are sorted
    - EVENT HANDLERS / TRIGGERS
        - handler for add new screen
        - delete element button handler
        - handle button for additional choice
        - show delete-screen-button on hover over screen-number
        - hide delete-screen-button on mouseleave of screen-number
        - delete screen when delete-screen-button is clicked
    - INITIALIZATION
        - initialize dragging of different buttons 
        - UI container (tabs) initialize

--------------------------------------------------------------------   ****/ 

    
    /* VARIABLES 
    ------------------------------------------------*/
    var is_dragging = false;
    var screenNumber = 0;
    var screenID = '';
    var choiceCount = 2;
    var element = '';
    var textField = '<input type="text" disabled="disabled"/>';
    var textArea = '<textarea disabled="disabled"></textarea>';
    var image = '<button disabled="disabled">Take a Snapshot</button>';
    var video = '<button disabled="disabled">Make a Video</button>';
    var sound = '<button disabled="disabled">Start Recording</button>';
    var choice = '<div class="choices"><input class="1" type="radio" name="choice" value="option1" disabled="disabled"><input class="label" type="text" placeholder="Option 1"/><br><input class="2" type="radio" name="choice" value="option2" disabled="disabled"><input class="label" type="text" placeholder="Option 2"/><br>';
    var numerical = '<input type="number" disabled="disabled"/>';
    var date = '<input type="date" disabled="disabled"/>';
    var location = '<button disabled="disabled">Add Current Location</button>';
    

    /* FUNCTIONS 
    ------------------------------------------------*/



	function checkPasswords(){
	console.log('checkPasswords'); 
	var pass1 = $("#reg_password").val();
	var pass2 = $("#reg_password2").val();
	console.log('checkPasswords'+pass1); 
	console.log('checkPasswords'+pass2); 
	
	if(pass1 == pass2)
    {
        $(":text").removeClass("incorrect"); 
        console.log('submitting form'); 
         document.forms["reg_form"].submit();
    }

    else
    {
        $(":text").addClass("incorrect");
        alert("Passwords not equal");
    }
      console.log('checkPasswords'); 
    };
	
    

    //posting to backend
    function saveScenario(scenario){
        console.log(scenario); 
        sendScenarioData(JSON.stringify(scenario));
    };

    //create scenario object
    function createScenario(update){


        var scenario = {
            title: $('#scenario-title').val(),
            type: $('#scenario-type').val(),
            description: $('#scenario-description').val(),
            startDate: $('#scenario-start').val(),
            endDate: $('#scenario-end').val()
        };

        if (update) {
            scenario['id'] = $('#scenario-head').attr('class');
        }

        var screenCount = $('.block').length;

        var allScreensData = [];

        $('.block').each(function(index, value){

						var screen = {};
            var screenData = [];
            
            var elementCount = $(value).children().length;

            $(value).children().each(function(index, value){
				
                var element = {};

                var requiredBox = $(value).find('.required-switch input');
                var required = true;

                if(!requiredBox.is(':checked')){
                    required = false;
                }
                element.required = required;               

                //works if element has class: 'scenario-element dropped TYPE'  
                console.log($(value).attr('class'));
                var elementType = $(value).attr('class').replace('scenario-element dropped ', '');
                element.type = elementType;
                
                if ($(value).find('input.label').val() !== ""){
                    element.title = $(value).find('input.label').val();
                }

                if(elementType === 'choice'){
                    var content = $(value).find('.content .choices input.label');
                    console.log(content);
                    var choices = [];
                    content.each(function(index, value){
                        var choice = $(value).val();
                        choices.push(choice);
                    });
                    element.content = choices;
                }
                
                screenData.push(element);

                if (index === elementCount - 1) {
                		screen["screenElements"] = screenData;
                    allScreensData.push(screen);
                }

            });
            
            scenario['screenData'] = allScreensData;

            if (index === screenCount - 1) {
            	console.log("saveScenario call");
                saveScenario(scenario);
                $('#save-scenario').removeClass('loading').html('Saved');
            }

        });
    };

    //adding Elements to the Scenario
    function addElement(targetScreen, element, elementName){
        $(targetScreen).append('<div class="scenario-element dropped '+ elementName +'"><input class="label" type="text" placeholder="Label"/></br><div class="content required">' + element + '</div><div class="required-switch"><input type="checkbox" checked="checked" name="required" value="true"><span>Required</span></div></div>').find('input.label').focus();
    };
    
    //drop functionality
    function droppable(screenID){
        //allow dropping new elements into the scenario
        $("#screen" + screenID).droppable({
          drop: function( event, ui ) {
            var elementName = ui.draggable[0].classList[0];
            if(!$(ui.draggable[0]).hasClass('dropped')){
                switch (elementName){
                    case 'textfield':
                        element = textField;           
                        break;
                    case 'textarea':
                        element = textArea; 
                        break;
                    case 'image':
                        element = image; 
                        break;
                    case 'video':
                        element = video; 
                        break;
                    case 'sound':
                        element = sound; 
                        break;
                    case 'choice':
                        element = choice; 
                        break;
                    case 'numerical':
                        element = numerical; 
                        break;
                    case 'date':
                        element = date; 
                        break;
                    case 'location':
                        element = location; 
                        break;
                    default:
                        break;
                }
                addElement(this, element, elementName); 
            }
          }
        });        
    };

    //make it possible to rearrange elements 
    function sortable(screenID) {
        $("#screen" + screenID).sortable({
            connectWith: ".screen",
            cursor: "move",
            start: function(event, ui) {
                is_dragging = true;
            },
            stop: function(event, ui) {
                is_dragging = false;
            }
        }).disableSelection();
    };

    //add new screen to the scenario
    function addScreen() {
        screenNumber = $('.block').length+1;
        $("#screen-nav").append('<div id="nav'+screenNumber+'" class="dropped nav-item"><span class="icon-mobile-1"></span><a href="#screen'+ screenNumber +'">Screen '+ screenNumber +'</a><span class="icon-cancel"></span></div>');
        $("a[href=#screen"+ screenNumber + "]").trigger('click');
        $("#screens").append("<div id='screen"+ screenNumber +"' class='screen block droppable active'></div>");

        $("#nav" + screenNumber).droppable({
            over: function( event, ui ) {
                var targetId = $(event.target).attr('id').replace('nav', '');
                $("a[href=#screen"+ targetId + "]").trigger('click');
            }
        });
        droppable(screenNumber);
        sortable(screenNumber);
        updateScreenNumber();
    };

    //update screen number when screens are sorted
    function updateScreenNumber(){        
        $('#screen-nav > .nav-item').each(function() {
            var i = $(this).index() + 1;
            $(this).find('a').html('Screen ' + i);
        });
    };
    

    /* EVENT HANDLING / TRIGGERS
    ------------------------------------------------*/
    $(document).on('click', '.icon.icon-cancel', function(e){
        e.stopPropagation();
				var scenarioItem = $(this).parent().parent();
        var id = scenarioItem.attr('id');
        console.log(id);

        $.ajax({
          type: "GET",
          url: '/deletescenario?scenario_id=' + id,
          success: function(data){
            console.log('scenario deleted');
            scenarioItem.remove();
          }
        });

    });

    $(document).on('click', '.nav-item .icon-cancel', function(event){
        event.stopImmediatePropagation();
        var id = $(this).parent().attr('id').replace('nav', '');
        $('#screen' + id).remove();
        $(this).parent().remove(); 
        var prev = parseInt(id);
        var prev_int = prev - 1;
        var newId = prev_int.toString();
        console.log(newId);
        if (newId > 0) {
            $('.nav-item').removeClass('active');
            $('#nav' + newId).addClass('active'); 
            $('.screen').removeClass('active');
            $('#screen' + newId).addClass('active'); 
        } else {
            $('.nav-item').removeClass('active');
            $('#information .nav-item').addClass('active');
            $('#delete-element').hide();
            $('#element-panel').hide();
            $('.screen').removeClass('active');
            $('#default-fields').addClass('active');  
        }

        updateScreenNumber();
        
    });

    $('#information .nav-item').click(function(){
        $('.nav-item').removeClass('active');
        $(this).addClass('active');  

        $('#delete-element').hide();
        $('#element-panel').hide();
        $('.screen').removeClass('active');
        $('#default-fields').addClass('active');      
    });

    $(document).on('click', '.nav-item', function(){
        $('.nav-item').removeClass('active');
        $(this).addClass('active');        
    });

    $(document).on('click', '#screen-nav .nav-item', function(){
        $('#delete-element').show();
        $('#element-panel').show();

        $('.screen').removeClass('active');
        var id = $(this).attr('id').replace('nav', '');
        $('#screen' + id).addClass('active');        
    });

    $('#register form button').click(function(event){
        event.preventDefault;
        checkPasswords();
    });

    $('#login form button').click(function(event){
        event.preventDefault;
				console.log('before post');
        $.ajax({
          type: "POST",
          url: '/login',
          data: data,
          error: function(data){
            console.log('error');
          }
        });
        console.log('after post');
                 
    });

    //handler for add new screen
    $("div#add-screen").click(function(){
        addScreen();
    });

    //delete element button handler
    $("#delete-element").droppable({ 
        hoverClass: "active",
        drop: function( event, ui ) {
            $(ui.draggable[0]).remove();
        }
    });    

    //handle button for additional choice
    $(document).on('keydown', '.choices input', function(event) {
        if ( event.which == 13 ) {
            event.preventDefault();
            choiceCount += 1;
            $(this).parent().append('<input class="'+ choiceCount +'" type="radio" name="choice" value="option'+ choiceCount +'" disabled="disabled"><input class="label" type="text" placeholder="Option '+ choiceCount +'"/><br>');
            $(this).parent().find('input:last').focus();
            $(this).next('input.label').focus();
        }
        else if(event.which == 8 && choiceCount > 1 && $(this).val() === ""){
            event.preventDefault();
            choiceCount -= 1;
            $(this).prev('input').remove();
            $(this).prev('br').remove();
            $(this).prev('input').focus();
            $(this).remove();
        }
    });

    //show delete-screen-button on hover over screen-number
    // $(document).on('mouseenter', 'li.screen-link', function(){
    //     screenID = $(this).attr('href');
    //     $(this).find('span').addClass('active');
    // });

    //hide delete-screen-button on mouseleave of screen-number
    // $(document).on('mouseleave', 'li.screen-link', function(){
    //     $(this).find('span').removeClass('active');
    // });

    //delete screen when delete-screen-button is clicked
    // $(document).on('click', 'span.delete-screen', function(){
    //     $(this).parent().remove();
    //     tabs.tabs('refresh');
    //     updateScreenNumber();
    // });

	$(document).on('click', '.scenario', function(){
        var id = $(this).attr('id');
        window.location = "editor.html?id=" + id;
    });

    $('div#save-scenario').click(function(){

        var screenCounter = $('.block').length;
        var update = false;

        if ($(this).hasClass('update')){
            update = true;
        }

        $('.block').each(function(index, value){
            if (index === screenCounter - 1) {
                createScenario(update);
            }
        });
    });

    // $(document).on('change','.required-switch input',function(){
    //     if ($(this).is(':checked')) {
    //         $(this).prevAll('.content').addClass('required');
    //     }
    //     else{
    //         $(this).prevAll('.content').removeClass('required');
    //     }
    // });


    /* INITIALIZE
    ------------------------------------------------*/

    //initialize dragging of different buttons 
    $(".draggable").draggable({ 
        opacity: 0.8,
        revert: true,
        revertDuration: 0
    });
    
    $('#screen-nav').sortable({
        stop: function() {
            updateScreenNumber();
        }
    });
    
    droppable(1);
    sortable(1);

    //$("#default-fields").validate();

  });