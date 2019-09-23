
var $resultServices="";
var $miSuperId="";
var socket = io.connect();
var bboton = document.getElementById("bbuscar");
var filtrado = "";
	
MainApp();

function MainApp() {
	init();

}

function init(){
	
	socket.on("miServicio",function(data){
		
		var data4,data5,codigo,descr,unidad,nomunidad;
		var ext = data.MsgData.Transaction.CO_PROJ_INFH_WK.CO_PROJ_INFD_WK.length;
		$resultServices = data.MsgData.Transaction.CO_PROJ_INFH_WK.CO_PROJ_INFD_WK;
		
		var respuesta;
		$("#mgif").show();
		for(i =0; i<ext; i++){
			var a;
			data4 = JSON.stringify(data.MsgData.Transaction.CO_PROJ_INFH_WK.CO_PROJ_INFD_WK[i]);
			
			data5 = JSON.parse(data4);
			//$resultServices = data5;
			//console.log("d: "+data4);
			codigo=data5['PROJECT_ID']['$value'];
			descr=data5['DESCR']['$value'];
			
			if(data5['BUSINESS_UNIT']!=null){
				unidad=data5['PROJECT_TYPE']['$value'];
				nomunidad = data5['DESCR1']['$value'];
			} else {
				unidad="Sin info";
				nomunidad="Sin info";
			}

			if(!codigo.includes("S8") && !codigo.includes("S9") && codigo!=null){
				respuesta = respuesta + ListaProyectos({codigo:codigo,
													descripcion:descr,
													codunidad:unidad,
													unidad:nomunidad,
													id:$miSuperId});

				document.getElementById("contenidop1").innerHTML = respuesta;

			}
			
		}
		filtrado = "miServicio";
		socket.emit("listaProyectos",$resultServices);
		$("#mgif").hide();
	});

	socket.on("miServicio2",function(data){
		$resultServices = data.rows;
		var respuesta;
		var a;
		for(a=0; a<data.rows.length; a++){
			var string=JSON.stringify(data.rows[a]);
			var json =  JSON.parse(string);
			console.log('c: '+json[0] +" "+json[2]+" "+json[4]+" "+json[3]+"#");
			if(!json[0].includes("S8") && !json[0].includes("S9") && json[0]!=null){
				respuesta = respuesta + ListaProyectos({codigo:json[0],
													descripcion:json[2],
													codunidad:json[3],
													unidad:json[4],
													id:$miSuperId});

				document.getElementById("contenidop1").innerHTML = respuesta;

			}
		}
		filtrado = "miServicio2";
		$("#mgif").hide();
	});

}


function Bbuscar(){
	var busqueda = $("#tbuscar").val();
	$("#mgif").show();
		if(filtrado=="miServicio"){
			var data4,data5,codigo,descr,unidad,nomunidad;
				var ext = $resultServices.length;
				console.log("ext "+ext);
				var respuesta;
				
				for(i =0; i<ext; i++){
					var a;
					data4 = JSON.stringify($resultServices[i]);
					
					data5 = JSON.parse(data4);
					
					codigo=data5['PROJECT_ID']['$value'];
					descr=data5['DESCR']['$value'];
					
					if(data5['BUSINESS_UNIT']!=null){
						unidad=data5['PROJECT_TYPE']['$value'];
						nomunidad = data5['DESCR1']['$value'];
					} else {
						unidad="Sin info";
						nomunidad="Sin info";
					}
		
					console.log("uno: "+descr + " - " + busqueda);	
		
					if(descr.includes(busqueda) || codigo.includes(busqueda)){
						console.log("dos: "+descr + " - " + busqueda);	
						
						respuesta = respuesta + ListaProyectos({codigo:codigo,
															descripcion:descr,
															codunidad:unidad,
															unidad:nomunidad,
															id:$miSuperId});
		
						document.getElementById("contenidop1").innerHTML = respuesta;
		
					}
					
				}
				$("#mgif").hide();
		} else {
			$resultServices = data.rows;
			var respuesta;
			var a;
			for(a=0; a<data.rows.length; a++){
				var string=JSON.stringify(data.rows[a]);
				var json =  JSON.parse(string);
				console.log('c: '+json[0] +" "+json[2]+" "+json[4]+" "+json[3]+"#");
				if(!json[0].includes("S8") && !json[0].includes("S9") && json[0]!=null){
					respuesta = respuesta + ListaProyectos({codigo:json[0],
														descripcion:json[2],
														codunidad:json[3],
														unidad:json[4],
														id:$miSuperId});

					document.getElementById("contenidop1").innerHTML = respuesta;

				}
			}
			filtrado = "miServicio2";
			$("#mgif").hide();
		}
				
}

