//Inicializamos las variables necesarias.
var express = require('express')
  , http = require('http');
const fs = require('fs');
const soap = require('soap');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
const oracledb = require('oracledb');
const mypw = 'cosapi';
var mysql = require('mysql');

var puerto = 8001;

server.listen(puerto);

function Valida(){
	/*console.log('inicia..');
	var ActiveDirectory = require('activedirectory');
	var config = { url: 'ldap://cosapi.local',
				baseDN: '',
				username: 'sistemas.cosapi',
				password: 'hapsy74' }
	var ad = new ActiveDirectory(config);
	var username = 'pruebaco2';
	var password = 'Cosapi2019';
	
	ad.authenticate(username, password, function(err, auth) {
	if (err) {
		console.log('ERROR: '+JSON.stringify(err));
		return;
	}
	
	if (auth) {
		console.log('Authenticated!');
	}
	else {
		console.log('Authentication failed!');
	}
	});

	ad.userExists(username, function(err, exists) {
		if (err) {
		  console.log('ERROR: ' +JSON.stringify(err));
		  return;
		}
	   
		console.log(username + ' exists: ' + exists);
	  });*/

	  var ActiveDirectory = require('activedirectory');
		var config = {
			url: 'ldap://cosapi.local:389' //,
				// baseDN: 'dc=domain,dc=com'
		};
		var ad = new ActiveDirectory(config);
		var username = 'pruebaco2@cosapi.com.pe';
		var password = 'Cosapi2019';
		// Authenticate
		ad.authenticate(username, password, function(err, auth) {
			if (err) {
				console.log('ERROR: ' + JSON.stringify(err));
				return;
			}
			if (auth) {
				console.log('Authenticated!');
			} else {
				console.log('Authentication failed!');
			}
		});
}


//Marco la ruta de acceso y la vista a mostrar
app.set('view options', {
	  layout: false
	});
app.use(express.static('public'));
app.get('', function(req, res){
	Valida();
	res.sendFile(__dirname + '/public/view/login_simple.html');
	//res.sendFile(__dirname + '/nn.html');
});
app.get('/prueba', function(req, res){
    res.sendFile(__dirname + '/libros.html');
});
app.get('/valida', function(req, res){
	var nom = req.query;
    var n="";
    fs.readFile(__dirname+'/public/view/lista.html', 'utf8', (error, datos) => {
        if (error) throw error;
        console.log("El contenido es: ", nom.a[0]);
        
        datos = datos.replace("MIDD",nom.a[0]);
        res.send(datos);
    });
    
});
app.get('/inicio', function(req, res){
	var nom = req.query;
    var n="";
    fs.readFile(__dirname+'/public/view/inicio.html', 'utf8', (error, datos) => {
        if (error) throw error;
        console.log("El contenido es: ", nom.a[0]);
        
		datos = datos.replace("MIDD",nom.a[0]);
		datos = datos.replace("PROY",nom.a[1]);
		datos = datos.replace("NOMBRE",nom.a[2]);
        res.send(datos);
    });
    
});



    	
function BD2(){
	
	var connection;
	async function run(){
		try{
			connection = await oracledb.getConnection({
				user: 'RO',
				password: mypw,
				connectString: "dscope.cosapi.com.pe/desa"
			});

			result = await connection.execute('SELECT * FROM EMPLEADO');

			
			var a;
			for(a=0; a<result.rows.length; a++){
				var string=JSON.stringify(result.rows[a]);
				var json =  JSON.parse(string);

				console.log("Result master "+a+": "+ json);
				console.log("Result hijos: "+ json[3] + " - " + json[4]);
				
			}
			
		} catch(err){
			console.error(err.message);
		} finally{
			if(connection){
				try{
					await connection.close();
				} catch(err){
					console.error(err.message);
				}
			}
		}
		
	}

	run();
}     



