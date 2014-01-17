//List Scenario Creation
function ajaxRequest(){
 var activexmodes=["Msxml2.XMLHTTP", "Microsoft.XMLHTTP"] //activeX versions to check for in IE
 if (window.ActiveXObject){ //Test for support for ActiveXObject in IE first (as XMLHttpRequest in IE7 is broken)
  for (var i=0; i<activexmodes.length; i++){
   try{
    return new ActiveXObject(activexmodes[i])
   }
   catch(e){
    //suppress error
   }
  }
 }
 else if (window.XMLHttpRequest) // if Mozilla, Safari etc
  return new XMLHttpRequest()
 else
  return false
}

function fillScenariosFromDB(listID){
    console.log('test scenario load'); 
    var data_path = "/allscenarios";
    var http_request = ajaxRequest();
    http_request.onreadystatechange  = function(){
        if (http_request.readyState == 4  ) {
            
            var jsonData = JSON.parse(http_request.responseText);

            for (var s in jsonData.scenarios) {

                var scenario = jsonData.scenarios[s];
                
                console.log('adding scenario: '+scenario.title);
                
                $("#"+listID).append('<li> <a id='+scenario.id+' href="#Sample_Data?id='+scenario.id+'" data-transition="slide" class="scenario ui-btn ui-btn-icon-right ui-icon-carat-r"> '
                	+scenario.title+' - '+scenario.organizationType+'</a></li>');

                //fields in scenario object: id, title, organizationType, description, screenData, startDate, endDate, userId
            }
        }
    }
    http_request.open("GET", data_path, true);
    http_request.send();
};


	  
//End List Scenario Creation
	$(document).on('click', '.scenario', function(){
        var id = $(this).attr('id');
        console.log('clicked: '+id);
        //window.location = "editor.html?id=" + id;
        loadScenario(id);
    });
	
	//XML call wrapper object
	var dataStore = function(id){
		var xml;
		if (id == undefined){
			console.log('undefined id, returning');
			return {};
		}
		alert('before GET, id='+id);
		$.ajax({
		  type: "GET",
		  url: "/getscenarioxform?scenario_id="+id,
		  dataType: "xml",
		  success : function(data) {
						xml = data;
					}
		});

		return {getXml : function()
		{
			console.log('getXML, id='+id);
			if (xml) return xml;
			else alert("XML wasn't loaded!")
		}};
	};
	
	function loadScenario(id){
		console.log('loadScenario id='+id);
		    $.ajax({
		      type: "GET",
		      url: '/getscenarioxform?scenario_id=' + id,
		      dataType: "xml",
		      success: function(data){
						console.log('data'+data);
						renderXML(data);
		      }
		    });
		};
	
	//input saving example
	function save_Input(total_pages){	
			console.log("Count of the pages: "+total_pages);
			alert('Data saved!');
			return;
			
			
			for(var id = 1; id <= total_pages; id++)
			{
				var select = $('div#page'+id);
				var input_select = select.find('input[type="text"]').val(); 
				var elemName = select.find('input[type="text"]').attr("name");
				
				var filledXml = dataStore.getXml();
				$(filledXml).find('instance').children().each(function() {
					$(this).children().each(function() {
								console.log(this.tagName);
								if($(this).is(elemName))
									$(this).text(input_select);						
							});
				});
				alert("works!1" + input_select + " " + elemName);				
			}
			
			// alert("works!1" + input_select + " " + elemName);
			console.log(filledXml);
	}
	
	//image saving
	function previewFile(image_id) {
		//alert(image_id);
		var preview = document.querySelector('img#'+image_id);
		var file    = document.querySelector('input[type=file][name='+image_id+']').files[0];
		var reader  = new FileReader();

		if (file) {
			reader.readAsDataURL(file);
		} else {
			preview.src = "";
		}
		
		reader.onloadend = function () {
			//alert(reader.result);
			preview.src = reader.result;
			console.log(reader.result);
		}
		//file = "";
	}
	
	//global function (to wrap inner functions - not working without it so far)

		
	
		//$('#Sample_Data').on('pageshow', function(event, ui){ //'pageshow' will not work in the future versions of jQuery					
			
	function renderXML(xml){
			console.log('renderXml call, xml=');
			console.log(xml);
			//var select = $('div#renderContent');
		
			var i = 0; // variable for generating an ID for "select" control
			
	//			var xml = dataStore.getXml(scenario_id); //call for XML
	//		var xml = loadScenario(scenario_id);
			
			var id = 1; // id of each screen to render
			var total_pages = 0;
			var scenarioName = $(xml).find('instance').children().text();
			
			$(xml).find("group").each(function(test) //counter of how many screens (pages) are in this XForm
			{
				total_pages++
			});
			
			//searching for group tag, which is representing the one screen
			$(xml).find('group').each(function(){
			console.log('group:');
				console.log(this);
				
				var body_html = ""; //we will "push" here all parsed information from XForm
				$(this).children().each(function() {
				
				console.log('element:');
				console.log(this);
					
					//parsing input checkbox elements
					if($(this).is('select')){
						body_html += "<label>"+$(this).children("label").text()+"</label>";
						var elemName = $(this).attr("ref").split("/")[2];
						
						$(this).find("item").each(function() {i++; 
							body_html += "<input type=checkbox id='"+elemName+i+"' name="+elemName+" value=\""+$(this).children('value').text()+"\"/>"+"<label for='"+elemName+i+"'>"+$(this).children('label').text()+"</label>";
						});
						i = 0;
					}	
					
					//parsing input radio-button elements
					if($(this).is('select1')){
						body_html += "<label>"+$(this).children("label").text()+"</label>";
						var elemName = $(this).attr("ref").split("/")[2];
						
						$(this).find("item").each(function() {i++;  
							body_html += "<input type=radio id='"+elemName+i+"' name="+elemName+" value=\""+$(this).children('value').text()+"\"/>"+"<label for='"+elemName+i+"'>"+$(this).children('label').text()+"</label>";
						});
						i = 0;
					}
					
					//parsing label element
					if($(this).is('label')){
						body_html += "<br><div class=label_input_text><b>"+$(this).text()+"</b></div>";
						console.log(body_html);
					}
					
					//parsing input element
					if($(this).is('input')){
						if($(this).attr('type') == 'location'){
							//alert("Works!");
							body_html += "<label>"+$(this).children("label").text()+"</label>";
							body_html += "<div>" + $(this).children("hint").text() + "</div>";
							body_html += "<label for=location>Latitude and Longitude:</label><input id=location name='" + $(this).attr("ref").split("/")[2] + "' type=text></input><br>";
							
							//getting GPS coordinates
							navigator.geolocation.getCurrentPosition (function (pos)
							{
								lat = "" + pos.coords.latitude;
								lng = "" + pos.coords.longitude;
								console.log("lat: "+lat+ ", lng: " +lng);
								$("#location").val(lat.substr(0,10)+", "+lng.substr(0,10));
							});
						}else{
							body_html += "<label>"+$(this).children("label").text()+"</label>";
							body_html += "<div>" + $(this).children("hint").text() + "</div>";
							body_html += "<input name='" + $(this).attr("ref").split("/")[2] + "' type=text></input><br>";
						}
					}	
					
					//parsing image element
					if($(this).is('upload')){
						body_html += "<label>"+$(this).children("label").text()+"</label>";
						body_html +=  "<div>" + $(this).children("hint").text() + "</div>";
						//<video autoplay id='video_prev'></video>
						var elemName = $(this).attr("ref").split("/")[2];
						body_html += "<input name='" + elemName + "' type=file accept=image/*;capture=camera onchange=previewFile('"+elemName+"')></input><img id='"+elemName+"' src='' height='200' alt='Image preview...'><br>";
					}	
				}); //end children
				
				body_html += "<br>";
				
				console.log('after adding children');
				console.log(body_html);
				
				if (id == 1){ //page generator for first screen
					newPage = $("<div data-role=page id=page" + id +" "+ "data-theme=a>"+
								"<div data-role=header  data-theme=b data-position=fixed>"+
									"<a href=#Scenarios data-role=button data-icon=arrow-l data-transition=slide data-direction=reverse>All</a>"+
									"<h1>"+scenarioName+"</h1>"+
									// "<a id=save_btn data-role=button data-icon=star>Save</a>"+
								"</div>"+
								"<div id=renderContent data-role=content data-theme=a>"+body_html+"</div>"+												
								"<div data-role=footer data-theme=a data-position=fixed>"+				
									"<h3>Screen "+id+" of "+total_pages+"</h3>"+
									"<a data-role=button href=#page"+(id+1)+" data-icon=arrow-r data-iconpos=right class=ui-btn-right data-transition=slide>"+
										"Next</a>"+	
								"</div>"+
							"</div>");
					// Append the new page into pageContainer
					newPage.appendTo($.mobile.pageContainer);

					// Move to this page by ID '#page'
					$.mobile.changePage('#page1');
					
				} else { //from second to last
					newPage = $("<div data-role=page id=page" + id +" "+"data-theme=a>"+
								"<div data-role=header  data-theme=b data-position=fixed>"+
									"<a href=#Scenarios data-role=button data-icon=arrow-l data-transition=slide data-direction=reverse>All</a>"+
									"<h1>"+scenarioName+"</h1>"+
									// "<a id=save_btn data-role=button data-icon=star>Save</a>"+
								"</div>"+
								"<div id=renderContent data-role=content data-theme=a>"+body_html+"</div>"+												
								"<div data-role=footer data-theme=a data-position=fixed>"+				
									"<h3>Screen "+id+" of "+total_pages+"</h3>"+
									"<a data-role=button href=#page"+(id-1)+" data-icon=arrow-l data-iconpos=left class=ui-btn-left data-transition=slide data-direction=reverse>"+
										"Prev</a>"+
									"<a data-role=button href=#page"+(id+1)+" data-icon=arrow-r data-iconpos=right class=ui-btn-right data-transition=slide>"+
										"Next</a>"+	
								"</div>"+
							"</div>");
					
				};
				if (id == total_pages){ //last screen
					newPage = $("<div data-role=page id=page" + id +" "+"data-theme=a>"+
								"<div data-role=header  data-theme=b data-position=fixed>"+
									"<a href=#Scenarios data-role=button data-icon=arrow-l data-transition=slide data-direction=reverse>All</a>"+
									"<h1>"+scenarioName+"</h1>"+
									"<a id=save_btn data-role=button data-icon=star onclick=save_Input("+total_pages+")>Save</a>"+
								"</div>"+
								"<div id=renderContent data-role=content data-theme=a>"+body_html+"</div>"+												
								"<div data-role=footer data-theme=a data-position=fixed>"+				
									"<h3>Screen "+id+" of "+total_pages+"</h3>"+
									"<a data-role=button href=#page"+(id-1)+" data-icon=arrow-l data-iconpos=left	class=ui-btn-left data-transition=slide data-direction=reverse>"+
										"Prev</a>"+
								"</div>"+
							"</div>");
				}

				newPage.appendTo( $.mobile.pageContainer ); //adding generated pages to jQuery pageContainer and to our body "div"
				id++;
				
			});
			//select.append('<p>Screen count:' + screen_count + '</p>');
			//select.append(body_html);	
		};

		
$(function(){	
		//getting GPS coordinates
		navigator.geolocation.getCurrentPosition (function (pos)
		{
			var lat = pos.coords.latitude;
			var lng = pos.coords.longitude;
			$("#lat").text (lat);
			$("#lng").text (lng);
		});
		
		//rendering map with marker, placed according to coordinates, gathered by previous function
		$('#btn').on('click', function (event)
		{
		  //alert("works!1");
		  var lat = $("span#lat").text();
		  var lng = $("span#lng").text();
		  //alert("lat:" + lat + " " + "lng:" + lng);
		  var latlng = new google.maps.LatLng (lat, lng);
		  var options = { 
			zoom : 14, 
			center : latlng, 
			mapTypeId : google.maps.MapTypeId.ROADMAP 
		  };

		  var $content = $("#GPS_data div#map");
		  $content.height (screen.height - 200);
		  //alert(screen.height);
		  var map = new google.maps.Map ($content[0], options);
		  map.setCenter(options.center);
		  
		  new google.maps.Marker ( 
		  { 
			map : map, 
			animation : google.maps.Animation.DROP,
			position : latlng  
		  });
		});	 
		
	});//end global function