function ListaProyectos(xdata){
	var dat="";
	var codigo,descr,unidad,codunidad,grafico,mid;

	codigo = xdata.codigo;
	descr = xdata.descripcion;
	unidad = xdata.unidad;
	codunidad = xdata.codunidad;
	mid = xdata.id;
	console.log('c: '+codigo +" "+descr+" "+unidad+" "+codunidad+"#");
	//var nom = descr.replace("_"," ");
	var nom = descr;
	//console.log('c: '+codigo +" "+descr+" "+unidad+" "+codunidad+"#");
	if(codunidad=="UNINF"){
		grafico = '#7FD986';
		//grafico='#ff1122';
	} else if(codunidad=="UNPLT"){
		grafico = '#7FCBD9';
	} else if(codunidad=="UNING"){
		grafico = '#EEAA65';
	} else if(codunidad=="UNDNE"){
		grafico = '#E7EE65';
	} else if(codunidad=="UNEYT"){
		grafico = '#EE7A65';
	} else if(codunidad=="UNMIN"){
		grafico = '#EE7A65';
	} else {
		grafico = '#AB7A65';
	}

	dat = dat+'<a href="http://localhost:8001/inicio?a='+mid+'&a='+codigo+'&a='+descr+'">';
	//dat = dat+'<a href="http://192.168.43.62:8001/inicio?a='+mid+'&a='+codigo+'&a='+descr+'">';
	dat = dat+'<div class="w3-col" style="width:25%; margin:5px; overflow-x: scroll;">';
	dat = dat+'<table style="font-size: 20px; min-height:150px; background: '+grafico+'; border-width: 2px; border-color: blue;  border-radius: 1em; width:100%; color:#000000;">';
	dat = dat+'<tr style="border:none;"><td style="width:50%; border:none; color:#635C5B;">';
	dat = dat+'<center><b>'+codigo+'</b></center></td><td style="border:none; color:#2B3763;"><center><b>'+unidad+'</b></center></td></tr>';
	dat = dat+'<tr><td style="border:none; color:#FFFFFF;" colspan="2"><center><b>'+nom+'</center></b></td></tr>';
	dat = dat+'</table></div></a>';			
	return dat;
}

function UnidadesSelect(){
	var x = document.getElementById("unidadesN").value;
	var data4,data5,codigo,descr,unidad,nomunidad;

	if(x!="0"){
		var ext = $resultServices.length;
		console.log("ext "+ext);
		var respuesta;
		$("#mgif").show();
		for(i =0; i<ext; i++){
			var a;
			data4 = JSON.stringify($resultServices[i]);
			
			data5 = JSON.parse(data4);
			
			codigo=data5['PROJECT_ID']['$value'];
			descr=data5['DESCR']['$value'];
			
			if(data5['BUSINESS_UNIT']!=null){
				unidad=data5['PROJECT_TYPE']['$value'];
				nomunidad = data5['DESCR1']['$value'];
			} else {
				unidad="Sin info";
				nomunidad="Sin info";
			}

			if(unidad.includes(x)){
				respuesta = respuesta + ListaProyectos({codigo:codigo,
													descripcion:descr,
													codunidad:unidad,
													unidad:nomunidad,
													id:$miSuperId});

				document.getElementById("contenidop1").innerHTML = respuesta;

			}
			
		}
		$("#mgif").hide();
	}
}
