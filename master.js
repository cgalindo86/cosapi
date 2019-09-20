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

//Marco la ruta de acceso y la vista a mostrar
app.set('view options', {
	  layout: false
	});
app.use(express.static('public'));
app.get('', function(req, res){
	//BD2();
    res.sendFile(__dirname + '/public/view/login_simple.html');
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
	//console.log("bd2");
	//para verificar
	var connection;
	async function run(){
		try{
			connection = await oracledb.getConnection({
				user: 'RO',
				password: mypw,
				connectString: "dscope.cosapi.com.pe/desa"
			});

			result = await connection.execute('SELECT nombre_empleado FROM EMPLEADO');

			console.log("Result 1: "+ result.metaData);
			//console.log("Result is: "+ result.metaData['rows']);
			var string=JSON.stringify(result.rows[0]);
			
			console.log("Result 2: "+ string);
			
			var json =  JSON.parse(string);
			console.log("Result 3: "+ json);
			//console.log("Result 3: "+ string2);
			var i; 
            var nombre;
			for(i =0; i<json.length; i++){
				nombre = json[i];
				console.log("Result "+i+": "+ nombre);
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
    
    
		BD2();

		

    	function BD(consulta,data){
    		
    		var con = mysql.createConnection({
	              host: "localhost",
	              user: "root",
	              password: "",
	              database: "costos"
	            });

    		con.connect(function(err) {
    			if(consulta=="0"){
                    
    				con.query("SELECT * FROM empresa  ", function (err, result, fields) {
			                if (err) throw err;
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
			                var i; 
                            var idEmp="";
                            var nomEmp="";
			                for(i =0; i<json.length; i++){
					
			                	idEmp = json[i].id;
                                nomEmp = json[i].nombre;
                                io.sockets.emit('envio empresa', {id: idEmp, nombre: nomEmp});
                                console.log('item '+i+": "+idEmp+" - "+nomEmp);
			                	
			                }
                             
                            
			              });
    			} else if(consulta=="1"){
                    
    				con.query("SELECT * FROM obra  ", function (err, result, fields) {
							if (err) throw err;
							
							console.log("result "+result);


			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
			                var i; 
                            var nombre, costo, responsable, funcion;
                            
			                for(i =0; i<json.length; i++){
                                nombre = json[i].nomarea;
                                costo = json[i].costo;
			                	responsable = json[i].nombre+" "+json[i].apellido;
                                funcion = json[i].funcionnom;
                                io.sockets.emit('envio obra', {nombre: nombre, costo: costo, responsable: responsable, funcion: funcion});
                                
			                	
			                }
                             
                            
						  });
					
				}  else if(consulta=="2"){
					var usuario = data.usuario;
					var password = data.password;
					console.log("usuario: "+usuario+" - contraseña: "+password);
					var consultaQ = "SELECT * FROM usuarios WHERE miusuario= ? AND mipassword = ?";
					
					con.query(consultaQ,[usuario,password], function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
			                var mnombre, mid, i;
                            for(i =0; i<json.length; i++){
								mnombre = json[i].nombre;
								mid = json[i].id;
							}

							if(mnombre!=null){
									
								io.sockets.emit('validacion', {nombre: mnombre, id:mid, resultado:"ok"});
								
							} else {
								io.sockets.emit('validacion', {nombre: mnombre, id:mid, resultado:"no ok"});
							
							}
			                
								
						  });
					
    			} else if(consulta=="3"){
					var usuario = data.usuario;
					var consultaQ = "SELECT * FROM usuarios WHERE id= ? ";
					
					con.query(consultaQ,[usuario], function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
			                var mnombre, mid, i;
                            for(i =0; i<json.length; i++){
								mnombre = json[i].nombre;
								mid = json[i].id;
							}
							console.log("nom usu"+mnombre);
							io.sockets.emit('minombre', {nombre: mnombre, id:mid});
								
						  });
					
    			} else if(consulta=="4"){
					//var usuario = data.usuario;
					var consultaQ = "SELECT * FROM proyecto ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta;
                            for(i =0; i<json.length; i++){
								respuesta = respuesta + json[i].proyecto+"#";
							}
							console.log("respuesta: "+respuesta);
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
									codigo=data5['PROJECT_ID']['$value'];
									codunidad=data5['PROJECT_TYPE']['$value'];
									nomunidad = data5['DESCR1']['$value'];
									descr1="";
									descr2=data5['DESCR']['$value'];
									//participacion = data5['PARTICIPATION_PCT'];
									/*ojo hay valores de cliente y participacion que son object*/
									
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
									
									var sql = "INSERT INTO proyecto (proyecto,descripcion_corta,";
									sql = sql + "descripcion_larga,unidad_negocio,descripcion_unidad_negocio,";
									sql = sql + "nombre_cliente,participacion,nombre_supervision,moneda_proyecto,";
									sql = sql + "fecha_inicio,fecha_fin) VALUES ('"+codigo+"','"+descr1+"','"+descr2+"',";
									sql = sql + "'"+codunidad+"','"+nomunidad+"','"+cliente+"','"+participacion+"',";
									sql = sql + "'"+supervisor+"','"+moneda+"','"+fechai+"','"+fechaf+"')";
									con.query(sql, function (err, result) {
										if (err) throw err;
										console.log("1 record inserted");
									});

									
								}
							}
						  });
					
    			}  else if(consulta=="5"){
					//var usuario = data.usuario;
					var emp = data.empleado;
					var consultaQ = "SELECT * FROM empleado WHERE empleado='"+emp+"' AND proyecto='"+data.proyecto+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta="";
                            for(i =0; i<json.length; i++){
								respuesta = json[i].empleado;
							}
							console.log("respuesta: "+respuesta);
							
							if(respuesta==""){
								var sql = "INSERT INTO empleado (empleado,cargo_empleado,cargo_empleado_r,";
								sql = sql + "area_empleado,area_empleado_r,tipo_documento,";
								sql = sql + "numero_documento,nombre_empleado,apellido_empleado,fecha_ingreso,";
								sql = sql + "fecha_cese,provisiones_empleado,sueldo_basico,costo_total,"
								sql = sql + "estado_empleado,proyecto) VALUES ('"+data.empleado+"','"+data.cargo+"','"+data.cargo_r+"',";
								sql = sql + "'"+data.area+"','"+data.area_r+"','"+data.tipoDocumento+"','"+data.numeroDocumento+"',";
								sql = sql + "'"+data.nombre+"','"+data.apellido+"','"+data.fechaIngreso+"','"+data.fechaCese+"',";
								sql = sql + "'"+data.provisiones+"','"+data.sueldo+"','"+data.costo+"','"+data.estado+"',";
								sql = sql + "'"+data.proyecto+"')";
								con.query(sql, function (err, result) {
									if (err) throw err;
									console.log("1 record inserted");
								});

								var sql2 = "INSERT INTO empleado_proyecto (empleado,proyecto)";
								sql2 = sql2 + " VALUES ('"+data.empleado+"','"+data.proyecto+"')";
								con.query(sql2, function (err, result) {
									if (err) throw err;
									console.log("1 record inserted 2");
								});
							}
							
						  });
					
					var consultaQ = "SELECT * FROM proyecto_periodo WHERE proyecto='"+data.proyecto+"' AND periodo='"+data.periodo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						var mnombre, mid, i;
						var respuesta="";
						for(i =0; i<json.length; i++){
							respuesta = json[i].proyecto;
						}
						console.log("respuesta: "+respuesta);
								  
						if(respuesta==""){
							var sql = "INSERT INTO proyecto_periodo (proyecto,periodo,estado,";
							sql = sql + "usuario_creacion,fecha_creacion) VALUES ('"+data.proyecto+"','"+data.periodo+"','"+data.estado+"',";
							sql = sql + "'"+data.usuario+"','"+data.fecha+"')";
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							});
						}
								  
					});


					var consultaQ = "SELECT * FROM incidencia WHERE proyecto='"+data.proyecto+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						var mnombre, mid, i;
						var respuesta="";
						for(i =0; i<json.length; i++){
							respuesta = json[i].proyecto;
						}
						console.log("respuesta: "+respuesta);
								  
						if(respuesta==""){
							var eperiodo='';
							var ii;
							for(ii=1; ii<=12; ii++){
								if(ii<10){ eperiodo='0'; } else { eperiodo = ''; }
								eperiodo = "2019" + eperiodo + ii;
								var sql = "INSERT INTO incidencia (proyecto,empleado,periodo) VALUES ('"+data.proyecto+"','"+data.empleado+"','"+eperiodo+"')";
								con.query(sql, function (err, result) {
									if (err) throw err;
									console.log("1 record inserted incidencia "+ eperiodo);
								});
							}
							
							
						}
								  
					});
					
					
					
    			}  else if(consulta=="6"){
					//var usuario = data.usuario;
					var consultaQ = "SELECT * FROM proyecto_periodo WHERE proyecto='"+data.proyecto+"' AND periodo='"+data.periodo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta="";
                            for(i =0; i<json.length; i++){
								respuesta = json[i].proyecto;
							}
							console.log("respuesta: "+respuesta);
							
							if(respuesta==""){
								var sql = "INSERT INTO proyecto_periodo (proyecto,periodo,estado,";
								sql = sql + "usuario_creacion,fecha_creacion) VALUES ('"+data.proyecto+"','"+data.periodo+"','"+data.estado+"',";
								sql = sql + "'"+data.usuario+"','"+data.fecha+"')";
								con.query(sql, function (err, result) {
									if (err) throw err;
									console.log("1 record inserted");
								});
								io.sockets.emit("DatosProyecto",{proyecto:"", periodo: ""});
							} else {
								io.sockets.emit("DatosProyecto",{proyecto:json[0].proyecto, periodo: json[0].periodo});
							}
							
						  });
					
					
					
    			}  else if(consulta=="7"){
					//var usuario = data.usuario;
					var consultaQ = "SELECT * FROM empleado WHERE empleado='"+data.codigo+"' OR numero_documento='"+data.documento+"' OR "+"nombre_empleado LIKE '%"+data.nombre+"%' "+" OR "+"apellido_empleado LIKE '%"+data.apellidos+"%' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta="";
                            for(i =0; i<json.length; i++){
								respuesta = json[i].empleado+"#"+json[i].apellido_empleado + " "+json[i].nombre_empleado +"#";
								respuesta = respuesta +json[i].area_empleado + " "+json[i].area_empleado_r +"#";
								respuesta = respuesta +json[i].fecha_ingreso + "#"+json[i].fecha_cese +"#%";
							}
							console.log("respuesta: "+respuesta);
							io.sockets.emit("ResultEmpleado",respuesta);
							
						  });
					
					
					
    			}  else if(consulta=="8"){
					
					var consultaQ = "SELECT * FROM area_empleado ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta='<option value="0">Seleccionar</option>';
                            for(i =0; i<json.length; i++){
								respuesta = respuesta + '<option value="'+json[i].area_empleado+'">'+json[i].descripcion_area + "</option>";
								
							}
							console.log("respuestaArea: "+respuesta);
							io.sockets.emit("recibeArea",respuesta);
							
						  });
					
    			}  else if(consulta=="9"){
					
					var consultaQ = "UPDATE empleado SET fecha_inicio='"+data.fechaInicio+"',";
					consultaQ = consultaQ + " fecha_fin='"+data.fechaFin+"',",
					consultaQ = consultaQ + " area_empleado='"+data.area+"',";
					consultaQ = consultaQ + " area_empleado_r='"+data.nombreArea+"' WHERE empleado='"+data.empleado+"' ";
					consultaQ = consultaQ + "AND proyecto='"+data.proyecto+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "UPDATE empleado_proyecto SET fecha_inicio='"+data.fechaInicio+"',";
					consultaQ = consultaQ + " fecha_fin='"+data.fechaFin+"'",
					consultaQ = consultaQ + " WHERE empleado='"+data.empleado+"' ";
					consultaQ = consultaQ + "AND proyecto='"+data.proyecto+"'";
						  
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho2");
						});
					
    			}  else if(consulta=="10"){
					
					var consultaQ = "SELECT * FROM empleado WHERE proyecto='"+data.proyecto+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							io.sockets.emit("ResultadoEmpleadoProyecto",json);
							
						  });
					
    			}  else if(consulta=="11"){
					var empleado="",nnombre="",fecha_inicio="",fecha_fin="";
					var data2="",data3="";

					var codempleado="";
					var consultaQ = "SELECT * FROM empleado WHERE proyecto='"+data.proyecto+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							
                            for(i =0; i<json.length; i++){
								codempleado = json[i].empleado;
								empleado = empleado + json[i].empleado+"#";
								console.log("empl "+empleado);
								nnombre = nnombre + json[i].nombre_empleado + json[i].apellido_empleado+"#";
								console.log("nnombre "+nnombre);
								fecha_inicio = fecha_inicio + json[i].fecha_inicio+"#";
								console.log("fi "+fecha_inicio);
								fecha_fin = fecha_fin + json[i].fecha_fin+"#";
								console.log("ff "+fecha_fin);

								console.log("busq "+data.proyecto+" "+codempleado);
								var c=0;
								var consultaQ2 = "SELECT * FROM incidencia WHERE proyecto='"+data.proyecto+"'  AND empleado='"+codempleado+"' ORDER BY periodo";
								con.query(consultaQ2, function (err, result2, fields) {
									if (err) throw err;
									
									var string2=JSON.stringify(result2);
									var json2 = JSON.parse(string2);
									//console.log(json2);
									var a;
									for(a=0; a<json2.length; a++){
										data2 = data2 + json2[a].incidencia_prevista+"#";
										data3 = data3 + json2[a].incidencia_real+"#";	
										
									}
									data2 = data2+"%";
									data3 = data3+"%";
									c++;
									if(c==json.length){
										console.log("d2"+data2);
										console.log("d3"+data3);
										io.sockets.emit("ResultadoIncidenciaProyecto",{
											empleado: empleado,
											nombre: nnombre,
											fechaInicio: fecha_inicio,
											fechaFin: fecha_fin,
											incidencia_prevista: data2,
											incidencia_real: data3
										});
									}
									
								});
								
							}
							
						  });
    			}  else if(consulta=="12"){
					
					var consultaQ = "UPDATE incidencia SET incidencia_prevista='"+data.incidencia+"' ";
					consultaQ = consultaQ + " WHERE empleado='"+data.empleado+"' ";
					consultaQ = consultaQ + "AND proyecto='"+data.proyecto+"' AND periodo='"+data.periodo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
    			}  else if(consulta=="13"){
					
					var consultaQ = "UPDATE incidencia SET incidencia_real='"+data.incidencia+"' ";
					consultaQ = consultaQ + " WHERE empleado='"+data.empleado+"' ";
					consultaQ = consultaQ + "AND proyecto='"+data.proyecto+"' AND periodo='"+data.periodo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					//BD("11",data);
    			}  else if(consulta=="14"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							io.sockets.emit("recibeArea2",json);
							
						  });
					
    			}  else if(consulta=="15"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM area_empleado WHERE area_empleado='"+data.codigo+"' AND  estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			        	var json =  JSON.parse(string);
						
						var respuesta='';
						for(i =0; i<json.length; i++){
							respuesta = json[i].area_empleado;
						}
						console.log("resp area "+respuesta);
						if(respuesta==""){
							var sql = "INSERT INTO area_empleado (area_empleado,descripcion_area,estado) ";
							sql = sql + "VALUES ('"+data.codigo+"','"+data.descripcion+"','"+data.estado+"') ";
							
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							});	
						}
						//io.sockets.emit("ActualizaTabla","1");	
					});
					
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibeArea2",json);
							
					});
					
    			} else if(consulta=="16"){
					
					var consultaQ = "UPDATE area_empleado SET descripcion_area='"+data.descripcion+"', estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE area_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeArea2",json);
								  
					});
					
						  
    			}  else if(consulta=="17"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM funcion_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibeFuncion2",json);
							
					});
					//io.sockets.emit("ActualizaTabla","2");
    			}  else if(consulta=="18"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM funcion_empleado WHERE funcion_empleado='"+data.codigo+"' AND  estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			        	var json =  JSON.parse(string);
						
						var respuesta='';
						for(i =0; i<json.length; i++){
							respuesta = json[i].funcion_empleado;
						}
						console.log("resp funcion "+respuesta);
						
						if(respuesta==""){
							var sql = "INSERT INTO funcion_empleado (funcion_empleado,descripcion_funcion,estado) ";
							sql = sql + "VALUES ('"+data.codigo+"','"+data.descripcion+"','"+data.estado+"') ";
							
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							});	
						}
							
					});
					var consultaQ = "SELECT * FROM funcion_empleado WHERE estado='1' ";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibeFuncion2",json);
							
					});
					
    			} else if(consulta=="19"){
					
					var consultaQ = "UPDATE funcion_empleado SET descripcion_funcion='"+data.descripcion+"', estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE funcion_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM funcion_empleado WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeFuncion2",json);
								  
					});

    			}  else if(consulta=="20"){
					
					var consultaQ = "SELECT * FROM funcion_empleado ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta='<option value="0">Seleccionar</option>';
                            for(i =0; i<json.length; i++){
								respuesta = respuesta + '<option value="'+json[i].funcion_empleado+'">'+json[i].descripcion_funcion + "</option>";
								
							}
							console.log("respuestaFuncion: "+respuesta);
							io.sockets.emit("recibeFuncion",respuesta);
							
						  });
					
    			} else if(consulta=="21"){
					
					var consultaQ = "UPDATE funcion_empleado SET estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE funcion_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM funcion_empleado WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeFuncion2",json);
								  
					});

    			} else if(consulta=="22"){
					
					var consultaQ = "UPDATE area_empleado SET estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE area_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeArea2",json);
								  
					});
					
						  
    			}  else if(consulta=="23"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM rol  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibePerfil2",json);
							
					});
					//io.sockets.emit("ActualizaTabla","2");
    			}  else if(consulta=="24"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM rol WHERE rol='"+data.codigo+"' AND  estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			        	var json =  JSON.parse(string);
						
						var respuesta='';
						for(i =0; i<json.length; i++){
							respuesta = json[i].area_empleado;
						}
						console.log("resp rol "+respuesta);
						if(respuesta==""){
							var sql = "INSERT INTO rol (descripcion,estado) ";
							sql = sql + "VALUES ('"+data.descripcion+"','"+data.estado+"') ";
							
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							});	
						}
						//io.sockets.emit("ActualizaTabla","1");	
					});
					
					var consultaQ = "SELECT * FROM rol  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibePerfil2",json);
							
					});
					
    			} else if(consulta=="25"){
					
					var consultaQ = "UPDATE rol SET descripcion='"+data.descripcion+"', estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE rol='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM rol WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibePerfil2",json);
								  
					});

    			}  else if(consulta=="26"){
					
					var consultaQ = "SELECT * FROM accion ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							var mnombre, mid, i;
							var respuesta='<select id="AccionSelectVal"><option value="0">Seleccionar</option>';
                            for(i =0; i<json.length; i++){
								respuesta = respuesta + '<option value="'+json[i].accion+'">'+json[i].descripcion_accion + "</option>";
								
							}
							respuesta = respuesta + '</select>';
							console.log("respuestaAccion: "+respuesta);
							io.sockets.emit("recibeAccion",respuesta);
							
						  });
					
    			}  else if(consulta=="27"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM accion WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibeOpciones",json);
							
					});
					//io.sockets.emit("ActualizaTabla","2");
    			}  else if(consulta=="28"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM accion WHERE accion='"+data.codigo+"' AND  estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			        	var json =  JSON.parse(string);
						
						var respuesta='';
						for(i =0; i<json.length; i++){
							respuesta = json[i].area_empleado;
						}
						console.log("resp rol "+respuesta);
						if(respuesta==""){
							var sql = "INSERT INTO accion (descripcion_accion,estado) ";
							sql = sql + "VALUES ('"+data.descripcion+"','"+data.estado+"') ";
							
							con.query(sql, function (err, result) {
								if (err) throw err;
								console.log("1 record inserted");
							});	
						}
						//io.sockets.emit("ActualizaTabla","1");	
					});
					
					var consultaQ = "SELECT * FROM accion  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
							
			            var string=JSON.stringify(result);
			            var json =  JSON.parse(string);
						io.sockets.emit("recibeOpciones",json);
							
					});
					
    			} else if(consulta=="29"){
					
					var consultaQ = "UPDATE accion SET descripcion_accion='"+data.descripcion+"', estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE accion='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM accion WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeOpciones",json);
								  
					});

    			} else if(consulta=="30"){
					
					var consultaQ = "UPDATE rol SET estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE rol='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM rol  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibePerfil2",json);
								  
					});
					
						  
    			} else if(consulta=="31"){
					
					var consultaQ = "UPDATE accion SET estado='"+data.estado+"' ";
					consultaQ = consultaQ + " WHERE accion='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM accion  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeOpciones",json);
								  
					});
					
						  
    			}  else if(consulta=="32"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='0'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							io.sockets.emit("recibeArea3",json);
							
						  });
					
    			} else if(consulta=="33"){
					
					var consultaQ = "UPDATE area_empleado SET estado='1' ";
					consultaQ = consultaQ + " WHERE area_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM area_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeArea2",json);
								  
					});
					
						  
    			}  else if(consulta=="34"){
					//console.log("consulta area");
					var consultaQ = "SELECT * FROM funcion_empleado  WHERE estado='0'";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							
			                var string=JSON.stringify(result);
			                var json =  JSON.parse(string);
							io.sockets.emit("recibeFuncion3",json);
							
						  });
					
    			} else if(consulta=="35"){
					
					var consultaQ = "UPDATE funcion_empleado SET estado='1' ";
					consultaQ = consultaQ + " WHERE funcion_empleado='"+data.codigo+"' ";
					
					con.query(consultaQ, function (err, result, fields) {
							if (err) throw err;
							console.log("hecho");
						  });
					
					var consultaQ = "SELECT * FROM funcion_empleado  WHERE estado='1'";
					
					con.query(consultaQ, function (err, result, fields) {
						if (err) throw err;
								  
						var string=JSON.stringify(result);
						var json =  JSON.parse(string);
						io.sockets.emit("recibeFuncion2",json);
								  
					});
					
						  
    			}
				
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
        BD(data.id,data.emp);
	});
	
	socket.on('login', function(data) {
        BD("2",data);
	});

	socket.on('busca nombre', function(data) {
		BD("3",data);
		Conecta();
    });


	socket.on('listaProyectos', function(data) {
        BD("4",data);
	});

	socket.on('GuardaEmpleadoProyecto', function(data) {
        BD("5",data);
	});

	socket.on('ConsultaProyecto', function(data) {
        BD("6",data);
	});

	socket.on('BuscaEmpleado', function(data) {
		BD("7",data);
	});

	socket.on('BuscaArea', function(data) {
		BD("8",data);
	});

	socket.on('ParametrosInicio', function(data) {
		console.log(data);
		io.sockets.emit('ParametrosInicio2', data);
	});

	socket.on('ActualizaEmpleado', function(data) {
		BD("9",data);
	});

	socket.on('EmpleadoProyecto', function(data) {
		BD("10",data);
	});

	socket.on('IncidenciaProyecto', function(data) {
		BD("11",data);
	});

	socket.on('GuardarIncidencia', function(data) {
		BD("12",data);
	});

	socket.on('CierrePeriodo', function(data) {
		BD("13",data);
	});

	socket.on('ConsultaArea', function(data) {
		BD("14",data);
	});

	socket.on('GuardaArea', function(data) {
		BD("15",data);
	});

	socket.on('EditaArea', function(data) {
		BD("16",data);
	});

	socket.on('ConsultaFuncion', function(data) {
		BD("17",data);
	});

	socket.on('GuardaFuncion', function(data) {
		console.log(data);
		BD("18",data);
	});

	socket.on('EditaFuncion', function(data) {
		BD("19",data);
	});

	socket.on('BuscaFuncion', function(data) {
		BD("20",data);
	});

	socket.on('EliminaFuncion', function(data) {
		BD("21",data);
	});
	
	socket.on('EliminaArea', function(data) {
		BD("22",data);
	});

	socket.on('ConsultaPerfil', function(data) {
		BD("23",data);
	});

	socket.on('GuardaPerfil', function(data) {
		BD("24",data);
	});
	
	socket.on('EditaPerfil', function(data) {
		BD("25",data);
	});//BuscaAcciones

	socket.on('BuscaAcciones', function(data) {
		BD("26",data);
	});//

	socket.on('ConsultaOpciones', function(data) {
		BD("27",data);
	});

	socket.on('GuardaOpciones', function(data) {
		BD("28",data);
	});
	
	socket.on('EditaOpciones', function(data) {
		BD("29",data);
	});//BuscaAcciones

	socket.on('EliminaPerfil', function(data) {
		BD("30",data);
	});

	socket.on('EliminaOpciones', function(data) {
		BD("31",data);
	});

	socket.on('ConsultaArea2', function(data) {
		BD("32",data);
	});

	socket.on('GuardaArea2', function(data) {
		BD("33",data);
	});

	socket.on('ConsultaFuncion2', function(data) {
		BD("34",data);
	});

	socket.on('GuardaFuncion2', function(data) {
		BD("35",data);
	});

	
});