//Se ha establecido conexión
io.sockets.on('connection', function(socket) {
    
		function BD2(consulta,data){
	
			var connection;
			async function run(){
				try{
					connection = await oracledb.getConnection({
						user: 'RO',
						password: mypw,
						connectString: "dscope.cosapi.com.pe/desa"
					});
					
					if(consulta=="0"){
						
						result = await connection.execute('SELECT * FROM EMPLEADO');
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
			
							console.log("Result master "+a+": "+ json);
							console.log("Result hijos: "+ json[0] + " - " + json[3]);
							io.sockets.emit('envio empresa', {id: json[0], nombre: json[3]});
						}
						
					} else if(consulta=="2"){
						var usuario = data.usuario;
						var password = data.password;
						var sql = "SELECT * FROM USUARIO WHERE TELEFONO = '"+password+"' AND USERNAME = '"+usuario+"'";
						console.log(usuario + " - " + password + "\n"+sql);
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
			
							if(json[1]!=null){
									
								io.sockets.emit('validacion', {nombre: json[1], id:json[0], resultado:"ok"});
								
							} else {
								io.sockets.emit('validacion', {nombre: json[1], id:json[0], resultado:"no ok"});
							
							}
						}

											
					} else if(consulta=="3"){
						var usuario = data.usuario;
						var sql = "SELECT * FROM USUARIO WHERE USUARIO = '"+usuario+"'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							io.sockets.emit('minombre', {nombre: json[1], id:json[0]});
							
						}
						
						//Conecta();
						var sql = "SELECT * FROM PROYECTO";
						result = await connection.execute(sql);
						var a; var respuesta='';
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0];
						}

						if(respuesta!=""){
							console.log("mi servicio 2");
							io.sockets.emit('miServicio2', result);
						} else {
							console.log("conecta");
							Conecta();
						}

					} else if(consulta=="4"){
						var respuesta="";
						var sql = "SELECT * FROM PROYECTO";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = respuesta + json[0]+"#";
						}
						console.log("respuesta ",respuesta);
						var ext = data.length;
						console.log("ext "+ext);
						var codigo,descr1,descr2,codunidad,nomunidad,cliente,participacion,supervisor,moneda;
						var fechai,fechaf;

						for(i =0; i<ext; i++){
							data4 = JSON.stringify(data[i]);					
							data5 = JSON.parse(data4);
							codigo=data5['PROJECT_ID']['$value'];
							if(respuesta.includes(codigo) && codigo!=null && data5['PROJECT_TYPE']!= null){
								console.log("incluido ",codigo);
							} else if(codigo!=null && data5['PROJECT_TYPE']!= null){
								console.log("no incluido ",codigo);
								respuesta = respuesta + codigo+"#";
								codigo=data5['PROJECT_ID']['$value'];
								codunidad=data5['PROJECT_TYPE']['$value'];
								nomunidad = data5['DESCR1']['$value'];
								descr1="";
								descr2=data5['DESCR']['$value'];
								//participacion = data5['PARTICIPATION_PCT'];
								//ojo hay valores de cliente y participacion que son object
								
								//cliente = data5['NAME2'];
								cliente = '';
								participacion = "";
								supervisor = "";
								moneda = data5['CURRENCY_CD']['$value'];
								fechai = data5['START_DT']['$value'];
								fechaf = data5['END_DT']['$value'];
								
								if(codigo==null){ codigo="";}
								if(codunidad==null){ codunidad="";}
								if(nomunidad==null){ nomunidad="";}
								if(descr1==null){ descr1="";}
								if(descr2==null){ descr2="";}
								if(cliente==null){ cliente="";}
								if(participacion==null){ participacion="";}
								if(supervisor==null){ supervisor="";}
								if(moneda==null){ moneda="";}
								if(fechai==null){ fechai="";}
								if(fechaf==null){ fechaf="";}

								descr2 = descr2.replace("'"," ");
								
								let result = await connection.execute(
									`INSERT INTO PROYECTO (PROYECTO,DESCRIPCION_CORTA_PROYECTO,
										DESCRPCION_LARGA_PROYECTO,UNIDAD_NEGOCIO,DESCRIPCION_UNIDAD_NEGOCIO,
										NOMBRE_CLIENTE,PARTICIPACION,NOMBRE_SUPERVISION,MONEDA_PROYECTO,FECHA_INICIO,
										FECHA_FIN,USUARIO_CREACION) 
									VALUES (:PROYECTO, :DESCRIPCION_CORTA_PROYECTO, 
										:DESCRPCION_LARGA_PROYECTO, :UNIDAD_NEGOCIO, :DESCRIPCION_UNIDAD_NEGOCIO,
										:NOMBRE_CLIENTE, :PARTICIPACION, :NOMBRE_SUPERVISION, :MONEDA_PROYECTO, 
										:FECHA_INICIO, :FECHA_FIN, :USUARIO_CREACION)`,
									[codigo, descr1, descr2, codunidad, nomunidad, 
										cliente, participacion, supervisor, moneda, fechai, fechaf, "admin"],{ autoCommit: true});
								console.log("Rows inserted: " + result.rowsAffected);  // 1
								
							}
						}
												
					}  else if(consulta=="5"){
						var respuesta=""; 
						var sql = "SELECT * FROM EMPLEADO WHERE EMPLEADO='"+data.empleado+"' AND PROYECTO='"+data.proyecto+"'" ;
						
						console.log("SQL empleado",sql);
						
						result = await connection.execute(sql);
						var a;
						respuesta = "";
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}
						console.log("respuesta","#"+respuesta+"#");
						if(respuesta==""){
							//var result;
							result = await connection.execute(
								`INSERT INTO EMPLEADO (EMPLEADO,TIPO_DOCUMENTO,
									NUMERO_DOCUMENTO,NOMBRE_EMPLEADO,APELLIDO_EMPLEADO,
									CARGO_EMPLEADO,AREA_EMPLEADO,FECHA_INGRESO,FECHA_CESE,PROVISIONES_EMPLEADO,
									SUELDO_BASICO,COSTO_TOTAL,ESTADO_EMPLEADO,PROYECTO,AREA_EMPLEADO_DESC,
									CARGO_EMPLEADO_DESC) 
								VALUES (:EMPLEADO, :TIPO_DOCUMENTO,
									:NUMERO_DOCUMENTO, :NOMBRE_EMPLEADO, :APELLIDO_EMPLEADO,
									:CARGO_EMPLEADO, :AREA_EMPLEADO, :FECHA_INGRESO, :FECHA_CESE, :PROVISIONES_EMPLEADO,
									:SUELDO_BASICO, :COSTO_TOTAL, :ESTADO_EMPLEADO, :PROYECTO, :AREA_EMPLEADO_DESC,
									:CARGO_EMPLEADO_DESC)`,
								[data.empleado, data.tipoDocumento, data.numeroDocumento, data.nombre, data.apellido, 
									data.cargo, data.area, data.fechaIngreso, data.fechaCese, data.provisiones, 
									data.sueldo, data.costo, data.estado, data.proyecto, data.area_r, data.cargo_r],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							//var result3;		
							result = await connection.execute(
								`INSERT INTO EMPLEADO_PROYECTO (EMPLEADO,PROYECTO) 
								VALUES (:EMPLEADO, :PROYECTO)`,
								[data.empleado, data.proyecto],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);


							var sql2 = "SELECT * FROM AREA_EMPLEADO WHERE AREA_EMPLEADO='"+data.area+"' " ;
							console.log("SQL2",sql2);
							result = await connection.execute(sql2);
							var a;
							respuesta = "";
							for(a=0; a<result.rows.length; a++){
								var string=JSON.stringify(result.rows[a]);
								var json =  JSON.parse(string);
								respuesta = json[0]+"";
							}
							console.log("respuesta",respuesta);
							if(respuesta==""){
								//var result;
								result = await connection.execute(
									`INSERT INTO AREA_EMPLEADO (AREA_EMPLEADO,DESCRIPCION_AREA) 
									VALUES (:AREA_EMPLEADO, :DESCRIPCION_AREA)`,
									[data.area, data.area_r],{ autoCommit: true});
								console.log("Rows inserted: " + result.rowsAffected);
							}


							var sql3 = "SELECT * FROM CARGO_EMPLEADO WHERE CARGO_EMPLEADO='"+data.cargo+"' " ;
							console.log("SQL3",sql3);
							result = await connection.execute(sql3);
							var a;
							respuesta = "";
							for(a=0; a<result.rows.length; a++){
								var string=JSON.stringify(result.rows[a]);
								var json =  JSON.parse(string);
								respuesta = json[0]+"";
							}
							console.log("respuesta",respuesta);
							if(respuesta==""){
								//var result;
								result = await connection.execute(
									`INSERT INTO CARGO_EMPLEADO (CARGO_EMPLEADO,DESCRIPCION_CARGO) 
									VALUES (:CARGO_EMPLEADO, :DESCRIPCION_CARGO)`,
									[data.cargo, data.cargo_r],{ autoCommit: true});
								console.log("Rows inserted: " + result.rowsAffected);
							}
						}
						
						var sql = "SELECT * FROM PROYECTO_PERIODO WHERE PROYECTO = '"+data.proyecto+"' AND PERIODO = '"+data.periodo+"'";
						result = await connection.execute(sql);
						var a;
						respuesta = '';
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}

						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO PROYECTO_PERIODO (PROYECTO,PERIODO,ESTADO,USUARIO_CREACION,FECHA_CREACION) 
								VALUES (:PROYECTO,:PERIODO,:ESTADO,:USUARIO_CREACION,:FECHA_CREACION)`,
								[data.proyecto, data.periodo, data.estado, data.usuario, data.fecha],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
						}

						
						var sql2 = "SELECT * FROM INCIDENCIA WHERE PROYECTO = '"+data.proyecto+"' ";
						console.log("previo incidencia",sql2);
						result = await connection.execute(sql2);
						var a;
						respuesta = '';
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}
						console.log("luego incidencia",respuesta);
						if(respuesta==""){
							var eperiodo='';
							var ii;
							for(ii=1; ii<=12; ii++){
								if(ii<10){ eperiodo='0'; } else { eperiodo = ''; }
								eperiodo = "2019" + eperiodo + ii;
								console.log(eperiodo);
								result = await connection.execute(
									`INSERT INTO INCIDENCIA (PROYECTO,EMPLEADO,PERIODO) 
									VALUES (:PROYECTO,:EMPLEADO,:PERIODO)`,
									[data.proyecto, data.empleado, eperiodo],{ autoCommit: true});
								console.log("Rows inserted: " + result.rowsAffected);
								
							}
							
						}
					} else if(consulta=="6"){
						var respuesta=""; 
						var sql = "SELECT * FROM PROYECTO_PERIODO WHERE PROYECTO = '"+data.proyecto+"' AND PERIODO = '"+data.periodo+"'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}


						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO PROYECTO_PERIODO (PROYECTO,PERIODO,ESTADO,USUARIO_CREACION,FECHA_CREACION) 
								VALUES (:PROYECTO,:PERIODO,:ESTADO,:USUARIO_CREACION,:FECHA_CREACION)`,
								[data.proyecto, data.periodo, data.estado, data.usuario, data.fecha],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							io.sockets.emit("DatosProyecto",{proyecto:"", periodo: ""});
						} else {
							io.sockets.emit("DatosProyecto",{proyecto:json[0].proyecto, periodo: json[0].periodo});
						}

						
					}  else if(consulta=="7"){
						var respuesta=""; 
						var sql = "SELECT * FROM EMPLEADO WHERE EMPLEADO = '"+data.codigo+"' OR NUMERO_DOCUMENTO = '"+data.documento+"' OR NOMBRE_EMPLEADO LIKE '%"+data.nombre+"%' OR APELLIDO_EMPLEADO LIKE '%"+data.apellidos+"%'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"#"+json[4] + " "+json[3] +"#";
							respuesta = respuesta +json[6] + " "+json[19] +"#";
							respuesta = respuesta +json[7] + "#"+json[8] +"#%";
						}
						io.sockets.emit("ResultEmpleado",respuesta);

					} else if(consulta=="8"){
						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO ";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = respuesta + '<option value="'+json[0]+'">'+json[1] + "</option>";
						}
						io.sockets.emit("recibeArea",respuesta);

					} else if(consulta=="9"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE EMPLEADO SET FECHA_INICIO = :FECHA_INICIO, FECHA_FIN = :FECHA_FIN, 
							AREA_EMPLEADO = :AREA_EMPLEADO, AREA_EMPLEADO_DESC = :AREA_EMPLEADO_DESC 
							WHERE EMPLEADO = :EMPLEADO`,
							[data.fechaInicio,data.fechaFin,data.area,data.nombreArea,data.empleado],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected); 
					  
						result = await connection.execute(
							`UPDATE EMPLEADO_PROYECTO SET FECHA_INICIO = :FECHA_INICIO, FECHA_FIN = :FECHA_FIN 
							WHERE EMPLEADO = :EMPLEADO AND PROYECTO = :PROYECTO`,
							[data.fechaInicio,data.fechaFin,data.empleado,data.proyecto],
							{ autoCommit: true });
						console.log("Rows updated 2: " + result.rowsAffected);

					} else if(consulta=="10"){
						var respuesta=""; 
						var sql = "SELECT * FROM EMPLEADO WHERE PROYECTO = '"+data.proyecto+"'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
						}
						//console.log("reEmp",result);
						io.sockets.emit("ResultadoEmpleadoProyecto",result);
						
					} else if(consulta=="11"){
						var respuesta=""; 
						var data2="";
						var data3="";
						var empleado="";
						var nnombre="";
						var fecha_inicio="";
						var fecha_fin="";

						var sql = "SELECT * FROM EMPLEADO WHERE PROYECTO = '"+data.proyecto+"'";
						result = await connection.execute(sql);
						var limite = result.rows.length;
						var c=0;
						console.log("antes for",empleado+" "+nnombre+" "+fecha_inicio+" "+fecha_fin);
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							console.log("dentro for",empleado+" "+nnombre+" "+fecha_inicio+" "+fecha_fin);
							if(json[0]!=null && json[0]!=undefined && json[0]!=NaN){
								empleado = empleado + json[0]+"#";
								
							} else {
								fecha_inicio = fecha_inicio + " " +"#";
							}

							if(json[3]!=null && json[3]!=undefined && json[3]!=NaN){
								nnombre = nnombre + json[3] + " " + json[4]+"#";
							} else {
								nnombre = nnombre + json[3] + " " + json[4]+"#";
							}
							
							if(json[21]!=null && json[21]!=undefined){
								fecha_inicio = fecha_inicio + json[21]+"#";
								
							} else {
								fecha_inicio = fecha_inicio + " " +"#";
							}

							if(json[22]!=null && json[22]!=undefined){
								fecha_fin = fecha_fin + json[22]+"#";
							} else {
								fecha_fin = fecha_fin + " " +"#";
								
							}
							

							console.log("luego val",empleado+" "+nnombre+" "+fecha_inicio+" "+fecha_fin);

							//var respuesta=""; 
							var sql2 = "SELECT * FROM INCIDENCIA WHERE PROYECTO = '"+data.proyecto+"' AND EMPLEADO = '"+json[0]+"'";
							result2 = await connection.execute(sql2);
							var b;
							for(b=0; b<result2.rows.length; b++){
								var string2=JSON.stringify(result2.rows[b]);
								var json2 =  JSON.parse(string2);

								if(json2[3]!=null && json2[3]!=undefined){
									data2 = data2 + json2[3]+"#";
								} else {
									data2 = data2 + " " +"#";	
								}

								if(json2[4]!=null && json2[4]!=undefined){
									data3 = data3 + json2[4]+"#";
								} else {
									data3 = data3 + " " +"#";	
								}
								
							}

							data2 = data2+"%";
							data3 = data3+"%";
							c++;
							//console.log("c - tam json",c + " - " +limite);
							if(c==limite){
								//console.log("d2"+data2);
								//console.log("d3"+data3);
								io.sockets.emit("ResultadoIncidenciaProyecto",{
									empleado: empleado,
									nombre: nnombre,
									fechaInicio: fecha_inicio,
									fechaFin: fecha_fin,
									incidencia_prevista: data2,
									incidencia_real: data3
								});
							}
						}
						
					} else if(consulta=="12"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE INCIDENCIA SET INCIDENCIA_PREVISTA = :INCIDENCIA_PREVISTA
							WHERE EMPLEADO = :EMPLEADO AND PROYECTO = :PROYECTO AND PERIODO = :PERIODO`,
							[data.incidencia,data.empleado,data.proyecto,data.periodo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected); 
						
					} else if(consulta=="13"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE INCIDENCIA SET INCIDENCIA_REAL = :INCIDENCIA_PREVISTA
							WHERE EMPLEADO = :EMPLEADO AND PROYECTO = :PROYECTO AND PERIODO = :PERIODO`,
							[data.incidencia,data.empleado,data.proyecto,data.periodo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected); 
						
					} else if(consulta=="14"){
						var respuesta=""; 
						
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						console.log("reEmp",result);
						//console.log("reEmp",result);
						io.sockets.emit("recibeArea2",result);
						
					} else if(consulta=="15"){
						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE AREA_EMPLEADO = '"+data.codigo+"' AND ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}


						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO AREA_EMPLEADO (AREA_EMPLEADO,DESCRIPCION_AREA,ESTADO) 
								VALUES (:AREA_EMPLEADO, :DESCRIPCION_AREA, :ESTADO)`,
								[data.codigo, data.descripcion, data.estado],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							
						} 
						
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeArea2",result);
						
					} else if(consulta=="16"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE AREA_EMPLEADO SET DESCRIPCION_AREA = :DESCRIPCION_AREA, ESTADO = :ESTADO
							WHERE AREA_EMPLEADO = :AREA_EMPLEADO`,
							[data.descripcion,data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeArea2",result);
						
					} else if(consulta=="17"){
						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						io.sockets.emit("recibeFuncion2",result);
						
					} else if(consulta=="18"){
						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE CARGO_EMPLEADO = '"+data.codigo+"' AND ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
						}


						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO CARGO_EMPLEADO (CARGO_EMPLEADO,DESCRIPCION_CARGO,ESTADO) 
								VALUES (:CARGO_EMPLEADO, :DESCRIPCION_CARGO, :ESTADO)`,
								[data.codigo, data.descripcion, data.estado],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							
						} 
						
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeFuncion2",result);
						
					} else if(consulta=="19"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE CARGO_EMPLEADO SET DESCRIPCION_CARGO = :DESCRIPCION_CARGO, ESTADO = :ESTADO
							WHERE CARGO_EMPLEADO = :CARGO_EMPLEADO`,
							[data.descripcion,data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeFuncion2",result);
						
					} else if(consulta=="20"){
						var respuesta=""; 
						
						var sql = "SELECT * FROM CARGO_EMPLEADO ";
						result = await connection.execute(sql);
						var limite = result.rows.length;
						var c=0;

						respuesta='<option value="0">Seleccionar</option>';
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = respuesta + '<option value="'+json[0]+'">'+json[1] + "</option>";
						}
						io.sockets.emit("recibeFuncion",respuesta);

					} else if(consulta=="21"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE CARGO_EMPLEADO SET ESTADO = :ESTADO
							WHERE CARGO_EMPLEADO = :CARGO_EMPLEADO`,
							[data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeFuncion2",result);
						
					} else if(consulta=="22"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE AREA_EMPLEADO SET ESTADO = :ESTADO
							WHERE AREA_EMPLEADO = :AREA_EMPLEADO`,
							[data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeArea2",result);
						
					} else if(consulta=="23"){
						var respuesta=""; 
						var sql = "SELECT * FROM ROL WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						
						io.sockets.emit("recibePerfil2",result);
						
					} else if(consulta=="24"){
						var respuesta=""; 
						var sql = "SELECT * FROM ROL WHERE ROL = '"+data.codigo+"' AND ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						var reg=1;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
							reg++;
						}


						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO ROL (ROL,DESCRIPCION_ROL,ESTADO) 
								VALUES (:ROL,:DESCRIPCION_CARGO, :ESTADO)`,
								[reg,data.descripcion, data.estado],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							
						} 
						
						var sql = "SELECT * FROM ROL WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibePerfil2",result);
						
					} else if(consulta=="25"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE ROL SET DESCRIPCION_ROL = : DESCRIPCION_ROL, ESTADO = :ESTADO
							WHERE ROL = :ROL`,
							[data.descripcion,data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM ROL WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibePerfil2",result);
						
					} else if(consulta=="26"){
						
						var sql = "SELECT * FROM ACCION ";
						result = await connection.execute(sql);
						var a;
						var reg=0;
						var respuesta='<select id="AccionSelectVal"><option value="0">Seleccionar</option>';
                            
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = respuesta + '<option value="'+json[0]+'">'+json[1] + "</option>";
								
							reg++;
						}

						io.sockets.emit("recibeAccion",respuesta);
						
					} else if(consulta=="27"){
						
						var sql = "SELECT * FROM ACCION WHERE ESTADO ='1' ";
						result = await connection.execute(sql);
						var a;
						
						io.sockets.emit("recibeOpciones",result);
						
					} else if(consulta=="28"){
						var respuesta=""; 
						var sql = "SELECT * FROM ACCION WHERE ACCION = '"+data.codigo+"' AND ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						var reg=0;
						for(a=0; a<result.rows.length; a++){
							var string=JSON.stringify(result.rows[a]);
							var json =  JSON.parse(string);
							respuesta = json[0]+"";
							reg++;
						}


						if(respuesta==""){
							let result = await connection.execute(
								`INSERT INTO ACCION (ACCION,DESCRIPCION_ACCION,ESTADO) 
								VALUES (:ACCION,:DESCRIPCION_ACCION, :ESTADO)`,
								[reg,data.descripcion, data.estado],{ autoCommit: true});
							console.log("Rows inserted: " + result.rowsAffected);
							
						} 
						
						var sql = "SELECT * FROM ACCION WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeOpciones",result);
						
					} else if(consulta=="29"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE ACCION SET DESCRIPCION_ACCION = : DESCRIPCION_ACCION, ESTADO = :ESTADO
							WHERE ACCION = :ACCION`,
							[data.descripcion,data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM ACCION WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeOpciones",result);
						
					} else if(consulta=="30"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE ROL SET ESTADO = :ESTADO
							WHERE ROL = :ROL`,
							[data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM ROL WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibePerfil2",result);
						
					} else if(consulta=="31"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE ACCION SET ESTADO = :ESTADO
							WHERE ACCION = :ACCION`,
							[data.estado,data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM ACCION WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeOpciones",result);
						
					} else if(consulta=="32"){
						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '0'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeArea3",result);
						
					} else if(consulta=="33"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE AREA_EMPLEADO SET ESTADO = :ESTADO
							WHERE AREA_EMPLEADO = :AREA_EMPLEADO`,
							["1",data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						io.sockets.emit("recibeArea2",result);
						
					} else if(consulta=="34"){
						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '0'";
						result = await connection.execute(sql);
						var a;
						
						//console.log("reEmp",result);
						io.sockets.emit("recibeFuncion3",result);
						
					} else if(consulta=="35"){
						var respuesta=""; 
						result = await connection.execute(
							`UPDATE CARGO_EMPLEADO SET ESTADO = :ESTADO
							WHERE CARGO_EMPLEADO = :CARGO_EMPLEADO`,
							["1",data.codigo],
							{ autoCommit: true });  
						console.log("Rows updated: " + result.rowsAffected);

						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE ESTADO = '1'";
						result = await connection.execute(sql);
						var a;
						
						io.sockets.emit("recibeFuncion2",result);
						
					} else if(consulta=="36"){
						var respuesta=""; 
						var sql = "SELECT * FROM AREA_EMPLEADO WHERE AREA_EMPLEADO = '"+data.area+"'";
						result = await connection.execute(sql);
						var a;
						
						console.log("cont",result.rows.length);
						io.sockets.emit("recibeValCodArea",result.rows.length);
						
					} else if(consulta=="37"){
						var respuesta=""; 
						var sql = "SELECT * FROM CARGO_EMPLEADO WHERE CARGO_EMPLEADO = '"+data.funcion+"'";
						result = await connection.execute(sql);
						var a;
						
						console.log("cont",result.rows.length);
						io.sockets.emit("recibeValCodFuncion",result.rows.length);
						
					} else if(consulta=="38"){
						var respuesta=""; 
						var sql = "SELECT * FROM ROL WHERE ROL = '"+data.perfil+"'";
						result = await connection.execute(sql);
						var a;
						
						console.log("cont",result.rows.length);
						io.sockets.emit("recibeValCodPerfil",result.rows.length);
						
					} else if(consulta=="39"){
						var respuesta=""; 
						var sql = "SELECT * FROM ACCION WHERE ACCION = '"+data.opcion+"'";
						result = await connection.execute(sql);
						var a;
						
						console.log("cont",result.rows.length);
						io.sockets.emit("recibeValCodOpcion",result.rows.length);
						
					}
					/*
					
					*/
					
				} catch(err){
					console.error(err.message);
				} finally{
					if(connection){
						try{
							await connection.close();
						} catch(err){
							console.error(err.message);
						}
					}
				}
				
			}
		
			run();
		}  

    	function BD(consulta,data){
    		
    		var con = mysql.createConnection({
	              host: "localhost",
	              user: "root",
	              password: "",
	              database: "costos"
	            });

    		con.connect(function(err) {
				
    		});
	    	//con.end();
		}

		function Conecta(){
			const url = 'http://oraclepruebas.cosapi.com.pe/PSIGW/PeopleSoftServiceListeningConnector/CO_PROJ_INF_SRV.1.wsdl'

			soap.createClient(url, (err, client) => {
				if(err){
					console.log(err)
				}else{
					console.log('ok')
					client.CO_PROJ_INF_OPER({
			
					},(err, res) => {
						console.log(res)
						
						var dato = JSON.stringify(res)
						io.sockets.emit('miServicio', res);
						console.log("data: "+dato.MsgData+"/")
						      
				   })
			
				}
			
			})
		}

		
		    
    socket.on('consulta', function(data) {
		//BD(data.id,data.emp);
		BD2(data.id,data.emp);
	});
	
	socket.on('login', function(data) {
		//BD("2",data);
		BD2("2",data);
	});

	socket.on('busca nombre', function(data) {
		//BD("3",data);
		BD2("3",data);
		//Conecta();
    });


	socket.on('listaProyectos', function(data) {
        BD2("4",data);
	});

	socket.on('GuardaEmpleadoProyecto', function(data) {
        BD2("5",data);
	});

	socket.on('ConsultaProyecto', function(data) {
        BD2("6",data);
	});

	socket.on('BuscaEmpleado', function(data) {
		BD2("7",data);
	});

	socket.on('BuscaArea', function(data) {
		BD2("8",data);
	});

	socket.on('ParametrosInicio', function(data) {
		console.log(data);
		io.sockets.emit('ParametrosInicio2', data);
	});

	socket.on('ActualizaEmpleado', function(data) {
		console.log(data);
		BD2("9",data);
	});

	socket.on('EmpleadoProyecto', function(data) {
		BD2("10",data);
	});

	socket.on('IncidenciaProyecto', function(data) {
		BD2("11",data);
	});

	socket.on('GuardarIncidencia', function(data) {
		BD2("12",data);
	});

	socket.on('CierrePeriodo', function(data) {
		BD2("13",data);
	});

	socket.on('ConsultaArea', function(data) {
		BD2("14",data);
	});

	socket.on('GuardaArea', function(data) {
		BD2("15",data);
	});

	socket.on('EditaArea', function(data) {
		BD2("16",data);
	});

	socket.on('ConsultaFuncion', function(data) {
		BD2("17",data);
	});

	socket.on('GuardaFuncion', function(data) {
		console.log(data);
		BD2("18",data);
	});

	socket.on('EditaFuncion', function(data) {
		BD2("19",data);
	});

	socket.on('BuscaFuncion', function(data) {
		BD2("20",data);
	});

	socket.on('EliminaFuncion', function(data) {
		BD2("21",data);
	});
	
	socket.on('EliminaArea', function(data) {
		BD2("22",data);
	});

	socket.on('ConsultaPerfil', function(data) {
		BD2("23",data);
	});

	socket.on('GuardaPerfil', function(data) {
		BD2("24",data);
	});
	
	socket.on('EditaPerfil', function(data) {
		BD2("25",data);
	});//BuscaAcciones

	socket.on('BuscaAcciones', function(data) {
		BD2("26",data);
	});//

	socket.on('ConsultaOpciones', function(data) {
		BD2("27",data);
	});

	socket.on('GuardaOpciones', function(data) {
		BD2("28",data);
	});
	
	socket.on('EditaOpciones', function(data) {
		BD2("29",data);
	});//BuscaAcciones

	socket.on('EliminaPerfil', function(data) {
		BD2("30",data);
	});

	socket.on('EliminaOpciones', function(data) {
		BD2("31",data);
	});

	socket.on('ConsultaArea2', function(data) {
		BD2("32",data);
	});

	socket.on('GuardaArea2', function(data) {
		BD2("33",data);
	});

	socket.on('ConsultaFuncion2', function(data) {
		BD2("34",data);
	});

	socket.on('GuardaFuncion2', function(data) {
		BD2("35",data);
	});

	socket.on('ValidaCodigoArea', function(data) {
		BD2("36",data);
	});

	socket.on('ValidaCodigoFuncion', function(data) {
		BD2("37",data);
	});

	socket.on('ValidaCodigoPerfil', function(data) {
		BD2("38",data);
	});

	socket.on('ValidaCodigoOpcion', function(data) {
		BD2("39",data);
	});
	
});
