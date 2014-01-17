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

function sendScenarioData(scenarioData){
	var postrequest=new ajaxRequest();
	postrequest.onreadystatechange=function(){
		if (postrequest.readyState==4){
			if (postrequest.status==200 || window.location.href.indexOf("http")==-1){
				console.log("scenario save OK");
				window.location = 'scenarios.html';
			} else {
				alert("scenario save not OK: "+postrequest.response);
			}
	 	}
	}
	var parameters="data="+scenarioData;
	postrequest.open("POST", "/savescenario", true);
	postrequest.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	postrequest.send(parameters);
}
