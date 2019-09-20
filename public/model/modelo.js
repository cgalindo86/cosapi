//Inicializamos las variables necesarias.
var express = require('express')
  , http = require('http');
const fs = require('fs');
const soap = require('soap');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
var mysql = require('mysql');

var puerto = 8002;

server.listen(puerto);

//Marco la ruta de acceso y la vista a mostrar
//Se ha establecido conexión
io.sockets.on('connection', function(socket) {
    
    //BD();

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

});