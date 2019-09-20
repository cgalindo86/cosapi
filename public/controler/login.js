
window.onload = function(){
    
	MainApp();
}


function MainApp() {

	socket = io.connect('/');
    init();
		
	function init(){
		var bacceso = document.getElementById("bacceso");
		
        bacceso.addEventListener("click", function(evt) {
			//alert($("#username").val()+" - "+$("#password").val());
			socket.emit("login",{usuario:$("#username").val(),password:$("#password").val()});
		}, false);

		socket.on("validacion",function(xdata){
			
			if(xdata.resultado=="ok"){
				window.location="http://localhost:8001/valida?a="+xdata.id;
				//window.location="http://192.168.43.62:8001/valida?a="+xdata.id;
			} else {
				alert("Verifique datos ingresados");
			}
		});

		/*socket.on("envio obra",function(xdata){
			
			$idata = '<center><h6>'+xdata.nombre+'</h6><br><h2>S/. '+xdata.costo+' SOLES</h2></center><br>';
			$idata = '<center><h1>'+xdata.responsable+'</h1><br><h2>'+xdata.funcion+'</h2></center>';
			$imaster = $imaster + $ihead + $ibody + $idata + $icierre;

			retorno.innerHTML = $imaster;
		});*/

	}


}
